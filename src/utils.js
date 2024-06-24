const tty                = require('tty');
const diagnosticsChannel = require('diagnostics_channel');

const DIAGNOSTIC_CHANNEL_NAME = 'kitten-logger';
const channel                 = diagnosticsChannel.channel(DIAGNOSTIC_CHANNEL_NAME);

const DIAGNOSTIC_SEVERITY = {
  ERROR : 3,
  WARN  : 2,
  INFO  : 1,
  DEBUG : 0,
};

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

function isTTYMode () {
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

  isTTY : isTTYMode(),

  KITTEN_LOGGER_TAG : 'K_LOG',

  DIAGNOSTIC_CHANNEL_NAME,
  DIAGNOSTIC_SEVERITY,

  /**
   * Publishes a diagnostic message to a diagnostics channel.
   *
   * @param {string} level - The logging level (e.g., 'INFO', 'ERROR').
   * @param {string} namespace - The namespace associated with the message.
   * @param {number} pid - The process ID from which the message originates.
   * @param {string} message - The message to be published.
   */
  publishDiagnostic(level, namespace, pid, message) {
    const diagnostic = {
      severity   : DIAGNOSTIC_SEVERITY[level],
      message    : message.msg,
      properties : {
        namespace,
        pid,
      }
    };

    if (message.id) {
      diagnostic.properties.id = message.id;
    }

    channel.publish(diagnostic);
  }
};
