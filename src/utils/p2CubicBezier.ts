/*
 * @Author: your name
 * @Date: 2020-12-19 20:54:27
 * @LastEditTime: 2020-12-19 20:57:07
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\utils\p2CubicBezier.ts
 */
import { IControlPoints } from '../models/controlPoints';

export default function p2CubicBezier ({ cp1x, cp1y, cp2x, cp2y }: IControlPoints): string {
  return `cubic-bezier(${cp1x},${cp1y},${cp2x},${cp2y})`;
};
