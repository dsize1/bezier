import { IControlPoints } from '../../models/controlPoints';
import { IControlPlayer } from '../../models/controlPlayer';

export interface IBezierCurvePoint{
  start: number | undefined;
  accDis: number;
  accTime: number;
}

export interface IStageViewProps {
  width: number;
  height: number;
}

export interface IStateOptions {
  x0: number;
  y0: number;
  xLen: number;
  yLen: number;
  stageW: number;
  stageH: number;
  stage: React.RefObject<HTMLCanvasElement>;
}

export type IDrawCoordinatesOptions = [IStateOptions, IControlPoints]

export type IDrawCurvePointOptions = [IStateOptions, IBezierCurvePoint];

export type IDrawBezierCurveOptions = [IStateOptions, IControlPoints, IControlPlayer]
