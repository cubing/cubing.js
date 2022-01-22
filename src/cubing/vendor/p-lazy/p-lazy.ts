// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// TODO: Use private class fields when ESLint support it.

export class PLazy<T> extends Promise<T> {
  constructor(executor) {
    super((resolve) => {
      resolve();
    });

    this._executor = executor;
  }

  static from(function_) {
    return new PLazy((resolve) => {
      resolve(function_());
    });
  }

  static resolve(value) {
    return new PLazy((resolve) => {
      resolve(value);
    });
  }

  static reject(error) {
    return new PLazy((_resolve, reject) => {
      reject(error);
    });
  }

  then(onFulfilled, onRejected) {
    this._promise = this._promise || new Promise(this._executor);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    this._promise = this._promise || new Promise(this._executor);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this._promise.catch(onRejected);
  }
}

export function from<T>(function_): Promise<T> {
  return new PLazy((resolve) => {
    resolve(function_());
  });
}
