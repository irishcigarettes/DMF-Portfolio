declare module "heic-convert" {
  export interface HeicConvertOptions {
    buffer: Buffer | Uint8Array | ArrayBuffer;
    format: "JPEG" | "PNG";
    quality?: number;
  }

  // The library returns a Buffer in Node environments.
  export default function heicConvert(options: HeicConvertOptions): Promise<Buffer>;
}
