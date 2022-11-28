const fs                        = require('fs');
const path                      = require('path');
const should                    = require('should');
const {execFile: exec, spawn}   = require('child_process');

const DATASETS_DIRECTORY = path.join(__dirname         , 'datasets');
const LOGS_DIRECTORY     = path.join(DATASETS_DIRECTORY, 'logs');
const FILE_PATH          = path.join(LOGS_DIRECTORY    , 'out.log');

describe('process', () => {

  beforeEach(done => {
    delete process.env.KITTEN_LOGGER_DEST;
    fs.access(FILE_PATH, err => {
      if (!err) {
        fs.unlinkSync(FILE_PATH);
      }

      fs.access(LOGS_DIRECTORY, err => {
        if (!err) {
          fs.rmdirSync(LOGS_DIRECTORY);
        }

        done();
      });
    });
  });

  it('should create log directory', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_simple.js')], { cwd : DATASETS_DIRECTORY }, err => {
      try {
        fs.accessSync(LOGS_DIRECTORY);
      }
      catch (e) {
        should(e).not.ok();
      }
      done();
    });
  });

  it('should create out.log file', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_simple.js')], { cwd : DATASETS_DIRECTORY }, err => {
      try {
        fs.accessSync(FILE_PATH);
      }
      catch (e) {
        should(e).not.ok();
      }
      done();
    });
  });

  it('should log a message in log file', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_simple.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      should(csv.length).eql(2);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple');
      should(log[3]).eql('Test message');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      done();
    });
  });

  it('should log messages in log file', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_simple_multiple.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      should(csv.length).eql(6);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple-multiple');
      should(log[3]).eql('Test message 1');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[1];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple-multiple');
      should(log[3]).eql('Test message 2');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[2];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple-multiple');
      should(log[3]).eql('Test message 3');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[3];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple-multiple');
      should(log[3]).eql('Test message 4');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[4];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple-multiple');
      should(log[3]).eql('Test message 5');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      done();
    });
  });

  it('should log idKittenLogger value', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_id_log.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      should(csv.length).eql(3);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-id');
      should(log[3]).eql('Info message');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('123456');
      log = csv[1];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('ERROR');
      should(log[2]).eql('test-id');
      should(log[3]).eql('Error message');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('123456');
      done();
    });
  });

  it('should format messages from worker in cluster mode', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_cluster.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      let nbMessagesByWorker = {};

      should(csv.length).eql(7);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('DEBUG');
      should(log[2]).eql('master');
      should(log[3]).eql('Message from master: console.log');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[1];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-cluster');
      should(log[3]).eql('Master done');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[2];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-cluster');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('Test message from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[3];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-cluster');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('Test message from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[4];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-cluster');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('Test message from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[5];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-cluster');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('Test message from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;

      for (pid in nbMessagesByWorker) {
        should(nbMessagesByWorker[pid]).eql(1);
      }
      done();
    });
  });

  it('should format messages from worker in cluster mode : console.log', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_cluster_console.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      let nbMessagesByWorker = {};

      should(csv.length).eql(6);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('DEBUG');
      should(log[2]).eql('master');
      should(log[3]).eql('Message from master: console.log');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[1];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('DEBUG');
      should(log[2]).eql('worker');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('Test message from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[2];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('DEBUG');
      should(log[2]).eql('worker');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('Test message from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[3];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('DEBUG');
      should(log[2]).eql('worker');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('Test message from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[4];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('DEBUG');
      should(log[2]).eql('worker');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('Test message from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;

      for (pid in nbMessagesByWorker) {
        should(nbMessagesByWorker[pid]).eql(1);
      }
      done();
    });
  });

  it('should log a message in console with no initialization', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_no_init.js')], { cwd : DATASETS_DIRECTORY, stdio : 'pipe' }, (err, msg) => {
      let csv = CSVToArray(msg);
      should(csv.length).eql(2);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple');
      should(log[3]).eql('Test message');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      done();
    });
  });

  it('should log a large message', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_large_message.js')], { cwd : DATASETS_DIRECTORY, stdio : 'pipe' }, (err, msg) => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      should(csv.length).eql(3);

      let log = csv[0];
      let regex = /DELIMITER/g;
      should(log[3].match(regex)).be.an.Array().lengthOf(11);

      log = csv[1];
      should(log[3]).eql('Test message');

      done();
    });
  });

  it.skip('should log a large message in the console', done => {
    spawn('node', [path.join(__dirname, 'datasets', 'process_large_message_console.js')], { cwd : DATASETS_DIRECTORY, stdio : 'pipe' }, (err, msg) => {
      console.log(err);
      let csv = CSVToArray(msg);
      should(csv.length).eql(3);
      let log = csv[0];
      let regex = /DELIMITER/g;
      should(log[3].match(regex)).be.an.Array().lengthOf(11);

      log = csv[1];
      should(log[3]).eql('Test message');

      done();
    });
  });

  it('should log large messages from worker in cluster mode', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_cluster_large_message.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      let regex = /DELIMITER/g;

      should(csv.length).eql(7);
      should(csv[2][3].match(regex)).be.an.Array().lengthOf(11);
      should(csv[3][3].match(regex)).be.an.Array().lengthOf(11);
      should(csv[4][3].match(regex)).be.an.Array().lengthOf(11);
      should(csv[5][3].match(regex)).be.an.Array().lengthOf(11);
      done();
    });
  });

  it('should log error message in log file', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_error.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      should(csv.length).eql(2);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('ERROR');
      should(log[2]).eql('master');
      should(log[3]).eql('An error');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      done();
    });
  });

  it('should log error message in log file in cluster', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_error_cluster.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      let nbMessagesByWorker = {};

      should(csv.length).eql(7);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('DEBUG');
      should(log[2]).eql('master');
      should(log[3]).eql('Message from master: console.log');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[1];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-cluster');
      should(log[3]).eql('Master done');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      log = csv[2];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('ERROR');
      should(log[2]).eql('worker');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('An error from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[3];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('ERROR');
      should(log[2]).eql('worker');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('An error from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[4];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('ERROR');
      should(log[2]).eql('worker');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('An error from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;
      log = csv[5];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('ERROR');
      should(log[2]).eql('worker');
      should(log[3].slice(0, log[3].indexOf('#'))).eql('An error from worker ');
      should(isNaN(log[4])).eql(false);
      should(log[4]).eql(log[3].slice(log[3].indexOf('#') + 1));
      should(log[5]).eql('');
      nbMessagesByWorker[log[4]] = !nbMessagesByWorker[log[4]] ? 1 : nbMessagesByWorker[log[4]] + 1;

      for (pid in nbMessagesByWorker) {
        should(nbMessagesByWorker[pid]).eql(1);
      }
      done();
    });
  });

  it('should not log K_LOG', done => {
    exec('node', [path.join(__dirname, 'datasets', 'process_tag.js')], { cwd : DATASETS_DIRECTORY }, err => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      should(csv.length).eql(1);
      let log = csv[0];
      should(log.length).eql(1);
      should(log[0]).eql('test');
      done();
    });
  });

  it('should log where the environnement variable tells to (tty)', done => {
    process.env.KITTEN_LOGGER_DEST = 'tty';
    exec('node', [path.join(__dirname, 'datasets', 'process_simple.js')], { cwd : DATASETS_DIRECTORY }, (err, out) => {
      let csv      = CSVToArray(out);
      should(csv.length).eql(2);
      let log = csv[0];
			should(log.length).eql(6);
			should(/[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}/.test(log[0])).eql(true);
			should(/INFO/.test(log[1])).eql(true);
			should(/test-simple/.test(log[2])).eql(true);
			should(log[3]).eql('Test message');
      done();
    });
  });

  it('should log where the environnement variable tells to (file)', done => {
    process.env.KITTEN_LOGGER_DEST = 'file';
    exec('node', [path.join(__dirname, 'datasets', 'process_simple.js')], { cwd : DATASETS_DIRECTORY }, (err, out) => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      should(csv.length).eql(2);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple');
      should(log[3]).eql('Test message');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      done();
    });
  });

  it('should log where the environnement variable tells to (auto)', done => {
    process.env.KITTEN_LOGGER_DEST = 'auto';
    exec('node', [path.join(__dirname, 'datasets', 'process_simple.js')], { cwd : DATASETS_DIRECTORY }, (err, out) => {
      let fileData = fs.readFileSync(FILE_PATH);
      let csv      = CSVToArray(fileData.toString());
      should(csv.length).eql(2);
      let log = csv[0];
      should(isNaN((new Date(log[0])).getTime())).eql(false);
      should(log[1]).eql('INFO');
      should(log[2]).eql('test-simple');
      should(log[3]).eql('Test message');
      should(isNaN(log[4])).eql(false);
      should(log[5]).eql('');
      done();
    });
  });
});


/**
 * Convert CSV to JS array
 * @param {String} strData content of CSV file
 */
function CSVToArray (strData) {
  if (strData === '') {
    return [];
  }
  var _strDelimiter = '\t';
  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      '(\\' + _strDelimiter + '|\\r?\\n|\\r|^)' +
      // Quoted fields.
      "(?:'([^']*(?:''[^']*)*)'|" +
      // "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + double quote version
      // Standard fields.
      "([^'\\" + _strDelimiter + '\\r\\n]*))'
      // "([^\"\\" + _strDelimiter + "\\r\\n]*))" double quote version
    ),
    'gi'
  );
  var arrData = [[]];
  var arrMatches = null;
  while (arrMatches = objPattern.exec(strData)) {
    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];
    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (strMatchedDelimiter.length && strMatchedDelimiter !== _strDelimiter) {
      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);
    }
    var strMatchedValue;
    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {
      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(new RegExp("''", 'g'), "'");
      // strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\""); double quote version
    }
    else {
      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];
    }
    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }
  // Return the parsed data.
  return (arrData);
}
