import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { connectDatabase } from "../config/database";
import { authenticate, getJwtSecret } from "../middleware/auth";
import { User } from "../models/User";

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
