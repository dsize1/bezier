import React, { useRef } from 'react';
import Canvas from '../../Canvas';
import utils from '../../utils';
import styles from './display.module.css';

const getCls = utils.getStyleCls(styles);

const Quadtree = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<Canvas>();
  return (
    <div className={getCls('container')} ref={containerRef} />
  );
};

export default Quadtree;
