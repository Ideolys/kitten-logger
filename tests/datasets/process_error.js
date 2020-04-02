const kittenLogger = require('../../index');

kittenLogger.init();

console.error('An error');

setTimeout(() => {
  process.exit();
}, 500);
