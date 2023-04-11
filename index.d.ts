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

export type Scale<T extends string> = humanFormat.Scale<T>;

export type ScaleLike = Scale<string> | ScaleName;

export type Prefix<S extends ScaleLike> = S extends Scale<infer U>
  ? U
  : S extends "binary"
  ? BinaryPrefix
  : S extends "SI"
  ? SIPrefix
  : never;

export declare interface Options<S extends ScaleLike> {
  maxDecimals?: number | "auto";
  separator?: string;
  unit?: string;
  scale?: S;
  strict?: boolean;
  prefix?: Prefix<S>;
  decimals?: number;
}

export declare interface Info<S extends ScaleLike> {
  value: number;
  prefix: Prefix<S>;
  unit?: string;
}

export declare interface ParsedInfo<S extends ScaleLike> {
  value: number;
  factor: number;
  prefix: Prefix<S>;
  unit?: string;
}

export declare function humanFormat<S extends ScaleLike>(
  value: number,
  opts?: Options<S>
): string;

export declare namespace humanFormat {
  function bytes<S extends ScaleLike>(value: number, opts?: Options<S>): string;

  function parse<S extends ScaleLike>(str: string, opts?: Options<S>): number;

  namespace parse {
    function raw<S extends ScaleLike>(
      str: string,
      opts?: Options<S>
    ): ParsedInfo<S>;
  }

  function raw<S extends ScaleLike>(value: number, opts?: Options<S>): Info<S>;

  class Scale<P extends string> {
    constructor(prefixes: Record<P, number>);
  }

  namespace Scale {
    function create<P extends string>(
      prefixes: P[],
      base: number,
      initExp?: number
    ): Scale<P>;
  }

  export { bytes, parse, raw, Prefix, BinaryPrefix, Scale };
}

export default humanFormat;
