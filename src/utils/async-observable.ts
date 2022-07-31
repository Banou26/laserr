import type { Observable } from 'rxjs'
import { from } from 'rxjs'
import { mergeMap } from 'rxjs/operators'

export default <T extends (...args) => Promise<Observable<any>>>(func: T) =>
  (...args: Parameters<T>): Awaited<ReturnType<T>> =>
    from(func(...args))
      .pipe(
        mergeMap(returnObservable => returnObservable)
      ) as Awaited<ReturnType<T>>
