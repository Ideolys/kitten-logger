const should = require('should');
const logger = require('../src/logger');
const filter = require('../src/filter');
const assert = require('assert');

const diagnosticsChannel = require('diagnostics_channel');

const {
  DIAGNOSTIC_CHANNEL_NAME,
  DIAGNOSTIC_SEVERITY
} = require('../src/utils');

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
      let _logger1 = logger.persistentLogger('test');

      process.env.KITTEN_LOGGER = 'somethingelse';
      filter.filter();
      logger.enable();

      should(_logger1.isEnabled).eql(false);
      should(_logger1.debug.name).eql('disabled');
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

  describe('publishDiagnostic', () => {

    it('should publish a diagnostic INFO', done => {
      function onDiagnostic (message)  {
        assert.equal(message.severity, DIAGNOSTIC_SEVERITY.INFO);
        assert.equal(message.properties.pid, process.pid);
        assert.equal(message.properties.namespace, 'test');
        assert.equal(message.properties.id, undefined);
        assert.equal(/test/.test(message.message), true);
        diagnosticsChannel.unsubscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);
        done();
      }

      diagnosticsChannel.subscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);

      let _logger = logger.persistentLogger('test');
      _logger.info('test');
    });

    it('should publish a diagnostic : DEBUG', done => {
      function onDiagnostic (message)  {
        assert.equal(message.severity, DIAGNOSTIC_SEVERITY.DEBUG);
        assert.equal(message.properties.pid, process.pid);
        assert.equal(message.properties.namespace, 'test');
        assert.equal(message.properties.id, undefined);
        assert.equal(/test/.test(message.message), true);
        diagnosticsChannel.unsubscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);
        done();
      }

      diagnosticsChannel.subscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);

      let _logger = logger.persistentLogger('test');
      _logger.debug('test');
    });

    it('should publish a diagnostic : WARN', done => {
      function onDiagnostic (message)  {
        assert.equal(message.severity, DIAGNOSTIC_SEVERITY.WARN);
        assert.equal(message.properties.pid, process.pid);
        assert.equal(message.properties.namespace, 'test');
        assert.equal(message.properties.id, undefined);
        assert.equal(/test/.test(message.message), true);
        diagnosticsChannel.unsubscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);
        done();
      }

      diagnosticsChannel.subscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);

      let _logger = logger.persistentLogger('test');
      _logger.warn('test');
    });

    it('should publish a diagnostic : ERROR', done => {
      function onDiagnostic (message)  {
        assert.equal(message.severity, DIAGNOSTIC_SEVERITY.ERROR);
        assert.equal(message.properties.pid, process.pid);
        assert.equal(message.properties.namespace, 'test');
        assert.equal(message.properties.id, undefined);
        assert.equal(/test/.test(message.message), true);
        diagnosticsChannel.unsubscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);
        done();
      }

      diagnosticsChannel.subscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);

      let _logger = logger.persistentLogger('test');
      _logger.error('test');
    });

    it('should publish a diagnostic with log id', done => {
      function onDiagnostic (message)  {
        assert.equal(message.severity, DIAGNOSTIC_SEVERITY.INFO);
        assert.equal(message.properties.pid, process.pid);
        assert.equal(message.properties.namespace, 'test');
        assert.equal(message.properties.id, 1);
        assert.equal(/test/.test(message.message), true);
        diagnosticsChannel.unsubscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);
        done();
      }

      diagnosticsChannel.subscribe(DIAGNOSTIC_CHANNEL_NAME, onDiagnostic);

      let _logger = logger.persistentLogger('test');
      _logger.info('test', { idKittenLogger : 1 });
    });

  });

});
