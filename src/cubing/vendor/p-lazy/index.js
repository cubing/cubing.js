// TODO: Use private class fields when ESLint support it.

export default class PLazy extends Promise {
	constructor(executor) {
		super(resolve => {
			resolve();
		});

		this._executor = executor;
	}

	static from(function_) {
		return new PLazy(resolve => {
			resolve(function_());
		});
	}

	static resolve(value) {
		return new PLazy(resolve => {
			resolve(value);
		});
	}

	static reject(error) {
		return new PLazy((resolve, reject) => {
			reject(error);
		});
	}

	then(onFulfilled, onRejected) {
		this._promise = this._promise || new Promise(this._executor);
		// eslint-disable-next-line promise/prefer-await-to-then
		return this._promise.then(onFulfilled, onRejected);
	}

	catch(onRejected) {
		this._promise = this._promise || new Promise(this._executor);
		return this._promise.catch(onRejected);
	}
}
