import { Subject, Observable } from 'rxjs';

export interface pipelineFunc<T> {
  (sub: Subject<T> | Observable<T>): Observable<T>
}
