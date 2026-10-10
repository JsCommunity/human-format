/// <reference path="./index.d.ts" />
import humanFormat = require("human-format");
import { expectError, expectType } from "tsd";

expectType<string>(humanFormat(1337));
expectType<string>(humanFormat(1337, { maxDecimals: "auto", unit: "B" }));
expectType<string>(humanFormat(1337, { scale: "binary", prefix: "Ki" }));
expectError(humanFormat("1337"));
expectError(humanFormat(1337, { maxDecimals: "foo" }));
expectType<string>(humanFormat(1337, { rounding: "floor" }));
expectError(humanFormat(1337, { rounding: "trunc" }));
expectError(humanFormat(1337, { scale: "foo" }));
expectError(humanFormat(1337, { prefix: "Ki" }));
expectError(humanFormat(1337, { scale: "binary", prefix: "k" }));
expectType<string>(humanFormat(1e30, { prefix: "Q" }));

expectType<string>(humanFormat.bytes(1337));
expectType<string>(humanFormat.bytes(1337, { prefix: "Ki" }));
expectError(humanFormat.bytes(1337, { prefix: "k" }));

const options: humanFormat.Options<"SI"> = { prefix: "k" };
expectType<string>(humanFormat(1337, options));

const raw = humanFormat.raw(1337, { scale: "binary" });
expectType<number>(raw.value);
expectType<humanFormat.BinaryPrefix>(raw.prefix);
expectType<humanFormat.SIPrefix>(humanFormat.raw(1337).prefix);

expectType<number>(humanFormat.parse("1.34 kB"));
expectType<number>(humanFormat.parse("1 Ki", { scale: "binary" }));
expectType<number>(humanFormat.parse.raw("1.34 kB").factor);
expectType<humanFormat.BinaryPrefix>(
  humanFormat.parse.raw("1 Ki", { scale: "binary" }).prefix
);
expectError(humanFormat.parse.raw("1 Ki", true));

const scale = humanFormat.Scale.create(["", "ki", "Mi"], 1024);
expectType<humanFormat.Scale<"" | "ki" | "Mi">>(scale);
expectType<string>(humanFormat(1337, { scale, prefix: "ki" }));
expectError(humanFormat(1337, { scale, prefix: "Ki" }));
expectType<"" | "ki" | "Mi">(humanFormat.raw(1337, { scale }).prefix);
expectType<"" | "ki" | "Mi">(scale.findPrefix(1337).prefix);

const parsed = scale.parse("1 ki");
expectType<humanFormat.ParsedInfo<typeof scale> | undefined>(parsed);
if (parsed !== undefined) {
  expectType<"" | "ki" | "Mi">(parsed.prefix);
}
