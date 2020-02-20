const fs        = require('fs');
const path      = require('path');
const stream    = require('stream');
const cluster   = require('cluster');
const padlz     = require('./utils').padlz;
const tty       = require('tty');
const zlib      = require('zlib');
const formatter = require('./formatters');

const LOG_RETENTION  = process.env.KITTEN_LOGGER_RETENTION_DAYS || 10;
const LOGS_DIRECTORY = process.env.KITTEN_LOGGER_RETENTION_DIRECTORY || 'logs';
const LOGS_FILE      = process.env.KITTEN_LOGGER_RETENTION_FILENAME  || 'out';
const outFilename    = path.join(process.cwd(), LOGS_DIRECTORY, LOGS_FILE + '.log');
const IS_ATTY        = tty.isatty(process.stdout.fd);
var currentDay       = '';

let currentRotationIterator = LOG_RETENTION;

// do nothing if this file is called form a worker
if (cluster.isWorker === true) {
  return;
}

if (!IS_ATTY) {
  const outTransform = createTransformStreamToAddLogInfo(process.pid);

  process.stdout.write = outTransform.write.bind(outTransform);
  process.stderr.write = outTransform.write.bind(outTransform);

  // create the logs directory if it does not exist
  try {
    fs.mkdirSync(path.join(process.cwd(), LOGS_DIRECTORY));
  }
  catch (e) {} // eslint-disable-line

  // create log stream
  var outLogStream = fs.createWriteStream(outFilename, { flags : 'a', encoding : 'utf8',  mode : parseInt('0666', 8) });

  outTransform.pipe(outLogStream);

  // we should do it when there is a new log to write to improve rotation precision
  setInterval(function () {
    var _date = new Date();
    var _day  = _date.getFullYear() + padlz(_date.getMonth()+1, 2) + padlz(_date.getDate(), 2);
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
  let ttyTransform = _getTransform(process.pid);

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write      = (chunk, encoding, callback) => {
    ttyTransform(chunk, encoding, (err, data) => {
      originalStdoutWrite(data, encoding, callback);
    }, process.pid);
  };
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write      = (chunk, encoding, callback) => {
    ttyTransform(chunk, encoding, (err, data) => {
      originalStderrWrite(data, encoding, callback);
    });
  };
}

// Pipe each worker stdout/stderr to master stdout/stderr
  cluster.on('fork', function (worker) {
    const outTransform = createTransformStreamToAddLogInfo(worker.process.pid, true);
    worker.process.stdout.pipe(outTransform);
    worker.process.stderr.pipe(outTransform);
    outTransform.pipe(process.stdout);
  });

/**
 * Get transform function
 * @param {String} pid
 * @param {Boolean} isWorker
 * @returns {Function}
 */
function _getTransform (pid, isWorker) {
  return function transform (chunk, encoding, callback) {
    let currentLog = chunk.toString();
    let index      = currentLog.indexOf('KT_LOG%');

    if (index === -1) {
      return callback(null, formatter.format('DEBUG', isWorker ? 'worker' : 'master', pid, currentLog, null, isWorker));
    }

    // For workers, sometimes chunk is concatenation of multiple messages
    return callback(null, isWorker ? currentLog : currentLog.replace(/KT_LOG%/g, ''))
  }
}

/**
 * Create a transform stream to add log information
 * @param  {Integer} pid      process id
 * @param  {Boolean} isWorker true if the transform stream is generated for a worker.
 * @return {Function}         Transform stream function
 */
function createTransformStreamToAddLogInfo (pid, isWorker) {
  return new stream.Transform({
    transform : _getTransform(pid, isWorker)
  });
}

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
