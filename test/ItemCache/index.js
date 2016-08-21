const assert = require('chai').assert;
const ItemCache = require('../../src/cmds/gen/ItemCache');
const Item = require('../../src/cmds/gen/Item');

var itemCache;

module.exports = describe('ItemCache', function() {

  beforeEach(function() {
    itemCache = new ItemCache();
    assert.isTrue(itemCache.add(new Item('item 1').strength(1)).pop() === 0);
    assert.isTrue(itemCache.add(new Item('item 2').strength(2)).pop() === 1);
    assert.isTrue(itemCache.add(new Item('item 3').strength(3)).pop() === 2);
    assert.isTrue(itemCache.add(new Item('item 4').strength(4)).pop() === 3);
    assert.isTrue(itemCache.add(new Item('item 5').strength(5)).pop() === 4);
  });

  it('getStrongestWithIndex works as expected', function() {
    var [_index, item] = itemCache.getStrongestWithIndex();
    assert.equal(item.getFileData(), 'item 5');
  });

  it('will not allow addition of items stronger than what it caches', function() {
    assert.isTrue(itemCache.add(new Item('item 6').strength(6)).length === 0);
  });

  it('will allow addition of items weaker than the strongest item it caches', function() {
    var [_index, item] = itemCache.add(new Item('item 6').strength(2));
    assert.equal(item.getFileData(), 'item 5');
  });

});
