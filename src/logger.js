const tty        = require('tty');
const formatters = require('./formatters');
const filter     = require('./filter');
const IS_ATTY    = tty.isatty(process.stdout.fd);
const formatFn   = IS_ATTY ? formatters.formatTTY : formatters.format;
let loggers      = {};

/**
 * Define logger functions
 * @param {Object} logger
 * @param {String} namespace
 */
function defineFns (logger, namespace) {
  logger.info  = filter.isLevelEnabled('INFO')  && logger.isEnabled ? LOG_LEVEL_FNS.info(namespace)  : LOG_LEVEL_FNS.disabled;
  logger.error = filter.isLevelEnabled('ERROR') && logger.isEnabled ? LOG_LEVEL_FNS.error(namespace) : LOG_LEVEL_FNS.disabled;
  logger.warn  = filter.isLevelEnabled('WARN')  && logger.isEnabled ? LOG_LEVEL_FNS.warn(namespace)  : LOG_LEVEL_FNS.disabled;
  logger.debug = filter.isLevelEnabled('DEBUG') && logger.isEnabled ? LOG_LEVEL_FNS.debug(namespace) : LOG_LEVEL_FNS.disabled;
}

const LOG_LEVEL_FNS = {
  info     : function (namespace) { return function info  (msg, opt) { process.stdout.write( formatFn('INFO' , namespace, process.pid, msg, opt, true) )}},
  debug    : function (namespace) { return function debug (msg, opt) { process.stdout.write( formatFn('DEBUG', namespace, process.pid, msg, opt, true) )}},
  warn     : function (namespace) { return function warn  (msg, opt) { process.stdout.write( formatFn('WARN' , namespace, process.pid, msg, opt, true) )}},
  error    : function (namespace) { return function error (msg, opt) { process.stdout.write( formatFn('ERROR', namespace, process.pid, msg, opt, true) )}},
  disabled : function disabled () { return; }
};

/**
 * Persistent logger
 * Logger can be disabled with isEnabled property
 * @param {String} namespace
 * @returns {Function}
 */
function persistentLogger (namespace) {
  // If the logger is already created for this namespace, re-use it
  // Thus, if someone creates a logger in a loop, it will not leak!
  if (loggers[namespace] !== undefined) {
    return loggers[namespace];
  }

  // create loggers, and exists as fast as possible if the log is disabled
  let _log = {
    isEnabled : filter.isEnabled(namespace)
  };

  defineFns(_log, namespace);

  /**
   * Extend a logger
   * The given namespace will be concatenate to the parent's namespace
   * @param {String} extendNamespace
   * @returns {Function} persistentLogger
   */
  _log.extend = function extend (extendNamespace) {
    return persistentLogger(namespace + ':' + extendNamespace);
  }

  // Keep a reference to the logger
  // Thus, if the log filter changes at runtime, we can travel all loggers and udpate the boolean isEnabled
  loggers[namespace] = _log;
  return _log;
}

/**
 * Non persistent logger
 * Logger cannot be disabled
 * @param {String} namespace
 * @retuns {Function}
 */
function logger (namespace) {
  let _log = {
    isEnabled : filter.isEnabled(namespace)
  };

  defineFns(_log, namespace);

  /**
   * Extend a logger
   * The given namespace will be concatenate to the parent's namespace
   * @param {String} extendNamespace
   * @returns {Function} logger
   */
  _log.extend = function extend (extendNamespace) {
    return logger(namespace + ':' + extendNamespace);
  }

  return _log;
}

/**
 * Enable persitent loggers
 */
function enable () {
  for (let namespace in loggers) {
    loggers[namespace].isEnabled = filter.isEnabled(namespace);
    defineFns(loggers[namespace], namespace);
  }
}

/**
 * Enable persitent loggers levels
 */
function enableLevels () {
  for (let namespace in loggers) {
    let logger = loggers[namespace];
    defineFns(logger, namespace);
  }
}

exports.persistentLogger = persistentLogger;
exports.logger           = logger;
exports.loggers          = loggers;
exports.filter           = filter;
exports.enable           = enable;
exports.enableLevels     = enableLevels;
