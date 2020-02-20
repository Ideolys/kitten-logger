const tty           = require('tty');
const padlz         = require('./utils').padlz;

const IS_ATTY       = tty.isatty(process.stdout.fd);
const CSV_SEPARATOR = '\t';
const COLORS        = require('../colors');

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

function getTime () {
  var _date = new Date();
  return padlz(_date.getHours()    , 2) + ':'
    + padlz(_date.getMinutes()     , 2) + ':'
    + padlz(_date.getSeconds()     , 2) + '.'
    + padlz(_date.getMilliseconds(), 3)
  ;
}

const colorsByLevel = {
  DEBUG : '',
  INFO  : COLORS.CYAN,
  WARN  : COLORS.YELLOW,
  ERROR : COLORS.RED
};

module.exports = {

  /**
   * Extend formatters list
   * @param {String} namespace
   * @param {Function} formatterFn
   */
  add (namespace, formatterFn) {
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
   * @param {Boolean} preventFormattingAgain
   */
  format (level, namespace, pid, msg, opt, preventFormattingAgain) {
    let _out  = [];
    let _time = '';
    let _msg  = '';

    // if the output is a terminal and we have a beautifier for this namespace, use it to parse the msg
    if (IS_ATTY === true && formatters[namespace] instanceof Function) {
      _msg = formatters[namespace](msg);
    }
    else if (typeof(msg) === 'string'){
      _msg = msg;
    }
    else {
      _msg = JSON.stringify(msg, null, IS_ATTY === true ? 2 : null);
    }

    let _id = null;
    if (opt && opt.idKittenLogger) {
      _id = opt.idKittenLogger;
    }

    if (IS_ATTY === false) {
      _time = getCurrentTimestamp();
      // escape with simple quote, and add quote for CSV.
      // As JSON uses double quote, we use simple quote for CSV to minimize replacements
      _msg = "'" + _msg.replace(/'/g,"''").replace('\n', '') + "'";
    }
    else {
      _time     = COLORS.DIM + getTime() + COLORS.OFF;
      namespace = COLORS.DIM + namespace + COLORS.OFF;
      level     = colorsByLevel[level] + level + COLORS.OFF;
      pid       = COLORS.DIM + pid + COLORS.OFF;
      _id       = _id ? COLORS.DIM + _id + COLORS.OFF : undefined;
    }

    _out.push(_time, level, namespace, _msg, pid, _id);
    return (preventFormattingAgain === true ? 'KT_LOG%' : '') + _out.join(CSV_SEPARATOR) + '\n';
  }
};
