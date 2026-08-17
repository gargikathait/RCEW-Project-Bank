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


declare module "mongoose" {
  export namespace Types { class ObjectId { constructor(value?: string); static isValid(value: string): boolean; toString(): string; } }
  export type HydratedDocument<T, M = {}> = T & M & { _id: any; id: string; save(): Promise<void>; toJSON(): any; isModified(path?: string): boolean; set(path: string, value: unknown): void };
  export interface Model<T, Q = {}, M = {}> {
    new(doc?: Partial<T>): HydratedDocument<T, M>;
    find(query?: unknown): any;
    findById(id: string): any;
    findOne(query: unknown): any;
    findByIdAndUpdate(id: string, update: unknown, opts?: unknown): any;
    create(doc: Partial<T>): Promise<HydratedDocument<T, M>>;
    countDocuments(query?: unknown): Promise<number>;
    aggregate(pipeline?: unknown[]): Promise<any[]>;
    distinct(field: string): Promise<string[]>;
  }
  export class Schema<T = any, M = any, Methods = any> {
    constructor(definition?: unknown, options?: unknown);
    index(fields: unknown, options?: unknown): void;
    pre(name: string, fn: Function): void;
    methods: Methods & Record<string, Function>;
    static Types: { ObjectId: unknown };
  }
  export function model<T, M = Model<T>>(name: string, schema?: Schema<T, any, any>): M;
  export const models: Record<string, unknown>;
  export function connect(uri: string, options?: unknown): Promise<typeof import("mongoose")>;
  export const connection: { readyState: number; close(): Promise<void> };
  const mongoose: { models: typeof models; model: typeof model; connect: typeof connect; connection: typeof connection; Schema: typeof Schema; Types: { ObjectId: typeof Types.ObjectId } };
  export default mongoose;
}
