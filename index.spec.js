"use strict";

var assert = require("assert");
var test = require("node:test");

var describe = test.describe;
var it = test.it;

var humanFormat = require("./");

// ===================================================================

var data = [
  [1e-25, "100 r", { value: 100, prefix: "r" }],
  [1e-3, "1 m", { value: 1, prefix: "m" }],
  [0, "0", { value: 0, prefix: "" }],
  [1, "1", { value: 1, prefix: "" }],
  [10, "10", { value: 10, prefix: "" }],
  [1e12, "1 T", { value: 1, prefix: "T" }],
  [1e27, "1 R", { value: 1, prefix: "R" }],
  [1e33, "1000 Q", { value: 1000, prefix: "Q" }],
  [1e-30, "1 q", { value: 1, prefix: "q" }],
  [1024, "1 Ki", { value: 1, prefix: "Ki" }, { scale: "binary" }],
  [1572864, "1.5 Mi", { value: 1.5, prefix: "Mi" }, { scale: "binary" }],
];
data.forEach(function (datum) {
  var num = datum[0];
  if (num !== 0) {
    var raw = datum[2];
    data.push([
      -num,
      "-" + datum[1],
      { __proto__: raw, value: -raw.value },
      datum[3],
    ]);
  }
});

// relative tolerance, so that tiny and huge numbers are checked too
function assertCloseTo(actual, expected) {
  assert(
    Math.abs(expected - actual) <= 1e-9 * Math.abs(expected),
    actual + " is not close to " + expected
  );
}

function compareRaw(actual, expected) {
  assert.strictEqual(typeof actual, "object");
  assertCloseTo(actual.value, expected.value);
  assert.strictEqual(actual.prefix, expected.prefix);
  assert.strictEqual(actual.unit, expected.unit);
}

// ===================================================================

describe("humanFormat()", function () {
  it("throws for an invalid number", function () {
    [undefined, null, NaN, true, false, "a string", "-5", [], {}].forEach(
      function (value) {
        assert.throws(function () {
          humanFormat(value);
        }, TypeError);
      }
    );
  });

  it("does not depend on ES2015 built-ins", function () {
    var isNaN = Number.isNaN;
    delete Number.isNaN;
    try {
      assert.throws(
        function () {
          humanFormat(NaN);
        },
        { message: "value must be a number" }
      );
      assert.strictEqual(humanFormat(1), "1");
    } finally {
      Number.isNaN = isNaN;
    }
  });

  it("should convert number to human readable string", function () {
    data.forEach(function (datum) {
      assert.strictEqual(humanFormat(datum[0], datum[3]), datum[1]);
      compareRaw(humanFormat.raw(datum[0], datum[3]), datum[2]);
    });
  });

  it("uses the defaults for options set to undefined", function () {
    assert.strictEqual(
      humanFormat(1337, {
        maxDecimals: undefined,
        rounding: undefined,
        scale: undefined,
        separator: undefined,
        unit: undefined,
      }),
      "1.34 k"
    );
  });

  it("formats infinities without prefix", function () {
    assert.strictEqual(humanFormat(Infinity, { unit: "B" }), "Infinity B");
    assert.strictEqual(humanFormat(-Infinity, { decimals: 1 }), "-Infinity");
    assert.deepStrictEqual(humanFormat.raw(Infinity), {
      value: Infinity,
      prefix: "",
    });
  });

  it("can use custom units", function () {
    assert.strictEqual(humanFormat(0, { unit: "g" }), "0 g");
  });

  it("can use custom separators", function () {
    assert.strictEqual(humanFormat(1337, { separator: " - " }), "1.34 - k");
  });

  describe("with scale opts", function () {
    it("should use this custom scale", function () {
      var scale = humanFormat.Scale.create(",ki,Mi,Gi".split(","), 1024, 0);
      assert.strictEqual(humanFormat(102400, { scale: scale }), "100 ki");
      compareRaw(humanFormat.raw(102400, { scale: scale }), {
        value: 100,
        prefix: "ki",
      });
    });

    it("throws for an unknown scale", function () {
      assert.throws(
        function () {
          humanFormat(102400, { scale: "foo" });
        },
        { message: "missing scale" }
      );
    });
  });

  describe("with prefix opts", function () {
    it("should use this prefix", function () {
      assert.strictEqual(
        humanFormat(100, { unit: "m", prefix: "k" }),
        "0.1 km"
      );
      compareRaw(humanFormat.raw(100, { unit: "m", prefix: "k" }), {
        value: 0.1,
        prefix: "k",
      });
    });

    it("throws for an unknown prefix", function () {
      assert.throws(
        function () {
          humanFormat(102400, { prefix: "foo" });
        },
        { message: "invalid prefix" }
      );
    });
  });

  describe("with maxDecimals opts", function () {
    it("should round to decimal digits", function () {
      assert.strictEqual(
        humanFormat(2358, { maxDecimals: 1, prefix: "k" }),
        "2.4 k"
      );
      assert.strictEqual(humanFormat(111111111, { maxDecimals: 1 }), "111.1 M");
      assert.strictEqual(humanFormat(1e9, { maxDecimals: 0 }), "1 G");
    });

    it("should change the unit if necessary", function () {
      assert.strictEqual(humanFormat(999.9, { maxDecimals: 0 }), "1 k");
    });

    it("with auto", function () {
      assert.strictEqual(
        humanFormat(1181.1111, { maxDecimals: "auto" }),
        "1.2 k"
      );
      assert.strictEqual(
        humanFormat(11911.1111, { maxDecimals: "auto" }),
        "12 k"
      );
      assert.strictEqual(humanFormat(1.0, { maxDecimals: "auto" }), "1");
      assert.strictEqual(humanFormat(-5.36, { maxDecimals: "auto" }), "-5.4");
      assert.strictEqual(humanFormat(-15.36, { maxDecimals: "auto" }), "-15");
      // rounded once, not to 1 decimal first (123.5) then to 0 (124)
      assert.strictEqual(
        humanFormat(123456789, { maxDecimals: "auto" }),
        "123 M"
      );
      assert.strictEqual(humanFormat(9.96, { maxDecimals: "auto" }), "10");
      assert.strictEqual(
        humanFormat(15.36, { maxDecimals: "auto", prefix: "" }),
        "15"
      );
    });
  });

  describe("with rounding opt", function () {
    it("can round down", function () {
      var opts = { maxDecimals: "auto", rounding: "floor" };
      assert.strictEqual(humanFormat(1390, opts), "1.3 k");
      assert.strictEqual(humanFormat(13999, opts), "13 k");
      assert.strictEqual(humanFormat(-1310, opts), "-1.4 k");
      assert.strictEqual(
        humanFormat(999999, { rounding: "floor" }),
        "999.99 k"
      );
      assert.strictEqual(
        humanFormat(1999, { decimals: 1, rounding: "floor" }),
        "1.9 k"
      );
    });

    it("can round up", function () {
      var opts = { maxDecimals: 1, rounding: "ceil" };
      assert.strictEqual(humanFormat(1310, opts), "1.4 k");
      assert.strictEqual(humanFormat(-1390, opts), "-1.3 k");
      assert.strictEqual(
        humanFormat(999001, { maxDecimals: 0, rounding: "ceil" }),
        "1 M"
      );
    });

    it("ignores floating point errors", function () {
      assert.strictEqual(humanFormat(4.35, { rounding: "floor" }), "4.35");
      assert.strictEqual(humanFormat(4.35, { rounding: "ceil" }), "4.35");
    });

    it("throws for an unknown rounding", function () {
      assert.throws(
        function () {
          humanFormat(1, { rounding: "foo" });
        },
        { message: "invalid rounding" }
      );
    });
  });

  describe("with decimals opt", function () {
    it("forces a fixed number of decimals", function () {
      assert.strictEqual(humanFormat(1, { decimals: 2 }), "1.00");
      assert.strictEqual(humanFormat(1.11111, { decimals: 2 }), "1.11");
    });

    it("should change the unit if necessary", function () {
      assert.strictEqual(humanFormat(999999, { decimals: 0 }), "1 M");
      assert.strictEqual(humanFormat(999999, { decimals: 2 }), "1.00 M");
      assert.strictEqual(humanFormat(999.5, { decimals: 0 }), "1 k");
    });

    it("takes precedence over maxDecimals", function () {
      assert.strictEqual(
        humanFormat(1.1111, { decimals: 2, maxDecimals: 0 }),
        "1.11"
      );
    });
  });
});

describe("humanFormat.bytes()", function () {
  it("uses the binary scale and the B unit", function () {
    assert.strictEqual(humanFormat.bytes(0), "0 B");
    assert.strictEqual(humanFormat.bytes(1024), "1 KiB");
  });

  it("accepts options", function () {
    assert.strictEqual(humanFormat.bytes(1536, { maxDecimals: 0 }), "2 KiB");
    assert.strictEqual(humanFormat.bytes(1000, { scale: "SI" }), "1 kB");
    assert.strictEqual(
      humanFormat.bytes(1024, { scale: undefined, unit: undefined }),
      "1 KiB"
    );
  });
});

describe("humanFormat.parse()", function () {
  var parse = humanFormat.parse;

  it("should convert human readable string to number", function () {
    data.forEach(function (datum) {
      assertCloseTo(parse(datum[1], datum[3]), datum[0]);
      compareRaw(parse.raw(datum[1], datum[3]), {
        __proto__: datum[2],
        unit: "",
      });
    });
  });

  it("avoids floating point errors", function () {
    assert.strictEqual(parse("8.3M"), 8300000);
    assert.strictEqual(parse("-8.3M"), -8300000);
    assert.strictEqual(parse("1.34 kiB", { scale: "binary" }), 1372.16);
    assert.strictEqual(parse("0.00000015"), 1.5e-7);
  });

  it("accepts exponent notation", function () {
    assert.strictEqual(parse("1e3"), 1000);
    assert.strictEqual(parse("1.5E-7"), 1.5e-7);
    assert.strictEqual(parse("1e3k"), 1e6);
    assert.strictEqual(parse("2e"), 2e18);
  });

  it("rejects digits after the prefix", function () {
    ["1k5", "1.5.3"].forEach(function (str) {
      assert.throws(
        function () {
          parse(str);
        },
        { message: "cannot parse str" }
      );
    });
  });

  it("checks the unit if specified", function () {
    assert.strictEqual(parse("1 km", { unit: "m" }), 1000);
    assert.strictEqual(parse("1 m ", { unit: "m" }), 1);
    assert.strictEqual(parse("1 mm", { unit: "m" }), 0.001);
    assert.strictEqual(parse("1 k", { unit: "m" }), 1000);
    assert.strictEqual(parse.raw("1 kB", { unit: "B" }).unit, "B");
    assert.strictEqual(parse.raw("1 k", { unit: "B" }).unit, "");
    ["5 apples", "1 kg"].forEach(function (str) {
      assert.throws(
        function () {
          parse(str, { unit: "B" });
        },
        { message: "cannot parse str" }
      );
    });
  });

  it("returns the unit", function () {
    assert.strictEqual(parse.raw("1 kB").unit, "B");
  });

  it("handles incorrect case as gracefully as possible", function () {
    assert.strictEqual(parse("1g"), 1e9);
    assert.strictEqual(parse("100K"), 1e5);
    assert.strictEqual(parse("1 KI", { scale: "binary" }), 1024);
  });

  it("rejects incorrect case in strict mode", function () {
    assert.throws(
      function () {
        parse("1g", { strict: true });
      },
      { message: "cannot parse str" }
    );
  });

  it("throws for a non-string", function () {
    assert.throws(function () {
      parse(1);
    }, TypeError);
  });

  it("throws for an unknown scale", function () {
    assert.throws(
      function () {
        parse("1", { scale: "foo" });
      },
      { message: "missing scale" }
    );
  });

  it("throws for an unparsable string", function () {
    assert.throws(
      function () {
        parse("foo");
      },
      { message: "cannot parse str" }
    );
  });
});

describe("humanFormat.parse.bytes()", function () {
  var parseBytes = humanFormat.parse.bytes;

  it("accepts SI and binary prefixes", function () {
    assert.strictEqual(parseBytes("100"), 100);
    assert.strictEqual(parseBytes("1.5 kB"), 1500);
    assert.strictEqual(parseBytes("1.5 KiB"), 1536);
    assert.strictEqual(parseBytes("1 GiB"), 1073741824);
    assert.strictEqual(parseBytes("512 K"), 512000);
    assert.strictEqual(parseBytes("1 QB"), 1e30);
  });

  it("parses what bytes() formats", function () {
    [0, 1, 1536, 1073741824].forEach(function (value) {
      assert.strictEqual(parseBytes(humanFormat.bytes(value)), value);
    });
    [0, 1, 1500, 2e9].forEach(function (value) {
      assert.strictEqual(
        parseBytes(humanFormat.bytes(value, { scale: "SI" })),
        value
      );
    });
  });

  it("ignores case", function () {
    assert.strictEqual(parseBytes("1 KB"), 1000);
    assert.strictEqual(parseBytes("1 kib"), 1024);
    assert.strictEqual(parseBytes("10mb"), 10000000);
  });

  it("respects strict mode", function () {
    assert.strictEqual(parseBytes("1 kB", { strict: true }), 1000);
    ["1 kb", "1 KB"].forEach(function (str) {
      assert.throws(
        function () {
          parseBytes(str, { strict: true });
        },
        { message: "cannot parse str" }
      );
    });
  });

  it("rejects other units", function () {
    ["5 apples", "1 rpm", "1 kg"].forEach(function (str) {
      assert.throws(
        function () {
          parseBytes(str);
        },
        { message: "cannot parse str" }
      );
    });
  });
});
