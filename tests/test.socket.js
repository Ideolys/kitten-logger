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

});
