const kittenLogger = require('../../index');

kittenLogger.init();

process.stdout.write('K_LOGtest');

setTimeout(() => {
  process.exit();
}, 500);
