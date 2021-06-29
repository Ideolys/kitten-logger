# kitten-logger

## Features
  + Cluster Mode
  + Log rotation
  + Custom formatters by namespaces
  + Support Debug library variables
  + Filtering at runtime

## Get started

**Install**
```
npm install kitten-logger
```

**Log**
```js
const kittenLogger = require('kitten-logger');

kittenLogger.init();

let logger = kittenLogger.createPersistentLogger('http');

logger.info('My message to log');
```

## Philosophy

A master process initializes kitten-logger (`kittenLogger.init`) to capture `stdout` and `stderr` from master process and forked processes if it is run in cluster mode. Then, it logs entries in log file in CSV format or directly in the terminal.

## API

### Log levels

- `DEBUG`
- `INFO`
- `WARN`
- `ERROR`

### Environment variables

Variable                            | Description
------------------------------------|------------
`KITTEN_LOGGER`                     | Enable namespaces, ex: `namespace:*`. It supports multi-filters with `,` as separator, ex: `namespace,otherNamespace`. By default, the variable searchs `DEBUG` variable. If no `DEBUG` variable has been found, the `*` is set.
`KITTEN_LOGGER_LEVEL`               | Filter log level from specified level. Default is `INFO`. The hierarchy is `DEBUG` < `INFO` < `WARN` < `ERROR`.
`KITTEN_LOGGER_RETENTION_DAYS`      | Set log retention days. By default is `10`;
`KITTEN_LOGGER_RETENTION_DIRECTORY` | Directory to write to logs file. Default is `logs`.
`KITTEN_LOGGER_RETENTION_FILENAME`  | Filename where to write logs. Default is `out`;
`KITTEN_LOGGER_IS_LOADED`           | If `true`, kitten logger will prefix all logs by `K_LOG` for sub instances of kitten-logger.

### Initialisation `kittenLogger.init`

The initialisation function create the `logs` directory where the process has been launched. If it is in TTY mode, the logs are redirected to the terminal. Otherwise, the logs are writted to the file `out.log`. A rotation log system is enabled to rotate logs by day.

### Loggers

kitten-logger differenciates two types of logger:
  - persitent logger
  - simple logger

#### `kittenLogger.createPersistentLogger({String} namespace) -> {LoggerObject}`

Create a persistent logger. It returns a logger Object.

Variable        | Description
----------------|------------
`namespace`     | Global name to identify the logger. This name is unique. It can be filter by the variable `KITTEN_LOGGER`.

**Example**
```js
const kittenLogger = require('kitten-logger');

let logger = kittenLogger.createPersistentLogger('http');

logger.error(err);
```

#### `kittenLogger.createLogger({String} namespace) -> {LoggerObject}`

Create a persistent logger. It returns a logger Object.

Variable        | Description
----------------|------------
`namespace`     | Name to identify the logger. It is not unique. It can be filter by the variable `KITTEN_LOGGER` as the creation of the logger.

**Example**
```js
const kittenLogger = require('kitten-logger');

let logger = kittenLogger.createLogger('http');

logger.error(err);
```

#### `LoggerObject`

**Methods**
+ `LoggerObject.debug({String/Object} msg, {Object} options)`: log given message with level `DEBUG`.
+ `LoggerObject.info({String/Object} msg, {Object} options)`: log given message with level `INFO`.
+ `LoggerObject.warn({String/Object} msg, {Object} options)`: log given message with level `WARN`.
+ `LoggerObject.error({String/Object} msg, {Object} options)`: log given message with level `ERROR`.
+ `LoggerObject.extend({String} namespace) -> {LoggerObject}`: extend the current logger, the namespace of the final LoggerObject will be the concatenation of the current one with the given parameter as `parentNamespace:childNamespace`.
`options` is an Object, the key `isKittenLogger` can be set to follow logs through a chain of actions.


### Terminal formatters

When displaying logs in terminal, formatters can be applied by namespaces.

#### `kittenLogger.addFormatter({String} namespace, {Function} formatterFn)`

Variable        | Description
----------------|------------
`namespace`     | Namespace of a logger to format.
`formatterFn`   | Function to format message before logging in terminal.

**Example**
```js
const kittenLogger = require('kitten-logger');

let logger = kittenLogger.createLogger('http');

kittenLogger.addFormatter('http', msg => {
  return msg.method + ' ' + msg.url;
});

...

// Logger, log the `req` object of an HTTP request
logger.log({ method : req.method, url : req.url });
```

#### `kittenLogger.formattersCollection -> Object`

Return a list of predefined formatters (`/lib`):
  - `http_start`, log HTTP request
  - `http_end`, log HTTP request's result

### Filter

Kitten-logger allows you to filter namespaces & levels at runtime.

### Static

Define the variable `KITTEN_LOGGER`.

```js
process.env.KITTEN_LOGGER = 'onlyMyNamespace';
```

Define the variable `KITTEN_LOGGER_LEVEL`.

```js
process.env.KITTEN_LOGGER_LEVEL = 'INFO';
```

### Programatic

`kittenLogger.filter({String} filter)`

```js
kittenLogger.filter('onlyMyNamespace');
```

`kittenLogger.filterLevel({String} level)`

```js
kittenLogger.filterLevel('INFO');
```

### Receive actions from outside the process

kitten-logger is allow to communicate between its pairs if exist in sub dependencies via socket.

To send action to kittenLogger instances, a process must connect to the given path, ex: `/tmp/kitten_logger_<inode>`.
Where `<inode>` is the file descriptor's value of the master process.

The message must be of JSON type aand follow the given format :

```json
{
  action : <ACTION>,
  value  : <value>
}
```
Where `<ACTION>` is a string, and `<value>` is the value for the action.

Actions       | Description
--------------|------------
`FILTER`      | Call the mehod `kittenLogger.filter` for the clients connected to the socket server.
`FILTER_LEVEL`| Call the mehod `kittenLogger.filterLevel` for the clients connected to the socket server.

#### `kittenLogger.listen()`

Start a socket server. It must be run once in the master process.

#### `kittenLogger.connect()`

Connect to the socket server. It must be run once in the child process. If will attemp to connect to the socket server for 20 seconds.
