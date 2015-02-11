var Promise = require('native-or-bluebird');

function reduce(arr, callback, accumulator) {
    var currentPromise = arr.shift();

    if (!currentPromise) {
        return Promise.resolve(accumulator);
    }

    var callbackResult = callback(accumulator, currentPromise),
        thenFunction = function (accumulator) {
            return reduce(arr, callback, accumulator);
        };

    if (callbackResult.then) {
        return callbackResult.then(thenFunction);
    }

    if (callbackResult) {
        return Promise.resolve(callbackResult).then(thenFunction);
    }
    return Promise.reject(callbackResult);
}

module.exports = reduce;