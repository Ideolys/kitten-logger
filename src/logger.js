const formatters = require('./formatters');
const filter     = require('./filter');
let loggers      = {};

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
  let _log   = (msq, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('DEBUG', namespace, process.pid, msg, opt, true) )};
  _log.info  = (msg, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('INFO' , namespace, process.pid, msg, opt, true) )};
  _log.error = (msg, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('ERROR', namespace, process.pid, msg, opt, true) )};
  _log.warn  = (msg, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('WARN' , namespace, process.pid, msg, opt, true) )};
  _log.debug = (msg, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('DEBUG', namespace, process.pid, msg, opt, true) )};
  _log.isEnabled = filter.isEnabled(namespace);

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
  let _log   = (msq, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('DEBUG', namespace, process.pid, msg, opt, true) )};
  _log.info  = (msg, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('INFO' , namespace, process.pid, msg, opt, true) )};
  _log.error = (msg, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('ERROR', namespace, process.pid, msg, opt, true) )};
  _log.warn  = (msg, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('WARN' , namespace, process.pid, msg, opt, true) )};
  _log.debug = (msg, opt) => { if (_log.isEnabled === false ) return; process.stdout.write( formatters.format('DEBUG', namespace, process.pid, msg, opt, true) )};
  _log.isEnabled = filter.isEnabled(namespace);
  return _log;
}

exports.persistentLogger = persistentLogger;
exports.logger           = logger;
exports.loggers          = loggers;
exports.filter           = filter;
