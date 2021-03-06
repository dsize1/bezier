/*
 * @Author: your name
 * @Date: 2020-12-13 21:55:51
 * @LastEditTime: 2020-12-22 23:13:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\components\Stage\draws.ts
 */
import { timer, animationFrameScheduler, Observable } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import _get from 'lodash/get';
import utils from '../../utils';
import { PADDING, POINT_RADIUS, DUE_TIME, PERIOD, CONTROL_POINT_RADIUS, HALF_PADDING } from './contants';
import { IPoint } from '../../types';
import { IStageOptions, IBezierCurvePoint, IDrawCoordinatesOptions, IDrawCurvePointOptions } from './types';
import { IControlPoints } from '../../models/controlPoints';
import { IControlPlayer } from '../../models/controlPlayer';

const getPoint = (
  origin: IPoint,
  offsetLeft: number,
  offsetBottom: number
): IPoint => {
  return [origin[0] + offsetLeft, origin[1] - offsetBottom];
}

// bezier curve
export const getPoints$ = (
  stageOptions: IStageOptions,
  controlPoints: IControlPoints,
  controlPlayer: IControlPlayer
): Observable<IDrawCurvePointOptions> => {
  const { xLen, yLen } = stageOptions;
  const { cp1x, cp1y, cp2x, cp2y, duration } = controlPoints;
  const controlPoint1: IPoint = [
    utils.toFixed(cp1x * (xLen - POINT_RADIUS), 2),
    utils.toFixed(cp1y * (yLen - POINT_RADIUS), 2)
  ];
  const controlPoint2: IPoint = [
    utils.toFixed(cp2x * (xLen - POINT_RADIUS), 2),
    utils.toFixed(cp2y * (yLen - POINT_RADIUS), 2)
  ];
  const time = xLen - POINT_RADIUS;
  const distance = yLen - POINT_RADIUS;
  const endPoint: IPoint = [time, distance];
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
          percent = percent > 1 ? 1 : percent;
          const { deltaT, deltaD } = utils.calculateBezier(percent, endPoint, controlPoint1, controlPoint2);
          const point: IBezierCurvePoint = {
            start,
            accDis: deltaD,
            accTime: deltaT
          };
          return [stageOptions, point];
        },
        [stageOptions, { start: undefined, accDis: 0, accTime: 0 }]
      ),
      takeWhile(([,{ accTime }]) => accTime < time),
    );
  return points$;
}

export const drawBezierCurvePoint = ([stageOptions, { accTime, accDis }]: IDrawCurvePointOptions) => {
  const { x0, y0, stage } = stageOptions;
  const ctx = utils.getCtxByStage(stage);
  const point = getPoint([x0, y0], accTime, accDis);
  if (ctx) {
    utils.drawPoint(ctx, point, POINT_RADIUS, '#333333');
  }
}

export const drawCoordinates = ([stageOptions, controlPonitsOptions]: IDrawCoordinatesOptions) => {
  // console.log('reset stage');
  const { x0, y0, xLen, yLen, stage, stageW, stageH } = stageOptions;
  const { cp1x, cp1y, cp2x, cp2y } = controlPonitsOptions;
  const ctx = utils.getCtxByStage(stage);
  if (ctx) {
    ctx.save();
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, stageW, stageH);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(PADDING, PADDING + yLen, xLen, yLen);
    ctx.fillStyle = '#333333';
    ctx.font = '14px sans-serif';
    ctx.fillText('Distance', PADDING - HALF_PADDING, PADDING + yLen - HALF_PADDING);
    ctx.fillText('O', x0 - HALF_PADDING, y0 + HALF_PADDING);
    ctx.direction = 'rtl';
    ctx.fillText('duration', stageW - HALF_PADDING, y0 + PADDING);
    const ctrlPoint1 = getPoint([x0, y0], cp1x * xLen, cp1y * yLen);
    const ctrlPoint2 = getPoint([x0, y0], cp2x * xLen, cp2y * yLen);
    utils.drawPoint(ctx, ctrlPoint1, CONTROL_POINT_RADIUS, '#52c41a');
    utils.drawPoint(ctx, ctrlPoint2, CONTROL_POINT_RADIUS, '#ff5722');
    ctx.restore();
  }
}
