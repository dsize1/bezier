import Circle, { ICircleState } from './Shape/Circle';
import Rectangle, { IRectangleState } from './Shape/Rectangle';

export interface IMovement {
  startTime: number | undefined;
  x: number;
  y: number;
  prevX: number | undefined;
  prevY: number | undefined;
  percent: number;
  id: string;
}

export type ShapeType = Circle | Rectangle;
export type ShapeState = ICircleState | IRectangleState;
export type CanvasContext = CanvasRenderingContext2D;

export interface IUnit {
  shape: ShapeType;
  state: ShapeState | ((shape: ShapeType) => ShapeState);
  cubicBezier?: string;
  delay?: number;
  duration: number;
};