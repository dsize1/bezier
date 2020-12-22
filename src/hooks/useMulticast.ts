/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState } from 'react';
import useConstant from 'use-constant';
import { Subject, Observable, Subscription } from 'rxjs';
import { pipelineFunc } from './types';

const useMulticast = <T extends any[]>(
  observers: any[],
  dependency: T,
  pipeline?: pipelineFunc<T>
) => {
  const sub = useConstant(() => new Subject<T>());

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (sub) {
      console.log('subscribe');
      const subscriptions: Subscription[] = [];
      let op: Observable<T> | Subject<T> = pipeline ?
        pipeline(sub) :
        sub

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
      // todo 各dependency产生observable
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
