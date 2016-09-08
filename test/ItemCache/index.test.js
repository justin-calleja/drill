import test from 'ava';
import ItemCache from '../../src/cmds/gen/ItemCache';
import Item from '../../src/cmds/gen/Item';

const OPTS = {
  max: 3,
  handlers: {
    cacheIsFullAndItemAsStrongAsStrongest: () => null
  }
};

test('By default cache.getSortedItems() will return items sorted by stronger first', t => {
  var cache = new ItemCache(OPTS);
  cache.input(new Item('item 20').strength(20));
  cache.input(new Item('item 50').strength(50));
  cache.input(new Item('item 30').strength(30));

  t.deepEqual([50, 30, 20], cache.getSortedItems().map(item => item.getStrength()));
});

test(`'input' will not allow addition of items stronger than what it caches if cache is full`, t => {
  var cache = new ItemCache(OPTS);

  cache.input(new Item('item 1').strength(1));
  cache.input(new Item('item 2').strength(2));
  cache.input(new Item('item 3').strength(3));
  cache.input(new Item('item 4').strength(4));

  t.deepEqual([3, 2, 1], cache.getSortedItems().map(item => item.getStrength()));

  cache.input(new Item('item 5').strength(5));
  t.deepEqual([3, 2, 1], cache.getSortedItems().map(item => item.getStrength()));
});

test(`'input' will allow addition of items weaker than the strongest item it caches`, t => {
  var cache = new ItemCache(OPTS);

  cache.input(new Item('item 2').strength(2));
  cache.input(new Item('item 3').strength(3));
  cache.input(new Item('item 4').strength(4));
  cache.input(new Item('item 1').strength(1));

  t.deepEqual([3, 2, 1], cache.getSortedItems().map(item => item.getStrength()));

  cache.input(new Item('item 0').strength(0));
  t.deepEqual([2, 1, 0], cache.getSortedItems().map(item => item.getStrength()));
});
