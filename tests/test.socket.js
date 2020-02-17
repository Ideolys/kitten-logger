const should = require('should');
const socket = require('../src/socket');
const logger = require('../src/logger');
const filter = require('../src/filter');

describe('socket', () => {

  beforeEach(() => {
    process.env.KITTEN_LOGGER = '*';
    filter.filter();
  });

  it('should run a socket server', done => {
    socket.listen(c => {
      c.close();
      done();
    });
  });

  it('should connect to a socket server', done => {
    socket.listen(c => {
      socket.connect(client => {
        client.destroy();
        c.close();
        done();
      });
    });
  });

  it('should receive filter action', done => {
    should(process.env.KITTEN_LOGGER).eql('*');

    socket.listen(c => {
      socket.connect(client => {
        socket.connect(client2 => {
          socket.send({ action : 'FILTER', value : 'http:*' });

          setTimeout(() => {
            should(process.env.KITTEN_LOGGER).eql('http:*');
            client2.destroy();
            client.destroy();
            c.close();
            done();
          }, 200);
        });
      });
    });
  });

  it('should disable persistent logger', done => {
    let _logger = logger.persistentLogger('sql');
    should(_logger.isEnabled).eql(true);

    socket.listen(c => {
      socket.connect(client => {
        socket.connect(client2 => {
          socket.send({ action : 'FILTER', value : 'http' });

          setTimeout(() => {
            should(_logger.isEnabled).eql(false);
            client2.destroy();
            client.destroy();
            c.close();
            done();
          }, 200);
        });
      });
    });
  });

  it('should enable persistent logger', done => {
    process.env.KITTEN_LOGGER = 'http';
    filter.filter();
    let _logger = logger.persistentLogger('sql');
    should(_logger.isEnabled).eql(false);

    socket.listen(c => {
      socket.connect(client => {
        socket.connect(client2 => {
          socket.send({ action : 'FILTER', value : 'sql' });

          setTimeout(() => {
            should(_logger.isEnabled).eql(true);
            client2.destroy();
            client.destroy();
            c.close();
            done();
          }, 200);
        });
      });
    });
  });

  it('should not disable logger', done => {
    let _logger = logger.logger('sql');
    should(_logger.isEnabled).eql(true);

    socket.listen(c => {
      socket.connect(client => {
        socket.connect(client2 => {
          socket.send({ action : 'FILTER', value : 'http' });

          setTimeout(() => {
            should(_logger.isEnabled).eql(true);
            client2.destroy();
            client.destroy();
            c.close();
            done();
          }, 200);
        });
      });
    });
  });

  it('should receive filter_level action', done => {
    should(process.env.KITTEN_LOGGER).eql('*');

    socket.listen(c => {
      socket.connect(client => {
        socket.connect(client2 => {
          socket.send({ action : 'FILTER_LEVEL', value : 'ERROR' });

          setTimeout(() => {
            should(process.env.KITTEN_LOGGER_LEVEL).eql('ERROR');
            client2.destroy();
            client.destroy();
            c.close();
            done();
          }, 200);
        });
      });
    });
  });

  it('should disable DEBUG & INFO functions', done => {
    let _logger = logger.persistentLogger('sql');

    socket.listen(c => {
      socket.connect(client => {
        socket.connect(client2 => {
          socket.send({ action : 'FILTER_LEVEL', value : 'WARN' });

          setTimeout(() => {
            should(_logger.debug.name).eql('disabled');
            should(_logger.info.name).eql('disabled');
            client2.destroy();
            client.destroy();
            c.close();
            done();
          }, 200);
        });
      });
    });
  });

  it('should disable DEBUG functions', done => {
    process.env.KITTEN_LOGGER_LEVEL = 'INFO'
    let _logger = logger.persistentLogger('sql');
    should(_logger.debug.name).eql('disabled');

    socket.listen(c => {
      socket.connect(client => {
        socket.connect(client2 => {
          socket.send({ action : 'FILTER_LEVEL', value : 'DEBUG' });

          setTimeout(() => {
            should(_logger.debug.name).not.eql('disabled');
            client2.destroy();
            client.destroy();
            c.close();
            done();
          }, 200);
        });
      });
    });
  });

  it('should not disable DEBUG functions for non persistent logger', done => {
    let _logger = logger.logger('sql');
    should(_logger.debug.name).not.eql('disabled');

    socket.listen(c => {
      socket.connect(client => {
        socket.connect(client2 => {
          socket.send({ action : 'FILTER_LEVEL', value : 'INFO' });

          setTimeout(() => {
            should(_logger.debug.name).not.eql('disabled');
            client2.destroy();
            client.destroy();
            c.close();
            done();
          }, 200);
        });
      });
    });
  });

});
