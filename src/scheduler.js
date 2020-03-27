const fs          = require('fs');
const path        = require('path');
const cluster     = require('cluster');
const zlib        = require('zlib');
const destination = require('./destination');
const utils       = require('./utils');

const LOG_RETENTION  = process.env.KITTEN_LOGGER_RETENTION_DAYS || 10;
const LOGS_DIRECTORY = process.env.KITTEN_LOGGER_RETENTION_DIRECTORY || 'logs';
const LOGS_FILE      = process.env.KITTEN_LOGGER_RETENTION_FILENAME  || 'out';
const outFilename    = path.join(process.cwd(), LOGS_DIRECTORY, LOGS_FILE + '.log');
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
      rotateStream(outTransform, outLogStream, outFilename, stream => {
        outLogStream = stream;
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
 * @param  {Stream} readableStream stream from which logs come from
 * @param  {Stream} writableStream current file stream where logs go to
 * @param  {String} filename       log filename
 * @param  {Function} callback newStream: new file stream where logs go to
 */
function rotateStream (readableStream, writableStream, filename, callback) {
  readableStream.pause();
  readableStream.unpipe(writableStream);
  writableStream.end();

  currentRotationIterator = LOG_RETENTION;
  rotateLog(filename, () => {
    var _newWritableStream = fs.createWriteStream(filename, { flags : 'a', encoding : 'utf8',  mode : parseInt('0666',8) });
    readableStream.pipe(_newWritableStream);
    readableStream.resume();
    callback(_newWritableStream);
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
