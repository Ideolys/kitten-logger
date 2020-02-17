const filter  = require('./filter');
const loggers = require('./logger');

module.exports = function init () {
  const scheduler = require('./scheduler');

  filter.filter();
  loggers.enable();
  loggers.enableLevels();
};
