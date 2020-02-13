const filter  = require('./filter');
const loggers = require('./logger').loggers;

module.exports = function init () {
  const scheduler = require('./scheduler');

  filter.filter();

  // activate already registered loggers if exist
  for (let namespace in loggers) {
    loggers[namespace].isEnabled = filter.isEnabled(namespace);
  }
};
