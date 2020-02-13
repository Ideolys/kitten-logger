const logger     = require('./src/logger');
const formatters = require('./src/formatters');

// Remove timestamp and color from "debug" package
process.env.DEBUG_HIDE_DATE = true;
process.env.DEBUG_COLORS    = 0;

module.exports = {
  createPersitentLogger : logger.persistentLogger,
  addFormatter          : formatters.add,
  init                  : require('./src/init')
};
