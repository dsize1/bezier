import { timer, animationFrameScheduler, Observable } from 'rxjs';
import { scan, takeWhile } from 'rxjs/operators';
import _isNumber from 'lodash/isNumber';
import _isFunction from 'lodash/isFunction';
import _map from 'lodash/map';
import _get from 'lodash/get';
import _toPairs from 'lodash/toPairs';
import _pick from 'lodash/pick';
import utils from '../utils';
import { IPoint } from '../types';
import { IMovement, IUnit, ShapeState, ShapeType } from './types';

const percentReg = new RegExp(/^(100|[1-9][0-9]?|0)%$/);
export const percent2Number = (percent: string | number, size: number) => {
  if (_isNumber(percent)) return percent;
  if (!percentReg.test(percent)) return 0;
  return utils.toFixed(Number(percent.slice(0, -1)) / 100 * size, 2)
};

type OrientationType = 0 | 1 | -1; 
interface ICalculateBezierParam {
  distance: number;
  orientation: OrientationType;
  end: IPoint;
  cp1: IPoint;
  cp2: IPoint;
};
type CanvasSizeType = { width: number; height: number; };
interface ICalculateBezierUnit {
  [param: string]: ICalculateBezierParam;
}
const getCalculateBezierUnitParams = (units: Array<IUnit>, { width, height }: CanvasSizeType): Array<ICalculateBezierUnit> => {
  return _map(
    units,
    (unit: IUnit): ICalculateBezierUnit => {
      const { shape, state, duration } = unit;
      const cubicBezier = _get(unit, 'cubicBezier', 'linear');
      const delay = _get(unit, 'delay', 0);
      const name = _pick(shape, ['id', 'alias']);
      const endState = _isFunction(state) ?
        _toPairs(state(shape)) :
        _toPairs(state) ;
      const params = _map(
        endState,
        ([key, end]: [keyof ShapeState, ShapeType[keyof ShapeState]]) => {
          const start = shape[key];
          const value = {
            
          }
          return [key, value];
        }
      );
      return { id: shape.id,  }
    }
  );
};

export const getMovements$ = (units: Array<IUnit>): Observable<Array<IMovement>> => {

};
