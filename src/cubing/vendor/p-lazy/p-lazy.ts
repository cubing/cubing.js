// TODO: Use private class fields when ESLint support it.

// @ts-ignore
export class PLazy<T> extends Promise<T> {
  // @ts-ignore
  constructor(executor) {
    super((resolve) => {
      // @ts-ignore
      resolve();
    });

    // @ts-ignore
    this._executor = executor;
  }

  // @ts-ignore
  static from(function_) {
    // @ts-ignore
    return new PLazy((resolve) => {
      resolve(function_());
    });
  }

  // @ts-ignore
  static resolve(value) {
    // @ts-ignore
    return new PLazy((resolve) => {
      resolve(value);
    });
  }

  // @ts-ignore
  static reject(error) {
    // @ts-ignore
    return new PLazy((_resolve, reject) => {
      reject(error);
    });
  }

  // @ts-ignore
  then(onFulfilled, onRejected) {
    // @ts-ignore
    this._promise = this._promise || new Promise(this._executor);
    // @ts-ignore
    return this._promise.then(onFulfilled, onRejected);
  }

  // @ts-ignore
  catch(onRejected) {
    // @ts-ignore
    this._promise = this._promise || new Promise(this._executor);
    // @ts-ignore
    return this._promise.catch(onRejected);
  }
}

// @ts-ignore
export function from<T>(function_): Promise<T> {
  // @ts-ignore
  return new PLazy((resolve) => {
    resolve(function_());
  });
}
