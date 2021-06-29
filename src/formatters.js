const utils                 = require('./utils');
const getTime               = utils.getTime
const getCurrentTimestamp   = utils.getCurrentTimestamp;
const COLORS                = require('../colors');
const { KITTEN_LOGGER_TAG } = require('./utils');
const variables             = require('./variables');
const CSV_SEPARATOR         = '\t';
const MAX_LENGTH            = 60000;

let formatters = {};

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
   */
  format (level, namespace, pid, msg, opt) {
    let _out  = [];
    let _time = '';
    let _msg  = '';

    // if the output is a terminal and we have a beautifier for this namespace, use it to parse the msg
    if (msg.constructor === String){
      _msg = msg.slice(0, MAX_LENGTH);
    }
    else {
      _msg = JSON.stringify(msg);
    }

    let _id = '';
    if (opt && opt.idKittenLogger) {
      _id = opt.idKittenLogger;
    }

    _time = getCurrentTimestamp();
    // escape with simple quote, and add quote for CSV.
    // As JSON uses double quote, we use simple quote for CSV to minimize replacements
    _msg = "'" + _msg.replace(/'/g,"''").replace(/\n/g, '') + "'";

    _out = _time + CSV_SEPARATOR + level + CSV_SEPARATOR + namespace + CSV_SEPARATOR + _msg + CSV_SEPARATOR + pid + CSV_SEPARATOR + _id;
    return (variables.isLoggerChild ? KITTEN_LOGGER_TAG : '') + _out + '\n';
  },

  /**
   * Format log
   * @param {String} level INFO|WARN|ERROR
   * @param {String} namespace
   * @param {Int} pid
   * @param {Object/String} msg to format/log
   * @param {*} opt option to pass to formatter (ex: req)
   */
  formatTTY (level, namespace, pid, msg, opt) {
    let _out  = [];
    let _time = '';
    let _msg  = '';

    // if the output is a terminal and we have a beautifier for this namespace, use it to parse the msg
    if (formatters[namespace] instanceof Function) {
      _msg = formatters[namespace](msg);
    }
    else if (msg.constructor === String){
      _msg = msg.slice(0, MAX_LENGTH);
    }
    else {
      _msg = JSON.stringify(msg, null, 2);
    }

    let _id = '';
    if (opt && opt.idKittenLogger) {
      _id = opt.idKittenLogger;
    }

    _time     = COLORS.DIM + getTime() + COLORS.OFF;
    namespace = COLORS.DIM + namespace + COLORS.OFF;
    level     = colorsByLevel[level] + level + COLORS.OFF;
    pid       = COLORS.DIM + pid + COLORS.OFF;
    _id       = _id ? COLORS.DIM + _id + COLORS.OFF : '';
    _mg       = _msg.replace(/\n$/g, '');

    _out = _time + CSV_SEPARATOR + level + CSV_SEPARATOR + namespace + CSV_SEPARATOR + _msg + CSV_SEPARATOR + pid + CSV_SEPARATOR + _id;
    return (variables.isLoggerChild ? KITTEN_LOGGER_TAG : '') + _out + '\n';
  }
};
