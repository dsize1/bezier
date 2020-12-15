import React, { useMemo, useEffect, useRef } from 'react';
import { timer } from 'rxjs';
import { throttle } from 'rxjs/operators';
import useControlPoints from '../../models/controlPoints';
import { useSubject } from './hooks';
import { drawCoordinates, drawBezierCurve } from './draws';
import { PADDING } from './contants';
import { IStageViewProps, IStateOptions } from './types';
import { IControlPoints } from '../../models/controlPoints';

function Stage ({ width, height }: IStageViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { points: controlPonitsOptions } = useControlPoints();

  const stageOptions: IStateOptions = useMemo(() => {
    const originX = PADDING;
    const originY = height - PADDING;
    const axisXLength = width - (2 * PADDING);
    const axisYLength = height - (2 * PADDING);
    return {
      x0: originX,
      y0: originY,
      xLen: axisXLength,
      yLen: axisYLength,
      stageW: width,
      stageH: height,
      stage: canvasRef
    };
  }, [width, height]);

  useEffect(() => {
    drawCoordinates(stageOptions);
  }, [stageOptions])

  const log = (...args: any[]) => {
    console.log(...args);
  }

  useSubject<[IStateOptions, IControlPoints]>(
    [drawBezierCurve, log],
    [stageOptions, controlPonitsOptions],
    (subject) => {
      return subject.pipe(
        throttle(([, { duration }]) => {
          return timer(duration + 100);
        })
      );
    }
  );

  return (
    <div>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  )
}

export default Stage;
