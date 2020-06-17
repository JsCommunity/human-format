'use strict'

/* eslint-env jest */

// ===================================================================

var humanFormat = require('./')

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
data.forEach(function (datum) {
  var num = datum[0]
  if (num !== 0) {
    var raw = datum[2]
    data.push([-num, '-' + datum[1], { __proto__: raw, value: -raw.value }])
  }
})

function compareRaw (actual, expected) {
  expect(typeof actual).toBe('object')
  expect(actual.value).toBeCloseTo(expected.value, 3)
  expect(actual.prefix).toBe(expected.prefix)
  expect(actual.unit).toBe(expected.unit)
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
      }).toThrow(TypeError)
    })
  })

  it('should convert number to human readable string', function () {
    data.forEach(function (datum) {
      expect(humanFormat(datum[0])).toBe(datum[1])
      compareRaw(humanFormat.raw(datum[0]), datum[2])
    })
  })

  it('can use custom units', function () {
    expect(humanFormat(0, { unit: 'g' })).toBe('0 g')
  })

  it('can use custom separators', function () {
    expect(humanFormat(1337, { separator: ' - ' })).toBe('1.34 - k')
  })

  describe('with scale opts', function () {
    it('should use this custom scale', function () {
      var scale = humanFormat.Scale.create(
        ',ki,Mi,Gi'.split(','),
        1024,
        0
      )
      expect(humanFormat(102400, { scale: scale })).toBe('100 ki')
      compareRaw(humanFormat.raw(102400, { scale: scale }), {
        value: 100,
        prefix: 'ki'
      })
    })

    it('throws of unknown scale', function () {
      expect(function () {
        humanFormat(102400, { scale: 'foo' })
      }).toThrow('missing scale')
    })
  })

  describe('with prefix opts', function () {
    it('should use this prefix', function () {
      expect(humanFormat(100, { unit: 'm', prefix: 'k' })).toBe('0.1 km')
      compareRaw(humanFormat.raw(100, { unit: 'm', prefix: 'k' }), {
        value: 0.1,
        prefix: 'k'
      })
    })

    it('throws of unknown prefix', function () {
      expect(function () {
        humanFormat(102400, { prefix: 'foo' })
      }).toThrow('invalid prefix')
    })
  })

  describe('with decimals opts', function () {
    it('should round to decimal digits', function () {
      expect(humanFormat(2358, { decimals: 1, prefix: 'k' })).toBe('2.4 k')
      expect(humanFormat(111111111, { decimals: 1 })).toBe('111.1 M')
      expect(humanFormat(1e9, { decimals: 0 })).toBe('1 G')
    })

    it('should change the unit if necessary', function () {
      expect(humanFormat(999.9, { decimals: 0 })).toBe('1 k')
    })
  })
})

describe('humanFormat.parse()', function () {
  var parse = humanFormat.parse

  it('should convert human readable string to number', function () {
    data.forEach(function (datum) {
      expect(parse(datum[1])).toBeCloseTo(datum[0], 3)
    // compareRaw(parse.raw(datum[1]), datum[2])
    })
  })

  it('handle as gracefully as possible incorrect case', function () {
    expect(parse('1g')).toBe(1e9)
  })
})
