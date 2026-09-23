import { Path } from "path-class";

/**
 * From `imgcat`:
 *
 * N      character cells
 * Npx    pixels
 * N%     percent of the session's width or height
 * auto   the image's inherent size will be used to determine an appropriate dimension
 *
 */
export type Dimension = number | `${number}%` | `${number}px` | "auto";

export type PrintInlineImageOptions = {
  width?: Dimension;
  height?: Dimension;
  preserveAspectRatio?: boolean;
  type?: string;
};

const DEFAULTS: Required<PrintInlineImageOptions> = {
  width: "auto",
  height: "auto",
  preserveAspectRatio: true,
  type: "auto",
};

export async function printInlineImage(
  image: string | Path | ArrayBufferLike,
  // TODO: validation?
  options?: PrintInlineImageOptions,
) {
  const arrayBuffer =
    typeof image === "string" || image instanceof Path
      ? (await new Path(image).read()).buffer
      : image;
  const base64 = new Uint8Array(arrayBuffer).toBase64();

  const optionsToSerialize = {
    inline: 1,
    width: options?.width ?? DEFAULTS.width,
    height: options?.height ?? DEFAULTS.height,
    type: options?.type ?? DEFAULTS.type,
    preserveAspectRatio:
      (options?.preserveAspectRatio ?? DEFAULTS.preserveAspectRatio) ? 1 : 0,
    size: arrayBuffer.byteLength,
  };
  const serializedOptions = Object.entries(optionsToSerialize)
    .map(([k, v]) => `${k}=${v}`)
    .join(";");

  process.stdout.write(`\x1b]1337;File=${serializedOptions}:${base64}\x07\n`);
}
