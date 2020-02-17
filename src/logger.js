const formatters = require('./formatters');
const filter     = require('./filter');
let loggers      = {};

/**
 * Define logger functions
 * @param {Object} logger
 * @param {String} namespace
 */
function defineFns (logger, namespace) {
  logger.info  = filter.isLevelEnabled('INFO')  ? LOG_LEVEL_FNS.info(logger , namespace) : LOG_LEVEL_FNS.disabled;
  logger.error = filter.isLevelEnabled('ERROR') ? LOG_LEVEL_FNS.error(logger, namespace) : LOG_LEVEL_FNS.disabled;
  logger.warn  = filter.isLevelEnabled('WARN')  ? LOG_LEVEL_FNS.warn(logger , namespace) : LOG_LEVEL_FNS.disabled;
  logger.debug = filter.isLevelEnabled('DEBUG') ? LOG_LEVEL_FNS.debug(logger, namespace) : LOG_LEVEL_FNS.disabled;
}

const LOG_LEVEL_FNS = {
  info     : function (logger, namespace, level = 'INFO' ) { return (msg, opt) => { if (logger.isEnabled === false ) return; process.stdout.write( formatters.format(level, namespace, process.pid, msg, opt, true) )}},
  debug    : function (logger, namespace, level = 'DEBUG') { return (msg, opt) => { if (logger.isEnabled === false ) return; process.stdout.write( formatters.format(level, namespace, process.pid, msg, opt, true) )}},
  warn     : function (logger, namespace, level = 'WARN' ) { return (msg, opt) => { if (logger.isEnabled === false ) return; process.stdout.write( formatters.format(level, namespace, process.pid, msg, opt, true) )}},
  error    : function (logger, namespace, level = 'ERROR') { return (msg, opt) => { if (logger.isEnabled === false ) return; process.stdout.write( formatters.format(level, namespace, process.pid, msg, opt, true) )}},
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
