describe('reduce', function () {

  var reduce = require('../reduce');

  it('should return promise, resolved with accumulator if collection is empty', function (done) {
    reduce([], function () {
    }, 'bla-bla')
      .then(function (result) {
        expect(result).toBe('bla-bla');
        done();
      });
  });

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

  it('should call callback with four arguments', function (done) {
    var arr = [1, 2, 3];
    var reduceSpy = jasmine.createSpy('REDUCE_CALLBACK');
    reduce(arr, function (acc, item) {
      reduceSpy.apply(this, arguments);
      return Promise.resolve(acc + item);
    }, 0).then(function (result) {
      expect(result).toBe(6);
      expect(reduceSpy.calls[0].args).toEqual([0, 1, 0, arr]);
      expect(reduceSpy.calls[1].args).toEqual([1, 2, 1, arr]);
      expect(reduceSpy.calls[2].args).toEqual([3, 3, 2, arr]);
      done();
    });
  });

  it('should call callback with four arguments, no matter how many items at a time', function (done) {
    var arr = [1, 2, 3];
    var reduceSpy = jasmine.createSpy('REDUCE_CALLBACK');
    reduce(arr, function (acc, item, i) {
      reduceSpy.apply(this, arguments);
      acc.sum += item;
      return Promise.resolve(acc);
    }, { sum: 0 }, 2).then(function (result) {
      expect(result.sum).toBe(6);
      expect(reduceSpy.calls[0].args).toEqual([result, 1, 0, arr]);
      expect(reduceSpy.calls[1].args).toEqual([result, 2, 1, arr]);
      expect(reduceSpy.calls[2].args).toEqual([result, 3, 2, arr]);
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
    }, { sum: 0 }, 2).then(function (result) {
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

  it('should resolve a promise with accumulated value, max three items at a time', function (done) {
    var arr = [1, 2];
    var delays = [2000, 200, 600, 1500, 200, 1250, 400, 600, 100, 600];

    var delaysSpy = jasmine.createSpy('DELAYS');

    reduce(arr, function (acc, item, i) {
      return new Promise(function (resolve) {
        setTimeout(function () {
          delaysSpy(item);
          acc.sum += item;
          resolve(acc);
        }, delays[i]);
      });
    }, { sum: 0 }, 3).then(function (result) {
      expect(result.sum).toBe(55);
      expect(delaysSpy.calls[0].args).toEqual([2]);
      expect(delaysSpy.calls[1].args).toEqual([3]);
      expect(delaysSpy.calls[2].args).toEqual([5]);
      expect(delaysSpy.calls[3].args).toEqual([4]);
      expect(delaysSpy.calls[4].args).toEqual([1]);
      expect(delaysSpy.calls[5].args).toEqual([7]);
      expect(delaysSpy.calls[6].args).toEqual([9]);
      expect(delaysSpy.calls[7].args).toEqual([6]);
      expect(delaysSpy.calls[8].args).toEqual([8]);
      expect(delaysSpy.calls[9].args).toEqual([10]);
      done();
    });
    arr.push(3);
    arr.push(4);
    arr.push(5);
    arr.push(6);
    arr.push(7);
    arr.push(8);
    arr.push(9);
    arr.push(10);
  });
});
