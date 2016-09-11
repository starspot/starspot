export function map<T, U>(promises: Promise<T>[] | T[], cb: (value: T, index: number, array: T[]) => U): Promise<U[]> {
  return Promise.all(promises)
    .then(result => result.map(cb));
}