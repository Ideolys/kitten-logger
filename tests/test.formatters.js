const should 		           = require('should');
const formatters           = require('../src/formatters');
const formattersCollection = require('../lib/formatters');
const COLORS               = require('../colors')

const TIMESTAMP_REGEX = /((((19|20)([2468][048]|[13579][26]|0[48])|2000)-02-29|((19|20)[0-9]{2}-(0[4678]|1[02])-(0[1-9]|[12][0-9]|30)|(19|20)[0-9]{2}-(0[1359]|11)-(0[1-9]|[12][0-9]|3[01])|(19|20)[0-9]{2}-02-(0[1-9]|1[0-9]|2[0-8])))\s([01][0-9]|2[0-3]):([012345][0-9]):([012345][0-9]))/;

describe('Formatters', () => {

	it('should define two format fns', () => {
		should(formatters.format).be.a.Function();
		should(formatters.formatTTY).be.a.Function();
	});

	describe('format', () => {
		it('should not crash if message is null', () => {
			should.doesNotThrow(() => {
				formatters.format('DEBUG', 'test', 1, null);
			});
		});

		it('should not crash if message is undefined', () => {
			should.doesNotThrow(() => {
				formatters.format('DEBUG', 'test', 1);
			});
		});

		it('should not crash if message is false', () => {
			should.doesNotThrow(() => {
				formatters.format('DEBUG', 'test', false);
			});
		});

		it('should not crash if message is an object', () => {
			should.doesNotThrow(() => {
				formatters.format('DEBUG', 'test', {});
			});
		});

		it('should separate fields by \t ', () => {
			let msg = formatters.format('DEBUG', 'test', 1, ['Hello world!']);
			should(msg.split('\t').length).above(1);
		});

		it('sould define a timestamp field', () => {
			let msg = formatters.format('DEBUG', 'test', 1, ['Hello world!']);
			let fields = msg.split('\t');
			should(fields.length).above(1);
			should(TIMESTAMP_REGEX.test(fields[0])).eql(true);
		});

		it('should define idKittenLogger', () => {
			let msg = formatters.format('DEBUG', 'test', 1268, ['Hello world!', { idKittenLogger : 7654 }]);
			let fields = msg.split('\t');
			should(fields.length).eql(6);
			should(fields[3]).eql('\'Hello world!\'');
			should(/7654/.test(fields[5])).eql(true);
			should(/\n$/.test(fields[5])).eql(true);
		});

		it('should handle mutlitple arguments with JSON', () => {
			let msg = formatters.format('DEBUG', 'test', 1268, ['Hello world!', { id : 2, label : 'A' }, { idKittenLogger : 7654 }]);
			let fields = msg.split('\t');
			should(fields.length).eql(6);
			should(fields[3]).eql('\'Hello world! ' + JSON.stringify({ id : 2, label : 'A' }, null, 2).replace(/\n/g, '') + '\'');
			should(fields[5]).eql('7654\n');
		});

	});

	describe('formattTTY', () => {
		it('should not crash if message is null', () => {
			should.doesNotThrow(() => {
				formatters.formatTTY('DEBUG', 'test', 1, null);
			});
		});

		it('should not crash if message is undefined', () => {
			should.doesNotThrow(() => {
				formatters.formatTTY('DEBUG', 'test', 1);
			});
		});

		it('should not crash if message is false', () => {
			should.doesNotThrow(() => {
				formatters.formatTTY('DEBUG', 'test', false);
			});
		});

		it('should not crash if message is an object', () => {
			should.doesNotThrow(() => {
				formatters.formatTTY('DEBUG', 'test', {});
			});
		});

		it('should define 7 fields', () => {
			let msg = formatters.formatTTY('DEBUG', 'test', 1268, ['Hello world!']);
			let fields = msg.split('\t');
			should(fields.length).eql(6);
			should(TIMESTAMP_REGEX.test(fields[0])).eql(true);
			should(/DEBUG/.test(fields[1])).eql(true);
			should(/test/.test(fields[2])).eql(true);
			should(fields[3]).eql('Hello world!');
			should(/1268/.test(fields[4])).eql(true);
			should(fields[5]).eql('\n');
		});

		it('should define 7 fields with multiple string args', () => {
			let msg = formatters.formatTTY('DEBUG', 'test', 1268, ['Hello world!', '0000']);
			let fields = msg.split('\t');
			should(fields.length).eql(6);
			should(TIMESTAMP_REGEX.test(fields[0])).eql(true);
			should(/DEBUG/.test(fields[1])).eql(true);
			should(/test/.test(fields[2])).eql(true);
			should(fields[3]).eql('Hello world! 0000');
			should(/1268/.test(fields[4])).eql(true);
			should(fields[5]).eql('\n');
		});

		it('should define 7 fields with multiple args String & JSON', () => {
			let msg = formatters.formatTTY('DEBUG', 'test', 1268, [{ id : 2, label : 'A' }, '0000']);
			let fields = msg.split('\t');
			should(fields.length).eql(6);
			should(TIMESTAMP_REGEX.test(fields[0])).eql(true);
			should(/DEBUG/.test(fields[1])).eql(true);
			should(/test/.test(fields[2])).eql(true);
			should(fields[3]).eql(JSON.stringify({ id : 2, label : 'A' }, null, 2) + ' 0000');
			should(/1268/.test(fields[4])).eql(true);
			should(fields[5]).eql('\n');
		});

		it('should define 7 fields with multiple args String & JSON AND kitten options', () => {
			let msg = formatters.formatTTY('DEBUG', 'test', 1268, [{ id : 2, label : 'A' }, '0000', { idKittenLogger : 1234 }]);
			let fields = msg.split('\t');
			should(fields.length).eql(6);
			should(TIMESTAMP_REGEX.test(fields[0])).eql(true);
			should(/DEBUG/.test(fields[1])).eql(true);
			should(/test/.test(fields[2])).eql(true);
			should(fields[3]).eql(JSON.stringify({ id : 2, label : 'A' }, null, 2) + ' 0000');
			should(/1268/.test(fields[4])).eql(true);
			should(fields[5]).eql(COLORS.DIM + '1234' + COLORS.OFF + '\n');
		});
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
