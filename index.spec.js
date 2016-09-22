'use strict'

/* eslint-env mocha */

// ===================================================================

var humanFormat = require('./')

// -------------------------------------------------------------------

var expect = require('chai').expect

// ===================================================================

var data = [
  [1e-25, '0.1 y', { value: 0.1, prefix: 'y' }],
  [1e-3, '1 m', { value: 1, prefix: 'm' }],
  [0, '0', { value: 0, prefix: '' }],
  [1, '1', { value: 1, prefix: '' }],
  [10, '10', { value: 10, prefix: '' }],
  [1e12, '1 T', { value: 1, prefix: 'T' }],
  [1e28, '10000 Y', { value: 10000, prefix: 'Y' }]
]

function compareRaw (actual, expected) {
  expect(actual).to.be.an('object')
  expect(actual.value).to.be.closeTo(expected.value, 1e-3)
  expect(actual.prefix).to.equal(expected.prefix)
  expect(actual.unit).to.equal(expected.unit)
}

// ===================================================================

describe('humanFormat()', function () {
  it('returns throws for an invalid number', function () {
    ;[
      undefined,
      null,
      NaN,
      true,
      false,
      'a string',
      [],
      {}
    ].forEach(function (value) {
      expect(function () {
        humanFormat(value)
      }).to['throw'](TypeError)
    })
  })

  it('should convert number to human readable string', function () {
    data.forEach(function (datum) {
      expect(humanFormat(datum[0])).to.equal(datum[1])
      compareRaw(humanFormat.raw(datum[0]), datum[2])
    })
  })

  it('can use custom units', function () {
    expect(humanFormat(0, { unit: 'g' })).to.equal('0 g')
  })

  it('can use custom separators', function () {
    expect(humanFormat(1337, {separator: ' - '})).to.equal('1.34 - k')
  })

  it('can use custom scale', function () {
    var scale = humanFormat.Scale.create(
      ',ki,Mi,Gi'.split(','),
      1024,
      0
    )
    expect(humanFormat(102400, { scale: scale })).to.equal('100 ki')
    compareRaw(humanFormat.raw(102400, { scale: scale }), {
      value: 100,
      prefix: 'ki'
    })
  })

  it('can force a prefix', function () {
    expect(humanFormat(100, { unit: 'm', prefix: 'k' })).to.equal('0.1 km')
    compareRaw(humanFormat.raw(100, { unit: 'm', prefix: 'k' }), {
      value: 0.1,
      prefix: 'k'
    })
  })

  context('with decimalDigits opts', function () {
    it('should return decimal digit as given', function () {
      expect(humanFormat(2358, { decimals: 1, prefix: 'k' })).to.equal('2.4 k')
    })
  })
})

describe('humanFormat.parse()', function () {
  var parse = humanFormat.parse

  it('should convert human readable string to number', function () {
    data.forEach(function (datum) {
      expect(parse(datum[1])).to.be.closeTo(datum[0], datum[0] * 1e-3)
    // compareRaw(parse.raw(datum[1]), datum[2])
    })
  })

  it('handle as gracefully as possible incorrect case', function () {
    expect(parse('1g')).to.be.equal(1e9)
  })
})
