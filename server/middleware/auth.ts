import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Types } from "mongoose";
import { connectDatabase } from "../config/database";
import { UserRole, User } from "../models/User";

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; role: UserRole };
    }
  }
}

interface AuthPayload extends JwtPayload {
  id: string;
  role: UserRole;
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is required. Set it in the environment; do not commit secrets.");
  return secret;
}

export const authenticate: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return res.status(401).json({ success: false, message: "Authentication required" });
    const payload = jwt.verify(header.slice(7), getJwtSecret()) as AuthPayload;
    if (!payload.id || !Types.ObjectId.isValid(payload.id) || !["student", "faculty", "admin"].includes(payload.role)) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    await connectDatabase();
    const user = await User.findByIdAndUpdate(payload.id, { lastActiveAt: new Date() }, { new: true }).select("role isActive");
    if (!user || !user.isActive) return res.status(401).json({ success: false, message: "Invalid token" });
    req.user = { id: user.id, role: user.role };
    next();
  } catch {
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const optionalAuthenticate: RequestHandler = async (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return next();
  return authenticate(req, _res, next);
};

export function requireRole(...roles: UserRole[]): RequestHandler {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ success: false, message: "Authentication required" });
    if (!roles.includes(req.user.role)) return res.status(403).json({ success: false, message: "Insufficient permissions" });
    next();
  };
}
