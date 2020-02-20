const kittenLogger = require('../../index');

kittenLogger.init();

let logger = kittenLogger.createPersistentLogger('test-simple-multiple');

logger.info('Test message 1');
logger.info('Test message 2');
logger.info('Test message 3');
logger.info('Test message 4');
logger.info('Test message 5');

setTimeout(() => {
  process.exit();
}, 500);
