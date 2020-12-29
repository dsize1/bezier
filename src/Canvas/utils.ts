import _isNumber from 'lodash/isNumber';
import utils from '../utils';

const percentReg = new RegExp(/^(100|[1-9][0-9]?|0)%$/);
export const percent2Number = (percent: string | number, size: number) => {
  if (_isNumber(percent)) return percent;
  if (!percentReg.test(percent)) return 0;
  return utils.toFixed(Number(percent.slice(0, -1)) / 100 * size, 2)
}