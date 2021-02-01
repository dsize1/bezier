import { ResizeObserver } from '@juggle/resize-observer';
import { tap } from 'rxjs/operators';
import { v4 } from 'uuid';
import _isFunction from 'lodash/isFunction';
import _each from 'lodash/each';
import _isArray from 'lodash/isArray';
import Rectangle from './Shape/Rectangle';
import Shapes from './utils/Shapes';
import getMovements$ from './utils/getMovements$';
import Movement from './utils/Movement';
import { QuadtreeNode } from './utils/Shapes';
import { EventBus } from './utils/Event';
import { IMovementState, IUnit, ShapeType, ShapePosition, ShapeState, CanvasContext, CanvasSize } from './types';

interface Initiate {
  (canvasSize: CanvasSize, context: CanvasContext, cavas: Canvas): void
}
interface Moving {
  (movements: Array<IMovementState>, canvas: Canvas): void
}
type BeforeMoving = Moving;
interface DidMoved {
  (canvas: Canvas): void
}
interface DidCatch {
  (err: any, canvas: Canvas): void
}
interface IMoveHooks {
  beforeMoving?: BeforeMoving;
  moving?: Moving;
  didMoved?: DidMoved;
  didCatch?: DidCatch;
}
class Canvas {
  // id
  public id: string;
  // 容器元素
  public canvasEl!: HTMLCanvasElement;
  // canvas 上下文
  public context!: CanvasContext;
  // resize observer
  private resizeObserver: ResizeObserver
  private initFunc: Initiate | undefined;
  public isInitiated: boolean;
  // canvas 宽高
  public width!: number;
  public height!: number;
  // canvas内图形
  private shapes!: Shapes;

  private eventBus!: EventBus;

  constructor(readonly containerEl: Element, InitFunc = undefined) {
    this.id = `canvas-${v4()}`;
    this.shapes = new Shapes(0, 0);
    this.createCanvas(containerEl);
    this.resizeObserver = new ResizeObserver(this.resizeObserverCallback.bind(this));
    this.resizeObserver.observe(containerEl);
    this.isInitiated = false;
    this.initFunc = InitFunc;
  }
  
  public destroy () {
    this.resizeObserver.disconnect();
    this.shapes.clear();
    this.containerEl.removeChild(this.canvasEl);
  }

  public append (id: string, shape: ShapeType) {
    this.shapes.append(id, shape);
  }

  public remove (id: string) {
    this.shapes.remove(id);
  }

  change (id: string, state: ShapePosition): void;
  change (id: string, state: (shape: ShapeType, canvasSize: CanvasSize) => ShapePosition): void;
  public change (id: string, state: ShapePosition | ((shape: ShapeType, canvasSize: CanvasSize) => ShapePosition)) {
    const shape = this.shapes.get(id) as ShapeType;
    const nextState = _isFunction(state) ?
      state(shape, { width: this.width, height: this.height }) :
      state;
    this.shapes.change(id, shape, nextState);
  }

  public clear (x: number = 0, y: number = 0, w: number = this.width, h: number = this.height) {
    const ctx = this.context;
    ctx.clearRect(x, y, w, h);
  }

  public drawShapes () {
    this.shapes.forEach((id: string, shape: ShapeType) => {
      shape.draw(this);
    })
  }

  public setSize (width: number, height: number) {
    this.width = Math.floor(width);
    this.height = Math.floor(height);
    const canvas = this?.context?.canvas;
    if (canvas) {
      canvas.width = this.width;
      canvas.height = this.height;
    }
    this.shapes.resize(width, height);
  }

  public test () {
    this.shapes.show(
      (qtNode: QuadtreeNode) => {
        const { x, y, w, h } = qtNode.getRegion();
        const bBox = new Rectangle({
          x: x,
          y: y,
          width: w,
          height: h,
          fillStyle: '#333',
          drawType: 'stroke'
        });
        bBox.draw(this);
        if (qtNode.isLeaf) {
          _each(
            qtNode.units,
            (shape: ShapeType) => {
              shape.draw(this);
            }
          )
        }
      }
    );
  }

  public init (InitFunc: Initiate) {
    this.initFunc = InitFunc;
  }

  private createCanvas (containerEl: Element) {
    this.canvasEl = document.createElement('canvas');
    this.canvasEl.id = this.id;
    this.context = this.canvasEl.getContext('2d') as CanvasContext;
    containerEl.appendChild(this.canvasEl);
    this.eventBus = new EventBus(this.canvasEl, this.shapes);
  }

  private resizeObserverCallback (entries: { contentRect: { width: number; height: number; }; }[]) {
    entries.forEach((entry: { contentRect: { width: number; height: number; }; }) => {
      const { width, height } = entry.contentRect;
      this.isInitiated = false;
      this.setSize(width, height);
      this.clear();
      this.isInitiated = true;
      if (_isFunction(this.initFunc)) this.initFunc({ width, height }, this.context, this);
      this.drawShapes();
    });
  }

  move (unit: IUnit, hooks: IMoveHooks): void;
  move (units: Array<IUnit>, hooks: IMoveHooks): void;
  public move (unit: IUnit | Array<IUnit>, hooks: IMoveHooks): void {
    const params = _isArray(unit) ? unit : [unit];
    const size = { width: this.width, height: this.height }
    const movement = new Movement();
    getMovements$(params, size, movement)
      .pipe(
        tap((movements: Array<IMovementState>) => {
          if (_isFunction(hooks.beforeMoving)) hooks.beforeMoving(movements, this);
        })
      )
      .subscribe({
        next: (movements: Array<IMovementState>) => {
          _each(
            movements,
            ({ id, state }: IMovementState) => {
              this.change(id, state);
            }
          );
          if (_isFunction(hooks.moving)) hooks.moving(movements, this);
        },
        complete: () => {
          movement.clear();
          if (_isFunction(hooks.didMoved)) hooks.didMoved(this);
        },
        error: (err: any) => {
          movement.clear();
          if (_isFunction(hooks.didCatch)) hooks.didCatch(err, this);
        }
      });
  }
}

export default Canvas;
