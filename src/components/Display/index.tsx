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
import { IDisplayStageOptions, IDrawBallMotionOptions } from './types';
import styles from './display.module.css';

const getCls = utils.getStyleCls(styles);

const BALL_RADIUS = 12.5;
const BALL_COLOR = '#d87093';
const RECT_HEIGHT = 600;
const RECT_COLOR = '#ffffff';


function Display() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas>();
  const rect = useConstant(() => new Rectangle({
    x: 0,
    y: 168.5,
    width:
    '100%',
    height: RECT_HEIGHT,
    fillStyle: RECT_COLOR 
  }));
  const ball = useConstant(() => new Circle({
    x: 71.5,
    y: 756,
    radius: BALL_RADIUS,
    fillStyle: BALL_COLOR
  }));

  useEffect(() => {
    if (containerRef.current) {
      canvasRef.current = new Canvas(
        containerRef.current,
        [rect, ball]
      );
    }
    return () => {
      canvasRef?.current?.destroy();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={getCls('container')} ref={containerRef} />
  );
}

export default Display;
