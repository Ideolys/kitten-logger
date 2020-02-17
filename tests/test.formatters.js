const should 		           = require('should');
const formatters           = require('../src/formatters');
const formattersCollection = require('../lib/formatters');

describe('Formatters', () => {

	it('should separate fields by \t', () => {
		let msg = formatters.format('DEBUG', 'test', 1, 'Hello world!');
		should(msg.split('\t').length).above(1);
	});

	it('should define 7 fields', () => {
		let msg = formatters.format('DEBUG', 'test', 1268, 'Hello world!');
		let fields = msg.split('\t');
		should(fields.length).eql(6);
		should(/[0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}/.test(fields[0])).eql(true);
		should(/DEBUG/.test(fields[1])).eql(true);
		should(/test/.test(fields[2])).eql(true);
		should(fields[3]).eql('Hello world!');
		should(/1268/.test(fields[4])).eql(true);
		should(fields[5]).eql('\n');
	});

	it('should define idKittenLogger', () => {
		let msg = formatters.format('DEBUG', 'test', 1268, 'Hello world!', { idKittenLogger : 7654 });
		let fields = msg.split('\t');
		should(fields.length).eql(6);
		should(/7654/.test(fields[5])).eql(true);
		should(/\n$/.test(fields[5])).eql(true);
	});

	it('should define KITTEN_LOG if preventFormatAgain = true', () => {
		let msg = formatters.format('DEBUG', 'test', 1268, 'Hello world!', null, true);
		let fields = msg.split('\t');
		should(fields.length).eql(6);
		should(/^KITTEN_LOG/.test(fields[0])).eql(true);
	});

	describe('library', () => {

		it('should define formatters', () => {
			should(formattersCollection).be.an.Object();
		});

		it('should define http_end formatter', () => {
			should(formattersCollection.http_end).be.a.Function();
		});

		it('should define http_start formatter', () => {
			should(formattersCollection.http_start).be.a.Function();
		});

	});

});
