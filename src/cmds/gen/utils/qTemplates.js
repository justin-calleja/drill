function oneOf({ id, question, type, choices }) {
  return (
`# ${id}

${question}

### ${type}

${choices.map(c => '- ' + c + ': ').join('\n')}

- - -
`);
}
exports.oneOf = oneOf;

function markCorrect({ id, question, type, choices }) {
  return (
`# ${id}

${question}

### ${type}

${choices.map(c => '- ' + c + ': ').join('\n')}

- - -
`);
}
exports.markCorrect = markCorrect;

function confirm({ id, question, type }) {
  return (
`# ${id}

${question}

### ${type}

- - -
`);
}
exports.confirm = confirm;

function unorderedDelimited({ id, question, type }) {
  return (
`# ${id}

${question}

### ${type}

- - -
`);
}
exports.unorderedDelimited = unorderedDelimited;
