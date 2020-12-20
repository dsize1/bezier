import { IPoint } from '../types';

const TWO_PI = Math.PI * 2;

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  point: IPoint,
  radius: number,
  fillStyle: string
) => {
  const [x, y] = point;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.fillStyle = fillStyle;
  ctx.arc(x, y, radius, 0, TWO_PI);
  ctx.fill();
  ctx.closePath();
}

export default drawPoint;
