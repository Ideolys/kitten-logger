const tty           = require('tty');
const padlz         = require('./utils').padlz;
const IS_ATTY       = tty.isatty(process.stdout.fd);
const CSV_SEPARATOR = '\t';

let formatters = {};

function getCurrentTimestamp() {
  var _date = new Date();
  return _date.getFullYear()            + '-'
    + padlz(_date.getMonth()+1 , 2)     + '-'
    + padlz(_date.getDate()    , 2)     + ' '
    + padlz(_date.getHours()       , 2) + ':'
    + padlz(_date.getMinutes()     , 2) + ':'
    + padlz(_date.getSeconds()     , 2) + '.'
    + padlz(_date.getMilliseconds(), 3)
  ;
}

module.exports = {

  /**
   * Extend formatters list
   * @param {String} namespace
   * @param {Function} formatterFn
   */
  extend (namespace, formatterFn) {
    if (typeof formatterFn !== 'function') {
      throw new Error('formatterFn is not a function');
    }

    formatters[namespace] = formatterFn;
  },

  /**
   * Format log
   * @param {String} level INFO|WARN|ERROR
   * @param {String} namespace
   * @param {Int} pid
   * @param {Object/String} msg to format/log
   * @param {*} opt option to pass to formatter (ex: req)
   * @param {Boolean} preventFormattingAgain*
   * @param {String} version
   */
  format (level, namespace, pid, msg, opt, version, preventFormattingAgain) {
    let _out = [getCurrentTimestamp(), level];
    let _msg = '';

    // if the output is a terminal and we have a beautifier for this namespace, use it to parse the msg
    if (IS_ATTY === true && formatters[namespace] instanceof Function) {
      _msg = formatters[namespace](msg, opt);
    }
    else if (typeof(msg) === 'string'){
      _msg = msg;
    }
    else {
      _msg = JSON.stringify(msg, null, 2);
    }

    if (IS_ATTY === false) {
      // escape with simple quote, and add quote for CSV.
      // As JSON uses double quote, we use simple quote for CSV to minimize replacements
      _msg = "'" + _msg.replace(/'/g,"''") + "'";
    }

    _out.push(_msg, pid, namespace + '@' + version);

    return (preventFormattingAgain === true ? 'KITTEN_LOG%' : '') + _out.join(CSV_SEPARATOR) + '\n';
  }
};
