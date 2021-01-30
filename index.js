class DeepDataLoader {
	constructor(batchLoadFn) {
		this._batchLoadFn = batchLoadFn;
		this._batch = null;
		this._cache = new Map();
	}

	load(key, prop) {
		const cache = this._cache;

		// Get current batch or create and shedule next batch
		// to run after current callstack has cleared
		const {keys, props, callbacks, cacheHits} = getBatch(this);

		// If value is cached, return promise for cached value.
		// This avoids early round trips (additional network calls).
		if (cache.has(key) && cache.get(key).has(prop)) {
			return new Promise((resolve) => {
				cacheHits.add(() => resolve(cache.get(key).get(prop)));
			});
		}

		// Create promise
		const promise = new Promise((resolve, reject) => {
			keys.add(key);
			props.add(prop);
			if (!callbacks.has(key)) {
				callbacks.set(key, new Map());
			}
			callbacks.get(key).set(prop, {resolve, reject});
		});

		// Set cache / batch
		if (!cache.has(key)) {
			cache.set(key, new Map());
		}
		cache.get(key).set(prop, promise);

		return promise;
	}
}

function getBatch(loader) {
	// If there is a batch and it's not been dispatched
	const currentBatch = loader._batch;
	if (currentBatch && !currentBatch.hasDispatched) {
		return currentBatch;
	}
	// Create and save next batch
	const nextBatch = {
		hasDispatched: false,
		keys: new Set(),
		props: new Set(),
		callbacks: new Map(),
		cacheHits: new Set()
	};
	loader._batch = nextBatch;
	// Shedule next batch, to run after current callstack has cleared
	Promise.resolve().then(() => {
		process.nextTick(() => {
			dispatchBatch(loader, nextBatch);
		});
	});
	return nextBatch;
}

function dispatchBatch (loader, batch) {
	batch.hasDispatched = true;
	const keys = [...batch.keys];
	const props = [...batch.props];
	// If there's nothing to load, resolve any cache hits and return early.
  if (keys.length === 0) {
    resolveCacheHits(batch);
    return;
  }
	console.log('dispatchBatch()', {keys, props})
	loader._batchLoadFn(keys, props)
		.then((values) => dispatchSucceded(loader, batch, values))
		.catch((error) => failedDispatch(loader, batch, error));
}

function dispatchSucceded(loader, batch, values) {
	const keys = [...batch.keys];
	const props = [...batch.props];
	const callbacks = batch.callbacks;

	keys.forEach((key, idx) => {
		props.forEach((prop) => {
			const value = (values[idx] || {});
			const callback = (callbacks.get(key) || new Map()).get(prop);
			if (callback) {
				if (Object.prototype.hasOwnProperty.call(value, prop)) { // value.hasOwnProperty(prop)
					callback.resolve(value[prop]);
				} else {
					callback.reject(new Error('Not found'));
					clearCachePromise(loader, key, prop);
				}
			}
		});
	});
	resolveCacheHits(batch);
}

// Remove failed promises from cache
function failedDispatch(loader, batch, error) {
	batch.callbacks.forEach((callbacksValue, key) => {
		callbacksValue.forEach((callback, prop) => {
			if (callback) {
				callback.reject(error);
				clearCachePromise(loader, key, prop);
			}
		});
	});
	resolveCacheHits(batch);
}

// Resolve chached values
function resolveCacheHits(batch) {
	batch.cacheHits.forEach((cacheHit) => cacheHit());
}

// Clear single promise from cache - for rejected promises
function clearCachePromise(loader, key, prop) {
	const cache = loader._cache;
	if (cache.has(key) && cache.get(key).has(prop)) {
		cache.get(key).delete(prop);
		if (cache.get(key).size === 0) {
			cache.delete(key);
		}
	}
}

module.exports = DeepDataLoader;
