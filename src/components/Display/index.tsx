import React, { useEffect, useMemo, useRef, useState } from 'react';
import useConstant from 'use-constant';
import { tap, filter } from 'rxjs/operators';
import { useObservable } from "rxjs-hooks";
import utils from '../../utils';
import getAbsolutePosition from '../../Canvas/utils/getAbsolutePosition';
import Canvas from '../../Canvas';
import Circle from '../../Canvas/Shape/Circle';
import Rectangle from '../../Canvas/Shape/Rectangle';
import useControlPoints from '../../models/controlPoints';
import useControlPlayer from '../../models/controlPlayer';
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
const RECT = {
  x: 0,
  y: 168.5,
  width: '100%',
  height: RECT_HEIGHT,
  fillStyle: RECT_COLOR 
};
const BALL = {
  x: 84,
  y: 756,
  radius: BALL_RADIUS,
  fillStyle: BALL_COLOR
};

function Display() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas>();
  const rect = useConstant(() => new Rectangle({
    ...RECT,
    width: 0
  }));
  const ball = useConstant(() => new Circle(BALL));

  useEffect(() => {
    if (containerRef.current) {
      canvasRef.current = new Canvas(containerRef.current);
      canvasRef?.current?.init(
        (canvasSize, context, canvas) => {
          canvas.append(rect.id, rect);
          canvas.append(ball.id, ball);
          const rectWidth = getAbsolutePosition(RECT.width, 'width', canvasSize);
          canvas.change(rect.id, { width: rectWidth });
          canvas.drawShapes();
        }
      );
    }
    return () => {
      canvasRef?.current?.destroy();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { points: controlPonits } = useControlPoints();
  const { player: controlPlayer } = useControlPlayer();

  useObservable((_, inputs$) => inputs$.pipe(
    filter((inputs) => {
      const isInitiated = canvasRef?.current?.isInitiated ?? false;
      const run = inputs[1].run;
      return isInitiated && run;
    }),
    tap(([controlPonitsOptions]) => {
      const endY = ball.y === BALL_BOTTOM ? BALL_TOP : BALL_BOTTOM;
      const unit = {
        shape: ball,
        state: { y: endY },
        cubicBezier: controlPonitsOptions.cubicBezier,
        delay: DUE_TIME,
        duration: controlPonitsOptions.duration
      };
      canvasRef?.current?.move(
        unit,
        {
          moving: (_, canvas) => {
            canvas.clear();
            canvas.drawShapes();
          }
        }
      );
    }),
  ), [controlPonits, controlPlayer], [controlPonits, controlPlayer])

  return (
    <div className={getCls('container')} ref={containerRef} />
  );
}

export default Display;
