const filter  = require('./filter');
const loggers = require('./logger');

/**
 * Socket handler
 * @param {Object} msg { action : String, value }
 */
module.exports = (msg) => {
  if (!msg.action) {
    return;
  }


  if (msg.action === 'FILTER') {
    process.env.KITTEN_LOGGER = msg.value || '*';
    filter.filter();
    loggers.enable();
  }
};
