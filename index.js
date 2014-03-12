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
		root.returnExports = factory();
	}
}(this, function () {
	'use strict';

	//==================================================================

	// https://www.npmjs.org/package/escape-regexp
	var escapeRegexp = function (str) {
		return str.replace(/([.*+?=^!:${}()|[\]\/\\])/g, '\\$1');
	};

	var isArray = (function () {
		var toString = Object.prototype.toString;
		toString = toString.call.bind(toString);
		var tag = toString([]);
		return function (value) {
			return (toString(value) === tag);
		};
	})();

	var mergeDefaults = (function () {
		var has = Object.prototype.hasOwnProperty;
		has = has.call.bind(has);
		return function (opts, defs) {
			var key;
			for (key in defs)
			{
				if (has(defs, key) && (opts[key] === undefined))
				{
					opts[key] = defs[key];
				}
			}
			return opts;
		};
	})();

	//==================================================================

	// Binary search to find the greatest index which has a value <=.
	var findPrefix = function (list, value) {
		/* jshint bitwise: false */

		var current;
		var low = 0;
		var high = list.length;

		while (low < high)
		{
			var mid = (low + high) >> 1; // <=> Math.floor((low + high) / 2)
			current = list[mid][1];
			if (current < value)
			{
				low = mid + 1;
			}
			else
			{
				high = mid;
			}
		}

		if (current === value)
		{
			return list[low];
		}
		return list[low && low - 1];
	};

	//==================================================================

	var makePrefixes = function (prefixes, base, init) {
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
	};

	var defaults = {
		unit: 'B', // bytes.

		// SI prefixes (https://en.wikipedia.org/wiki/Metric_prefix).
		//
		// Not all prefixes are present, only those which are multiple of
		// 1e3, because humans usually prefer to see close numbers using
		// the same unit to ease the comparison.
		prefixes: makePrefixes(
			'y,z,a,f,p,n,µ,m,,k,M,G,T,P,E,Z,Y'.split(','),
			1e3, // Base.
			-8   // Exponent for the first value.
		),
	};

	var humanFormat = function (num, opts) {
		opts = mergeDefaults(opts || {}, defaults);

		// Ensures `num` is a number (or NaN).
		num = +num;

		// If `num` is 0 or NaN.
		if (!num)
		{
			return '0'+ opts.unit;
		}

		var prefix = findPrefix(opts.prefixes.list, num);

		// Rebases the number using the current prefix and rounds it with
		// 2 decimals.
		num = Math.round(num * 1e2 / prefix[1]) / 1e2;

		return num + prefix[0] + opts.unit;
	};
	humanFormat.makePrefixes = makePrefixes;
	humanFormat.parse = function (str, opts) {
		var prefixes = mergeDefaults(opts || {}, defaults).prefixes;

		var matches = prefixes.re.exec(str);
		if (!matches)
		{
			return null;
		}

		var num = +matches[1];
		var fac = prefixes.map[matches[2]];
		if (isNaN(num) || !fac)
		{
			return null;
		}

		return (num * fac);
	};

	return humanFormat;
}));
