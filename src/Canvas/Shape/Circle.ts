import { v4 } from 'uuid';
import _each from 'lodash/each';
import _set from 'lodash/set';
import Canvas from '../index';

const TWO_PI = Math.PI * 2;

interface IInitialCircle {
  x: number;
  y: number;
  radius: number;
  fillStyle?: string;
  drawType?: 'fill' | 'stroke';
  alias?: string;
}
export type CircleState = Partial<Omit<IInitialCircle, 'alias'>>;
export type CirclePosition = Partial<Pick<IInitialCircle, 'x' | 'y' | 'radius'>>;
class Circle {
  public readonly id: string;
  public readonly alias: string;
  public x: number;
  public y: number;
  public radius: number;
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

  public setState (nextState: CircleState) {
    _each(nextState, (value, key) => {
      _set(this, key, value);
    });
  }

  public draw (canvas: Canvas) {
    const { context: ctx } = canvas;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
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
