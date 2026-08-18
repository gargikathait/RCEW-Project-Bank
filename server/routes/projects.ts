import fs from "fs";
import path from "path";
import crypto from "crypto";
import { RequestHandler } from "express";
import multer from "multer";
import { Types } from "mongoose";
import { connectDatabase } from "../config/database";
import { authenticate, optionalAuthenticate, requireRole } from "../middleware/auth";
import { FacultyValidationStatus, Project } from "../models/Project";
import { User } from "../models/User";
import { emitProjectStatusUpdate } from "../realtime";

const uploadDir = path.resolve(process.cwd(), "server/uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== "application/pdf") return cb(new Error("Only PDF files are allowed"));
    cb(null, true);
  },
});

const asyncHandler = (handler: RequestHandler): RequestHandler => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
const isObjectId = (id: string) => Types.ObjectId.isValid(id);
const isOwnerOrAdmin = (project: { authorId: unknown }, user: Express.Request["user"]) => user?.role === "admin" || project.authorId?.toString() === user?.id;

export const handleGetProjects: RequestHandler = asyncHandler(async (req, res) => {
  await connectDatabase();
  const { year, department, category, search, sortBy = "recent", limit = "20", offset = "0" } = req.query;
  const query: Record<string, unknown> = {};
  if (year && year !== "all") query.year = year;
  if (department && department !== "all") query.department = { $regex: String(department), $options: "i" };
  if (category && category !== "all") query.category = category;
  if (search) query.$or = ["title", "description", "author", "tags"].map((field) => ({ [field]: { $regex: String(search), $options: "i" } }));
  const sort: Record<string, 1 | -1> = sortBy === "popular" ? { views: -1 } : sortBy === "rating" ? { rating: -1 } : sortBy === "year" ? { year: -1 } : { createdAt: -1 };
  const limitNum = Math.min(Math.max(parseInt(String(limit), 10) || 20, 1), 100);
  const offsetNum = Math.max(parseInt(String(offset), 10) || 0, 0);
  const [projects, total] = await Promise.all([Project.find(query).sort(sort).skip(offsetNum).limit(limitNum), Project.countDocuments(query)]);
  res.json({ success: true, projects: projects.map((p) => p.toJSON()), total, hasMore: offsetNum + limitNum < total });
});


export const handleGetProject: RequestHandler = asyncHandler(async (req, res) => {
  await connectDatabase();
  if (!isObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid project ID" });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  res.json({ success: true, project: project.toJSON() });
});

export const handleCreateProject: RequestHandler[] = [authenticate, asyncHandler(async (req, res) => {
  await connectDatabase();
  const user = await User.findById(req.user!.id);
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  const { title, description, department, year, category, level, tags, features, supervisor, collaborators, githubRepo, deployLink, githubId, gmailId } = req.body;
  if (!title || !description || !department || !year || !category || !level) return res.status(400).json({ success: false, message: "Missing required project fields" });
  const project = await Project.create({ title, description, department, year, category, level, tags: Array.isArray(tags) ? tags : [], features, supervisor, collaborators, githubRepo, deployLink, githubId, gmailId, author: user.name || `${user.firstName} ${user.lastName}`, authorId: user._id, facultyValidation: "pending" });
  res.status(201).json({ success: true, message: "Project created successfully", project: project.toJSON() });
})];

export const handleUpdateProject: RequestHandler[] = [authenticate, asyncHandler(async (req, res) => {
  await connectDatabase();
  if (!isObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid project ID" });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  if (!isOwnerOrAdmin(project, req.user)) return res.status(403).json({ success: false, message: "You can update only your own projects" });
  const allowed = ["title", "description", "department", "year", "category", "level", "tags", "features", "supervisor", "collaborators", "githubRepo", "deployLink", "githubId", "gmailId"];
  for (const key of allowed) if (key in req.body) project.set(key, req.body[key]);
  project.facultyValidation = "pending";
  await project.save();
  res.json({ success: true, message: "Project updated successfully", project: project.toJSON() });
})];

export const handleUploadProjectFile: RequestHandler[] = [authenticate, upload.single("file"), asyncHandler(async (req, res) => {
  await connectDatabase();
  if (!isObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid project ID" });
  if (!req.file) return res.status(400).json({ success: false, message: "PDF file is required" });
  const project = await Project.findById(req.params.id).select("+files.path");
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  if (!isOwnerOrAdmin(project, req.user)) return res.status(403).json({ success: false, message: "You can upload files only to your own projects" });
  project.files.push({ type: "documentation", name: req.file.originalname, originalName: req.file.originalname, storageName: req.file.filename, path: req.file.path, url: `/api/projects/${project.id}/files/${req.file.filename}`, size: req.file.size, mimeType: req.file.mimetype, uploadedBy: new Types.ObjectId(req.user!.id), uploadedAt: new Date() });
  await project.save();
  res.status(201).json({ success: true, message: "PDF uploaded successfully", project: project.toJSON() });
})];

export const handleServeProjectFile: RequestHandler[] = [authenticate, asyncHandler(async (req, res) => {
  await connectDatabase();
  if (!isObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid project ID" });
  const project = await Project.findById(req.params.id).select("+files.path");
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  const file = project.files.find((f) => f.storageName === req.params.fileName);
  if (!file) return res.status(404).json({ success: false, message: "File not found" });
  if (project.facultyValidation !== "approved" && !isOwnerOrAdmin(project, req.user) && !["faculty", "admin"].includes(req.user!.role)) return res.status(403).json({ success: false, message: "Not authorized to access this file" });
  res.type("application/pdf").sendFile(path.resolve(file.path));
})];

export const handleViewProject: RequestHandler[] = [optionalAuthenticate, asyncHandler(async (req, res) => {
  await connectDatabase();
  if (!isObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid project ID" });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sessionId = req.user ? undefined : (req.headers["x-view-session"] as string) || req.ip;
  const duplicate = project.viewRecords.some((v) => v.viewedAt > since && (req.user ? v.userId?.toString() === req.user.id : v.sessionId === sessionId));
  if (!duplicate) { project.views += 1; project.viewRecords.push({ userId: req.user ? new Types.ObjectId(req.user.id) : undefined, sessionId, viewedAt: new Date() }); await project.save(); }
  res.json({ success: true, message: duplicate ? "View already counted recently" : "View recorded", views: project.views });
})];

export const handleRateProject: RequestHandler[] = [authenticate, asyncHandler(async (req, res) => {
  await connectDatabase();
  const rating = Number(req.body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  const existing = project.ratings.find((r) => r.userId.toString() === req.user!.id);
  if (existing) existing.rating = rating; else project.ratings.push({ userId: new Types.ObjectId(req.user!.id), rating, createdAt: new Date() });
  await project.save();
  res.json({ success: true, message: "Rating saved", rating: project.rating });
})];

export const handleFacultyValidation: RequestHandler[] = [authenticate, requireRole("faculty", "admin"), asyncHandler(async (req, res) => {
  await connectDatabase();
  const { status, comments } = req.body as { status: FacultyValidationStatus; comments?: string };
  if (!["pending", "approved", "disapproved"].includes(status)) return res.status(400).json({ success: false, message: "Invalid validation status" });
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ success: false, message: "Project not found" });
  if (project.authorId.toString() === req.user!.id) return res.status(403).json({ success: false, message: "Faculty cannot approve their own project" });
  project.facultyValidation = status;
  project.facultyComments = comments;
  project.validatedBy = new Types.ObjectId(req.user!.id);
  project.validatedAt = new Date();
  await project.save();
  emitProjectStatusUpdate(project.id, project.facultyValidation, project.facultyComments);
  res.json({ success: true, message: "Project validation updated", project: project.toJSON() });
})];
  
export const handleGetFacultyProjects: RequestHandler[] = [
  authenticate,
  requireRole("faculty", "admin"),
  asyncHandler(async (_req, res) => {
    await connectDatabase();

    const projects = await Project.find({
      facultyValidation: "pending",
    })
      .sort({ createdAt: -1 })
      .populate("authorId", "name email department rollNumber");

    res.json({
      success: true,
      projects: projects.map((project) => project.toJSON()),
    });
  }),
];

export const handleGetProjectStats: RequestHandler = asyncHandler(async (_req, res) => {
  await connectDatabase();
  const [byYear, byDepartment, byCategory, total, totalDownloads] = await Promise.all([
    Project.aggregate([{ $group: { _id: "$year", count: { $sum: 1 } } }]),
    Project.aggregate([{ $group: { _id: "$department", count: { $sum: 1 } } }]),
    Project.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
    Project.countDocuments(),
    Project.aggregate([{ $group: { _id: null, downloads: { $sum: "$downloads" } } }]),
  ]);
  const toRecord = (rows: Array<{ _id: string; count: number }>) => Object.fromEntries(rows.map((r) => [r._id, r.count]));
  res.json({ success: true, stats: { byYear: toRecord(byYear), byDepartment: toRecord(byDepartment), byCategory: toRecord(byCategory), total, totalDownloads: totalDownloads[0]?.downloads ?? 0 } });
});

export const handleGetAvailableYears: RequestHandler = asyncHandler(async (_req, res) => {
  await connectDatabase();
  res.json({ success: true, years: await Project.distinct("year") });
});

export const handleGetAnalytics: RequestHandler[] = [authenticate, requireRole("admin"), asyncHandler(async (_req, res) => {
  await connectDatabase();
  const activeSince = new Date(Date.now() - 15 * 60 * 1000);
  const [totalUsers, activeUsers, totalProjects, totalUploads, totalViews, approvedProjects, pendingProjects, disapprovedProjects] = await Promise.all([
    User.countDocuments(), User.countDocuments({ lastActiveAt: { $gte: activeSince } }), Project.countDocuments(), Project.aggregate([{ $project: { count: { $size: "$files" } } }, { $group: { _id: null, total: { $sum: "$count" } } }]), Project.aggregate([{ $group: { _id: null, total: { $sum: "$views" } } }]), Project.countDocuments({ facultyValidation: "approved" }), Project.countDocuments({ facultyValidation: "pending" }), Project.countDocuments({ facultyValidation: "disapproved" }),
  ]);
  res.json({ success: true, analytics: { totalUsers, activeUsers, totalProjects, totalUploads: totalUploads[0]?.total ?? 0, totalViews: totalViews[0]?.total ?? 0, approvedProjects, pendingProjects, disapprovedProjects, activeUserWindowMinutes: 15 } });
})];
