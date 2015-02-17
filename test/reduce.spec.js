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

	it('should accept three arguments, no matter how many items at a time', function (done) {
		var arr = [1, 2, 3];
		var reduceSpy = jasmine.createSpy('REDUCE_CALLBACK');
		reduce(arr, function (acc, item, i) {
			reduceSpy.apply(this, arguments);
			acc.sum += item;
			return Promise.resolve(acc);
		}, {sum: 0}, 2).then(function (result) {
			expect(result.sum).toBe(6);
			expect(reduceSpy.calls[0].args).toEqual([result, 1, 0]);
			expect(reduceSpy.calls[1].args).toEqual([result, 2, 1]);
			expect(reduceSpy.calls[2].args).toEqual([result, 3, 2]);
			done();
		});
	});

	it('should resolve a promise with accumulated value, max two items at a time', function (done) {
		var arr = [1, 2];
		var delays = [1000, 100, 300, 200, 100];
		var delaysSpy = jasmine.createSpy('DELAYS');
		reduce(arr, function (acc, item, i) {
			return new Promise(function (resolve) {
				setTimeout(function () {
					delaysSpy(item);
					acc.sum += item;
					resolve(acc);
				}, delays[i]);
			});
		}, {sum: 0}, 2).then(function (result) {
			expect(result.sum).toBe(15);
			expect(delaysSpy.calls[0].args).toEqual([2]);
			expect(delaysSpy.calls[1].args).toEqual([3]);
			expect(delaysSpy.calls[2].args).toEqual([4]);
			expect(delaysSpy.calls[3].args).toEqual([5]);
			expect(delaysSpy.calls[4].args).toEqual([1]);
			done();
		});
		arr.push(3);
		arr.push(4);
		arr.push(5);
	});
});