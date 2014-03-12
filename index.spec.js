'use strict';

//====================================================================

var humanFormat = require('./');

//--------------------------------------------------------------------

var expect = require('chai').expect;

//====================================================================

var data = [
	[1e-25, '0.1yB'],
	[1e-3, '1mB'],
	[0, '0B'],
	[10, '10B'],
	[1e12, '1TB'],
	[1e28, '10000YB'],
];

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
		});
	});

	it('should convert number to human readable string', function () {
		data.forEach(function (datum) {
			expect(humanFormat(datum[0])).to.equal(datum[1]);
		});
	});

	it('can use custom units', function () {
		expect(humanFormat(0, { unit: 'g' })).to.equal('0g');
	});

	it('can use custom prefixes', function () {
		var prefixes = humanFormat.makePrefixes(
			',ki,Mi,Gi'.split(','),
			1024,
			0
		);
		expect(humanFormat(102400, { prefixes: prefixes })).to.equal('100kiB');
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
