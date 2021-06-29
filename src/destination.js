const fs                   = require('fs');
const path                 = require('path');
const cluster              = require('cluster');
const formatters           = require('./formatters');
const { KITTEN_LOGGER_TAG } = require('./utils');

const originalWrite = process.stdout.write.bind(process.stdout);
let formatFn        = formatters.formatTTY;

let destination  = originalWrite;
let outLogStream = null;

const LOGS_DIRECTORY = process.env.KITTEN_LOGGER_RETENTION_DIRECTORY || 'logs';
const LOGS_FILE      = process.env.KITTEN_LOGGER_RETENTION_FILENAME  || 'out';
const outFilename    = path.join(process.cwd(), LOGS_DIRECTORY, LOGS_FILE + '.log');

let rotationWritesBuffer  = [];
let ROTATION_LIMIT_BUFFER = 100000;

if (cluster.isWorker) {
  formatFn = formatters.format;
}

/**
 * Return msg to destination if Ttag defined
 * Prevent debug formatting
 * @param {Bbffer} chunk
 * @param {String} encoding
 * @param {Function} callback
 * @returns {Boolean}
 */
function returnIfTag (chunk, encoding, callback) {
  if (chunk.slice(0, 5) === KITTEN_LOGGER_TAG) {
    destination(chunk.slice(5), encoding, callback);
    return true;
  }

  return false;
}

module.exports = {
  originalWrite,
  logFilename : outFilename,

  get desWrite () {
    return destination;
  },

  setTTY () {
    destination = originalWrite;

    process.stdout.write = (chunk, encoding, callback) => {
      let resAction = returnIfTag(chunk, encoding, callback);
      if (resAction) {
        return;
      }

      destination(
        formatFn('DEBUG', cluster.isWorker ? 'worker' : 'master', process.pid, chunk.toString()),
        encoding,
        callback
      );
    };
    process.stderr.write = (chunk, encoding, callback) => {
      let resAction = returnIfTag(chunk, encoding, callback);
      if (resAction) {
        return;
      }

      destination(
        formatFn('ERROR', cluster.isWorker ? 'worker' : 'master', process.pid, chunk.toString()),
        encoding,
        callback
      );
    };
  },

  setFile () {
    try {
      fs.mkdirSync(path.join(process.cwd(), LOGS_DIRECTORY));
    }
    catch (e) {} // eslint-disable-line

    outLogStream = fs.createWriteStream(outFilename, { flags : 'a', encoding : 'utf8',  mode : parseInt('0666', 8) });
    destination  = outLogStream.write.bind(outLogStream);

    process.stdout.write = (chunk, encoding, callback) => {
      let resAction = returnIfTag(chunk, encoding, callback);
      if (resAction) {
        return;
      }

      destination(
        formatters.format('DEBUG', cluster.isWorker ? 'worker' : 'master', process.pid, chunk.toString()),
        encoding,
        callback
      );
    };
    process.stderr.write = (chunk, encoding, callback) => {
      let resAction = returnIfTag(chunk, encoding, callback);
      if (resAction) {
        return;
      }

      destination(
        formatters.format('ERROR', cluster.isWorker ? 'worker' : 'master', process.pid, chunk.toString()),
        encoding,
        callback
      );
    };

    // If error, try to properly close the current stream and reopen one
    outLogStream.on('error', () => {
      this.rotate(() => {
        this.setFile();
        this.pushRotationBuffer();
      });
    });
  },

  /**
   * Rotate current write stream
   * @param {Function} callback
   */
  rotate (callback) {
    destination = function (data) {
      if (rotationWritesBuffer.length < ROTATION_LIMIT_BUFFER) {
        rotationWritesBuffer.push(data);
      }
    }

    if (outLogStream.writableEnded) {
      callback();
    }

    outLogStream.on('error', () => {});
    outLogStream.on('close', () => {
      callback();
    });
    outLogStream.end();
  },

  /**
   * Push rotation buffer
   */
  pushRotationBuffer () {
    for (let i = 0, len = rotationWritesBuffer.length; i < len; i++) {
      destination(rotationWritesBuffer[i]);
    }

    rotationWritesBuffer = [];
  },

  /**
   * Only for tests
   * @param {Object} dest
   */
  _setDestination (dest) {
    destination = dest;
  }

}
