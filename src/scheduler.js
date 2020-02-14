const fs             = require('fs');
const path           = require('path');
const stream         = require('stream');
const cluster        = require('cluster');
const logger         = require('./logger');
const padlz          = require('./utils').padlz;
const tty            = require('tty');
const zlib           = require('zlib');

const LOG_RETENTION  = process.env.KITTEN_LOGGER_RETENTION_DAYS || 10;
const LOGS_DIRECTORY = process.env.KITTEN_LOGGER_RETENTION_DIRECTORY || 'logs';
const LOGS_FILE      = process.env.KITTEN_LOGGER_RETENTION_FILENAME  || 'out';
const outFilename    = path.join(process.cwd(), LOGS_DIRECTORY, LOGS_FILE + '.log');
const IS_ATTY        = tty.isatty(process.stdout.fd);
var currentDay       = '';

// do nothing if this file is called form a worker
if (cluster.isWorker === true) {
  return;
}

const masterLogger = logger.persistentLogger('master');
const workerLogger = logger.persistentLogger('worker');

const outTransform = createTransformStreamToAddLogInfo(masterLogger);

if (!IS_ATTY) {
  process.stdout.write = outTransform.write.bind(outTransform);
  process.stderr.write = outTransform.write.bind(outTransform);

  // create the logs directory if it does not exist
  try {
    fs.mkdirSync(path.join(process.cwd(), LOGS_DIRECTORY));
  }
  catch (e) {} // eslint-disable-line

  // create log stream
  var outLogStream = fs.createWriteStream(outFilename, { flags : 'a', encoding : 'utf8',  mode : parseInt('0666',8) });

  outTransform.pipe(outLogStream);

  // we should do it when there is a new log to write to improve rotation precision
  setInterval(function () {
    var _date = new Date();
    var _day  = _date.getFullYear() + padlz(_date.getMonth()+1, 2) + padlz(_date.getDate(), 2);
    if (currentDay === '') {
      currentDay = _day;
    }
    else if (currentDay !== _day) {
      console.log('[kitten-logger] [master] Rotate logs');
      outLogStream = rotateStream(outTransform, outLogStream, outFilename);
      currentDay   = _day;
    }
  }, 10000);
}
else {
  let ttyTransformOut = _getTransform(masterLogger);
  let ttyTransformErr = _getTransform(masterLogger, 'ERROR');

  const originalStdoutWrite = process.stdout.write.bind(process.stdout);
  process.stdout.write      = (chunk, encoding, callback) => {
    ttyTransformOut(chunk, encoding, (err, data) => {
      originalStdoutWrite(data, encoding, callback);
    }, process.pid);
  };
  const originalStderrWrite = process.stderr.write.bind(process.stderr);
  process.stderr.write      = (chunk, encoding, callback) => {
    ttyTransformErr(chunk, encoding, (err, data) => {
      originalStderrWrite(data, encoding, callback);
    });
  };
}

// Pipe each worker stdout/stderr to master stdout/stderr
cluster.on('fork', function (worker) {
  // transform stdout/sterr directly from worker thread to print the right worker process.id
  const _outTransformForWorker = createTransformStreamToAddLogInfo(workerLogger);
  worker.process.stdout.pipe(_outTransformForWorker);
  worker.process.stderr.pipe(_outTransformForWorker);
  _outTransformForWorker.pipe(process.stdout);
  _outTransformForWorker.pipe(process.stderr);
});


/**
 * Get transform function
 * @param {Object} defaultLogger persistent logger to format console.log messages
 * @param {String} defaultType default logger type
 * @returns {Function}
 */
function _getTransform (defaultLogger, defaultType = 'DEBUG') {
  return function transform (chunk, encoding, callback) {
    var _str = chunk.toString();

    // if the log is already transformed, leave immediately
    // Logs coming from workers or coming from ideos logger are already transformed, because the context cannot
    // be found by the master process
    // But log coming from everywhere (crash, console.log, debug module, etc) are not transformed
    if (_str.startsWith('KITTEN_LOG%') === true) {
      return callback(null, _str.slice(11));
    }

    let fn = defaultLogger[defaultType.toLowerCase()] || defaultLogger.debug;
    callback(null, fn.call(null, _str));
  }
}

/**
 * Create a transform stream to add log information
 * @param  {Integer} pid      process id
 * @param  {Boolean} isWorker true if the transform stream is generated for a worker.
 * @return {Function}         Transform stream function
 */
function createTransformStreamToAddLogInfo (defaultLogger) {
  return new stream.Transform({
    transform : _getTransform(defaultLogger)
  });
}

/**
 * Rotate file stream, and rotation log files
 * @param  {Stream} readableStream stream from which logs come from
 * @param  {Stream} writableStream current file stream where logs go to
 * @param  {String} filename       log filename
 * @return {Stream}                new file stream where logs go to
 */
function rotateStream (readableStream, writableStream, filename) {
  readableStream.pause();
  readableStream.unpipe(writableStream);
  writableStream.end();
  rotateLog(filename);
  var _newWritableStream = fs.createWriteStream(filename, { flags : 'a', encoding : 'utf8',  mode : parseInt('0666',8) });
  readableStream.pipe(_newWritableStream);
  readableStream.resume();
  return _newWritableStream;
}

/**
 * Rotate log file.
 * @Warning, this function is synchrone. But executed once a day, by the master process only, at midnight.
 * @param  {String} filename log file name
 */
function rotateLog (filename) {
  for (var i = LOG_RETENTION; i > 0 ; i--) {
    var _oldFile = filename + '.' + (i-1);
    if (i === 1) {
      _oldFile = filename;
    }
    var _newFile = filename + '.' + i;
    try {
      fs.renameSync(_oldFile, _newFile);

      let readStream  = fs.createReadStream(_newFile);
      let writeStream = fs.createWriteStream(_newFile + '.gz', { flags : 'a', encoding : 'utf8',  mode : parseInt('0666',8) });
      let gzip = zlib.createGzip();

      readStream.pipe(gzip).pipe(writeStream).on('finish', (err) => {
        if (err) {
          return;
        }

        fs.unlink(_newFile, (err) => {});
      });
    }
    catch (e) {} // eslint-disable-line
  }
}
