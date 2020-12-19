import React, { useMemo, useRef } from 'react';
import { of, concat } from 'rxjs';
import { tap, filter } from 'rxjs/operators';
import useResize from '../../hooks/useResize';
import useControlPoints from '../../models/controlPoints';
import useControlPlayer from '../../models/controlPlayer';
import useMulticast from '../../hooks/useMulticast';
import { drawCoordinates, drawBezierCurvePoint, getPoints$ } from './draws';
import { PADDING } from './contants';
import { IStateOptions, IDrawCoordinatesOptions, IDrawBezierCurveOptions } from './types';

function Stage (props: Partial<{ className: string }>) {
  const { className } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { width, height } = useResize(containerRef.current);

  const { points: controlPonitsOptions } = useControlPoints();
  const { player: controlPlayer, setPlayer: setControlPonitsPlayer } = useControlPlayer();

  const stageOptions: IStateOptions = useMemo(() => {
    const _width = Math.floor(width);
    const _height = Math.floor(height);
    const axisXLength = Math.floor(_width - (2 * PADDING));
    const axisYLength = Math.floor((1 / 3)  * (_height - (2 * PADDING)));
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

  const drawBezierCurve = ([stageOptions, controlPonits, controlPlayer]: IDrawBezierCurveOptions) => {
    const clear$ = of<IDrawCoordinatesOptions>([stageOptions, controlPonits]).pipe(
      tap(drawCoordinates)
    );
    const drawPoints$ = getPoints$(stageOptions, controlPonits, controlPlayer).pipe(
      tap(drawBezierCurvePoint)
    );
    const draw$ = concat(clear$, drawPoints$);
    draw$.subscribe({
      complete: () => {
        setControlPonitsPlayer({ ...controlPlayer, run: false });
      },
      error: () => {
        setControlPonitsPlayer({ ...controlPlayer, run: false });
      }
    });
  }

  useMulticast<IDrawCoordinatesOptions>(
    [drawCoordinates],
    [stageOptions, controlPonitsOptions]
  );

  useMulticast<IDrawBezierCurveOptions>(
    [drawBezierCurve],
    [stageOptions, controlPonitsOptions, controlPlayer],
    (subject) => {
      return subject.pipe(
        filter(([, , { run }]) => run)
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
