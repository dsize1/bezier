import React, { useMemo, useEffect, useRef } from 'react';
import { timer } from 'rxjs';
import { throttle, filter } from 'rxjs/operators';
import useResize from '../../hooks/useResize';
import useControlPoints from '../../models/controlPoints';
import useMulticast from '../../hooks/useMulticast';
import { drawCoordinates, drawBezierCurve } from './draws';
import { PADDING } from './contants';
import { IStateOptions } from './types';
import { IControlPoints } from '../../models/controlPoints';

function Stage (props: Partial<{ className: string }>) {
  const { className } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height } = useResize(containerRef.current);

  const { points: controlPonitsOptions } = useControlPoints();

  const stageOptions: IStateOptions = useMemo(() => {
    const _width = Math.floor(width);
    const _height = Math.floor(height);
    const axisXLength = _width - (2 * PADDING);
    const axisYLength = (1 / 3)  * (_height - (2 * PADDING));
    const originX = PADDING;
    const originY = 2 * axisYLength + PADDING;

    return {
      x0: originX,
      y0: originY,
      xLen: axisXLength,
      yLen: axisYLength,
      stageW: _width,
      stageH: _height,
      stage: canvasRef
    };
  }, [width, height]);

  useEffect(() => {
    drawCoordinates([stageOptions, controlPonitsOptions]);
  }, [stageOptions, controlPonitsOptions])

  const log = (...args: any[]) => {
    console.log(...args);
  }

  useMulticast<[IStateOptions, IControlPoints]>(
    [drawBezierCurve, log],
    [stageOptions, controlPonitsOptions],
    (subject) => {
      return subject.pipe(
        filter(([, { duration }]) => duration !== 0),
        throttle(([, { duration }]) => {
          return timer(duration + 100);
        })
      );
    }
  );

  return (
    <div className={className} ref={containerRef}>
      <canvas ref={canvasRef} width={stageOptions.stageW} height={stageOptions.stageH} />
    </div>
  )
}

export default Stage;
