const formatters         = require('./formatters');
const filter             = require('./filter');
const destination        = require('./destination');
const utils              = require('./utils');
const formatFn           = utils.isTTY ? formatters.formatTTY : formatters.format;
let loggers              = {};


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
  info  (namespace) {
    return function info  () {
      utils.publishDiagnostic('INFO', namespace, process.pid, formatters.parseMsgOrOptions(arguments));
      destination.desWrite(formatFn('INFO' , namespace, process.pid, arguments));
    }
  },
  debug (namespace) {
    return function debug () {
      utils.publishDiagnostic('DEBUG', namespace, process.pid, formatters.parseMsgOrOptions( arguments));
      destination.desWrite(formatFn('DEBUG', namespace, process.pid, arguments));
    }
  },
  warn  (namespace) {
    return function warn  () {
      utils.publishDiagnostic('WARN', namespace, process.pid, formatters.parseMsgOrOptions( arguments));
      destination.desWrite(formatFn('WARN' , namespace, process.pid, arguments));
    }
  },
  error (namespace) {
    return function error () {
      utils.publishDiagnostic('ERROR', namespace, process.pid, formatters.parseMsgOrOptions( arguments));
      destination.desWrite(formatFn('ERROR', namespace, process.pid, arguments));
    }
  },
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
