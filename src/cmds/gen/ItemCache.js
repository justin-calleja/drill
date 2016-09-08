var noOpLogger = require('@justinc/no-op-logger');
var SortedArray = require('sorted-array');

const DEFAULT_OPTS = {
  max: 5,
  log: noOpLogger,
  compareFn: (itemA, itemB) => {
    if (itemA.getStrength() < itemB.getStrength()) return 1;
    if (itemA.getStrength() > itemB.getStrength()) return -1;

    return 0;
  },
  handlers: {
    cacheIsNotFull: (cache, item) => {
      cache.addItem(item);
      cache.log.trace(`Added in cache: '${item.getId()}'`);
    },
    cacheIsFullAndItemStrongest: (cache, item) => {
      cache.log.trace(`Too strong to be added in cache: '${item.getId()}'`);
    },
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
    cacheIsFullAndItemNotStrongest: (cache, item) => {
      var strongestItem = cache.getStrongest();
      if (strongestItem) {
        cache.replaceStrongest(item);
        cache.log.trace(`Replaced strongest item: '${strongestItem.getId()}', with  weaker item: '${item.getId()}'`);
      }
    },
    invalid: (cache, item) => {
      cache.log.error(`Cache thinks item with id: '${item ? item.getId() : ''}' is invalid.`);
    }
  }
};

class ItemCache {

  constructor(opts = {}) {
    this.max = opts.max || DEFAULT_OPTS.max;
    this.log = opts.log || DEFAULT_OPTS.log;
    this.handlers = Object.assign({}, DEFAULT_OPTS.handlers, opts.handlers);
    this.items = new SortedArray([], opts.compareFn || DEFAULT_OPTS.compareFn);
  }

  getSize() {
    return this.items.array.length;
  }

  getMax() {
    return this.max;
  }

  /**
   * Items in array will be sorted according to cache's compareFn.
   * By default, stronger items will be before weaker ones in the array.
   * @return {Array<Item>}
   */
  getSortedItems() {
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
    this.items.remove(this.getStrongest());
    this.items.insert(item);
    return this;
  }

  examineResultHandler([code, item]) {
    this.handlers[code](this, item);
    return this;
  }

  /**
   * Returns an array of size 2 with given Item as the 2nd element.
   * The first element is one of the following strings:
   * - 'cacheIsNotFull'
   * - 'cacheIsFullAndItemStrongest'
   * - 'cacheIsFullAndItemAsStrongAsStrongest'
   * - 'cacheIsFullAndItemNotStrongest'
   * - 'invalid'
   * @param  {Item} item
   * @return {[string, Item]}
   */
  examine(item) {
    if (this.getSize() < this.getMax()) return ['cacheIsNotFull', item];
    if (item.getStrength() > this.getStrongest().getStrength()) return ['cacheIsFullAndItemStrongest', item];
    if (item.getStrength() === this.getStrongest().getStrength()) return ['cacheIsFullAndItemAsStrongAsStrongest', item];
    if (item.getStrength() < this.getStrongest().getStrength()) return ['cacheIsFullAndItemNotStrongest', item];
    return ['invalid', item];
  }

  /**
   * This method is used to add items to the cache in the designed way
   * (i.e. following the cache's rules for item addition)
   * @param  {Item} item
   * @return {ItemCache}
   */
  input(item) {
    this.examineResultHandler(this.examine(item));
  }

  merge(cache) {
    cache.getSortedItems().forEach(this.input.bind(this));
    return this;
  }

}

module.exports = ItemCache;
