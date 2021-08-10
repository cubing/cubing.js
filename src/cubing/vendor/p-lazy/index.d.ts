/**
Create a lazy promise that defers execution until it's awaited or when `.then()` or `.catch()` is called.
*/
export default class PLazy<ValueType> extends Promise<ValueType> {
	/**
	Create a `PLazy` promise from a promise-returning or async function.

	@example
	```
	import PLazy from 'p-lazy';

	const lazyPromise = new PLazy(resolve => {
		someHeavyOperation(resolve);
	});

	// `someHeavyOperation` is not yet called

	await doSomethingFun;

	// `someHeavyOperation` is called
	console.log(await lazyPromise);
	```
	*/
	static from<ValueType>(function_: () => ValueType | PromiseLike<ValueType>): PLazy<ValueType>;
}
