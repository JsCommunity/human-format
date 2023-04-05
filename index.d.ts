type BinaryPrefix = "" | "Ki" | "Mi" | "Gi" | "Ti" | "Pi" | "Ei" | "Zi" | "Yi";

type SIPrefix =
  | "y"
  | "z"
  | "a"
  | "f"
  | "p"
  | "n"
  | "µ"
  | "m"
  | ""
  | "k"
  | "M"
  | "G"
  | "T"
  | "P"
  | "E"
  | "Z"
  | "Y";

export type ScaleName = "binary" | "SI";

export type Prefix<S extends ScaleName> = S extends "binary"
  ? BinaryPrefix
  : SIPrefix;

export declare interface Options<S extends ScaleName> {
  maxDecimals?: number | "auto";
  separator?: string;
  unit?: string;
  scale?: S;
  strict?: boolean;
  prefix?: Prefix<S>;
  decimals?: number;
}

export declare interface Info<S extends ScaleName> {
  value: number;
  prefix: Prefix<S>;
  unit?: string;
}

export declare interface ParsedInfo<S extends ScaleName> {
  value: number;
  factor: number;
  prefix: Prefix<S>;
  unit?: string;
}

export declare function humanFormat<S extends ScaleName>(
  value: number,
  opts?: Options<S>
): string;

export declare namespace humanFormat {
  function bytes<S extends ScaleName>(value: number, opts?: Options<S>): string;

  function parse<S extends ScaleName>(str: string, opts?: Options<S>): number;

  namespace parse {
    function raw<S extends ScaleName>(
      str: string,
      opts?: Options<S>
    ): ParsedInfo<S>;
  }

  namespace Scale {
    function create<S extends ScaleName>(prefixesList: Array<string>, base: number, initExp: number): S
  }

  function raw<S extends ScaleName>(value: number, opts?: Options<S>): Info<S>;

  export { bytes, parse, raw, Prefix, BinaryPrefix, Scale };
}

export default humanFormat;
