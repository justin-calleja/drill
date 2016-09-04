var promptDel = require('@justinc/prompt-del-as-promised');
var dirExists = require('@justinc/dir-exists').dirExistsAsPromised;
var mkdirp = require('mkdirp-promise/lib/node6');
var chalk = require('chalk');
var path = require('path');
var emptyDir = require('empty-dir');

/**
 * @typedef {Object} ResetResult
 * @property {string} workspaceState - either 'not-empty', 'empty', or 'not-exists'. The state in which the workspace was found.
 * @property {[string]} createdPaths - Any paths which were created
 * @property {[string]} deletedPaths - Any paths which were deleted
 */

/**
 * [description]
 * @param  {[type]} workspacePath [description]
 * @return {Promise<ResetResult>}               [description]
 */
module.exports = (workspacePath) => {

  return new Promise((resolve, reject) => {
    return dirExists(workspacePath).then(exists => {
      if (exists) {
        emptyDir(workspacePath, (err, isEmpty) => {
          if (err) return reject(err);

          if (!isEmpty) {
            var patterns = [path.join(workspacePath, '**'), '!' + workspacePath];
            var promptMsg = chalk.red('About to delete workspace!') + `\nPatterns to delete by:\n${patterns}`;
            return promptDel({ patterns, promptMsg }).then(({ deletedPaths }) => {
              resolve({
                workspaceState: 'not-empty',
                createdPaths: [],
                deletedPaths
              });
            });
          } else {
            // empty workspace, nothing to reset
            return resolve({
              workspaceState: 'empty',
              createdPaths: [],
              deletedPaths: []
            });
          }
        });
      } else {
        // workspace does not exist, so create it
        mkdirp(workspacePath).then(createdPath => {
          resolve({
            workspaceState: 'not-exists',
            createdPaths: [createdPath],
            deletedPaths: []
          });
        });
      }
    }).catch(reject);

  });
};
