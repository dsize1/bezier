import { timer, animationFrameScheduler, Observable } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import _get from 'lodash/get';
import utils from '../utils';
import { IPoint } from '../types';

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
  sp: IPoint,
  ep: IPoint,
  cp1: IPoint,
  cp2: IPoint,
  duration: number,
  delay: number
): Observable<IMotionValue> => {
  const orientationX = (sp[0] - ep[0]) >= 0 ? 1 : -1;
  const orientationY = (sp[1] - ep[1]) >= 0 ? 1 : -1;
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
          const [deltaX, deltaY] = utils.calculateBezier(percent, sp, ep, cp1, cp2);
          const prevX = acc.x;
          const prevY = acc.y;
          const x = deltaX * orientationX + sp[0];
          const y = deltaY * orientationY + sp[1];
          return { startTime, prevX, prevY, x, y, percent };
        },
        { startTime: undefined, x: 0, y: 0, prevX: undefined, prevY: undefined, percent: 0 }
      ),
      takeWhile(({ percent }) => percent < 1),
    );
  return points$;
}

export default getMotion$;
