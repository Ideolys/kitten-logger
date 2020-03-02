const kittenLogger = require('../../index');

let logger = kittenLogger.createPersistentLogger('test-simple');

logger.info('Test message');

setTimeout(() => {
  process.exit();
}, 500);
