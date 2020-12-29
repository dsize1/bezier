import { Subject, Observable } from 'rxjs';

export interface pipelineFunc<T> {
  (dep$: Subject<T> | Observable<T>): Observable<any>
}
