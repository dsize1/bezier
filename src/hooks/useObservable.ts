import { useEffect, useState, useRef } from 'react';
import { Subject, Subscription } from 'rxjs';

const useObservable = <T extends any[]>(observer: any, dependency: T) => {
  const subRef = useRef(new Subject<T>());

  const [isSubscribed, setIsSubscribed] = useState(false);
  
  useEffect(() => {
    if (subRef.current) {
      const subject = subRef.current;
      const subscription: Subscription = subject.subscribe(observer)
      setIsSubscribed(true);
      return () => {
        subscription.unsubscribe();
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

export default useObservable;
