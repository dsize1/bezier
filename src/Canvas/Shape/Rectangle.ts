import { v4 } from 'uuid';
import _each from 'lodash/each';
import _set from 'lodash/set';
import Canvas from '../index';

export interface IInitialRectangle {
  x: number;
  y: number;
  width: number;
  height: number;
  fillStyle?: string;
  drawType?: 'fill' | 'stroke';
  alias?: string;
}
export type RectangleState = Partial<Omit<IInitialRectangle, 'alias'>>;
export type RectanglePosition = Partial<Pick<IInitialRectangle, 'x' | 'y' | 'width' | 'height'>>
class Rectangle {
  public readonly id: string;
  public readonly alias: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public fillStyle: string | undefined;
  public drawType: 'fill' | 'stroke';
  
  static type = 'rectangle';

  constructor({ x, y, width, height, fillStyle, drawType, alias }: IInitialRectangle) {
    this.id = v4();
    this.alias = alias || this.id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    this.drawType = drawType || 'fill';
  }

  public setState (nextState: RectangleState) {
    _each(nextState, (value, key) => {
      _set(this, key, value);
    });
  } 

  public draw (canvas: Canvas) {
    const { context: ctx } = canvas;
    ctx.save();
    ctx.beginPath();
    ctx.rect(this.x, this.y, this.width, this.height);
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

export default Rectangle;
