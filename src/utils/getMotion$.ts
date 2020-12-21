import { timer, animationFrameScheduler, Observable } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import _get from 'lodash/get';
import utils from '../utils';
import { IPoint } from '../types';
import { IControlPoints } from '../models/controlPoints';

interface IMotionValue {
  startTime: number | undefined;
  x: number;
  y: number;
  prevX: number | undefined;
  prevY: number | undefined;
  percent: number;
}

const PERIOD = 16;

const getMotion$ = (
  startPoint: IPoint,
  endPoint: IPoint,
  controlPoints: IControlPoints,
  duration: number,
  delay: number
): Observable<IMotionValue> => {
  // todo 用相对值去计算
  const startX: IPoint = [0, startPoint[0]];
  const endX: IPoint = [duration, endPoint[0]];
  const cp1X: IPoint = [
    utils.toFixed(duration * controlPoints.cp1x, 2),
    utils.toFixed(Math.abs(endPoint[0] - startPoint[0]) * controlPoints.cp1y, 2) 
  ];
  const cp2X: IPoint = [
    utils.toFixed(duration * controlPoints.cp2x, 2),
    utils.toFixed(Math.abs(endPoint[0] - startPoint[0]) * controlPoints.cp2y, 2) 
  ];

  const startY: IPoint = [0, startPoint[1]];
  const endY: IPoint = [duration, endPoint[1]];
  const cp1Y: IPoint = [
    utils.toFixed(duration * controlPoints.cp1x, 2),
    utils.toFixed(Math.abs(endPoint[1] - startPoint[1]) * controlPoints.cp1y, 2) 
  ];
  const cp2Y: IPoint = [
    utils.toFixed(duration * controlPoints.cp2x, 2),
    utils.toFixed(Math.abs(endPoint[1] - startPoint[1]) * controlPoints.cp2y, 2) 
  ];

  const points$ = timer(delay, PERIOD, animationFrameScheduler)
    .pipe(
      scan(
        (acc: IMotionValue): IMotionValue => {
          // 当前时间
          const now = Date.now();
          // 开始时间
          const startTime = _get(acc, 'startTime', now);
          // 时间差
          const diff = now - startTime;
          // 计算贝赛尔
          let percent = diff / duration;
          percent = percent > 1 ? 1 : percent;
          let x: number;
          let y: number;
          if (startPoint[0] === endPoint[0]) {
            x = startPoint[0];
          } else {
            const resultX = utils.calculateBezier(percent, startX, endX, cp1X, cp2X);
            x = resultX.deltaD;
          }
          if (startPoint[1] === endPoint[1]) {
            y = startPoint[1];
          } else {
            const resultY = utils.calculateBezier(percent, startY, endY, cp1Y, cp2Y);
            y = resultY.deltaD;
          }
          const prevX = acc.x;
          const prevY = acc.y;
          return { startTime, prevX, prevY, x, y, percent };
        },
        { startTime: undefined, x: 0, y: 0, prevX: undefined, prevY: undefined, percent: 0 }
      ),
      takeWhile(({ percent }) => percent < 1, true),
    );
  return points$;
}

export default getMotion$;
