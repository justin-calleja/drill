var noOpLogger = require('@justinc/no-op-logger');

class ItemCache {

  constructor(max = 5, log = noOpLogger) {
    this.max = max;
    this.log = log;
    this.items = [];
  }

  getItems() {
    return this.items;
  }

  /**
   * @return {[number, Item]} the strongest item and its index in an array of shape: [index, Item]
   */
  getStrongestWithIndex() {
    if (this.items.length > 0) {
      return this.items.reduce((acc, item, i) => {
        return acc[1].getStrength() > item.getStrength() ? acc : [i, item];
      }, [0, this.items[0]]);
    } else {
      return null;
    }
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
