import { v4 } from 'uuid';
import _each from 'lodash/each';
import _set from 'lodash/set';
import utils from '../../utils';
import Canvas from '../index';
import { BaseShape } from '../utils/event';
import { Region } from '../utils/Shapes';

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
class Rectangle extends BaseShape {
  public readonly id: string;
  public readonly alias: string;
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public fillStyle: string | undefined;
  public drawType: 'fill' | 'stroke';
  public box: Region;
  
  static type = 'rectangle';

  constructor({ x, y, width, height, fillStyle, drawType, alias }: IInitialRectangle) {
    super();
    this.id = v4();
    this.alias = alias || this.id;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.fillStyle = fillStyle;
    this.drawType = drawType || 'fill';
    this.box = this.getBoundaryBox();
  }

  public setState (nextState: RectanglePosition) {
    _each(nextState, (value, key) => {
      _set(this, key, value);
    });
    this.box = this.getBoundaryBox();
  }

  public resize (now: { width: number; height: number; }, past: { width: number; height: number; }) {
    if (past.width === 0 || past.height === 0) {
      return;
    }
    const proportion = now.width / past.width
    const x = utils.toFixed(this.x * proportion, 2);
    const y = utils.toFixed(this.y * proportion, 2);
    const width = utils.toFixed(this.width * proportion, 2);
    const height = utils.toFixed(this.height * proportion, 2);
    this.setState({ x, y, width, height });
  }

  public getBoundaryBox (): Region {
    return { x: this.x, y: this.y, w: this.width, h: this.height };
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
