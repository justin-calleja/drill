var crypto = require('crypto');

module.exports = function _generateId(data, opts) {
  opts = opts || {};
  opts.hashAlgorithm = opts.hashAlgorithm || 'md5';
  opts.digestEncoding = opts.digestEncoding || 'hex';

  return crypto.createHash(opts.hashAlgorithm).update(data).digest(opts.digestEncoding);
};
