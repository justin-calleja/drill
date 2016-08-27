var noOpLogger = require('@justinc/no-op-logger');
var SortedArray = require('sorted-array');
var chance = require('chance').Chance();

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
  cacheIsNotFull: (item) => {
    this.addItem(item);
    this.log.trace(`Added in cache: '${item.getId()}'`);
  },
  // 1
  cacheIsFullAndItemStrongest: (item) => {
    this.log.trace(`Too strong to be added in cache: '${item.getId()}'`);
  },
  // 2
  cacheIsFullAndItemAsStrongAsStrongest: (item) => {
    if (chance.bool()) {
      var strongestItem = this.getStrongest();
      if (strongestItem) {
        this.replaceStrongest(item);
        this.log.trace(`Replaced '${strongestItem.getId()}', with '${item.getId()}'. Both of equal strength.`);
      }
    }
  },
  // 3
  cacheIsFullAndItemNotStrongest: (item) => {
    var strongestItem = this.getStrongest();
    if (strongestItem) {
      this.replaceStrongest(item);
      this.log.trace(`Replaced strongest item: '${strongestItem.getId()}', with  weaker item: '${item.getId()}'`);
    }
  }
};

class ItemCache {

  constructor(_opts, handlers, compareFn) {
    var opts = Object.assign({}, _opts, DEFAULT_OPTS);
    this.max = opts.max;
    this.log = opts.log;
    this.items = new SortedArray([], compareFn || DEFAULT_COMPARE_FN);
    this.handlers = Object.assign({}, DEFAULT_HANDLERS, handlers);
    const self = this;
    Object.keys(this.handlers).forEach(key => {
      this.handlers[key] = this.handlers[key].bind(self);
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

  // getStrongestItems() {
  //   var strongestItem = this.getStrongest();
  //   if (strongestItem) {
  //     var strongestStrength = strongestItem.getStrength();
  //     var result = [strongestItem];
  //     for (let i = 1; i < this.items.array.length; i++) {
  //       if (this.items.array[i].getStrength() === strongestStrength) {
  //         result.push(this.items.array[i]);
  //       } else {
  //         break;
  //       }
  //     }
  //     return result;
  //   } else {
  //     return [];
  //   }
  // }

  examineResultHandler([code, item]) {
    this.handlersAsArray[code](item);
    return this;
  }


  /**
   * @return {[number, Item]} the strongest item and its index in an array of shape: [index, Item]
   */
  // getStrongestWithIndex() {
  //   if (this.items.length > 0) {
  //     return this.items.reduce((acc, item, i) => {
  //       return acc[1].getStrength() > item.getStrength() ? acc : [i, item];
  //     }, [0, this.items[0]]);
  //   } else {
  //     return null;
  //   }
  // }

  // TODO: give cache default handlers for cases 0,1,2,3 and make these handlers configurable at cache construction time.

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

  // NOTE: if add were to sort on addition, you wouldn't need a getStrongestWithIndex operation
  // as the strongest would always be at the head (or tail) of the list.
  /**
   * Adds item to the cache. If item was added an array with the item's
   * index is returned. If the item was not added (too strong to add) an
   * empty array is returned.
   * If the item was added but had to replace an item (the strongest item in the cache)
   * in order to do so, an array of size 2 is returned: [indexOfRemovedItem, removedItem]
   *
   * @param {[type]} item [description]
   */
  add(item) {
    if (this.items.length < this.max) {
      var index = this.items.push(item) - 1;
      this.log.trace(`Added in cache: '${item.getId()}'`);
      return [index];
    } else {
      var [strongestItemIndex, strongestItem] = this.getStrongestWithIndex();

      if (strongestItem.getStrength() < item.getStrength()) {
        this.log.trace(`Too strong to be added in cache: '${item.getId()}'`);
        return [];
      } else {
        this.log.trace(`Replaced '${strongestItem.getStrength()}' with '${item.getStrength()}'`);
        this.items[strongestItemIndex] = item;
        return [strongestItemIndex, strongestItem];
      }
    }
  }

}

module.exports = ItemCache;
