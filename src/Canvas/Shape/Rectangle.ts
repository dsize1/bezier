import { v4 } from 'uuid';
import _each from 'lodash/each';
import _set from 'lodash/set';
import _isFunction from 'lodash/isFunction';
import { percent2Number } from '../utils';
import Canvas from '../index';

interface IInitialRectangle {
  x: number | string;
  y: number | string;
  width: number | string;
  height: number | string;
  fillStyle?: string;
  drawType?: 'fill' | 'stroke';
  alias?: string;
}
export type IRectangleState = Partial<Omit<IInitialRectangle, 'alias'>>;
class Rectangle {
  public readonly id: string;
  public readonly alias: string;
  public x: number | string;
  public y: number | string;
  public width: number | string;
  public height: number | string;
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

  public setState (nextState: IRectangleState) {
    _each(nextState, (value, key) => {
      _set(this, key, value);
    });
  } 

  public draw (canvas: Canvas) {
    const { context: ctx, width, height } = canvas;
    const x = percent2Number(this.x, width);
    const y = percent2Number(this.y, height);
    const w = percent2Number(this.width, width);
    const h = percent2Number(this.height, height);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
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
