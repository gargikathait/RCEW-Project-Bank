import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import {
  handleRegister,
  handleLogin,
  handleProfile,
  handleUploadPhoto,
  handleForgotPassword,
  handleResetPassword,
} from "./routes/auth";
import {
  handleGetProjects,
  handleGetProject,
  handleCreateProject,
  handleUpdateProject,
  handleViewProject,
  handleRateProject,
  handleFacultyValidation,
  handleGetProjectStats,
  handleGetAvailableYears,
  handleUploadProjectFile,
  handleServeProjectFile,
  handleGetAnalytics,
} from "./routes/projects";
import { handleStatusEvents } from "./realtime";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });


  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.post("/api/auth/forgot-password", handleForgotPassword);
  app.post("/api/auth/reset-password", handleResetPassword);
  app.get("/api/auth/profile", handleProfile);
  app.post("/api/auth/upload-photo", handleUploadPhoto);

  // Projects routes
  app.get("/api/projects", handleGetProjects);
  app.get("/api/projects/stats", handleGetProjectStats);
  app.get("/api/analytics", handleGetAnalytics);
  app.get("/api/projects/status/events", handleStatusEvents);
  app.get("/api/projects/years", handleGetAvailableYears);
  app.get("/api/projects/:id", handleGetProject);
  app.post("/api/projects", handleCreateProject);
  app.put("/api/projects/:id", handleUpdateProject);
  app.post("/api/projects/:id/view", handleViewProject);
  app.post("/api/projects/:id/files", handleUploadProjectFile);
  app.get("/api/projects/:id/files/:fileName", handleServeProjectFile);
  app.post("/api/projects/:id/rate", handleRateProject);
  app.post("/api/projects/:id/faculty-validation", handleFacultyValidation);

  app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ success: false, message: error.code === "LIMIT_FILE_SIZE" ? "File must be 10MB or smaller" : error.message });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    res.status(500).json({ success: false, message });
  });

  return app;
}
