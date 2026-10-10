// UMD: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
  /* global define: false */
  // AMD and browser globals are not testable in Node
  /* node:coverage disable */
  if (typeof define === "function" && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === "object") {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.humanFormat = factory();
  }
  /* node:coverage enable */
})(this, function () {
  "use strict";

  // =================================================================

  function assign(dst, src) {
    var i, n, prop;
    for (i = 1, n = arguments.length; i < n; ++i) {
      src = arguments[i];
      if (src != null) {
        for (prop in src) {
          if (has(src, prop)) {
            dst[prop] = src[prop];
          }
        }
      }
    }
    return dst;
  }

  // https://www.npmjs.org/package/escape-regexp
  function escapeRegexp(str) {
    return str.replace(/([.*+?=^!:${}()|[\]/\\])/g, "\\$1");
  }

  function has(obj, prop) {
    return obj != null && Object.prototype.hasOwnProperty.call(obj, prop);
  }

  // Number.MAX_SAFE_INTEGER is not ES5
  var MAX_SAFE_INTEGER = 9007199254740991;

  function resolve(container, entry) {
    while (typeof entry === "string") {
      entry = container[entry];
    }
    return entry;
  }

  // =================================================================

  function Scale(prefixes) {
    this._prefixes = prefixes;

    var escapedPrefixes = [];
    var list = [];
    var lcPrefixes = (this._lcPrefixes = {});
    var prefix, lcPrefix;
    for (prefix in prefixes) {
      if (has(prefixes, prefix)) {
        escapedPrefixes.push(escapeRegexp(prefix));

        list.push({
          factor: prefixes[prefix],
          prefix: prefix,
        });

        // Adds lower cased prefixes for case insensitive fallback, except
        // when ambiguous (e.g. M and m).
        lcPrefix = prefix.toLowerCase();
        if (lcPrefix === prefix || !has(prefixes, lcPrefix)) {
          lcPrefixes[lcPrefix] = prefix;
        }
      }
    }

    list.sort(function (a, b) {
      return a.factor - b.factor;
    });
    this._list = list;

    // longest first
    escapedPrefixes.sort(function (a, b) {
      return b.length - a.length;
    });
    this._regexp = new RegExp(
      "^\\s*(-)?\\s*(\\d+(?:\\.\\d+)?(?:e[+-]?\\d+)?)\\s*(" +
        escapedPrefixes.join("|") +
        ")\\s*(\\D*?)\\s*$",
      "i"
    );
  }

  Scale.create = function Scale$create(prefixesList, base, initExp) {
    var prefixes = {};
    if (initExp === undefined) {
      initExp = 0;
    }
    for (var i = 0, n = prefixesList.length; i < n; ++i) {
      prefixes[prefixesList[i]] = Math.pow(base, i + initExp);
    }

    return new Scale(prefixes);
  };

  // Binary search to find the greatest index which has a value <=.
  Scale.prototype.findPrefix = function Scale$findPrefix(value) {
    var list = this._list;
    var low = 0;
    var high = list.length - 1;

    var mid, current;
    while (low !== high) {
      mid = (low + high + 1) >> 1;
      current = list[mid].factor;

      if (current > value) {
        high = mid - 1;
      } else {
        low = mid;
      }
    }

    return list[low];
  };

  Scale.prototype.parse = function Scale$parse(str, strict) {
    var matches = str.match(this._regexp);

    if (matches === null) {
      return;
    }

    var prefix = matches[3];
    var factor;

    if (has(this._prefixes, prefix)) {
      factor = this._prefixes[prefix];
    } else if (
      !strict &&
      ((prefix = prefix.toLowerCase()), has(this._lcPrefixes, prefix))
    ) {
      prefix = this._lcPrefixes[prefix];
      factor = this._prefixes[prefix];
    } else {
      return;
    }

    var value = +matches[2];
    if (matches[1] !== undefined) {
      value = -value;
    }

    return {
      factor: factor,
      prefix: prefix,
      unit: matches[4],
      value: value,
    };
  };

  // =================================================================

  var scales = {
    // https://en.wikipedia.org/wiki/Binary_prefix
    binary: Scale.create(",Ki,Mi,Gi,Ti,Pi,Ei,Zi,Yi".split(","), 1024),

    // https://en.wikipedia.org/wiki/Metric_prefix
    //
    // Not all prefixes are present, only those which are multiple of
    // 1000, because humans usually prefer to see close numbers using
    // the same unit to ease the comparison.
    SI: Scale.create("y,z,a,f,p,n,µ,m,,k,M,G,T,P,E,Z,Y".split(","), 1000, -8),
  };

  var defaults = {
    // Decimal digits for formatting.
    maxDecimals: 2,

    // separator to use between value and units
    separator: " ",

    // Unit to use for formatting.
    unit: "",
  };
  var rawDefaults = {
    // How to round to maxDecimals: round, floor or ceil.
    rounding: "round",

    scale: "SI",

    // Strict mode prevents parsing of incorrectly cased prefixes.
    strict: false,
  };

  function humanFormat(value, opts) {
    opts = assign({}, defaults, opts);

    var decimals = opts.decimals;
    if (decimals !== undefined) {
      // round at the displayed precision so that the prefix is changed if needed
      opts.maxDecimals = decimals;
    }

    var info = humanFormat$raw(value, opts);
    value =
      decimals !== undefined
        ? info.value.toFixed(decimals)
        : String(info.value);
    var suffix = info.prefix + opts.unit;
    return suffix === "" ? value : value + opts.separator + suffix;
  }

  var humanFormat$bytes$opts = { scale: "binary", unit: "B" };
  function humanFormat$bytes(value, opts) {
    return humanFormat(
      value,
      opts === undefined
        ? humanFormat$bytes$opts
        : assign({}, humanFormat$bytes$opts, opts)
    );
  }

  function humanFormat$parse(str, opts) {
    var info = humanFormat$parse$raw(str, opts);

    // 8.3 * 1e6 is 8300000.000000001 but 83 * 1e6 / 10 is exact: when the
    // digits times the factor is an exact integer, only the division rounds
    var decimals = String(info.value).split(".")[1];
    if (decimals !== undefined && decimals.indexOf("e") === -1) {
      var power = Math.pow(10, decimals.length);
      var scaled = Math.round(info.value * power) * info.factor;
      if (scaled % 1 === 0 && Math.abs(scaled) <= MAX_SAFE_INTEGER) {
        return scaled / power;
      }
    }
    return info.value * info.factor;
  }

  function humanFormat$parse$raw(str, opts) {
    if (typeof str !== "string") {
      throw new TypeError("str must be a string");
    }

    // Merge default options.
    opts = assign({}, rawDefaults, opts);

    // Get current scale.
    var scale = resolve(scales, opts.scale);
    if (scale === undefined) {
      throw new Error("missing scale");
    }

    // TODO: if multiple units are specified, at least must match and
    // the returned value should be: { value: <value>, unit: matchedUnit }

    // The unit, if specified, is optional but nothing else is accepted. It is
    // removed first, otherwise "1 m" with unit "m" would be parsed as milli.
    var unit = opts.unit;
    if (unit !== undefined) {
      str = str.trim();
      if (unit !== "" && str.slice(-unit.length) === unit) {
        str = str.slice(0, -unit.length);
      } else {
        unit = "";
      }
    }

    var info = scale.parse(str, opts.strict);
    if (info === undefined || (unit !== undefined && info.unit !== "")) {
      throw new Error("cannot parse str");
    }
    if (unit !== undefined) {
      info.unit = unit;
    }

    return info;
  }

  // toPrecision(15) removes floating point errors (4.35 * 100 is
  // 434.99999999999994) which Math.round ignores but floor and ceil do not
  var roundings = {
    ceil: function (value) {
      return Math.ceil(+value.toPrecision(15));
    },
    floor: function (value) {
      return Math.floor(+value.toPrecision(15));
    },
    round: Math.round,
  };
  var oppositeRoundings = { ceil: "floor", floor: "ceil" };

  function humanFormat$raw(value, opts) {
    // Zero is a special case, it never has any prefix.
    if (value === 0) {
      return {
        value: 0,
        prefix: "",
      };
    } else if (value < 0) {
      // floor and ceil apply to the signed value
      var rounding = opts != null && opts.rounding;
      var result = humanFormat$raw(
        -value,
        has(oppositeRoundings, rounding)
          ? assign({}, opts, { rounding: oppositeRoundings[rounding] })
          : opts
      );
      result.value = -result.value;
      return result;
    }

    // value !== value is the ES5 equivalent of Number.isNaN(value)
    if (typeof value !== "number" || value !== value) {
      throw new TypeError("value must be a number");
    }

    // Merge default options.
    opts = assign({}, rawDefaults, opts);

    // Get current scale.
    var scale = resolve(scales, opts.scale);
    if (scale === undefined) {
      throw new Error("missing scale");
    }

    if (!has(roundings, opts.rounding)) {
      throw new Error("invalid rounding");
    }
    var round = roundings[opts.rounding];

    var power;
    var maxDecimals = opts.maxDecimals;
    var autoMaxDecimals = maxDecimals === "auto";
    if (autoMaxDecimals) {
      power = 10;
    } else if (maxDecimals !== undefined) {
      power = Math.pow(10, maxDecimals);
    }

    var prefix = opts.prefix;
    var factor;
    if (prefix !== undefined) {
      if (!has(scale._prefixes, prefix)) {
        throw new Error("invalid prefix");
      }

      factor = scale._prefixes[prefix];
    } else {
      var _ref = scale.findPrefix(value);
      if (power !== undefined) {
        do {
          factor = _ref.factor;

          // factor is usually >> power, therefore it's better to
          // divide factor by power than the other way to limit
          // numerical error
          var r = factor / power;

          value = round(value / r) * r;
        } while ((_ref = scale.findPrefix(value)).factor !== factor);
      } else {
        factor = _ref.factor;
      }

      prefix = _ref.prefix;
    }
    value =
      power === undefined
        ? value / factor
        : round((value * power) / factor) / power;

    if (autoMaxDecimals && Math.abs(value) >= 10) {
      value = round(value);
    }

    return {
      prefix: prefix,
      value: value,
    };
  }

  humanFormat.bytes = humanFormat$bytes;
  humanFormat.parse = humanFormat$parse;
  humanFormat$parse.raw = humanFormat$parse$raw;
  humanFormat.raw = humanFormat$raw;
  humanFormat.Scale = Scale;

  return humanFormat;
});
