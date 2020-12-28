import { ResizeObserver } from '@juggle/resize-observer';
import { v4 } from 'uuid';
import _isFunction from 'lodash/isFunction';
import _each from 'lodash/each';
import Circle, { ICircleState } from './Shape/Circle';
import Rectangle, { IRectangleState } from './Shape/Rectangle';

type ShapeType = Circle | Rectangle;
type ShapeState = ICircleState | IRectangleState;
type CanvasContext = CanvasRenderingContext2D;

class Canvas {
  // id
  public id: string;
  // 容器元素
  public container: Element;
  // canvas 上下文
  public context!: CanvasContext;
  // resize observer
  private resizeObserver: ResizeObserver
  // canvas 宽高
  public width!: number;
  public height!: number;
  // canvas内图形
  private shapes: Map<string, ShapeType>;
  // 舞台
  private stage: Set<string>;

  constructor(
    containerEl: Element,
    stage?: readonly ShapeType[]
  ) {
    this.id = `canvas-${v4()}`;
    this.shapes = new Map<string, ShapeType>();
    this.stage = new Set<string>();
    _each(stage, (shape: ShapeType) => {
      const id = shape.id;
      this.shapes.set(id, shape);
      this.stage.add(id);
    });
    this.container = containerEl;
    this.createCanvas(containerEl);
    this.resizeObserver = new ResizeObserver(this.resizeObserverCallback.bind(this));
    this.resizeObserver.observe(containerEl);
  }
  
  public destroy () {
    this.resizeObserver.disconnect();
    this.shapes.clear();
    this.stage.clear();
  }

  public append (id: string, shape: ShapeType) {
    this.shapes.set(id, shape);
    shape.draw(this);
  }

  public remove (id: string) {
    this.shapes.delete(id);
    this.stage.delete(id);
    this.drawShapes();
  }

  change (id: string, state: ShapeState): void;
  change (id: string, state: (shape: ShapeType) => ShapeState): void;
  public change (id: string, state: ShapeState | ((shape: ShapeType) => ShapeState)) {
    const shape = this.shapes.get(id) as ShapeType;
    let nextState: ShapeState;
    if (_isFunction(state)) {
      nextState = state(shape);
    } else {
      nextState = state;
    }
    shape.setState(nextState);
    shape.draw(this);
  }

  public clear (x: number = 0, y: number = 0, w: number = this.width, h: number = this.height) {
    const ctx = this.context;
    ctx.clearRect(x, y, w, h);
  }

  public drawShapes () {
    this.shapes.forEach((shape: ShapeType, id: string) => {
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
      this.clear();
      this.drawShapes();
    }
  }

  private createCanvas (containerEl: Element) {
    const canvasEl = document.createElement('canvas');
    canvasEl.id = this.id;
    this.context = canvasEl.getContext('2d') as CanvasContext;
    containerEl.appendChild(canvasEl);
  }

  private resizeObserverCallback (entries: { contentRect: { width: number; height: number; }; }[]) {
    entries.forEach((entry: { contentRect: { width: number; height: number; }; }) => {
      const { width, height } = entry.contentRect;
      this.setSize(width, height);
    });
  }
}

export default Canvas;
