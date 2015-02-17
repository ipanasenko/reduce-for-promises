describe('reduce', function () {

	var reduce = require('../reduce');
	var Promise = require('native-or-bluebird');

	it('should resolve a promise with accumulated value', function (done) {
		var arr = [1, 2];
		reduce(arr, function (acc, item) {
			if (item === 2) {
				return acc + item;
			}
			return new Promise(function (resolve) {
				setTimeout(function () {
					resolve(acc + item);
				}, 100);
			});
		}, 0).then(function (result) {
			expect(result).toBe(10);
			done();
		});
		arr.push(3);
		arr.push(4);
	});

	it('should reject a promise when any of array items rejects a promise', function (done) {
		var arr = [1, 2, 3, 4];
		reduce(arr, function (acc, item) {
			return new Promise(function (resolve, reject) {
				setTimeout(function () {
					if (item === 3) {
						reject(item);
					} else {
						resolve(acc + item);
					}
				}, 100);
			});
		}, 0).then(null, function (reason) {
			expect(reason).toBe(3);
			done();
		});
	});

	it('should accept three arguments', function (done) {
		var arr = [1, 2, 3];
		var reduceSpy = jasmine.createSpy('REDUCE_CALLBACK');
		reduce(arr, function (acc, item, i) {
			reduceSpy.apply(this, arguments);
			return Promise.resolve(acc + item);
		}, 0).then(function (result) {
			expect(result).toBe(6);
			expect(reduceSpy.calls[0].args).toEqual([0, 1, 0]);
			expect(reduceSpy.calls[1].args).toEqual([1, 2, 1]);
			expect(reduceSpy.calls[2].args).toEqual([3, 3, 2]);
			done();
		});
	});
});