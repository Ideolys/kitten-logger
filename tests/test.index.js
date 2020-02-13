const should = require('should');
const index  = require('../index');

describe('index', () => {

  it('should define public properties', () => {
    should(index.addFormatter).be.a.Function();
    should(index.createLogger).be.a.Function();
    should(index.createPersitentLogger).be.a.Function();
    should(index.init).be.a.Function();
  });

});
