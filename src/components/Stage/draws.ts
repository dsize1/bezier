/*
 * @Author: your name
 * @Date: 2020-12-13 21:55:51
 * @LastEditTime: 2020-12-15 22:22:13
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\components\Stage\draws.ts
 */
import { timer, animationFrameScheduler, Observable, of, concat } from 'rxjs';
import { scan, takeWhile, tap } from 'rxjs/operators';
import _get from 'lodash/get';
import utils from '../../utils';
import { PADDING, TWO_PI, POINT_RADIUS, DUE_TIME, PERIOD } from './contants';
import { IPoint } from '../../types';
import { IStateOptions, IBezierCurvePoint } from './types';
import { IControlPoints } from '../../models/controlPoints';

// bezier curve
const getPoints$ = (
  stageOptions: IStateOptions,
  controlPonitsOptions: IControlPoints
): Observable<[IStateOptions, IBezierCurvePoint]> => {
  const { xLen, yLen } = stageOptions;
  const { cp1x, cp1y, cp2x, cp2y, duration } = controlPonitsOptions;
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
        (acc: [IStateOptions, IBezierCurvePoint]): [IStateOptions, IBezierCurvePoint] => {
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
          if (accDis >= distance) {
            accTime = time;
            accDis = distance;
          }
          const point: IBezierCurvePoint = {
            start,
            accDis,
            accTime
          };
          return [stageOptions, point];
        },
        [stageOptions, { start: undefined, accDis: 0, accTime: 0 }]
      ),
      takeWhile(([,{ accTime, accDis }]) => accTime < time && accDis < distance),
    );
  return points$;
}

const clearCoordinates = (stageOptions: IStateOptions) => {
  // console.log('clear');
  const { xLen, yLen, stage } = stageOptions;
  const canvas = stage?.current;
  const ctx = canvas?.getContext('2d');
  if (ctx) {
    ctx.clearRect(PADDING, PADDING, xLen, yLen)
  }
}

const drawPoint = ([stageOptions, { accTime, accDis }]: [IStateOptions, IBezierCurvePoint]) => {
  const { x0, y0, stage } = stageOptions;
  const canvas = stage?.current;
  const ctx = canvas?.getContext('2d');
  if (ctx) {
    ctx.beginPath();
    const currX = x0 + accTime;
    const currY = y0 - accDis;
    ctx.moveTo(currX, currY);
    ctx.arc(currX, currY, POINT_RADIUS, 0, TWO_PI);
    ctx.fill();
    ctx.closePath();
  }
}

export const drawCoordinates = (stageOptions: IStateOptions) => {
  const { x0, y0, xLen, yLen, stage, stageW, stageH } = stageOptions;
  const canvas = stage?.current;
  const ctx = canvas?.getContext('2d');
  if (ctx) {
    ctx.strokeRect(PADDING - 1, PADDING - 1, xLen + 2, yLen + 2);
    ctx.fillText('Distance', PADDING - 18, PADDING - 6);
    ctx.fillText('O', x0 - 12, y0 + 12);
    ctx.save();
    ctx.direction = 'rtl';
    ctx.fillText('Time', stageW - 18, stageH - 6);
    ctx.restore();
  }
}

export const drawBezierCurve = ([stageOptions, controlPonitsOptions]: [IStateOptions, IControlPoints]) => {
  const now = Date.now();
  const clear$ = of(stageOptions).pipe(
    tap(clearCoordinates)
  );
  const drawPoints$ = getPoints$(stageOptions, controlPonitsOptions).pipe(
    tap(drawPoint)
  );
  const draw$ = concat(clear$, drawPoints$);
  draw$.subscribe({
    complete: () => console.log(now)
  });
}
