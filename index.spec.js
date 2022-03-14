"use strict";

var assert = require("assert");
var mocha = require("tap").mocha;

var describe = mocha.describe;
var it = mocha.it;

var humanFormat = require("./");

// ===================================================================

var data = [
  [1e-25, "0.1 y", { value: 0.1, prefix: "y" }],
  [1e-3, "1 m", { value: 1, prefix: "m" }],
  [0, "0", { value: 0, prefix: "" }],
  [1, "1", { value: 1, prefix: "" }],
  [10, "10", { value: 10, prefix: "" }],
  [1e12, "1 T", { value: 1, prefix: "T" }],
  [1e28, "10000 Y", { value: 10000, prefix: "Y" }],
];
data.forEach(function (datum) {
  var num = datum[0];
  if (num !== 0) {
    var raw = datum[2];
    data.push([-num, "-" + datum[1], { __proto__: raw, value: -raw.value }]);
  }
});

function assertCloseTo(actual, expected, digit) {
  assert(Math.abs(expected - actual) < Math.pow(10, -(digit || 2)) / 2);
}

function compareRaw(actual, expected) {
  assert.strictEqual(typeof actual, "object");
  assertCloseTo(actual.value, expected.value, 3);
  assert.strictEqual(actual.prefix, expected.prefix);
  assert.strictEqual(actual.unit, expected.unit);
}

// ===================================================================

describe("humanFormat()", function () {
  it("returns throws for an invalid number", function () {
    [undefined, null, NaN, true, false, "a string", [], {}].forEach(function (
      value
    ) {
      assert.throws(function () {
        humanFormat(value);
      }, TypeError);
    });
  });

  it("should convert number to human readable string", function () {
    data.forEach(function (datum) {
      assert.strictEqual(humanFormat(datum[0]), datum[1]);
      compareRaw(humanFormat.raw(datum[0]), datum[2]);
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

    it("throws of unknown scale", function () {
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

    it("throws of unknown prefix", function () {
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

    it("with auto ", function () {
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
    });
  });

  describe("with decimals opt", function () {
    it("forces a fixed number of decimals", function () {
      assert.strictEqual(humanFormat(1, { decimals: 2 }), "1.00");
      assert.strictEqual(humanFormat(1.11111, { decimals: 2 }), "1.11");
    });

    it("takes precedence over maxDecimals", function () {
      assert.strictEqual(
        humanFormat(1.1111, { decimals: 2, maxDecimals: 0 }),
        "1.11"
      );
    });
  });
});

describe("humanFormat.parse()", function () {
  var parse = humanFormat.parse;

  it("should convert human readable string to number", function () {
    data.forEach(function (datum) {
      assertCloseTo(parse(datum[1]), datum[0], 3);
      // compareRaw(parse.raw(datum[1]), datum[2])
    });
  });

  it("handle as gracefully as possible incorrect case", function () {
    assert.strictEqual(parse("1g"), 1e9);
  });
});
