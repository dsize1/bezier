import { v4 } from 'uuid';
import _each from 'lodash/each';
import _set from 'lodash/set';
import _isFunction from 'lodash/isFunction';
import { percent2Number } from '../utils';
import Canvas from '../index';

const TWO_PI = Math.PI * 2;

interface IInitialCircle {
  x: number | string;
  y: number | string;
  radius: number | string;
  fillStyle?: string;
  drawType?: 'fill' | 'stroke';
  alias?: string;
}
export type ICircleState = Partial<Omit<IInitialCircle, 'alias'>>;
class Circle {
  public id: string;
  public alias: string;
  public x: number | string;
  public y: number | string;
  public radius: number | string;
  public fillStyle: string | undefined;
  public drawType: 'fill' | 'stroke';
  
  static type = 'circle';

  constructor({ x, y, radius, fillStyle, drawType, alias }: IInitialCircle) {
    this.id = v4();
    this.alias = alias || this.id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.fillStyle = fillStyle;
    this.drawType = drawType || 'fill';
  }

  public setState (nextState: ICircleState) {
    _each(nextState, (value, key) => {
      _set(this, key, value);
    });
  }

  public draw (canvas: Canvas) {
    const { context: ctx, width, height } = canvas;
    const x = percent2Number(this.x, width);
    const y = percent2Number(this.y, height);
    const r = percent2Number(this.radius, width);
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, r, 0, TWO_PI);
    ctx.closePath();
    if (this.fillStyle) {
      ctx.fillStyle = this.fillStyle;
    }
    if (this.drawType === 'fill') {
      ctx.fill();
    } else {
      ctx.stroke();
    }
    ctx.restore();
  }
}

export default Circle;
