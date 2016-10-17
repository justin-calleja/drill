function oneOf(userAnswer, item) {
  var answerInfo = item.getAnswer();
  var correctIndex = answerInfo.correct;
  var userSelectionIndex = userAnswer
    .split('\n')
    .map(s => s.substring(s.indexOf(':') + 1))
    .map(s => s.trim())
    .findIndex(s => s !== '');
  var isCorrect = userSelectionIndex === correctIndex;

  var userSelection = answerInfo.choices[userSelectionIndex];

  item.addLatestUserAnswer(userSelection);
  item.setLastAnswerWasCorrect(isCorrect);
  item.setNumberOfTimesAsked(item.getNumberOfTimesAsked() + 1);
  item.setLastAskedTime(new Date());

  return item;
}
exports.oneOf = oneOf;

function markCorrect(userAnswer, item) {
  var answerInfo = item.getAnswer();
  var correctIndices = answerInfo.correct;
  var userSelectionIndices = userAnswer
    .split('\n')
    .map(s => s.substring(s.indexOf(':') + 1))
    .map(s => s.trim())
    .reduce((acc, val, index) => {
      if (val !== '') {
        acc.push(index);
      }
      return acc;
    }, []);
  var isCorrect = userSelectionIndices.every(i => correctIndices.includes(i))
    && userSelectionIndices.length === correctIndices.length;

  item.addLatestUserAnswer(userSelectionIndices.map(i => answerInfo.choices[i]));
  item.setLastAnswerWasCorrect(isCorrect);
  item.setNumberOfTimesAsked(item.getNumberOfTimesAsked() + 1);
  item.setLastAskedTime(new Date());

  return item;
}
exports.markCorrect = markCorrect;

function confirm(userAnswer, item) {
  item.addLatestUserAnswer(userAnswer);
  item.setIsPendingUserConfirm(true);

  return item;
}
exports.confirm = confirm;

function unorderedDelimited(userAnswer, item) {
  var answerInfo = item.getAnswer();
  var answers = answerInfo.answers;
  var userAnswers = userAnswer.split(answerInfo.delimiter).map(ans => ans.trim());
  var isCorrect = userAnswers.every(ans => answers.includes(ans))
    && userAnswers.length === answers.length;

  item.addLatestUserAnswer(userAnswer);
  item.setLastAnswerWasCorrect(isCorrect);
  item.setNumberOfTimesAsked(item.getNumberOfTimesAsked() + 1);
  item.setLastAskedTime(new Date());

  return item;
}
exports.unorderedDelimited = unorderedDelimited;
