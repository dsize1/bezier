import { useState } from 'react';
import { createModel } from 'hox';

export interface IControlPoints {
  cp1x: number;
  cp1y: number;
  cp2x: number;
  cp2y: number;
  duration: number;
  cubicBezier: string;
}

function useControlPoints() {
  const initialPoints: Readonly<IControlPoints> = {
    cp1x: 0,
    cp1y: 0,
    cp2x: 1,
    cp2y: 1,
    duration: 1000,
    cubicBezier: 'cubic-bezier(0,0,1,1)' 
  };
  const [points, setPoints] = useState<Readonly<IControlPoints>>(initialPoints);
  return {
    initialPoints,
    points,
    setPoints
  }
}

export default createModel(useControlPoints);
