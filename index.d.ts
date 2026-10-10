declare module "human-format" {
  function humanFormat<TScale extends humanFormat.ScaleLike = "SI">(
    value: number,
    options?: humanFormat.Options<TScale>
  ): string;

  namespace humanFormat {
    export type BinaryPrefix =
      "" | "Ki" | "Mi" | "Gi" | "Ti" | "Pi" | "Ei" | "Zi" | "Yi";

    export type SIPrefix =
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

    export type ScaleLike = Scale<string> | ScaleName;

    export type Prefix<TScale extends ScaleLike> =
      TScale extends Scale<infer TPrefix>
        ? TPrefix
        : TScale extends "binary"
          ? BinaryPrefix
          : TScale extends "SI"
            ? SIPrefix
            : never;

    export interface Options<TScale extends ScaleLike> {
      maxDecimals?: number | "auto";
      separator?: string;
      unit?: string;
      scale?: TScale;
      strict?: boolean;
      prefix?: Prefix<TScale>;
      decimals?: number;
    }

    export interface Info<TScale extends ScaleLike> {
      value: number;
      prefix: Prefix<TScale>;
      unit?: string;
    }

    export interface ParsedInfo<TScale extends ScaleLike> {
      value: number;
      factor: number;
      prefix: Prefix<TScale>;
      unit?: string;
    }

    export class Scale<TPrefix extends string> {
      constructor(prefixes: Record<TPrefix, number>);
      static create<TPrefix extends string>(
        prefixes: TPrefix[],
        base: number,
        initExp?: number
      ): Scale<TPrefix>;
      findPrefix(value: number): { factor: number; prefix: TPrefix };
      parse(
        str: string,
        strict?: boolean
      ): ParsedInfo<Scale<TPrefix>> | undefined;
    }

    export function bytes<TScale extends ScaleLike = "binary">(
      value: number,
      options?: Options<TScale>
    ): string;

    export function parse<TScale extends ScaleLike = "SI">(
      str: string,
      options?: Options<TScale>
    ): number;

    export namespace parse {
      function raw<TScale extends ScaleLike = "SI">(
        str: string,
        options?: Options<TScale>
      ): ParsedInfo<TScale>;
    }

    export function raw<TScale extends ScaleLike = "SI">(
      value: number,
      options?: Options<TScale>
    ): Info<TScale>;
  }

  export = humanFormat;
}
