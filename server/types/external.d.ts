declare module "bcryptjs" {
  const bcrypt: { hash(value: string, rounds: number): Promise<string>; compare(value: string, hash: string): Promise<boolean> };
  export default bcrypt;
}

declare module "jsonwebtoken" {
  export interface JwtPayload { exp?: number; iat?: number; [key: string]: unknown }
  type SignOptions = { expiresIn?: string | number };
  export function sign(payload: string | object | Buffer, secret: string, options?: SignOptions): string;
  export function verify(token: string, secret: string): string | JwtPayload;
  const jwt: { sign: typeof sign; verify: typeof verify };
  export default jwt;
}

declare module "multer" {
  import { RequestHandler } from "express";
  namespace multer {
    class MulterError extends Error { code: string }
  }
  interface File { originalname: string; filename: string; path: string; size: number; mimetype: string }
  interface Options {
    storage?: unknown;
    limits?: { fileSize?: number };
    fileFilter?: (req: unknown, file: File, cb: (error: Error | null, acceptFile?: boolean) => void) => void;
  }
  interface Instance { single(fieldName: string): RequestHandler }
  function multer(options?: Options): Instance;
  namespace multer { function diskStorage(options: { destination: (req: unknown, file: File, cb: (error: Error | null, destination: string) => void) => void; filename: (req: unknown, file: File, cb: (error: Error | null, filename: string) => void) => void }): unknown }
  export = multer;
}

declare namespace Express { namespace Multer { interface File { originalname: string; filename: string; path: string; size: number; mimetype: string } } interface Request { file?: Multer.File } }
