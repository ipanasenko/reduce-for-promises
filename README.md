This is a simple implementation of [Promise.reduce](https://github.com/petkaantonov/bluebird/blob/master/API.md#reducefunction-reducer--dynamic-initialvalue---promise), that is available in [Bluebird](https://github.com/petkaantonov/bluebird)

# Installation
```
npm install reduce-for-promises
```

# Usage
```javascript
var reduce = require('reduce-for-promises');
```

# Example
callback function will iterate to next item only after previous item's promise is resolved
```javascript
reduce([1, 2, 3, 4], function (acc, item, i) {
	return new Promise(function (resolve) {
		setTimeout(function () {
			resolve(acc + item);
		}, 1000);
	});
}, 0).then(function (result) {
	console.log(result); // 10
});
```