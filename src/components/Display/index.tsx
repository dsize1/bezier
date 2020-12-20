import React, { useMemo, useRef, useState } from 'react';
import _isNil from 'lodash/isNil';
import { tap, filter } from 'rxjs/operators';
import useResize from '../../hooks/useResize';
import utils from '../../utils';
import useControlPoints from '../../models/controlPoints';
import useControlPlayer from '../../models/controlPlayer';
import useMulticast from '../../hooks/useMulticast';
import { DUE_TIME } from '../Stage/contants';
import { IDisplayStageOptions, IDrawBallMotionOptions } from './types';
import { IPoint } from '../../types';
import styles from './display.module.css';

const getCls = utils.getStyleCls(styles);

const BALL_RADIUS = 25;

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
      BALL_RADIUS / 2 :
      _height - (BALL_RADIUS / 2);
    const destinationX = originX;
    const destinationY = !isTop ?
      BALL_RADIUS / 2 :
      _height - (BALL_RADIUS / 2);
    return {
      x0: originX,
      y0: originY,
      xD: destinationX,
      yD: destinationY,
      xLen: _width,
      yLen: _height,
      stageW: _width,
      stageH: _height,
      stage: canvasRef
    };
  }, [width, height, isTop]);

  const drawBallAction = ([stageOptions, controlPoints, controlPlayer]: IDrawBallMotionOptions) => {
    const { x0, y0, xD, yD, xLen, yLen, stage } = stageOptions;
    const { cp1x, cp1y, cp2x, cp2y } = controlPoints;
    const { duration } = controlPlayer;
    const ctx = utils.getCtxByStage(stage);
    const startPoint: IPoint = [x0, y0];
    const endPoint: IPoint = [xD, yD];
    const controlPoint1: IPoint = [
      utils.toFixed(cp1x * (xLen - BALL_RADIUS), 2),
      utils.toFixed(cp1y * (yLen - BALL_RADIUS), 2)
    ];
    const controlPoint2: IPoint = [
      utils.toFixed(cp2x * (xLen - BALL_RADIUS), 2),
      utils.toFixed(cp2y * (yLen - BALL_RADIUS), 2)
    ];
    const drawMotion$ = utils.getMotion$(startPoint, endPoint, controlPoint1, controlPoint2, duration, DUE_TIME)
      .pipe(
        tap(({ x, y, prevX, prevY }) => {
          console.log(x, y);
          if (ctx) {
            if (!_isNil(prevX) && !_isNil(prevY) ) {
              utils.drawPoint(ctx, [prevX, prevY], BALL_RADIUS, '#333333');
            }
            utils.drawPoint(ctx, [x, y], BALL_RADIUS, '#333333');
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
