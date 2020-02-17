const COLORS = require('../colors');

module.exports = {
  namespace : 'http_start',
  /**
   * @param {Object} msg {
      method : req.method,
      url    : req.url,
      ip     : req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.ip
    }
   */
  fn : (msg) => {
    return COLORS.YELLOW + msg.method.toUpperCase() + ' ' + decodeURIComponent(msg.url || '') + ' from ' + msg.ip + COLORS.OFF;
  }
};
