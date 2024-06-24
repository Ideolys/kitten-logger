const utils                 = require('./utils');
const getTime               = utils.getTime
const getCurrentTimestamp   = utils.getCurrentTimestamp;
const COLORS                = require('../colors');
const { KITTEN_LOGGER_TAG } = require('./utils');
const variables             = require('./variables');
const CSV_SEPARATOR         = '\t';

let formatters = {};

const colorsByLevel = {
  DEBUG : '',
  INFO  : COLORS.CYAN,
  WARN  : COLORS.YELLOW,
  ERROR : COLORS.RED
};

/**
 * @param {Array} msgOrOptions Array of items to log and/or object of kitten options
 * @param {Function} formatterFn
 * @returns {{ id : {String}, msg : {String} }}
 */
function parseMsgOrOptions (msgOrOptions, formatterFn) {
  let id  = '';
  let msg = [];

  for (let key in msgOrOptions) {
    let msgOrOption = msgOrOptions[key];

    if (!msgOrOption) {
      continue;
    }

    if (msgOrOption.idKittenLogger) {
      id = msgOrOption.idKittenLogger;
      continue;
    }

    if (formatterFn) {
      msg.push(formatterFn(msgOrOption));
      continue;
    }

    if (msgOrOption.constructor === String) {
      msg.push(msgOrOption);
      continue;
    }

    msg.push(JSON.stringify(msgOrOption, null, 2));
  }

  msg = msg.join(' ');

  return {
    id,
    msg
  };
}

module.exports = {
  parseMsgOrOptions,

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
   * @param {Object/String} msgOrOptions message(s) to format/log, last is option object
   */
  format (level, namespace, pid, msgOrOptions) {
    let _out  = [];
    let _time = '';
    let _msg  = [];

    if (!msgOrOptions) {
      msgOrOptions = [];
    }

    let { msg, id } = parseMsgOrOptions(msgOrOptions);

    _time = getCurrentTimestamp();
    // escape with simple quote, and add quote for CSV.
    // As JSON uses double quote, we use simple quote for CSV to minimize replacements
    _msg = "'" + msg.replace(/'/g,"''").replace(/\n/g, '') + "'";

    _out = _time + CSV_SEPARATOR + level + CSV_SEPARATOR + namespace + CSV_SEPARATOR + _msg + CSV_SEPARATOR + pid + CSV_SEPARATOR + id;
    return (variables.isLoggerChild && !variables.isInitialized ? KITTEN_LOGGER_TAG : '') + _out + '\n';
  },

  /**
   * Format log
   * @param {String} level INFO|WARN|ERROR
   * @param {String} namespace
   * @param {Int} pid
   * @param {Array} msgOrOptions message(s) to format/log, last is option object
   */
  formatTTY (level, namespace, pid, msgOrOptions) {
    let _out  = [];
    let _time = '';

    if (!msgOrOptions) {
      msgOrOptions = [];
    }

    let { msg : _msg, id : _id } = parseMsgOrOptions(msgOrOptions, formatters[namespace]);

    _time     = COLORS.DIM + getTime() + COLORS.OFF;
    namespace = COLORS.DIM + namespace + COLORS.OFF;
    level     = colorsByLevel[level] + level + COLORS.OFF;
    pid       = COLORS.DIM + pid + COLORS.OFF;
    _id       = _id ? COLORS.DIM + _id + COLORS.OFF : '';
    _mg       = _msg.replace(/\n$/g, '');

    _out = _time + CSV_SEPARATOR + level + CSV_SEPARATOR + namespace + CSV_SEPARATOR + _msg + CSV_SEPARATOR + pid + CSV_SEPARATOR + _id;
    return (variables.isLoggerChild && !variables.isInitialized ? KITTEN_LOGGER_TAG : '') + _out + '\n';
  }
};
