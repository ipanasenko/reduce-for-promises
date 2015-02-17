var Promise = require('native-or-bluebird');

module.exports = (function () {
	var i = 0,
			resetI = function (result) {
				i = 0;
				return result;
			},
			resetIFail = function (reason) {
				resetI();
				return Promise.reject(reason);
			},
			increaseI = function () {
				i += 1;
			};

	return function reduce(arr, callback, accumulator) {
		var currentPromise = arr.shift();
		if (!currentPromise) {
			return Promise.resolve(accumulator).then(resetI);
		}

		var callbackResult = callback(accumulator, currentPromise, i),
				thenFunction = function (accumulator) {
					return reduce(arr, callback, accumulator);
				};

		increaseI();

		if (callbackResult && callbackResult.then) {
			return callbackResult.then(thenFunction, resetIFail);
		}

		if (callbackResult) {
			return Promise.resolve(callbackResult).then(thenFunction, resetIFail);
		}
		return Promise.reject(callbackResult).then(resetI);
	};
}());