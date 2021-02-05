import { v4 } from 'uuid';
import _each from 'lodash/each';
import _set from 'lodash/set';
import utils from '../../utils';
import Canvas from '../index';
import { BaseShape } from '../utils/Event';
import { Region } from '../utils/Shapes';

const TWO_PI = Math.PI * 2;

interface IInitialCircle {
  x: number;
  y: number;
  radius: number;
  zIndex?: number;
  fillStyle?: string;
  drawType?: 'fill' | 'stroke';
  alias?: string;
}
export type CircleState = Partial<Omit<IInitialCircle, 'alias'>>;
export type CirclePosition = Partial<Pick<IInitialCircle, 'x' | 'y' | 'radius'>>;
class Circle extends BaseShape {
  public readonly id: string;
  public readonly alias: string;
  public x: number;
  public y: number;
  public radius: number;
  public zIndex: number;
  public fillStyle: string | undefined;
  public drawType: 'fill' | 'stroke';
  public box: Region;
  public createAt: number;
  
  static type = 'circle';

  constructor({ x, y, radius, fillStyle, drawType, alias, zIndex }: IInitialCircle) {
    super();
    this.id = v4();
    this.alias = alias || this.id;
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.zIndex = zIndex || 0;
    this.fillStyle = fillStyle;
    this.drawType = drawType || 'fill';
    this.box = this.getBoundaryBox();
    this.createAt = performance.now();
  }

  public setState (nextState: CirclePosition) {
    _each(nextState, (value, key) => {
      _set(this, key, value);
    });
    this.box = this.getBoundaryBox();
    this.createAt = performance.now();
  }

  public resize (now: { width: number; height: number; }, past: { width: number; height: number; }) {
    if (past.width === 0 || past.height === 0) {
      return;
    }
    const proportion = now.width / past.width
    const x = utils.toFixed(this.x * proportion, 2);
    const y = utils.toFixed(this.y * proportion, 2);
    const radius = utils.toFixed(this.radius * proportion, 2);
    this.setState({ x, y, radius });
  }

  public getBoundaryBox (): Region {
    const x = this.x - this.radius;
    const y = this.y - this.radius;
    const w = this.radius * 2;
    const h = w;
    return { x, y, w, h };
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
