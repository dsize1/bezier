import { useState, useEffect, useCallback, useRef } from 'react'
import { ResizeObserver } from '@juggle/resize-observer';

const useResize = (element: Element | null) => {
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);

  const resizeObserverCallback = useCallback((entries, _observer) => {
    entries.forEach((entry: { contentRect: { width: number; height: number; }; }) => {
      const { width: _width, height: _height } = entry.contentRect;
      console.log('h,w', _width, _height);
      setHeight(_height);
      setWidth(_width);
    });
  }, [setHeight, setWidth]);

  const roRef = useRef<ResizeObserver>(new ResizeObserver(resizeObserverCallback));

  useEffect(() => {
    const ro = roRef.current;
    if (element && ro) {
      ro.observe(element);
    }
    return () => {
      if (ro) {
        ro.disconnect();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [element]);

  return { height, width };
};

export default useResize;