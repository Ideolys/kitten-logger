const should = require('should');
const index  = require('../index');

describe('index', () => {

  it('should define public properties', () => {
    should(index.addFormatter).be.a.Function();
    should(index.createLogger).be.a.Function();
    should(index.createPersistentLogger).be.a.Function();
    should(index.init).be.a.Function();
    should(index.filter).be.a.Function();
    should(index.listen).be.a.Function();
    should(index.connect).be.a.Function();
    should(index.sendAction).be.a.Function();
    should(index.formattersCollection).be.an.Object();
  });

  describe('environnement variable : DEBUG_HIDE_DATE', () => {
    it('should be get true when env variable not set' , () => {
      delete require.cache[require.resolve('../index')];
      delete process.env.DEBUG_HIDE_DATE;
      const index  = require('../index');
      should(process.env.DEBUG_HIDE_DATE).of.be.equal('true');
    })
  
    it('should be get the right value from env variable' , () => {
      delete require.cache[require.resolve('../index')];
      process.env.DEBUG_HIDE_DATE = false;
      const index  = require('../index');
      should(process.env.DEBUG_HIDE_DATE).of.be.equal('false');
    })
  });

  describe('environnement variable : DEBUG_COLORS', () => {
    it('should be get 0 when env variable not set' , () => {
      delete require.cache[require.resolve('../index')];
      delete process.env.DEBUG_COLORS;
      const index  = require('../index');
      should(process.env.DEBUG_COLORS).of.be.equal('0');
    })
  
    it('should be get the right value from env variable' , () => {
      delete require.cache[require.resolve('../index')];
      process.env.DEBUG_COLORS = 2;
      const index  = require('../index');
      should(process.env.DEBUG_COLORS).of.be.equal('2');
    })
  });

  describe('environnement variable : KITTEN_LOGGER', ()=> {
    it('should be get * when env variable not set' , () => {
      delete require.cache[require.resolve('../index')];
      delete process.env.KITTEN_LOGGER;
      delete process.env.DEBUG;
      const index  = require('../index');
      should(process.env.KITTEN_LOGGER).of.be.equal('*');
    })
  
    it('should be get the right value from env variable KITTEN_LOGGER' , () => {
      delete require.cache[require.resolve('../index')];
      process.env.KITTEN_LOGGER = 'my namespace';
      delete process.env.DEBUG;
      const index  = require('../index');
      should(process.env.KITTEN_LOGGER).of.be.equal('my namespace');
    })
  
    it('should be get the right value from env variable DEBUG' , () => {
      delete require.cache[require.resolve('../index')];
      delete process.env.KITTEN_LOGGER;
      process.env.DEBUG = 'my short namespace';
      const index  = require('../index');
      should(process.env.KITTEN_LOGGER).of.be.equal('my short namespace');
    })
  
    it('should be get the right value from env variable KITTEN_LOGGER when DEBUG is set' , () => {
      delete require.cache[require.resolve('../index')];
      process.env.KITTEN_LOGGER = 'my namespace';
      process.env.DEBUG = 'my short namespace';
      const index  = require('../index');
      should(process.env.KITTEN_LOGGER).of.be.equal('my namespace');
    })
  });

  describe('environnement variable : KITTEN_LOGGER_LEVEL', () => {
    it('should be get INFO when env variable not set' , () => {
      delete require.cache[require.resolve('../index')];
      delete process.env.KITTEN_LOGGER_LEVEL;
      const index  = require('../index');
      should(process.env.KITTEN_LOGGER_LEVEL).of.be.equal('INFO');
    })
  
    it('should be get the right value from env variable' , () => {
      delete require.cache[require.resolve('../index')];
      process.env.KITTEN_LOGGER_LEVEL = 'DEBUG';
      const index  = require('../index');
      should(process.env.KITTEN_LOGGER_LEVEL).of.be.equal('DEBUG');
    })
  });
});
