const kittenLogger = require('../../index');

kittenLogger.init();

console.log('A message from console.log')

setTimeout(() => {
  process.exit();
}, 500);
