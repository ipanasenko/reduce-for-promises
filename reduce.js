var Promise = require('native-or-bluebird');

module.exports = (function () {
	var i = 0,
			queueSize, currentQueue, accumulator;

	function handle(fn) {
		return function (result) {
			i = 0;
			currentQueue = undefined;
			fn(result);
		}
	}

	function increaseI(diff) {
		i += diff || 1;
	}

	function isPromise(promise) {
		return promise instanceof Promise;
	}

	function filterQueue() {
		currentQueue = currentQueue.filter(function (item) {
			if (isPromise(item) && item.isFulfilled()) {
				return false;
			}
			return true;
		});
	}

	function toPromise(item) {
		if (item && item.then) {
			// do nothing
		} else if (item) {
			item = Promise.resolve(item);
		} else {
			item = Promise.reject(item);
		}
		return item;
	}

	return function reduce(arr, callback, _accumulator, _queueSize) {
		if (typeof _accumulator !== 'undefined') {
			accumulator = _accumulator
		}
		queueSize = _queueSize || queueSize || 1;

		return new Promise(function (resolve, reject) {
			if (currentQueue && currentQueue.length === 0 && arr.length === 0) {
				// all is ready
				resolve(accumulator);
				return;
			}

			if (!currentQueue) {
				// no current queue - create it
				currentQueue = [];
			}

			// add new items to queue
			if (arr.length) {
				var newItemsCount = queueSize - currentQueue.length,
						newItems = arr.splice(0, newItemsCount);
				Array.prototype.push.apply(currentQueue, newItems.map(function (item) {
					var callbackResult = callback(accumulator, item, i);
					increaseI();
					return toPromise(callbackResult);
				}));
			}

			Promise.race(currentQueue).then(function (accumulator) {
				filterQueue();
				return reduce(arr, callback, accumulator, queueSize);
			}, handle(reject)).then(handle(resolve), handle(reject));
		});
	};
}());