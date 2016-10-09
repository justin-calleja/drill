const choices = require('@justinc/choices');

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

  return Promise.resolve(item);
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

  return Promise.resolve(item);
}
exports.markCorrect = markCorrect;

function confirm(userAnswer, item) {
  var answerInfo = item.getAnswer();
  var correctAnswer = answerInfo.text;
//   return choices({
//     message: `For the question:
//
// ${item.getQuestion()}
//
// You answered:
//
// ${userAnswer}
//
// The actual answer is:
//
// ${correctAnswer}
//
// Do you think you're correct or close enough?`,
//     choices: ['yes', 'no', 'skip']
//   }).then(answer => {
//     if (answer.choice !== 'skip') {
//       item.addLatestUserAnswer({ userAnswer, checkSelection: answer.choice });
//       item.setLastAnswerWasCorrect(answer.choice === 'yes');
//       item.setNumberOfTimesAsked(item.getNumberOfTimesAsked() + 1);
//       item.setLastAskedTime(new Date());
//     }
//     return item;
//   });

  return new Promise((resolve, _reject) => {
    choices({
      message: `For the question:

${item.getQuestion()}

You answered:

${userAnswer}

The actual answer is:

${correctAnswer}

Do you think you're correct or close enough?`,
      choices: ['yes', 'no', 'skip']
    }).then(answer => {
      if (answer.choice !== 'skip') {
        item.addLatestUserAnswer({ userAnswer, checkSelection: answer.choice });
        item.setLastAnswerWasCorrect(answer.choice === 'yes');
        item.setNumberOfTimesAsked(item.getNumberOfTimesAsked() + 1);
        item.setLastAskedTime(new Date());
      }
      return resolve(item);
    });

  });
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

  return Promise.resolve(item);
}
exports.unorderedDelimited = unorderedDelimited;
