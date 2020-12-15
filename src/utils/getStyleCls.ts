/*
 * @Author: your name
 * @Date: 2020-12-15 23:43:35
 * @LastEditTime: 2020-12-15 23:54:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\utils\getStyleCls.ts
 */

export default function getStyleCls (
  styles: { readonly [key: string]: string; },
  prefix?: string
) {
  return function (className: string): string {
    return prefix ? styles[`${prefix}-${className}`] : styles[className];
  }
}
