const should       = require('should');
const kittenLogger = require('../index');
const fs           = require('fs');
const pino         = require('pino');

const utils = require('../src/utils');
const dest  = require('../src/destination');

let writeStream         = fs.createWriteStream('/dev/null');
let nbIterationsAverage = 10;
let nbIterations        = 10000;

describe('benchmarks', () => {

  describe('Persistent logger', () => {
    let persistentLogger = kittenLogger.createPersistentLogger('test');

    it.skip('pino.info("hello world") should be slower than persistentLogger.info("hello world")', () => {
      redirectOn();
      let loggerPino   = pino({ timestamp : utils.getTime });
      let durationPino = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          loggerPino.info('hello world');
        }
      });
      durationKitten = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.info('hello world');
        }
      });
      should(durationKitten).lessThan(durationPino);
    });

    it('persistentLogger.info("hello world")', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.info('hello world');
        }
      });
      should(duration).lessThan(50);
    });

    it('persistentLogger.info({ hello : "world" })', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.info({ hello : 'world' });
        }
      });
      should(duration).lessThan(50);
    });

    it('persistentLogger.debug("hello world")', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.debug('hello world');
        }
      });
      should(duration).lessThan(50);
    });

    it('persistentLogger.debug({ hello : "world" })', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.debug({ hello : 'world' });
        }
      });
      should(duration).lessThan(50);
    });

    it('persistentLogger.error("hello world")', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.error('hello world');
        }
      });
      should(duration).lessThan(50);
    });

    it('persistentLogger.error({ hello : "world" })', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.error({ hello : 'world' });
        }
      });
      should(duration).lessThan(50);
    });

    it('persistentLogger.warn("hello world")', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.warn('hello world');
        }
      });
      should(duration).lessThan(50);
    });

    it('persistentLogger.warn({ hello : "world" })', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          persistentLogger.warn({ hello : 'world' });
        }
      });
      should(duration).lessThan(50);
    });
  });

  describe('Logger', () => {
    let logger = kittenLogger.createLogger('test-logger');

    it('logger.info("hello world")', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          logger.info('hello world');
        }
      });
      should(duration).lessThan(50);
    });

    it('logger.info({ hello : "world" })', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          logger.info({ hello : 'world' });
        }
      });
      should(duration).lessThan(50);
    });

    it('logger.debug("hello world")', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          logger.debug('hello world');
        }
      });
      should(duration).lessThan(50);
    });

    it('logger.debug({ hello : "world" })', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          logger.debug({ hello : 'world' });
        }
      });
      should(duration).lessThan(50);
    });

    it('logger.error("hello world")', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          logger.error('hello world');
        }
      });
      should(duration).lessThan(50);
    });

    it('logger.error({ hello : "world" })', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          logger.error({ hello : 'world' });
        }
      });
      should(duration).lessThan(50);
    });

    it('logger.warn("hello world")', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          logger.warn('hello world');
        }
      });
      should(duration).lessThan(50);
    });

    it('logger.warn({ hello : "world" })', () => {
      let duration = average(nbIterationsAverage, () => {
        for (let i = 0; i < nbIterations; i++) {
          logger.warn({ hello : 'world' });
        }
      });
      should(duration).lessThan(50);
    });
  });

});

function average (nbIterations, benchFn) {
  let global = 0;
  redirectOn();
  for (var i = 0; i < nbIterations; i++) {
    let start = process.hrtime();
    benchFn();
    global += getDurationInMS(start);
  }
  redirectOff();

  return global / nbIterations;
}

function redirectOn () {
  dest._setDestination(writeStream.write.bind(writeStream));
}

function redirectOff () {
  dest._setDestination(dest.originalWrite);
}

/**
 * Return duration in micro second when using process.hrtime
 * @param  {Array} time   Array coming from process.hrtime
 * @return {Integer}      Duration in microseconds
 */
function getDurationInMS (time) {
  var _interval = process.hrtime(time);
  return (_interval[0] * 1e6 + parseInt(_interval[1] / 1e3, 10)) / 1e3;
}
