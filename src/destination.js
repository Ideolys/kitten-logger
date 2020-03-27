const fs         = require('fs');
const path       = require('path');
const cluster    = require('cluster');
const formatters = require('./formatters');

const originalWrite = process.stdout.write.bind(process.stdout);
let formatFn        = formatters.formatTTY;

let destination  = originalWrite;
let outLogStream = null;

if (cluster.isWorker) {
  formatFn = formatters.format;
}

process.stderr.pipe(process.stdout);

module.exports = {

  get desWrite () {
    return destination;
  },

  setTTY () {
    destination = originalWrite;

    process.stdout.write = (chunk, encoding, callback) => {
      destination(
        formatFn('DEBUG', cluster.isWorker ? 'worker' : 'master', process.pid, chunk.toString()),
        encoding,
        callback
      );
    };
  },

  setFile () {
    const LOGS_DIRECTORY = process.env.KITTEN_LOGGER_RETENTION_DIRECTORY || 'logs';
    const LOGS_FILE      = process.env.KITTEN_LOGGER_RETENTION_FILENAME  || 'out';
    const outFilename    = path.join(process.cwd(), LOGS_DIRECTORY, LOGS_FILE + '.log');

    try {
      fs.mkdirSync(path.join(process.cwd(), LOGS_DIRECTORY));
    }
    catch (e) {} // eslint-disable-line

    outLogStream = fs.createWriteStream(outFilename, { flags : 'a', encoding : 'utf8',  mode : parseInt('0666', 8) });
    destination  = outLogStream.write.bind(outLogStream);

    process.stdout.write = (chunk, encoding, callback) => {
      destination(
        formatters.format('DEBUG', cluster.isWorker ? 'worker' : 'master', process.pid, chunk.toString()),
        encoding,
        callback
      );
    };
  }

}
