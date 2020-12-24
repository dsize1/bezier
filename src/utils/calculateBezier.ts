/*
 * @Author: your name
 * @Date: 2020-12-13 22:38:52
 * @LastEditTime: 2020-12-23 23:24:20
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\components\Stage\utils.ts
 */
import toFixed from './toFixed';
import { IPoint } from '../types';

export type ICalculateBezierResult = { deltaD: number, deltaT: number };
export default function calculateBezier (t: number, end: IPoint, controlPoint1: IPoint, controlPoint2: IPoint): ICalculateBezierResult {
  const [xE, yE] = end;
  const [x1, y1] = controlPoint1;
  const [x2, y2] = controlPoint2;
  const tPow2 = t * t;
  const tPow3 = tPow2 * t;
  const nt = 1 - t;
  const ntPow2 = nt * nt;
  const ntPow2MultiplyBy3t = ntPow2 * 3 * t;
  const tPow2MultiplyBy3nt = tPow2 * 3 * nt;
  const x =
    x1 * ntPow2MultiplyBy3t +
    x2 * tPow2MultiplyBy3nt +
    xE * tPow3;
  const y =
    y1 * ntPow2MultiplyBy3t +
    y2 * tPow2MultiplyBy3nt +
    yE * tPow3;
  return { deltaD: toFixed(y, 2), deltaT: toFixed(x, 2) };
};
