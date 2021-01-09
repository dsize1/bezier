import Circle, { CircleState, CirclePosition } from './Shape/Circle';
import Rectangle, { RectangleState, RectanglePosition } from './Shape/Rectangle';

export type ShapeType = Circle | Rectangle;
export type ShapeState = CircleState | RectangleState;
export type ShapeStateKey = keyof CircleState | keyof RectangleState;
export type ShapePosition = CirclePosition | RectanglePosition;
export type ShapePositionKey = keyof CirclePosition | keyof RectanglePosition;
export type CanvasContext = CanvasRenderingContext2D;
export type CanvasSize = { width: number; height: number; };
export interface IUnit {
  shape: ShapeType;
  state: ShapeState | ((shape: ShapeType, canvasSize: CanvasSize) => ShapePosition);
  cubicBezier?: string;
  delay?: number;
  duration: number;
};

export interface IMovement{
  startTime: number | undefined;
  curr: number | undefined;
  prev: number | undefined;
  percent: number;
  key: ShapePositionKey;
  start: number;
}

export interface IMovementState{
  id: string;
  state: ShapeState;
};
