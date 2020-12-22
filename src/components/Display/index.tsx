import React, { useMemo, useRef, useState } from 'react';
import _isNil from 'lodash/isNil';
import { tap, filter, first } from 'rxjs/operators';
import useResize from '../../hooks/useResize';
import utils from '../../utils';
import useControlPoints from '../../models/controlPoints';
import useControlPlayer from '../../models/controlPlayer';
import useMulticast from '../../hooks/useMulticast';
import { DUE_TIME } from '../Stage/contants';
import { IDisplayStageOptions, IDrawBallMotionOptions } from './types';
import styles from './display.module.css';

const getCls = utils.getStyleCls(styles);

const BALL_RADIUS = 12.5;

function Display() {
  const [isTop, setIsTop] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height } = useResize(containerRef.current);

  const { points: controlPoints } = useControlPoints();
  const { player: controlPlayer } = useControlPlayer();

  const stageOptions: IDisplayStageOptions = useMemo(() => {
    const _width = Math.floor(width);
    const _height = Math.floor(height);
    const originX = _width / 2;
    const originY = isTop ?
      BALL_RADIUS :
      _height - BALL_RADIUS;
    const endX = originX;
    const endY = !isTop ?
      BALL_RADIUS:
      _height - BALL_RADIUS;
    return {
      startPoint: [originX, originY],
      endPoint: [endX, endY],
      stageW: _width,
      stageH: _height,
      stage: canvasRef
    };
  }, [width, height, isTop]);

  const drawInitialStage = ([stageOptions]: [IDisplayStageOptions]) => {
    const { startPoint, stage, stageW, stageH } = stageOptions;
    const ctx = utils.getCtxByStage(stage);
    if (ctx) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, stageW, stageH);
      utils.drawPoint(ctx, startPoint, BALL_RADIUS, '#d87093');
      ctx.restore();
    }
  }

  const drawBallAction = ([stageOptions, controlPoints, controlPlayer]: IDrawBallMotionOptions) => {
    const { startPoint, endPoint, stage, stageW, stageH } = stageOptions;
    const { duration } = controlPoints;
    const ctx = utils.getCtxByStage(stage);
    const drawMotion$ = utils.getMotion$(startPoint, endPoint, controlPoints, duration, DUE_TIME)
      .pipe(
        tap(({ x, y, prevX, prevY }) => {
          if (ctx) {
            ctx.save();
            if (!_isNil(prevX) && !_isNil(prevY) ) {
              ctx.fillStyle = '#ffffff';
              ctx.fillRect(0, 0, stageW, stageH);
            }
            utils.drawPoint(ctx, [x, y], BALL_RADIUS, '#d87093');
            ctx.restore();
          }
        })
      );
    drawMotion$.subscribe({
      complete: () => {
        setIsTop((is) => !is);
      },
      error: () => {
        setIsTop((is) => !is);
      }
    });
  };

  useMulticast<[IDisplayStageOptions]>(
    [drawInitialStage],
    [stageOptions]
  );

  useMulticast<IDrawBallMotionOptions>(
    [drawBallAction],
    [stageOptions, controlPoints, controlPlayer],
    (subject) => {
      return subject.pipe(
        filter(([, , { run }]) => run)
      );
    }
  );

  return (
    <div className={getCls('container')} ref={containerRef}>
      <canvas ref={canvasRef} width={stageOptions.stageW} height={stageOptions.stageH} />
    </div>
  );
}

export default Display;
