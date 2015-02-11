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
});