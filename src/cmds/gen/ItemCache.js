var noOpLogger = require('@justinc/no-op-logger');
var SortedArray = require('sorted-array');
var { curry } = require('ramda');

const DEFAULT_COMPARE_FN = (itemA, itemB) => {
  if (itemA.getStrength() < itemB.getStrength()) return -1;
  if (itemA.getStrength() > itemB.getStrength()) return 1;

  return 0;
};

const DEFAULT_OPTS = {
  max: 5,
  log: noOpLogger
};

const DEFAULT_HANDLERS = {
  // 0
  cacheIsNotFull: (cache, item) => {
    cache.addItem(item);
    cache.log.trace(`Added in cache: '${item.getId()}'`);
  },
  // 1
  cacheIsFullAndItemStrongest: (cache, item) => {
    cache.log.trace(`Too strong to be added in cache: '${item.getId()}'`);
  },
  // 2
  cacheIsFullAndItemAsStrongAsStrongest: (cache, item) => {
    if (Math.floor((Math.random() * 2) + 1) === 1) {
      var strongestItem = cache.getStrongest();
      if (strongestItem) {
        cache.replaceStrongest(item);
        cache.log.trace(`Replaced '${strongestItem.getId()}', with '${item.getId()}'. Both of equal strength.`);
      }
    } else {
      cache.log.trace(`Skipping '${item.getId()}': as strong as strongest`);
    }
  },
  // 3
  cacheIsFullAndItemNotStrongest: (cache, item) => {
    var strongestItem = cache.getStrongest();
    if (strongestItem) {
      cache.replaceStrongest(item);
      cache.log.trace(`Replaced strongest item: '${strongestItem.getId()}', with  weaker item: '${item.getId()}'`);
    }
  }
};

class ItemCache {

  constructor(_opts, handlers, compareFn) {
    var opts = Object.assign({}, DEFAULT_OPTS, _opts);
    this.max = opts.max;
    this.log = opts.log;
    this.items = new SortedArray([], compareFn || DEFAULT_COMPARE_FN);
    this.handlers = Object.assign({}, DEFAULT_HANDLERS, handlers);
    const self = this;
    Object.keys(this.handlers).forEach(key => {
      self.handlers[key] = curry(self.handlers[key])(self);
    });
    this.handlersAsArray = [
      this.handlers.cacheIsNotFull,
      this.handlers.cacheIsFullAndItemStrongest,
      this.handlers.cacheIsFullAndItemAsStrongAsStrongest,
      this.handlers.cacheIsFullAndItemNotStrongest
    ];
  }

  getSize() {
    return this.items.array.length;
  }

  getMax() {
    return this.max;
  }

  getItems() {
    return this.items.array;
  }

  getStrongest() {
    return this.items.array[0];
  }

  addItem(item) {
    this.items.insert(item);
    return this;
  }

  replaceStrongest(item) {
    this.items.array[0] = item;
    return this;
  }

  examineResultHandler([code, item]) {
    this.handlersAsArray[code](item);
    return this;
  }

  /**
   * Returns an array of size 2 with given Item as the 2nd element.
   * The first element is a code for the examination result, which can be:
   * 0 for 'cache is not full, examined item can be added',
   * 1 for 'cache is full and examined item is stronger than the strongest item(s) in cache'.
   * 2 for 'cache is full and examined item is as strong as the strongest item(s) in cache',
   * 3 for 'cache is full and examined item is weaker than the strongest item(s) in cache'.
   * -1 for 'examination failed'
   * @param  {Item} item
   * @return {[integer, Item]}
   */
  examine(item) {
    if (this.getSize() < this.getMax()) return [0, item];
    if (item.getStrength() > this.getStrongest().getStrength()) return [1, item];
    if (item.getStrength() === this.getStrongest().getStrength()) return [2, item];
    if (item.getStrength() < this.getStrongest().getStrength()) return [3, item];
    return [-1, item];
  }

}

module.exports = ItemCache;
