/*
 * @Author: your name
 * @Date: 2020-12-13 21:55:51
 * @LastEditTime: 2020-12-19 21:38:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\components\Stage\draws.ts
 */
import { timer, animationFrameScheduler, Observable } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import _get from 'lodash/get';
import utils from '../../utils';
import { PADDING, TWO_PI, POINT_RADIUS, DUE_TIME, PERIOD, CONTROL_POINT_RADIUS, HALF_PADDING } from './contants';
import { IPoint } from '../../types';
import { IStateOptions, IBezierCurvePoint, IDrawCoordinatesOptions, IDrawCurvePointOptions } from './types';
import { IControlPoints } from '../../models/controlPoints';
import { IControlPlayer } from '../../models/controlPlayer';

const getCtxByStage = (
  stage: React.RefObject<HTMLCanvasElement>
): CanvasRenderingContext2D | null | undefined => {
  return stage?.current?.getContext('2d')
}

const getPoint = (
  origin: IPoint,
  offsetLeft: number,
  offsetBottom: number
): IPoint => {
  return [origin[0] + offsetLeft, origin[1] - offsetBottom];
}

// bezier curve
export const getPoints$ = (
  stageOptions: IStateOptions,
  controlPonits: IControlPoints,
  controlPlayer: IControlPlayer
): Observable<IDrawCurvePointOptions> => {
  const { xLen, yLen } = stageOptions;
  const { cp1x, cp1y, cp2x, cp2y } = controlPonits;
  const { duration } = controlPlayer;
  const point1: IPoint = [
    utils.toFixed(cp1x * (xLen - POINT_RADIUS), 2),
    utils.toFixed(cp1y * (yLen - POINT_RADIUS), 2)
  ];
  const point2: IPoint = [
    utils.toFixed(cp2x * (xLen - POINT_RADIUS), 2),
    utils.toFixed(cp2y * (yLen - POINT_RADIUS), 2)
  ];
  const time = xLen - POINT_RADIUS;
  const distance = yLen - POINT_RADIUS;
  const controlPoints: [IPoint, IPoint] = [point1, point2];
  const startPoint: IPoint = [0, 0];
  const endPoint: IPoint = [time, distance];
  const controlPoint1 = controlPoints[0];
  const controlPoint2 = controlPoints[1];
  const points$ = timer(DUE_TIME, PERIOD, animationFrameScheduler)
  // const points$ = timer(DUE_TIME, PERIOD, animationFrameScheduler)
    .pipe(
      scan(
        (acc: IDrawCurvePointOptions): IDrawCurvePointOptions => {
          // 当前时间
          const now = Date.now();
          // 开始时间
          const start = _get(acc, '[1].start', now);
          // 时间差
          const diff = now - start;
          // 计算贝赛尔
          let percent = diff / duration;
          // console.log('percent', percent);
          percent = percent > 1 ? 1 : percent;
          let [deltaTime, deltaDis] = utils.calculateBezier(percent, startPoint, endPoint, controlPoint1, controlPoint2);
          let accTime = deltaTime;
          let accDis = deltaDis;
          const point: IBezierCurvePoint = {
            start,
            accDis,
            accTime
          };
          return [stageOptions, point];
        },
        [stageOptions, { start: undefined, accDis: 0, accTime: 0 }]
      ),
      takeWhile(([,{ accTime }]) => accTime < time),
    );
  return points$;
}

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

export const drawBezierCurvePoint = ([stageOptions, { accTime, accDis }]: IDrawCurvePointOptions) => {
  const { x0, y0, stage } = stageOptions;
  const ctx = getCtxByStage(stage);
  const point = getPoint([x0, y0], accTime, accDis);
  if (ctx) {
    drawPoint(ctx, point, POINT_RADIUS, '#333333');
  }
}

export const drawCoordinates = ([stageOptions, controlPonitsOptions]: IDrawCoordinatesOptions) => {
  // console.log('reset stage');
  const { x0, y0, xLen, yLen, stage, stageW, stageH } = stageOptions;
  const { cp1x, cp1y, cp2x, cp2y } = controlPonitsOptions;
  const ctx = getCtxByStage(stage);
  if (ctx) {
    ctx.save();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, stageW, stageH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(PADDING, PADDING + yLen, xLen, yLen);
    ctx.fillStyle = '#333333';
    ctx.fillText('Distance', PADDING - HALF_PADDING, PADDING + yLen - HALF_PADDING);
    ctx.fillText('O', x0 - HALF_PADDING, y0 + HALF_PADDING);
    ctx.direction = 'rtl';
    ctx.fillText('Time', stageW - HALF_PADDING, y0 + HALF_PADDING);
    const ctrlPoint1 = getPoint([x0, y0], cp1x * xLen, cp1y * yLen);
    const ctrlPoint2 = getPoint([x0, y0], cp2x * xLen, cp2y * yLen);
    drawPoint(ctx, ctrlPoint1, CONTROL_POINT_RADIUS, '#52c41a');
    drawPoint(ctx, ctrlPoint2, CONTROL_POINT_RADIUS, '#ff5722');
    ctx.restore();
  }
}
