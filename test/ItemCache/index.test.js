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

  t.deepEqual(cache.getSortedItems().map(item => item.getStrength()), [50, 30, 20]);
});

test(`'input' will not allow addition of items stronger than what it caches if cache is full`, t => {
  var cache = new ItemCache(OPTS);

  cache.input(new Item('item 1').strength(1));
  cache.input(new Item('item 2').strength(2));
  cache.input(new Item('item 3').strength(3));
  cache.input(new Item('item 4').strength(4));

  t.deepEqual(cache.getSortedItems().map(item => item.getStrength()), [3, 2, 1]);

  cache.input(new Item('item 5').strength(5));
  t.deepEqual(cache.getSortedItems().map(item => item.getStrength()), [3, 2, 1]);
});

test(`'input' will allow addition of items weaker than the strongest item it caches`, t => {
  var cache = new ItemCache(OPTS);

  cache.input(new Item('item 2').strength(2));
  cache.input(new Item('item 3').strength(3));
  cache.input(new Item('item 4').strength(4));
  cache.input(new Item('item 1').strength(1));

  t.deepEqual(cache.getSortedItems().map(item => item.getStrength()), [3, 2, 1]);

  cache.input(new Item('item 0').strength(0));
  t.deepEqual(cache.getSortedItems().map(item => item.getStrength()), [2, 1, 0]);
});

test(`'merge' will input items from another cache into this cache following this cache's rules`, t => {
  var cache1 = new ItemCache(Object.assign({}, OPTS, { max: 4 }));
  var cache2 = new ItemCache();

  cache1.input(new Item('item 10').strength(10));
  cache1.input(new Item('item 5').strength(5));

  cache2.input(new Item('item 3').strength(3));
  cache2.input(new Item('item 4').strength(4));
  cache2.input(new Item('item 20').strength(20));
  cache2.input(new Item('item 15').strength(15));

  t.deepEqual(cache1.merge(cache2).getSortedItems().map(item => item.getStrength()), [10, 5, 4, 3]);
});
