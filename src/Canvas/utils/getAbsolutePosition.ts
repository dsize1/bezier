import _isNumber from 'lodash/isNumber';
import utils from '../../utils';
import { ShapePositionKey, CanvasSize } from '../types';


const percentReg = new RegExp(/^(100|[1-9][0-9]?|0)%$/);
export default function getAbsolutePosition (
  percent: string | number,
  key: ShapePositionKey,
  canvasSize: CanvasSize
): number {
  if (_isNumber(percent)) return percent;
  if (!percentReg.test(percent)) return 0;
  switch(key) {
    case 'x':
    case 'width':
    case 'radius':
      return utils.toFixed(Number(percent.slice(0, -1)) / 100 * canvasSize.width, 2);
    case 'y':
    case 'height':
      return utils.toFixed(Number(percent.slice(0, -1)) / 100 * canvasSize.height, 2)
    default: return 0;
  }
};