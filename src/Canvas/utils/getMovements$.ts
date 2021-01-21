import { timer, animationFrameScheduler, Observable } from 'rxjs';
import { map, scan, takeWhile } from 'rxjs/operators';
import _isFunction from 'lodash/isFunction';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _every from 'lodash/every';
import _some from 'lodash/some';
import _toPairs from 'lodash/toPairs';
import utils from '../../utils';
import Movement from './Movement';
import { IPoint } from '../../types';
import { IMovement, IMovementState, IUnit, ShapePosition, CanvasSize } from '../types';

type OrientationType = 0 | 1 | -1; 
interface ICalculateBezierParam {
  distance: number;
  orientation: OrientationType;
  endP: IPoint;
  cp1P: IPoint;
  cp2P: IPoint;
};

interface ICalculateBezierUnit {
  id: string;
  delay: number;
  duration: number;
  params: Array<ICalculateBezierParam>;
  movements: Array<IMovement>;
  isMoving: boolean;
  isMoved: boolean;
}
const getCalculateBezierUnitsParams = (units: Array<IUnit>, canvasSize: CanvasSize): Array<ICalculateBezierUnit> => {
  return _map(
    units,
    (unit: IUnit): ICalculateBezierUnit => {
      const { shape, state, duration } = unit;
      const cubicBezier = _get(unit, 'cubicBezier', 'linear');
      const [cp1, cp2] = utils.cubicBezier2p(cubicBezier);
      const delay = _get(unit, 'delay', 0);
      const endState = _isFunction(state) ?
        _toPairs(state(shape, canvasSize)) :
        _toPairs(state) ;
      const movements: Array<IMovement> = [];
      const params = _map<any[], ICalculateBezierParam>(
        endState,
        ([key, end]: [keyof ShapePosition, number]): ICalculateBezierParam => {
          const start = shape[key];
          const distance = Math.abs(end - start);
          const orientation = distance === 0 ?
            0 :
            end > start ?
              1 :
              -1;
          const endP: IPoint = [duration, distance];
          const cp1P: IPoint = [duration * cp1[0], distance * cp1[1]];
          const cp2P: IPoint = [duration * cp2[0], distance * cp2[1]];
          movements.push({ startTime: undefined, curr: undefined, prev: undefined, percent: 0, key, start });
          return { distance, orientation, endP, cp1P, cp2P};
        }
      );
      return { id: shape.id, params, delay, duration, movements, isMoving: false, isMoved: false };
    }
  );
};
const PERIOD = 16;

interface IScanAcc {
  startTimeLine: undefined | number;
  unitsParams: Array<ICalculateBezierUnit>;
} 

export default function getMovements$ (
  units: Array<IUnit>,
  canvasSize: CanvasSize,
  unitsState: Movement
): Observable<Array<IMovementState>> {
  const unitsParams = getCalculateBezierUnitsParams(units, canvasSize);
  return timer(0, PERIOD, animationFrameScheduler)
    .pipe(
      scan(
        (acc: IScanAcc): IScanAcc => {
          const currTimeLine = Date.now();
          const startTimeLine = _get(acc, 'startTimeLine', currTimeLine);
          const diffTimeLine = currTimeLine - startTimeLine;
          const accUnitsParams = _map(
            acc.unitsParams,
            (unit: ICalculateBezierUnit) => {
              if (!unit.isMoving && diffTimeLine < unit.delay) return unit;
              const unitMovements = _map(
                unit.movements,
                (movement: IMovement, index: number) => {
                  if (movement.percent >= 1) return movement;
                  const { distance, endP, cp1P, cp2P, orientation } = unit.params[index]
                  const startTime = _get(movement, 'startTime', currTimeLine);
                  const diff = currTimeLine - startTime;
                  let percent = diff / unit.duration;
                  percent = percent > 1 ? 1 : percent;
                  let curr = movement.start;
                  if (distance !== 0) {
                    const { deltaD } = utils.calculateBezier(percent, endP, cp1P, cp2P);
                    curr = curr + (deltaD * orientation);
                    curr = utils.toFixed(curr, 2);
                  }
                  const prev = _get(movement, 'prev', movement.start);
                  unitsState.setState(unit.id, movement.key, curr);
                  return { ...movement, startTime, curr, prev, percent };
                }
              );
              const unitIsMoved = _every(unitMovements, ['percent', 1]);
              return { ...unit, movements: unitMovements, isMoved: unitIsMoved, isMoving: true };
            }
          );
          return { startTimeLine, unitsParams: accUnitsParams };
        },
        { startTimeLine: undefined, unitsParams }
      ),
      takeWhile(({ unitsParams }) => _some(unitsParams, ['isMoved', false]), true),
      map((_) => unitsState.getState())
    )
};
