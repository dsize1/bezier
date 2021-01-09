import React, { useEffect, useMemo, useRef, useState } from 'react';
import useConstant from 'use-constant';
import _isNil from 'lodash/isNil';
import { tap, filter } from 'rxjs/operators';
import utils from '../../utils';
import Canvas from '../../Canvas';
import Circle from '../../Canvas/Shape/Circle';
import Rectangle from '../../Canvas/Shape/Rectangle';
import useControlPoints from '../../models/controlPoints';
import useControlPlayer from '../../models/controlPlayer';
import useMulticast from '../../hooks/useMulticast';
import { DUE_TIME } from '../Stage/contants';
import { IDrawBallMotionOptions } from './types';
import { IPoint } from '../../types';
import styles from './display.module.css';

const getCls = utils.getStyleCls(styles);

const BALL_RADIUS = 12.5;
const BALL_BOTTOM = 756;
const BALL_TOP = 181;
const BALL_COLOR = '#d87093';
const RECT_HEIGHT = 600;
const RECT_COLOR = '#ffffff';

function Display() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas>();
  const rect = useConstant(() => new Rectangle({
    x: 0,
    y: 168.5,
    width: 400,
    height: RECT_HEIGHT,
    fillStyle: RECT_COLOR 
  }));
  const ball = useConstant(() => new Circle({
    x: 84,
    y: 756,
    radius: BALL_RADIUS,
    fillStyle: BALL_COLOR
  }));

  useEffect(() => {
    if (containerRef.current) {
      canvasRef.current = new Canvas(containerRef.current);
      canvasRef.current.append(rect.id, rect);
      canvasRef.current.append(ball.id, ball);
    }
    return () => {
      canvasRef?.current?.destroy();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { points: controlPonitsOptions } = useControlPoints();
  const { player: controlPlayer, setPlayer: setControlPonitsPlayer } = useControlPlayer();

  const draw = (
    [controlPonitsOptions, controlPlayer]: IDrawBallMotionOptions
  ) => {
    const x = ball.x as number;
    const startY = ball.y as number;
    const endY = startY === BALL_BOTTOM ? BALL_TOP : BALL_BOTTOM;
    const startPoint: IPoint = [x, startY];
    const endPoint: IPoint = [x, endY];
    const draw$ = utils.getMotion$(
      startPoint,
      endPoint,
      controlPonitsOptions,
      DUE_TIME
    );
    draw$.subscribe({
      next: ({ x, y }) => {
        canvasRef?.current?.clear();
        canvasRef?.current?.change(rect.id, {});
        canvasRef?.current?.change(ball.id, { x, y });
      },
      complete: () => {
        setControlPonitsPlayer({ ...controlPlayer, run: false });
      },
      error: () => {
        setControlPonitsPlayer({ ...controlPlayer, run: false });
      }
    });
  };

  useMulticast<IDrawBallMotionOptions>(
    [draw],
    [controlPonitsOptions, controlPlayer],
    (dependency$) => {
      return dependency$.pipe(
        filter((dep) => dep[1].run)
      );
    }
  );

  return (
    <div className={getCls('container')} ref={containerRef} />
  );
}

export default Display;
