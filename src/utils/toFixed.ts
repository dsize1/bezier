/*
 * @Author: your name
 * @Date: 2020-12-12 15:19:04
 * @LastEditTime: 2020-12-12 15:22:19
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\utils\toFixed.ts
 */
export default function toFixed (num: number, pos: number): number {
  return Number(Number.prototype.toFixed.call(num, pos));
}
