var dirs = require('@justinc/dirs-as-promised');
var getOrDie = require('@justinc/drill-conf').getOrDie;
var archy = require('archy');

const CONTAINER_PATHS = getOrDie('container.paths');

module.exports = () => {

  Promise.all(CONTAINER_PATHS.map(dirs)).then(results => {
    return Promise.resolve(CONTAINER_PATHS.map((containerPath, index) => ({
      label: containerPath,
      nodes: results[index]
    })))
    .then(nodes => {
      nodes.forEach(node => console.log(archy(node)));
    });
  });

};
