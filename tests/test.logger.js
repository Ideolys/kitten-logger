const should = require('should');
const logger = require('../src/logger');
const filter = require('../src/filter');

describe('logger', () => {

  beforeEach(() =>  {
    process.env.KITTEN_LOGGER       = '*';
    process.env.KITTEN_LOGGER_LEVEL = 'DEBUG';
    filter.filter();
    delete logger.loggers['test'];
  });

  describe('persistentLogger', () => {

    it('should return an Object', () => {
      should(logger.persistentLogger('test')).be.an.Object();
    });

    it('should define functions for log types', () => {
      let _logger = logger.persistentLogger('test');
      should(_logger.info).be.a.Function();
      should(_logger.warn).be.a.Function();
      should(_logger.error).be.a.Function();
      should(_logger.debug).be.a.Function();
      should(_logger.extend).be.a.Function();
      should(_logger.isEnabled).eql(true);

      should(_logger.info.name).not.eql('disabeld');
      should(_logger.warn.name).not.eql('disabeld');
      should(_logger.error.name).not.eql('disabeld');
      should(_logger.debug.name).not.eql('disabeld');
    });

    it('should add logger to saved loggers', () => {
      logger.persistentLogger('test');
      should(logger.loggers['test']).be.an.Object();
    });

    it('should be a singleton', () => {
      let _logger1 = logger.persistentLogger('test');
      let _logger2 = logger.persistentLogger('test');
      should(_logger1).eql(_logger2);
    });

    it('should be disabled', () => {
      process.env.KITTEN_LOGGER = 'somethingelse';
      filter.filter();

      let _logger1 = logger.persistentLogger('test');
      should(_logger1.isEnabled).eql(false);
    });

    it('should extend the logger', () => {
      let _logger = logger.persistentLogger('test');
      let _child  = _logger.extend('child');
      should(logger.loggers['test:child']).be.an.Object();
    });

    it('should disable DEBUG & INFO functions', () => {
      process.env.KITTEN_LOGGER_LEVEL = 'WARN';

      let _logger1 = logger.persistentLogger('test');
      should(_logger1.debug.name).eql('disabled');
      should(_logger1.info.name).eql('disabled');
    });

    it('should disable DEBUG & INFO functions after creation', () => {
      let _logger1 = logger.persistentLogger('test');
      process.env.KITTEN_LOGGER_LEVEL = 'WARN';
      logger.enableLevels();
      should(_logger1.debug.name).eql('disabled');
      should(_logger1.info.name).eql('disabled');
    });
  });

  describe('non persistent logger', () => {

    it('should return an Object', () => {
      should(logger.logger('test')).be.an.Object();
    });

    it('should define functions for log types', () => {
      let _logger = logger.logger('test');
      should(_logger.info).be.a.Function();
      should(_logger.warn).be.a.Function();
      should(_logger.error).be.a.Function();
      should(_logger.debug).be.a.Function();
      should(_logger.extend).be.a.Function();
      should(_logger.isEnabled).eql(true);

      should(_logger.info.name).not.eql('disabeld');
      should(_logger.warn.name).not.eql('disabeld');
      should(_logger.error.name).not.eql('disabeld');
      should(_logger.debug.name).not.eql('disabeld');
    });

    it('should have not added logger to saved loggers', () => {
      logger.logger('test');
      should(logger.loggers['test']).eql(undefined);
    });

    it('should be disabled', () => {
      process.env.KITTEN_LOGGER = 'somethingelse';
      filter.filter();

      let _logger1 = logger.logger('test');
      should(_logger1.isEnabled).eql(false);
    });

    it('should disable DEBUG & INFO functions', () => {
      process.env.KITTEN_LOGGER_LEVEL = 'WARN';

      let _logger1 = logger.logger('test');
      should(_logger1.debug.name).eql('disabled');
      should(_logger1.info.name).eql('disabled');
    });

    it('should not disable DEBUG & INFO functions after creation', () => {
      let _logger1 = logger.logger('test');
      process.env.KITTEN_LOGGER_LEVEL = 'WARN';
      logger.enableLevels();
      should(_logger1.debug.name).not.eql('disabled');
      should(_logger1.info.name).not.eql('disabled');
    });

  });

});
