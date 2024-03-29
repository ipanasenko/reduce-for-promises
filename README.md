This is a simple implementation of [Promise.reduce](https://github.com/petkaantonov/bluebird/blob/master/API.md#reducefunction-reducer--dynamic-initialvalue---promise), that is available in [Bluebird](https://github.com/petkaantonov/bluebird)

# Installation
```
npm install reduce-for-promises
```

# Usage
```ts
import reduce from 'reduce-for-promises';
```

# Example
Callback function will iterate to next item only after previous item's promise is resolved
```ts
const result = await reduce([1, 2, 3, 4], function (acc, item) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve(acc + item);
    }, 1000);
  });
}, 0);
console.log(result); // 10
```

You can set fourth argument to reduce if you want to set step size. For example, if you want two items to be processed at a time, here is the example
```ts
const delays = [1000, 100, 300, 200, 100];
const { sum } = await reduce([1, 2, 3, 4, 5], function (acc, item, i) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      acc.sum += item;
      resolve(acc);
    }, delays[i]);
  });
}, {sum: 0}, 2);
console.log(sum); // 15
```
Please note that if you set step argument, make sure to use object as accumulator. Otherwise it won't be carried properly between callback iterations
