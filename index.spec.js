'use strict';

//====================================================================

var humanFormat = require('./');

//--------------------------------------------------------------------

var expect = require('chai').expect;

//====================================================================

var data = [
	[1e-25, '0.1yB', { num: 0.1, prefix: 'y', unit: 'B' }],
	[1e-3, '1mB', { num: 1, prefix: 'm', unit: 'B' }],
	[0, '0B', { num: 0, prefix: '', unit: 'B' }],
	[1, '1B', { num: 1, prefix: '', unit: 'B' }],
	[10, '10B', { num: 10, prefix: '', unit: 'B' }],
	[1e12, '1TB', { num: 1, prefix: 'T', unit: 'B' }],
	[1e28, '10000YB', { num: 10000, prefix: 'Y', unit: 'B' }],
];

function compareRaw(actual, expected) {
	expect(actual).to.be.an('object');
	expect(actual.num).to.be.closeTo(expected.num, 1e-3);
	expect(actual.prefix).to.equal(expected.prefix);
	expect(actual.unit).to.equal(expected.unit);
}

//====================================================================

describe('humanFormat()', function () {
	it('returns 0 for an invalid number', function () {
		// Note: `true` and `false` can be converted to number.
		[
			undefined,
			null,
			NaN,
			'a string',
			[],
			{},
		].forEach(function (value) {
			expect(humanFormat(value)).to.equal('0B');

			compareRaw(humanFormat.raw(value), {
				num: 0,
				prefix: '',
				unit: 'B',
			});
		});
	});

	it('should convert number to human readable string', function () {
		data.forEach(function (datum) {
			expect(humanFormat(datum[0])).to.equal(datum[1]);
			compareRaw(humanFormat.raw(datum[0]), datum[2]);
		});
	});

	it('can use custom units', function () {
		expect(humanFormat(0, { unit: 'g' })).to.equal('0g');
		compareRaw(humanFormat.raw(0, { unit: 'g' }), {
			num: 0,
			prefix: '',
			unit: 'g',
		});
	});

	it('can use custom prefixes', function () {
		var prefixes = humanFormat.makePrefixes(
			',ki,Mi,Gi'.split(','),
			1024,
			0
		);
		expect(humanFormat(102400, { prefixes: prefixes })).to.equal('100kiB');
		compareRaw(humanFormat.raw(102400, { prefixes: prefixes }), {
			num: 100,
			prefix: 'ki',
			unit: 'B',
		});
	});

	it('can force a prefix', function () {
		expect(humanFormat(100, { unit: 'm', prefix: 'k' })).to.equal('0.1km');
		compareRaw(humanFormat.raw(100, { unit: 'm', prefix: 'k' }), {
			num: 0.1,
			prefix: 'k',
			unit: 'm',
		});
	});


});

describe('humanFormat.parse()', function () {
	var parse = humanFormat.parse;

	it('should convert human readable string to number', function () {
		data.forEach(function (datum) {
			expect(parse(datum[1])).to.be.closeTo(datum[0], datum[0] * 1e-3);
		});
	});
});
