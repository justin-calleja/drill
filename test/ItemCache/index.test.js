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

  cache.input(tap(i => i.setStrength(1), new Item('item 1')));
  cache.input(tap(i => i.setStrength(2), new Item('item 2')));
  cache.input(tap(i => i.setStrength(3), new Item('item 3')));
  cache.input(tap(i => i.setStrength(4), new Item('item 4')));

  const assertions = makeAssertions(t, [1, 2, 3]);

  assertions(cache.getItems().map(item => item.getStrength()));
  cache.input(tap(i => i.setStrength(5), new Item('item 5')));
  assertions(cache.getItems().map(item => item.getStrength()));
});

test(`'input' will allow addition of items weaker than the strongest item it caches`, t => {
  var cache = new ItemCache(OPTS);

  cache.input(tap(i => i.setStrength(2), new Item('item 2')));
  cache.input(tap(i => i.setStrength(3), new Item('item 3')));
  cache.input(tap(i => i.setStrength(4), new Item('item 4')));
  cache.input(tap(i => i.setStrength(1), new Item('item 1')));

  makeAssertions(t, [1, 2, 3])(cache.getItems().map(item => item.getStrength()));

  cache.input(tap(i => i.setStrength(0), new Item('item 0')));
  makeAssertions(t, [0, 1, 2])(cache.getItems().map(item => item.getStrength()));
});

test(`'takeItemsFrom' will input items from another cache into this cache following this cache's rules`, t => {
  var cache1 = new ItemCache(Object.assign({}, OPTS, { max: 4 }));
  var cache2 = new ItemCache();

  cache1.input(tap(i => i.setStrength(10), new Item('item 10')));
  cache1.input(tap(i => i.setStrength(5), new Item('item 5')));

  cache2.input(tap(i => i.setStrength(3), new Item('item 3')));
  cache2.input(tap(i => i.setStrength(4), new Item('item 4')));
  cache2.input(tap(i => i.setStrength(20), new Item('item 20')));
  cache2.input(tap(i => i.setStrength(15), new Item('item 15')));

  makeAssertions(t, [3, 4, 5, 10])(cache1.takeItemsFrom(cache2).getItems().map(item => item.getStrength()));
});
