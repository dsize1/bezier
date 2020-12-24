import _isNumber from 'lodash/isNumber';
import classOf from '../classOf';

const TWO_PI = Math.PI * 2;

interface IPoint {
  x: number;
  y: number;
  radius?: number;
}
class Point {
  x: number;
  y: number;
  radius: number;

  constructor({ x, y, radius }: IPoint) {
    this.x = x;
    this.y = y;
    this.radius = radius || 1;
  }

  set = ({ x, y, radius }: Partial<IPoint>) => {
    if (_isNumber(x)) this.x = x;
    if (_isNumber(y)) this.y = y;
    if (_isNumber(radius)) this.radius = radius;
  }

  draw = (ctx: CanvasRenderingContext2D, fillStyle: string) => {
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.fillStyle = fillStyle;
    ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
    ctx.fill();
    ctx.closePath();
  }
}

type CanvasElement = Point;
type CanvasContext = CanvasRenderingContext2D;
type PropTypes = string | number | symbol;

interface CanvasOptions { width: number; height: number; };

class Canvas2D {
  // canvas 上下文
  context: CanvasContext;
  // canvas 宽高
  width: number;
  height: number;
  // 绘制背景函数
  drawStage: undefined | (() => void);
  // canvas 实体
  elementEntries: Map<string, CanvasElement>;

  constructor(
    canvasEl: HTMLCanvasElement,
    options: CanvasOptions,
    drawStageFunc?: () => void,
    entries?: readonly (readonly [string, CanvasElement])[]
  ) {

    const _context = canvasEl.getContext('2d') as CanvasContext;
    this.context = new Proxy(
      _context,
      { get: this.contextGetter, set: this.contextSetter }
    )

    this.width = options.width;
    this.height = options.height;

    this.drawStage = drawStageFunc?.bind(this) ?? undefined;

    this.elementEntries = new Map<string, CanvasElement>(entries);

  }

  appendElement = (elementKey: string, element: CanvasElement) => {
    this.elementEntries.set(elementKey, element);
  }

  removeElement = (elementKey: string) => {
    this.elementEntries.delete(elementKey);
  }

  setContext = (canvasEl: HTMLCanvasElement,) => {
    const _context = canvasEl.getContext('2d') as CanvasContext;
    this.context = new Proxy(
      _context,
      { get: this.contextGetter, set: this.contextSetter }
    )
  }

  setStage = (drawStageFunc: () => void) => {
    this.drawStage = drawStageFunc.bind(this);
  }

  setSize = (options: Pick<CanvasOptions, 'width' | 'height'>) => {
    this.width = options.width;
    this.height = options.height
  }

  contextGetter = (
    target: CanvasContext,
    prop: PropTypes,
    receiver: any
  ) => {
    // todo track
    return Reflect.get(target, prop, receiver);
  }

  contextSetter = (
    target: CanvasContext,
    prop: PropTypes,
    value: any,
    receiver: any
  ) => {
    // todo trigger
    return Reflect.set(target, prop, value, receiver);
  }
}

export default Canvas2D;
