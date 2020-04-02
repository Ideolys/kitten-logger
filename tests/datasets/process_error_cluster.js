const cluster      = require('cluster');
const kittenLogger = require('../../index');

if (cluster.isMaster) {
  kittenLogger.init();

  console.log('Message from master: console.log')

  let logger = kittenLogger.createPersistentLogger('test-cluster');

  cluster.setupMaster({
    stdio : 'pipe'
  });

  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }

  logger.info('Master done');

  return setTimeout(() => {
    process.exit();
  }, 500);
}

console.error('An error from worker #' + process.pid);
