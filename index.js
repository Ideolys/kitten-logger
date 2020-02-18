const logger               = require('./src/logger');
const formatters           = require('./src/formatters');
const filter               = require('./src/filter');
const socket               = require('./src/socket');
const formattersCollection = require('./lib/formatters');

// Remove timestamp and color from "debug" package
process.env.DEBUG_HIDE_DATE     = true;
process.env.DEBUG_COLORS        = 0;
process.env.KITTEN_LOGGER       = process.env.KITTEN_LOGGER || process.env.DEBUG || '*';
process.env.KITTEN_LOGGER_LEVEL = 'DEBUG';

filter.filter();
logger.enable();

module.exports = {
  createLogger           : logger.logger,
  createPersistentLogger : logger.persistentLogger,
  addFormatter           : formatters.add,
  init                   : require('./src/init'),
  /**
   * Filter namespace
   * @param {String} filter
   */
  filter : function (filter) {
    filter.filter(filter);
    logger.enable();
  },
  /**
   * Filter level
   * @param {String} level
   */
  filterLevel : function (level) {
    if (level) {
      process.env.KITTEN_LOGGER = level.toUpperCase();
    }
    logger.enableLevels();
  },

  formattersCollection : formattersCollection,

  listen     : socket.listen,
  connect    : socket.connect,
  sendAction : socket.send
};
