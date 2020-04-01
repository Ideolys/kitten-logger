const fs          = require('fs');
const cluster     = require('cluster');
const zlib        = require('zlib');
const destination = require('./destination');
const utils       = require('./utils');

const LOG_RETENTION  = process.env.KITTEN_LOGGER_RETENTION_DAYS || 10;
var currentDay       = '';

let currentRotationIterator = LOG_RETENTION;

// do nothing if this file is called form a worker
if (cluster.isWorker === true) {
  return;
}

if (!utils.isTTY) {
  destination.setFile();

  // we should do it when there is a new log to write to improve rotation precision
  setInterval(function () {
    var _date = new Date();
    var _day  = _date.getFullYear() + '' + _date.getMonth() + '' + _date.getDate();
    if (currentDay === '') {
      currentDay = _day;
    }
    else if (currentDay !== _day) {
      rotateStream(() => {
        currentDay = _day;
      });
    }
  }, 10000);
}
else {
  destination.setTTY();
}

// Pipe each worker stdout/stderr to master stdout/stderr
cluster.on('fork', function (worker) {
  worker.process.stdout.on('data', (chunk) => {
    destination.desWrite(chunk);
  });
});

/**
 * Rotate file stream, and rotation log files
 * @param  {Function} callback newStream: new file stream where logs go to
 */
function rotateStream (callback) {
  destination.rotate(() => {
    currentRotationIterator = LOG_RETENTION;

    rotateLog(destination.logFilename, () => {
      destination.setFile();
      destination.pushRotationBuffer();
      callback();
    });
  });
}

/**
 * Rotate log file.
 * @param {String} filename log file name
 * @param {Function}
 */
function rotateLog (filename, callback) {
  currentRotationIterator--;
  if (currentRotationIterator <= 0) {
    return callback();
  }

  let _oldFile = filename + '.' + (currentRotationIterator - 1);
  let _newFile = filename + '.' + currentRotationIterator;

  if (currentRotationIterator === 1) {
    _oldFile = filename;
  }
  else {
    _oldFile += '.gz';
    _newFile += '.gz';
  }

  fs.rename(_oldFile, _newFile, err => {
    if (err || _oldFile !== filename) {
      return rotateLog(filename, callback);
    }

    let readStream  = fs.createReadStream(_newFile);
    let writeStream = fs.createWriteStream(_newFile + '.gz', { flags : 'a', encoding : 'utf8',  mode : parseInt('0666',8) });
    let gzip = zlib.createGzip();

    readStream.pipe(gzip).pipe(writeStream).on('finish', (err) => {
      if (err) {
        return rotateLog(filename, callback);
      }

      fs.unlink(_newFile, (err) => {
        rotateLog(filename, callback);
      });
    });
  });
}
