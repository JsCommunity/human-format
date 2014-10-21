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

	// https://www.npmjs.org/package/escape-regexp
	function escapeRegexp(str) {
		return str.replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
	}

	var isArray = (function (toString) {
		var tag = toString.call([]);
		return function isArray(value) {
			return (toString.call(value) === tag);
		};
	})(Object.prototype.toString);

	var mergeDefaults = (function (has) {
		return function mergeDefaults(opts, defs) {
			var key;
			for (key in defs)
			{
				if (has.call(defs, key) && (opts[key] === undefined))
				{
					opts[key] = defs[key];
				}
			}
			return opts;
		};
	})(Object.prototype.hasOwnProperty);

	function round(f, n) {
		if (!n) {
			return Math.round(f);
		}

		var p = Math.pow(10, n);
		return Math.round(f * p) / p;
	}

	//==================================================================

	// Binary search to find the greatest index which has a value <=.
	function findPrefix(list, value) {
		/* jshint bitwise: false */

		var low = 0;
		var high = list.length - 1;

		var mid, current;
		while (low !== high) {
			mid = (low + high + 1) >> 1;
			current = list[mid][1];

			if (current > value) {
				high = mid - 1;
			} else {
				low = mid;
			}
		}

		return list[low];
	}

	//==================================================================

	// TODO: it should be easier to create non-consecutive prefixes
	// (e.g. K/M/G and Ki/Mi/Gi).
	function humanFormat$makePrefixes(prefixes, base, init) {
		init || (init = 0);

		var list = []; // Lists prefixes and their factor in ascending order.
		var map = {};  // Maps from prefixes to their factor.
		var re;        // Regex to parse a value and its associated unit.

		var tmp = [];

		prefixes.forEach(function (prefix, i) {
			var name, value;
			if (isArray(prefix))
			{
				name = prefix[0];
				value = prefix[1];
			}
			else
			{
				name = prefix;
				value = Math.pow(base, i + init);
				prefix = [name, value];
			}
			list.push(prefix);

			map[name] = value;

			tmp.push(escapeRegexp(name));
		});

		list.sort(function (a, b) {
			return (a[1] - b[1]);
		});

		tmp = tmp.sort(function (a, b) {
			return b.length - a.length; // Matches longest first.
		}).join('|');
		re = new RegExp('^\\s*(\\d+(?:\\.\\d+)?)\\s*('+ tmp +').*?$', 'i');

		return {
			list: list,
			map: map,
			re: re,
		};
	}

	// FIXME: it makes little sense to have fractional prefixes for an
	// indivisible unit (byte).
	var defaults = {
		unit: 'B', // bytes.

		// SI prefixes (https://en.wikipedia.org/wiki/Metric_prefix).
		//
		// Not all prefixes are present, only those which are multiple of
		// 1e3, because humans usually prefer to see close numbers using
		// the same unit to ease the comparison.
		prefixes: humanFormat$makePrefixes(
			'y,z,a,f,p,n,µ,m,,k,M,G,T,P,E,Z,Y'.split(','),
			1e3, // Base.
			-8   // Exponent for the first value.
		),
	};

	function humanFormat$raw(num, opts) {
		opts = mergeDefaults(opts || {}, defaults);

		// Ensures `num` is a number (or NaN).
		num = +num;

		// If `num` is 0 or NaN.
		if (!num)
		{
			return {
				num: 0,
				prefix: '',
				unit: opts.unit
			};
		}

		var prefix;
		// if a prefix is given use that prefix
		if(opts.prefix) {
			var factor = opts.factor;
			// if no factor is given then look it up
			if(factor === undefined) {
				factor = opts.prefixes.map[opts.prefix];
			}
			// if we found a factor use it
			if(factor !== undefined) {
				prefix = [opts.prefix, factor];
			}
		}

		// if no prefix was provided search for the best prefix
		if(!prefix) {
			prefix = findPrefix(opts.prefixes.list, num);
		}

		// Rebases the number using the current prefix and rounds it with
		// 2 decimals.
		num /= prefix[1];

		return {
			num: num,
			prefix: prefix[0],
			unit: opts.unit
		};
	}

	function humanFormat(num, opts){
		var info = humanFormat$raw(num, opts);
		return round(info.num, 2) + info.prefix +  info.unit;
	}

	humanFormat.raw = humanFormat$raw;
	humanFormat.makePrefixes = humanFormat$makePrefixes;
	humanFormat.parse = function humanFormat$parse(str, opts) {
		var prefixes = mergeDefaults(opts || {}, defaults).prefixes;

		var matches = prefixes.re.exec(str);
		if (!matches)
		{
			return null;
		}

		// TODO: when no prefixes match, it should try an case insensitive
		// match, unless `opt.caseSensitive` is enabled.
		//
		// TODO: the unit should be checked: it might be absent but it
		// should not differ from the one expected.
		//
		// TODO: if multiple units are specified, at least must match and
		// the returned value should be: { value: <value>, unit: matchedUnit }
		var num = +matches[1];
		var fac = prefixes.map[matches[2]];
		if (isNaN(num) || !fac)
		{
			// FIXME: an exception should be thrown if the input cannot be
			// parsed.
			return null;
		}

		return (num * fac);
	};

	return humanFormat;
}));
