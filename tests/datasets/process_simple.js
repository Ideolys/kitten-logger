const kittenLogger = require('../../index');

kittenLogger.init();

let logger = kittenLogger.createPersistentLogger('test-simple');

logger.info('Test message');

setTimeout(() => {
  process.exit();
}, 500);
