import _get from 'lodash/get';
import _isString from 'lodash/isString';
import _isNaN from 'lodash/isNaN';
import { IPoint } from '../types'; 

const re = new RegExp(/(?<=cubic-bezier\()1,2,3,4(?=\))/gi);
const ERROR_MESSAGE = 'Incorrect Cubic-Bezier curve parameters';

type ICubicBezierPoints = [IPoint, IPoint];

const getPoints = (cubicBezier: any): ICubicBezierPoints => {
  if (!_isString(cubicBezier)) throw new Error(ERROR_MESSAGE);
  const result = cubicBezier.split(',').map(Number);
  if (result.some(i => _isNaN(i)) && result.some.length !== 4) throw new Error(ERROR_MESSAGE);
  return [[result[0], result[1]], [result[2], result[3]]];
};

export default function cubicBezier2p (cubicBezier: string): ICubicBezierPoints {
  switch (cubicBezier) {
    case 'ease': return [[.25, .1], [.25, 1]];
    case 'linear': return [[0, 0], [1, 1]];
    case 'ease-in': return [[.42, 0], [1, 1]];
    case 'ease-out': return [[0, 0], [.58, 1]];
    case 'ease-in-out': return [[.42, 0], [.58, 1]];
    default: {
      const result = _get(re.exec(cubicBezier), '[0]');
      return getPoints(result);
    }
  }
};