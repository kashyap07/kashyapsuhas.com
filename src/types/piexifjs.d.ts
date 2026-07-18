// minimal shim: piexifjs ships no types. we only touch load/dump/insert and
// the ImageIFD.Orientation tag id.
declare module "piexifjs" {
  type ExifDict = {
    "0th"?: Record<number, unknown>;
    Exif?: Record<number, unknown>;
    GPS?: Record<number, unknown>;
    Interop?: Record<number, unknown>;
    "1st"?: Record<number, unknown>;
    thumbnail?: string | null;
  };
  const piexif: {
    ImageIFD: { Orientation: number; [k: string]: number };
    load(jpegData: string): ExifDict;
    dump(exif: ExifDict): string;
    insert(exifBytes: string, jpegData: string): string;
    remove(jpegData: string): string;
  };
  export default piexif;
}
