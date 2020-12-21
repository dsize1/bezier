import { IPoint } from '../../types';
import { IControlPoints } from '../../models/controlPoints';
import { IControlPlayer } from '../../models/controlPlayer';

export interface IDisplayStageOptions {
  stageW: number;
  stageH: number;
  startPoint: IPoint;
  endPoint: IPoint;
  stage: React.RefObject<HTMLCanvasElement>
};

export type IDrawBallMotionOptions = [IDisplayStageOptions, IControlPoints, IControlPlayer];
