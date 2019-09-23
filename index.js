// UMD: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  /* global define: false */
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory)
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory()
  } else {
    // Browser globals (root is window)
    root.humanFormat = factory()
  }
}(this, function () {
  'use strict'

  // =================================================================

  function assign (dst, src) {
    var i, n, prop
    for (i = 1, n = arguments.length; i < n; ++i) {
      src = arguments[i]
      if (src != null) {
        for (prop in src) {
          if (has(src, prop)) {
            dst[prop] = src[prop]
          }
        }
      }
    }
    return dst
  }

  function compareLongestFirst (a, b) {
    return b.length - a.length
  }

  function compareSmallestFactorFirst (a, b) {
    return a.factor - b.factor
  }

  // https://www.npmjs.org/package/escape-regexp
  function escapeRegexp (str) {
    return str.replace(/([.*+?=^!:${}()|[\]/\\])/g, '\\$1')
  }

  function forEach (arr, iterator) {
    var i, n
    for (i = 0, n = arr.length; i < n; ++i) {
      iterator(arr[i], i)
    }
  }

  function forOwn (obj, iterator) {
    var prop
    for (prop in obj) {
      if (has(obj, prop)) {
        iterator(obj[prop], prop)
      }
    }
  }

  var has = (function (hasOwnProperty) {
    return function has (obj, prop) {
      return obj != null && hasOwnProperty.call(obj, prop)
    }
  })(Object.prototype.hasOwnProperty)

  function resolve (container, entry) {
    while (typeof entry === 'string') {
      entry = container[entry]
    }
    return entry
  }

  // =================================================================

  function Scale (prefixes) {
    this._prefixes = prefixes

    var escapedPrefixes = []
    var list = []
    forOwn(prefixes, function (factor, prefix) {
      escapedPrefixes.push(escapeRegexp(prefix))

      list.push({
        factor: factor,
        prefix: prefix
      })
    })

    // Adds lower cased prefixes for case insensitive fallback.
    var lcPrefixes = this._lcPrefixes = {}
    forOwn(prefixes, function (factor, prefix) {
      var lcPrefix = prefix.toLowerCase()
      if (!has(prefixes, lcPrefix)) {
        lcPrefixes[lcPrefix] = prefix
      }
    })

    list.sort(compareSmallestFactorFirst)
    this._list = list

    escapedPrefixes.sort(compareLongestFirst)
    this._regexp = new RegExp(
      '^\\s*(-)?\\s*(\\d+(?:\\.\\d+)?)\\s*(' +
      escapedPrefixes.join('|') +
      ')\\s*(.*)\\s*?$',
      'i'
    )
  }

  Scale.create = function Scale$create (prefixesList, base, initExp) {
    var prefixes = {}
    if (initExp === undefined) {
      initExp = 0
    }
    forEach(prefixesList, function (prefix, i) {
      prefixes[prefix] = Math.pow(base, i + initExp)
    })

    return new Scale(prefixes)
  }

  // Binary search to find the greatest index which has a value <=.
  Scale.prototype.findPrefix = function Scale$findPrefix (value) {
    var list = this._list
    var low = 0
    var high = list.length - 1

    var mid, current
    while (low !== high) {
      mid = (low + high + 1) >> 1
      current = list[mid].factor

      if (current > value) {
        high = mid - 1
      } else {
        low = mid
      }
    }

    return list[low]
  }

  Scale.prototype.parse = function Scale$parse (str, strict) {
    var matches = str.match(this._regexp)

    if (matches === null) {
      return
    }

    var prefix = matches[3]
    var factor

    if (has(this._prefixes, prefix)) {
      factor = this._prefixes[prefix]
    } else if (
      !strict &&
      (prefix = prefix.toLowerCase(), has(this._lcPrefixes, prefix))
    ) {
      prefix = this._lcPrefixes[prefix]
      factor = this._prefixes[prefix]
    } else {
      return
    }

    var value = +matches[2]
    if (matches[1] !== undefined) {
      value = -value
    }

    return {
      factor: factor,
      prefix: prefix,
      unit: matches[4],
      value: value
    }
  }

  // =================================================================

  var scales = {
    // https://en.wikipedia.org/wiki/Binary_prefix
    binary: Scale.create(
      ',Ki,Mi,Gi,Ti,Pi,Ei,Zi,Yi'.split(','),
      1024
    ),

    // https://en.wikipedia.org/wiki/Metric_prefix
    //
    // Not all prefixes are present, only those which are multiple of
    // 1000, because humans usually prefer to see close numbers using
    // the same unit to ease the comparison.
    SI: Scale.create(
      'y,z,a,f,p,n,µ,m,,k,M,G,T,P,E,Z,Y'.split(','),
      1000, -8
    )
  }

  var defaults = {
    // Decimal digits for formatting.
    decimals: 2,

    // separator to use between value and units
    separator: ' ',

    // Unit to use for formatting.
    unit: ''
  }
  var rawDefaults = {
    scale: 'SI',

    // Strict mode prevents parsing of incorrectly cased prefixes.
    strict: false
  }

  function humanFormat (value, opts) {
    opts = assign({}, defaults, opts)

    var info = humanFormat$raw(value, opts)
    value = String(info.value)
    var suffix = info.prefix + opts.unit
    return suffix === '' ? value : value + opts.separator + suffix
  }

  var humanFormat$bytes$opts = { scale: 'binary', unit: 'B' }
  function humanFormat$bytes (value, opts) {
    return humanFormat(
      value,
      opts === undefined
        ? humanFormat$bytes$opts
        : assign({}, humanFormat$bytes$opts, opts)
    )
  }

  function humanFormat$parse (str, opts) {
    var info = humanFormat$parse$raw(str, opts)

    return info.value * info.factor
  }

  function humanFormat$parse$raw (str, opts) {
    if (typeof str !== 'string') {
      throw new TypeError('str must be a string')
    }

    // Merge default options.
    opts = assign({}, rawDefaults, opts)

    // Get current scale.
    var scale = resolve(scales, opts.scale)
    if (scale === undefined) {
      throw new Error('missing scale')
    }

    // TODO: the unit should be checked: it might be absent but it
    // should not differ from the one expected.
    //
    // TODO: if multiple units are specified, at least must match and
    // the returned value should be: { value: <value>, unit: matchedUnit }

    var info = scale.parse(str, opts.strict)
    if (info === undefined) {
      throw new Error('cannot parse str')
    }

    return info
  }

  function humanFormat$raw (value, opts) {
    // Zero is a special case, it never has any prefix.
    if (value === 0) {
      return {
        value: 0,
        prefix: ''
      }
    } else if (value < 0) {
      var result = humanFormat$raw(-value, opts)
      result.value = -result.value
      return result
    }

    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new TypeError('value must be a number')
    }

    // Merge default options.
    opts = assign({}, rawDefaults, opts)

    // Get current scale.
    var scale = resolve(scales, opts.scale)
    if (scale === undefined) {
      throw new Error('missing scale')
    }

    var power
    var decimals = opts.decimals
    if (decimals !== undefined) {
      power = Math.pow(10, decimals)
    }

    var prefix = opts.prefix
    var factor
    if (prefix !== undefined) {
      if (!has(scale._prefixes, prefix)) {
        throw new Error('invalid prefix')
      }

      factor = scale._prefixes[prefix]
    } else {
      var _ref = scale.findPrefix(value)
      if (power !== undefined) {
        do {
          factor = _ref.factor

          // factor is usually >> power, therefore it's better to
          // divide factor by power than the other way to limit
          // numerical error
          var r = factor / power

          value = Math.round(value / r) * r
        } while ((_ref = scale.findPrefix(value)).factor !== factor)
      } else {
        factor = _ref.factor
      }

      prefix = _ref.prefix
    }

    return {
      prefix: prefix,
      value: power === undefined
        ? value / factor
        : Math.round(value * power / factor) / power
    }
  }

  humanFormat.bytes = humanFormat$bytes
  humanFormat.parse = humanFormat$parse
  humanFormat$parse.raw = humanFormat$parse$raw
  humanFormat.raw = humanFormat$raw
  humanFormat.Scale = Scale

  return humanFormat
}))
