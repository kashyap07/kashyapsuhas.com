// Type declarations for heic2any package
declare module "heic2any" {
  interface Heic2AnyOptions {
    blob: Blob | File;
    toType?: string;
    quality?: number;
    multiple?: boolean;
  }

  type Heic2AnyResult = Blob | Blob[];

  interface Heic2AnyFunction {
    (options: Heic2AnyOptions): Promise<Heic2AnyResult>;
  }

  const heic2any: Heic2AnyFunction;
  export default heic2any;
}
