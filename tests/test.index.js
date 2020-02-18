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

});
