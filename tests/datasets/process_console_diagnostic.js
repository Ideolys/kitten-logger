const diagnosticsChannel = require('diagnostics_channel');
const {
  DIAGNOSTIC_CHANNEL_NAME
} = require('../../src/utils');
const kittenLogger = require('../../index');

kittenLogger.init();

let _logger = kittenLogger.createPersistentLogger('test');

function onDiagnostic (message) {
  diagnosticsChannel.unsubscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);

  _logger.info(JSON.stringify(message));
}
diagnosticsChannel.subscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);

console.log('A message from console.log')

setTimeout(() => {
  process.exit();
}, 500);
