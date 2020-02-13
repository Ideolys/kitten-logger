const fs             = require('fs');
const path           = require('path');
const stream         = require('stream');
const cluster        = require('cluster');
const formatter      = require('./formatters');
const padlz          = require('./utils').padlz;
const LOG_RETENTION  = 10;
var currentDay       = '';
const LOGS_DIRECTORY = 'logs';
const outFilename    = path.join(process.cwd(), LOGS_DIRECTORY, 'out.log');
const tty            = require('tty');
const IS_ATTY        = tty.isatty(process.stdout.fd);

// do nothing if this file is called form a worker
if (cluster.isWorker === true) {
  return;
}

const outTransform = createTransformStreamToAddLogInfo(process.pid);

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
  let ttyTransformOut = _getTransform(process.pid, cluster.isWorker);
  let ttyTransformErr = _getTransform(process.pid, cluster.isWorker, 'ERROR');

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
  const _outTransformForWorker = createTransformStreamToAddLogInfo(worker.process.pid, true);
  worker.process.stdout.pipe(_outTransformForWorker);
  worker.process.stderr.pipe(_outTransformForWorker);
  _outTransformForWorker.pipe(process.stdout);
  _outTransformForWorker.pipe(process.stderr);
});


function _getTransform (pid, isWorker, defaultNamespace = 'DEBUG') {
  return function transform (chunk, encoding, callback) {
    var _str = chunk.toString();

    // if the log is already transformed, leave immediately
    // Logs coming from workers or coming from ideos logger are already transformed, because the context cannot
    // be found by the master process
    // But log coming from everywhere (crash, console.log, debug module, etc) are not transformed
    if (_str.startsWith('KITTEN_LOG%') === true) {
      return callback(null, _str.slice(11));
    }

    var _namespace = isWorker ? 'worker' : 'master';
    callback(null, formatter.format(defaultNamespace, _namespace, pid, _str, null, isWorker));
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
    }
    catch (e) {} // eslint-disable-line
  }
}
