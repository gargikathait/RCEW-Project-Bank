import { RequestHandler } from "express";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { connectDatabase } from "../config/database";
import { authenticate, getJwtSecret } from "../middleware/auth";
import { User } from "../models/User";
import { PasswordResetToken } from "../models/PasswordResetToken";

const validateRollNumber = (rollNumber: string): boolean => /^\d{2}ERW[A-Z]{2,3}\d{3}$/.test(rollNumber.toUpperCase());
const safeMessage = (error: unknown) => error instanceof Error ? error.message : "Internal server error";

export const handleRegister: RequestHandler = async (req, res) => {
  try {
    await connectDatabase();
    const { firstName, lastName, email, rollNumber, department, semester, year, password, confirmPassword } = req.body;
    if (!firstName || !lastName || !email || !rollNumber || !department || !semester || !password) return res.status(400).json({ success: false, message: "All fields are required" });
    if (password !== confirmPassword) return res.status(400).json({ success: false, message: "Passwords do not match" });
    if (!validateRollNumber(rollNumber)) return res.status(400).json({ success: false, message: "Invalid roll number format. Must be like: 23ERWCS028" });
    const existing = await User.findOne({ $or: [{ email: email.toLowerCase() }, { rollNumber: rollNumber.toUpperCase() }] });
    if (existing) return res.status(409).json({ success: false, message: existing.email === email.toLowerCase() ? "Email is already registered" : "Roll number is already registered" });
    const user = await User.create({ firstName, lastName, name: `${firstName} ${lastName}`, email, rollNumber, department, semester, year: year ?? semester, password, role: "student", lastActiveAt: new Date() });
    res.status(201).json({ success: true, message: "User registered successfully", user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

export const handleLogin: RequestHandler = async (req, res) => {
  try {
    await connectDatabase();
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password are required" });
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user || !(await user.comparePassword(password))) return res.status(401).json({ success: false, message: "Invalid email or password" });
    user.lastActiveAt = new Date();
    await user.save();
    const token = jwt.sign({ id: user.id, role: user.role }, getJwtSecret(), { expiresIn: "7d" });
    res.json({ success: true, message: "Login successful", user: user.toJSON(), token });
  } catch (error) {
    res.status(500).json({ success: false, message: safeMessage(error) });
  }
};

export const handleProfile: RequestHandler[] = [authenticate, async (req, res) => {
  await connectDatabase();
  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, user: user.toJSON() });
}];

export const handleUploadPhoto: RequestHandler[] = [authenticate, async (req, res) => {
  await connectDatabase();
  const { photo } = req.body;
  if (typeof photo !== "string" || !photo.startsWith("data:image/") || photo.length > 7_000_000) return res.status(400).json({ success: false, message: "Valid image data under 5MB is required" });
  const user = await User.findByIdAndUpdate(req.user!.id, { profilePhoto: photo, lastActiveAt: new Date() }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, message: "Profile photo updated", user: user.toJSON() });
}];
export const handleForgotPassword: RequestHandler = async (req, res) => {
  try {
    await connectDatabase();

    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });

    // Do not reveal whether an account exists.
    if (!user) {
      return res.json({
        success: true,
        message:
          "If an account exists with this email, password reset instructions have been sent.",
      });
    }

    // Invalidate previous unused tokens for this user.
    await PasswordResetToken.updateMany(
      {
        userId: user._id,
        used: false,
      },
      {
        $set: { used: true },
      },
    );

    // Generate a cryptographically secure random token.
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only the hash in MongoDB.
    const tokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Token is valid for 15 minutes.
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
      used: false,
    });

    const appUrl =
      process.env.APP_URL?.replace(/\/$/, "") ||
      "http://localhost:5173";

    const resetUrl = `${appUrl}/reset-password?token=${rawToken}`;

    /*
     * DEVELOPMENT ONLY:
     *
     * We return the reset URL so you can test the complete flow locally.
     *
     * In production, this URL MUST be sent through your email provider
     * instead of being returned to the browser.
     */
    res.json({
      success: true,
      message:
        "If an account exists with this email, password reset instructions have been sent.",
      ...(process.env.NODE_ENV !== "production" && {
        resetUrl,
      }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: safeMessage(error),
    });
  }
};
export const handleResetPassword: RequestHandler = async (req, res) => {
  try {
    await connectDatabase();

    const { token, password, confirmPassword } = req.body;

    if (!token || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Token, password and confirm password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const tokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const resetToken = await PasswordResetToken.findOne({
      tokenHash,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    const user = await User.findById(resetToken.userId).select("+password");

    if (!user || !user.isActive) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // UserSchema's pre-save hook hashes this password.
    user.password = password;
    user.lastActiveAt = new Date();

    await user.save();

    // Make the token unusable immediately.
    resetToken.used = true;
    await resetToken.save();

    // Invalidate any other outstanding reset tokens.
    await PasswordResetToken.updateMany(
      {
        userId: user._id,
        used: false,
        _id: { $ne: resetToken._id },
      },
      {
        $set: { used: true },
      },
    );

    res.json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: safeMessage(error),
    });
  }
};