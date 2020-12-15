/*
 * @Author: your name
 * @Date: 2020-12-13 22:54:20
 * @LastEditTime: 2020-12-14 23:06:17
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: \bezier\src\type.ts
 */
import { Subject, Observable } from 'rxjs';

export type IPoint = [number, number]

export interface pipelineFunc<T> {
  (sub: Subject<T> | Observable<T>): Observable<T>
}
