## v0.1.20
  - Do not truncate logs.

## v0.1.19
  - Fix logs format for master process.

## v0.1.18
  - Logs from sub kitten-logger instances were not correctly formatted.

### v0.1.17
 - Fix LOG_RETENTION value in scheduler.

### v0.1.16
  - Fix: ensure that `KITTEN_LOGGER_RETENTION_DAYS` is not a NaN.

### v0.1.15
  - Fix: parse env variable `KITTEN_LOGGER_RETENTION_DAYS`

### v0.1.14
  - Fix: Listen to error event for writable stream.
  - Fix: When rotating, check if current writable stream is closed.

### v0.1.13
  - Do not pipe stderr to stdout.

### v0.1.12
  - Refacto stdout and sterr capture.

### v0.1.11
  - Fix large output issues

### v0.1.10
  - Fix crash without TTY
