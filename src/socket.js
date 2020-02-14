const net           = require('net');
const cluster       = require('cluster');
const fs            = require('fs');
const os            = require('os');
const socketName    = os.tmpdir() + '/kitten_logger_' + fs.fstatSync(1).ino;
const socketHandler = require('./socketHandler');

let reconnectInterval        = 1000;
let reconnectIntervalMax     = 20000;
let reconnectIntervalFactor  = 1.2;
let currentReconnectInterval = reconnectInterval;
let reconnectTimer           = null;
let serverConnection         = null;
let clients                  = [];
let clientsIterator          = 0;
let client                   = null;

/**
 * Used by client to open a socket
 * @param {Mixed} err error object
 * @param {Function} callback
 */
function _connect (err, callback) {
  // slow down reconnection frequency
  reconnectInterval *= reconnectIntervalFactor;
  if (currentReconnectInterval > reconnectIntervalMax) {
    currentReconnectInterval = reconnectIntervalMax;
  }

  clearTimeout(reconnectTimer);
  setTimeout(function () {
    reconnectTimer = setTimeout(function () {
      currentReconnectInterval = reconnectInterval;
    }, 10000); // we reset the slow down mechanism after 10 seconds of connection stability

    socket.connect(callback);
  }, currentReconnectInterval, 10);
}

/**
 * Used by send. It transforms the message, add some information for transmission
 * @param  {String} message the message to transform
 * @return {String}         the message ready to be transmitted
 */
function formatMessage (message) {
  var _dataStr = JSON.stringify(message);
  var _data    = _dataStr.length + '#' + _dataStr;
  return _data;
}


/**
 * onData
 * @param {String} data
 * @param {Object} socket
 */
function onData (rawData, socket, handleMessage) {
  var data      = rawData.toString();
  socket.buffer = socket.buffer || '';
  socket.buffer += data;

  if (socket.contentLength == null) {
    var i = socket.buffer.indexOf('#');
    // Check if the buffer has a #, if not, the end of the buffer string might be in the middle of a content length string
    if (i !== -1) {
      var _rawContentLength = socket.buffer.substring(0, i);
      socket.contentLength  = parseInt(_rawContentLength);
      socket.buffer         = socket.buffer.substring(i + 1);

      if (isNaN(socket.contentLength)) {
        socket.contentLength = null;
        socket.buffer        = '';
      }
    }
  }

  if (socket.contentLength !== null) {
    if (socket.buffer.length === socket.contentLength) {
      handleMessage(socket.buffer, socket);
    }
    else if (socket.buffer.length > socket.contentLength) {
      var message = socket.buffer.substring(0, socket.contentLength);
      var rest    = socket.buffer.substring(socket.contentLength);
      handleMessage(message, socket);
      onData(rest, socket);
    }
  }
}

const socket = {
  /**
   * Create a socket server
   * @param {Function} callback
   */
  listen : function (callback) {
    if (!cluster.isMaster) {
      return;
    }

    fs.unlink(socketName, (err) => {
      const server = net.createServer(c => {
        serverConnection = c;

        c.on('data', (data, socket) => {
          onData(data, serverConnection, serverHandleMessage);
        });
      });

      /**
       * Handle received message
       * @param {String} data
       * @param {Object} socket
       */
      function serverHandleMessage (data, socket) {
        socket.contentLength = null;
        socket.buffer        = '';

        data = JSON.parse(data);

        for (var i = 0; i < clients.length; i++) {
          clients[i].write(formatMessage(data), 'utf-8');
        }
      }

      server.on('error', (err) => {});
      server.on('connection', socket => {
        socket.id = clientsIterator++;
        clients.push(socket);

        socket.on('close', () => {
          for (var i = 0; i < clients.length; i++) {
            if (clients[i].id === socket.id) {
              clients.splice(i, 1);
              break;
            }
          }
        });
      });

      server.listen(socketName, (err, res) => {
        if (callback) callback(server);
      });
    });
  },

  /**
   * Connect to a socket server
   * Listen to actions
   * @param {Function} callback
   */
  connect : function (callback) {
    /**
     * Handle received message
     * @param {String} data
     * @param {Object} socket
     */
    function clientHandleMessage (data, socket) {
      socket.contentLength = null;
      socket.buffer        = '';

      data = JSON.parse(data);

      socketHandler(data);
    }

    client = net.connect(socketName, (err) => {});
    client.setEncoding('utf-8');
    client.on('connect', () => {
      if (callback) callback(client);
    });
    client.on('close'  , _connect);
    client.on('error'  , () => {});
    client.on('data'   , data => {
      onData(data, client, clientHandleMessage);
    });
  },

  send : function (data) {
    client.write(formatMessage(data), 'utf-8');
  }
};

module.exports = socket;
