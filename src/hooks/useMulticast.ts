/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useRef } from 'react';
import { Subject, Observable, Subscription } from 'rxjs';
import { pipelineFunc } from './types';

const useMulticast = <T extends any[]>(
  observers: any[],
  dependency: T,
  pipeline?: pipelineFunc<T>
) => {
  const subRef = useRef(new Subject<T>());

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    console.log('subscribe');
    const subscriptions: Subscription[] = [];
    if (subRef.current) {
      let op: Observable<T> | Subject<T> = pipeline ?
        pipeline(subRef.current) :
        subRef.current

      observers.forEach((observer) => {
        if (typeof observer === 'function' ) {
          subscriptions.push(op.subscribe(observer));
        }
      });
      setIsSubscribed(true);
      return () => {
        console.log('unsubscribe');
        subscriptions.forEach((subscription) => {
          subscription.unsubscribe();
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () => {
      const sub = subRef.current;
      if (isSubscribed) {
        console.log('deps changed', ...dependency);
        sub.next(dependency);
      }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSubscribed, ...dependency]
  );
}

export default useMulticast;
