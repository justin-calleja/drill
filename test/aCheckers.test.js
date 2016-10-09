import test from 'ava';
import * as aCheckers from '../src/cmds/gen/utils/aCheckers';
import Item from '../src/cmds/gen/Item';

var item = null;

test.beforeEach(() => {
  item = new Item();
  item.fromJSON(`
{
  "fileData": {
    "answer": {
      "delegate": "unordered-delimited",
      "delimiter": ",",
      "answers": [
        "ans1",
        "ans2"
      ]
    }
  }
}
`);
});

test('unorderedDelimited correct answers', t => {
  return aCheckers.unorderedDelimited('ans1, ans2', item).then(result => {
    t.true(result.isCorrect);
    t.deepEqual(result.userAnswer, result.correctAnswer);
  });
});

test('unorderedDelimited incorrect answers', t => {
  return aCheckers.unorderedDelimited('ans1,  ans25', item).then(result => {
    t.false(result.isCorrect);
    t.deepEqual(result.userAnswer, ['ans1', 'ans25']);
    t.deepEqual(result.correctAnswer, ['ans1', 'ans2']);
  });
});
