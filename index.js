const logger     = require('./src/logger');
const formatters = require('./src/formatters');
const filter     = require('./src/filter');
const socket     = require('./src/socket');

// Remove timestamp and color from "debug" package
process.env.DEBUG_HIDE_DATE = true;
process.env.DEBUG_COLORS    = 0;
process.env.KITTEN_LOGGER   = process.env.KITTEN_LOGGER || process.env.DEBUG || '*';

filter.filter();
// activate already registered loggers if exist
for (let namespace in logger.loggers) {
  logger.loggers[namespace].isEnabled = filter.isEnabled(namespace);
}

module.exports = {
  createLogger          : logger.logger,
  createPersitentLogger : logger.persistentLogger,
  addFormatter          : formatters.add,
  init                  : require('./src/init'),
  filter                : filter.filter,

  listen     : socket.listen,
  connect    : socket.connect,
  sendAction : socket.send
};
