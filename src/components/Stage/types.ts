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

export interface IStageOptions {
  x0: number;
  y0: number;
  xLen: number;
  yLen: number;
  stageW: number;
  stageH: number;
  stage: React.RefObject<HTMLCanvasElement>;
}

export type IDrawCoordinatesOptions = [IStageOptions, IControlPoints]

export type IDrawCurvePointOptions = [IStageOptions, IBezierCurvePoint];

export type IDrawBezierCurveOptions = [IStageOptions, IControlPoints, IControlPlayer]
