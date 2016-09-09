import test from 'ava';
import ItemCache from '../../src/cmds/gen/ItemCache';
import Item from '../../src/cmds/gen/Item';
import { compose, tap } from 'ramda';

const OPTS = {
  max: 3,
  handlers: {
    cacheIsFullAndItemAsStrongAsStrongest: () => null
  }
};

function makeAssertions(t, srcArr) {
  return compose(
    tap(arr => srcArr.forEach(el => t.true(arr.includes(el)))),
    tap(arr => t.is(arr.length, srcArr.length))
  );
}

test(`'input' will not allow addition of items stronger than what it caches if cache is full`, t => {
  var cache = new ItemCache(OPTS);

  cache.input(new Item('item 1').strength(1));
  cache.input(new Item('item 2').strength(2));
  cache.input(new Item('item 3').strength(3));
  cache.input(new Item('item 4').strength(4));

  const assertions = makeAssertions(t, [1, 2, 3]);

  assertions(cache.getItems().map(item => item.getStrength()));
  cache.input(new Item('item 5').strength(5));
  assertions(cache.getItems().map(item => item.getStrength()));
});

test(`'input' will allow addition of items weaker than the strongest item it caches`, t => {
  var cache = new ItemCache(OPTS);

  cache.input(new Item('item 2').strength(2));
  cache.input(new Item('item 3').strength(3));
  cache.input(new Item('item 4').strength(4));
  cache.input(new Item('item 1').strength(1));

  makeAssertions(t, [1, 2, 3])(cache.getItems().map(item => item.getStrength()));

  cache.input(new Item('item 0').strength(0));
  makeAssertions(t, [0, 1, 2])(cache.getItems().map(item => item.getStrength()));
});

test(`'takeItemsFrom' will input items from another cache into this cache following this cache's rules`, t => {
  var cache1 = new ItemCache(Object.assign({}, OPTS, { max: 4 }));
  var cache2 = new ItemCache();

  cache1.input(new Item('item 10').strength(10));
  cache1.input(new Item('item 5').strength(5));

  cache2.input(new Item('item 3').strength(3));
  cache2.input(new Item('item 4').strength(4));
  cache2.input(new Item('item 20').strength(20));
  cache2.input(new Item('item 15').strength(15));

  makeAssertions(t, [3, 4, 5, 10])(cache1.takeItemsFrom(cache2).getItems().map(item => item.getStrength()));
});
