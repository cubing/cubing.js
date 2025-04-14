export class InitialValueTracker<T> {
  resolve: (t: T) => void;
  reject: (e?: Error) => void;
  promise: Promise<T>;
  constructor() {
    Object.assign(this, Promise.withResolvers());
  }
}
