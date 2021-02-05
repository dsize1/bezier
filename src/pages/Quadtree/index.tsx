import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from 'antd';
import _throttle from 'lodash/throttle';
import Canvas from '../../Canvas';
import { IEvent } from '../../Canvas/utils/Event';
import Circle from '../../Canvas/Shape/Circle';
import Rectangle from '../../Canvas/Shape/Rectangle';
import utils from '../../utils';
import styles from './style.module.css';

const getCls = utils.getStyleCls(styles);

const RECTANGLE_COLOR = '#4169e1';
const CIRCLE_COLOR = '#d87093';

const getRectParams = (w: number, h: number) => {
  const x = utils.random(0, w);
  const y = utils.random(0, h);
  const width = utils.random(
    Math.round(w/50),
    Math.round(w/100)
  );
  const height = utils.random(
    Math.round(h/50),
    Math.round(h/100)
  );
  return { x, y, width, height, fillStyle: RECTANGLE_COLOR };
}

const getCircleParams = (w: number, h: number) => {
  const x = utils.random(0, w);
  const y = utils.random(0, h);
  const radius = utils.random(
    Math.round(w/100),
    Math.round(w/200)
  );
  return { x, y, radius, fillStyle: CIRCLE_COLOR };
}

const Quadtree = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas>();

  const onDrag = useMemo(
    () =>_throttle((event: IEvent) => {
      const shape = event.target;
      const offset = event.offset;
      const move = {
        x: shape.x + offset.x,
        y: shape.y + offset.y
      };
      if (canvasRef.current) {
        canvasRef.current.change(shape.id, move);
        canvasRef.current.clear();
        shape.draw(canvasRef.current);
      }
    }, 200, { leading: false, trailing: true }), 
    []
  );

  const onMouseEnter = (event: IEvent) => {
    const shape = event.target;
    if (canvasRef.current) {
      shape.fillStyle = '#4169e1';
      canvasRef.current.clear();
      shape.draw(canvasRef.current);
    }
  };

  const onMouseLeave = (event: IEvent) => {
    const shape = event.target;
    if (canvasRef.current) {
      shape.fillStyle = '#d87093';
      canvasRef.current.clear();
      shape.draw(canvasRef.current);
    }
  };

  const onMouseDown = (event: IEvent) => {
    const shape = event.target;
    if (canvasRef.current) {
      shape.fillStyle = '#f0f';
      canvasRef.current.clear();
      shape.draw(canvasRef.current);
    }
  };

  const onMouseUp = (event: IEvent) => {
    const shape = event.target;
    if (canvasRef.current) {
      shape.fillStyle = '#4169e1';
      canvasRef.current.clear();
      shape.draw(canvasRef.current);
    }
  };

  const addRect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rectParams = getRectParams(canvas.width, canvas.height);
    const rect = new Rectangle(rectParams);
    canvas.append(rect.id, rect);
    canvas.test();
  };

  const addCircle = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const circleParams = getCircleParams(canvas.width, canvas.height);
    const circle = new Circle(circleParams);
    circle.on('drag', onDrag);
    circle.on('mouseenter', onMouseEnter);
    circle.on('mouseleave', onMouseLeave);
    circle.on('mouseup', onMouseUp);
    circle.on('mousedown', onMouseDown);
    canvas.append(circle.id, circle);
    canvas.test();
  };

  useEffect(() => {
    if (containerRef.current) {
      canvasRef.current = new Canvas(containerRef.current);
    }
    return () => {
      canvasRef?.current?.destroy();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={getCls('container')}>
      <div className={getCls('stage')} ref={containerRef}/>
      <div className={getCls('controller')}>
        <Button onClick={addRect} type="primary">
          添加矩形
        </Button>
        <Button onClick={addCircle} type="primary" style={{ marginLeft: 12 }} >
          添加圆型
        </Button>
      </div>
    </div>
  );
};

export default Quadtree;
