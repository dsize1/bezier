/* eslint-disable react-hooks/rules-of-hooks */
import { useEffect, useState, useRef } from 'react';
import { Subject, Observable, Subscription } from 'rxjs';
import { pipelineFunc } from '../../types';

export const useSubject = <T extends any[]>(
  observers: any[],
  dependency: T,
  pipeline?: pipelineFunc<T>
) => {
  const subRef = useRef(new Subject<T>());

  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    let sub: Observable<T> | Subject<T> = subRef.current;
    const subscriptions: Subscription[] = [];
    if (sub) {
      console.log('start');
      if (pipeline) {
        sub = pipeline(sub);
      }

      observers.forEach((ob) => {
        if (typeof ob === 'function' ) {
          subscriptions.push(sub.subscribe(ob));
        }
      });
      setIsSubscribed(true);
      return () => {
        console.log('over');
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
        console.log('deps changed')
        sub.next(dependency);
      }
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isSubscribed, ...dependency]
  );
}
