const filter    = require('./filter');
const loggers   = require('./logger');
const variables = require('./variables');

module.exports = function init () {
  const scheduler = require('./scheduler');

  variables.isInitialized = true;

  filter.filter();
  loggers.enable();
  loggers.enableLevels();
};
