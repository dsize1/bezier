import { IControlPoints } from '../../models/controlPoints';
import { IControlPlayer } from '../../models/controlPlayer';

export interface IDisplayStageOptions {
  x0: number;
  y0: number;
  stageW: number;
  stageH: number;
  xD: number;
  yD: number;
  xLen: number;
  yLen: number;
  stage: React.RefObject<HTMLCanvasElement>
};

export type IDrawBallMotionOptions = [IDisplayStageOptions, IControlPoints, IControlPlayer];
