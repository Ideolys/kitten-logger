const cluster      = require('cluster');
const kittenLogger = require('../../index');

if (cluster.isMaster) {
  kittenLogger.init();

  console.log('Message from master: console.log')

  cluster.setupMaster({
    stdio : 'pipe'
  });

  for (var i = 0; i < 4; i++) {
    cluster.fork();
  }

  return setTimeout(() => {
    process.exit();
  }, 500);
}

console.log('Test message from worker #' + process.pid);
