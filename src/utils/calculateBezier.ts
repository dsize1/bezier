/*
 * @Author: your name
 * @Date: 2020-12-13 22:38:52
 * @LastEditTime: 2020-12-13 22:55:54
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\components\Stage\utils.ts
 */
import toFixed from './toFixed';
import { IPoint } from '../types';

export default function calculateBezier (t: number, start: IPoint, end: IPoint, control1: IPoint, control2: IPoint): IPoint {
  const [xS, yS] = start;
  const [xE, yE] = end;
  const [x1, y1] = control1;
  const [x2, y2] = control2;
  const tPow2 = t * t;
  const tPow3 = tPow2 * t;
  const nt = 1 - t;
  const ntPow2 = nt * nt;
  const ntPow3 = ntPow2 * nt;
  const x = xS * ntPow3 +
    3 * x1 * t * ntPow2 +
    3 * x2 * tPow2 * nt +
    xE * tPow3;
  const y =  yS * ntPow3 +
    3 * y1 * t * ntPow2 +
    3 * y2 * tPow2 * nt +
    yE * tPow3;
  return [toFixed(x, 2), toFixed(y, 2)];
}
