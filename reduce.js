function handleResult(handleFn) {
  return function (result) {
    handleFn(result);
  };
}

function promisify(value) {
  if (value.then) {
    return value;
  }

  return Promise.resolve(value);
}


module.exports = function reduce(collection, callback, accumulator, maxQueueSize, currentQueue, nextItemIndex) {

  maxQueueSize = maxQueueSize || 1;
  currentQueue = currentQueue || [];
  nextItemIndex = nextItemIndex || 0;

  return new Promise(function (resolve, reject) {

    var lastCollectionIndex = collection.length - 1;

    // already iterated over all items in collection
    if (nextItemIndex > lastCollectionIndex && currentQueue.length === 0) {
      resolve(accumulator);
      return;
    }

    var availableSlots = maxQueueSize - currentQueue.length;
    var itemsToAddToQueue = collection.slice(nextItemIndex, nextItemIndex + availableSlots);

    currentQueue = currentQueue.concat(
      itemsToAddToQueue.map(function (item, i) {
        var index = i + nextItemIndex;
        var itemPromise = promisify(callback(accumulator, item, index, collection))
          .then(function (result) {
            return {
              item: item,
              value: result
            };
          });

        itemPromise.item = item;

        return itemPromise;
      })
    );

    if (currentQueue.length === 0) {
      resolve(accumulator);
      return;
    }

    Promise.race(currentQueue)
      .then(function (result) {
        // remove resolved item from queue
        currentQueue = currentQueue.filter(function (itemPromise) {
          return itemPromise.item !== result.item;
        });

        return reduce(collection, callback, result.value, maxQueueSize, currentQueue, nextItemIndex + itemsToAddToQueue.length);
      })
      .then(handleResult(resolve))
      .catch(handleResult(reject));
  });

};
