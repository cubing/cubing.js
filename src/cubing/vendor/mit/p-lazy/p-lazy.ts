// @ts-nocheck

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

  // biome-ignore lint/suspicious/noThenProperty: This is implementing the `Promise` API.
  then(onFulfilled, onRejected) {
    this._promise = this._promise || new Promise(this._executor);

    return this._promise.then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    this._promise = this._promise || new Promise(this._executor);

    return this._promise.catch(onRejected);
  }
}

export function from<T>(function_): Promise<T> {
  return new PLazy((resolve) => {
    resolve(function_());
  });
}
