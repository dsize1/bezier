/*
 * @Author: your name
 * @Date: 2020-12-12 15:17:37
 * @LastEditTime: 2020-12-27 11:15:44
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\utils\index.ts
 */
import toFixed from './toFixed';
import calculateBezier from './calculateBezier';
import getStyleCls from './getStyleCls';
import p2CubicBezier from './p2CubicBezier';
import cubicBezier2p from './cubicBezier2p';
import getMotion$ from './getMotion$';
import getCtxByStage from './getCtxByStage';
// todo 封装画各种基础图形的类
import drawPoint from './drawPoint';

const utils = {
  toFixed,
  calculateBezier,
  getStyleCls,
  p2CubicBezier,
  cubicBezier2p,
  getMotion$,
  getCtxByStage,
  drawPoint
}

export default utils;
