var drillMeta = require('@justinc/drill-conf').drillMeta;
const path = require('path');
var generateId = require('./generateId');

class Item {

  constructor(fileData, parsedPath) {
    this.fileData = fileData;
    this.nonFileData = {};

    if (parsedPath) {
      var prefix = path.basename(path.dirname(parsedPath.dir)) + '-';
      this.nonFileData.id = prefix + (this.fileData.id || generateId(this.fileData.question));
    }
  }

  getId() {
    return this.nonFileData.id;
  }

  strength(strength) {
    this.nonFileData.strength = strength;
    return this;
  }

  getStrength() {
    return this.nonFileData.strength || 0;
  }

  getFileData() {
    return this.fileData;
  }

}

module.exports = Item;
