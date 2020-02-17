const COLORS = require('../colors');

module.exports = {
  namespace : 'http_end',
  /**
   * @param {Object} msg {
   *   statusCode : req.statusCode
   * }
   */
  fn : (msg) => {
    return COLORS.YELLOW + msg.statusCode + COLORS.OFF;
  }
};
