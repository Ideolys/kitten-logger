const kittenLogger = require('../../index');

kittenLogger.init();

let logger = kittenLogger.createLogger('test-id');

logger.info('Info message', { idKittenLogger : 123456 });
logger.error('Error message', { idKittenLogger : 123456 });

setTimeout(() => {
  process.exit();
}, 500);
