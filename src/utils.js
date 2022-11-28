const cluster = require('cluster');
const tty     = require('tty');

/**
 * zero padding
 * @param  {String}  n   string
 * @param  {Integer} len total number of character wanted
 * @return {String}      string
 */
function padlz (n, len) {
  for (n+=''; n.length < len; n = '0' + n) {} // eslint-disable-line
  return n;
}

function configureFromEnv () {
  return process.env.KITTEN_LOGGER_DEST === 'tty' || (tty.isatty(process.stdout.fd) && (process.env.KITTEN_LOGGER_DEST === 'auto' || !process.env.KITTEN_LOGGER_DEST));
}

module.exports = {
  getTime () {
    var _date = new Date();
    return padlz(_date.getHours()    , 2) + ':'
      + padlz(_date.getMinutes()     , 2) + ':'
      + padlz(_date.getSeconds()     , 2) + '.'
      + padlz(_date.getMilliseconds(), 3)
    ;
  },

  getCurrentTimestamp() {
    var _date = new Date();
    return _date.getFullYear()            + '-'
      + padlz(_date.getMonth()+1 , 2)     + '-'
      + padlz(_date.getDate()    , 2)     + ' '
      + padlz(_date.getHours()       , 2) + ':'
      + padlz(_date.getMinutes()     , 2) + ':'
      + padlz(_date.getSeconds()     , 2) + '.'
      + padlz(_date.getMilliseconds(), 3)
    ;
  },

  isTTY : configureFromEnv(),

  KITTEN_LOGGER_TAG : 'K_LOG'
};
