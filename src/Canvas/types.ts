export interface IMovement {
  startTime: number | undefined;
  x: number;
  y: number;
  prevX: number | undefined;
  prevY: number | undefined;
  percent: number;
}