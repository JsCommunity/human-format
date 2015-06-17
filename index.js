// UMD: https://github.com/umdjs/umd/blob/master/returnExports.js
(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define([], factory);
	} else if (typeof exports === 'object') {
		// Node. Does not work with strict CommonJS, but
		// only CommonJS-like environments that support module.exports,
		// like Node.
		module.exports = factory();
	} else {
		// Browser globals (root is window)
		root.humanFormat = factory();
	}
}(this, function () {
	'use strict';

	//==================================================================

	function assignBase(dst, src) {
		var prop;
		for (prop in src) {
			if (has(src, prop)) {
				dst[prop] = src[prop];
			}
		}
	}
	function assign(dst, src) {
		var i, n;
		for (i = 0, n = arguments.length; i < n; ++i) {
			src = arguments[i];
			if (src) {
				assignBase(dst, src);
			}
		}
		return dst;
	}

	function compareLongestFirst(a, b) {
		return b.length - a.length;
	}

	function compareSmallestFactorFirst(a, b) {
		return a.factor - b.factor;
	}

	// https://www.npmjs.org/package/escape-regexp
	function escapeRegexp(str) {
		return str.replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
	}

	function forEach(arr, iterator) {
		var i, n;
		for (i = 0, n = arr.length; i < n; ++i) {
			iterator(arr[i], i);
		}
	}

	function forOwn(obj, iterator) {
		var prop;
		for (prop in obj) {
			if (has(obj, prop)) {
				iterator(obj[prop], prop);
			}
		}
	}

	var has = (function (hasOwnProperty) {
		return function has(obj, prop) {
			return obj && hasOwnProperty.call(obj, prop);
		};
	})(Object.prototype.hasOwnProperty);

	var toString = (function (toString_) {
		return function toString(val) {
			return toString_.call(val);
		};
	})(Object.prototype.toString);

	function isDefined(val) {
		/* jshint eqnull:true */
		return val != null;
	}

	var isNumber = (function (tag) {
		return function isNumber(value) {
			return (value === value) && (toString(value) === tag);
		};
	})(toString(0));

	var isString = (function (tag) {
		return function isString(value) {
			return (toString(value) === tag);
		};
	})(toString(''));

	function resolve(container, entry) {
		while (isString(entry)) {
			entry = container[entry];
		}
		return entry;
	}

	function round(f, n) {
		if (!n) {
			return Math.round(f);
		}

		var p = Math.pow(10, n);
		return Math.round(f * p) / p;
	}

	//==================================================================

	function Scale(prefixes) {
		this._prefixes = prefixes;

		var escapedPrefixes = [];
		var list = [];
		forOwn(prefixes, function (factor, prefix) {
			escapedPrefixes.push(escapeRegexp(prefix));

			list.push({
				factor: factor,
				prefix: prefix
			});
		});

		list.sort(compareSmallestFactorFirst);
		this._list = list;

		escapedPrefixes.sort(compareLongestFirst);
		this._regexp = new RegExp(
			'^\\s*(\\d+(?:\\.\\d+)?)\\s*(' +
				escapedPrefixes.join('|') +
				')\\s*(.*)\\s*?$',
			'i'
		);
	}

	Scale.create = function Scale$create(prefixesList, base, initExp) {
		var prefixes = {};
		var factor = initExp ? Math.pow(base, initExp) : 1;
		forEach(prefixesList, function (prefix, i) {
			prefixes[prefix] = Math.pow(base, i + (initExp || 0));
			factor *= base;
		});

		return new Scale(prefixes);
	};

	// Binary search to find the greatest index which has a value <=.
	Scale.prototype.findPrefix = function Scale$findPrefix(value) {
		/* jshint bitwise: false */

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

		if (!matches) {
			return null;
		}

		var prefix = matches[2];

		if (!has(this._prefixes, prefix)) {
			if (strict) {
				return null;
			}

			// FIXME
			return null;
		}

		return {
			factor: this._prefixes[prefix],
			prefix: prefix,
			unit: matches[3],
			value: +matches[1]
		};
	};

	//==================================================================

	var scales = {
		// https://en.wikipedia.org/wiki/Binary_prefix
		binary: Scale.create(
			',ki,Mi,Gi,Ti,Pi,Ei,Zi,Yi'.split(','),
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
	};

	var defaults = {
		scale: 'SI',

		// Strict mode prevents parsing of incorrectly cased prefixes.
		strict: false,

		// Unit to use for formatting.
		unit: '',

		// Decimal digits for formatting.
		decimalDigits: 2
	};

	function humanFormat(value, opts){
		opts = assign({}, defaults, opts);

		var info = humanFormat$raw(value, opts);
		var suffix = info.prefix + opts.unit;
		return round(info.value, opts.decimalDigits) + (suffix ? ' ' + suffix : '');
	}

	function humanFormat$parse(str, opts) {
		var info = humanFormat$parse$raw(str, opts);

		return info.value * info.factor;
	}

	function humanFormat$parse$raw(str, opts) {
		if (!isString(str)) {
			throw new TypeError('str must be a string');
		}

		// Merge default options.
		opts = assign({}, defaults, opts);

		// Get current scale.
		var scale = resolve(scales, opts.scale);
		if (!scale) {
			throw new Error('missing scale');
		}

		// TODO: the unit should be checked: it might be absent but it
		// should not differ from the one expected.
		//
		// TODO: if multiple units are specified, at least must match and
		// the returned value should be: { value: <value>, unit: matchedUnit }

		var info = scale.parse(str, opts.strict);
		if (!info) {
			throw new Error('cannot parse str');
		}

		return info;
	}

	function humanFormat$raw(value, opts) {
		// Zero is a special case, it never has any prefix.
		if (value === 0) {
			return {
				value: 0,
				prefix: ''
			};
		}

		if (!isNumber(value)) {
			throw new TypeError('value must be a number');
		}

		// Merge default options.
		opts = assign({}, defaults, opts);

		// Get current scale.
		var scale = resolve(scales, opts.scale);
		if (!scale) {
			throw new Error('missing scale');
		}

		var prefix = opts.prefix;
		var factor;
		if (isDefined(prefix)) {
			if (!has(scale._prefixes, prefix)) {
				throw new Error('invalid prefix');
			}

			factor = scale._prefixes[prefix];
		} else {
			var _ref = scale.findPrefix(value);
			prefix = _ref.prefix;
			factor = _ref.factor;
		}

		// Rebase using current factor.
		value /= factor;

		return {
			prefix: prefix,
			value: value
		};
	}

	humanFormat.parse = humanFormat$parse;
	humanFormat$parse.raw = humanFormat$parse$raw;
	humanFormat.raw = humanFormat$raw;
	humanFormat.Scale = Scale;

	return humanFormat;
}));
