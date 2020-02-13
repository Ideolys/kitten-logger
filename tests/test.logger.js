const should = require('should');
const logger = require('../src/logger');

describe('logger', () => {

  beforeEach(() =>  {
    delete logger.loggers['test'];
  });

  describe('persistentLogger', () => {

    it('should return a function', () => {
      should(logger.persistentLogger('test')).be.a.Function();
    });

    it('should define functions for log types', () => {
      let _logger = logger.persistentLogger('test');
      should(_logger.info).be.a.Function();
      should(_logger.warn).be.a.Function();
      should(_logger.error).be.a.Function();
      should(_logger.isEnabled).eql(true);
    });

    it('should add logger to saved loggers', () => {
      logger.persistentLogger('test');
      should(logger.loggers['test']).be.a.Function();
    });

    it('should be a singleton', () => {
      let _logger1 = logger.persistentLogger('test');
      let _logger2 = logger.persistentLogger('test');
      should(_logger1).eql(_logger2);
    });
  });

  describe('non persistent logger', () => {

    it('should return a function', () => {
      should(logger.logger('test')).be.a.Function();
    });

    it('should define functions for log types', () => {
      let _logger = logger.logger('test');
      should(_logger.info).be.a.Function();
      should(_logger.warn).be.a.Function();
      should(_logger.error).be.a.Function();
      should(_logger.isEnabled).eql(undefined);
    });

    it('should have not added logger to saved loggers', () => {
      logger.logger('test');
      should(logger.loggers['test']).eql(undefined);
    });

  });

});
