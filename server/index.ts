import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  handleRegister,
  handleLogin,
  handleProfile,
  handleUploadPhoto,
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
} from "./routes/projects";

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

  app.get("/api/demo", handleDemo);

  // Authentication routes
  app.post("/api/auth/register", handleRegister);
  app.post("/api/auth/login", handleLogin);
  app.get("/api/auth/profile", handleProfile);
  app.post("/api/auth/upload-photo", handleUploadPhoto);

  // Projects routes
  app.get("/api/projects", handleGetProjects);
  app.get("/api/projects/stats", handleGetProjectStats);
  app.get("/api/projects/years", handleGetAvailableYears);
  app.get("/api/projects/:id", handleGetProject);
  app.post("/api/projects", handleCreateProject);
  app.put("/api/projects/:id", handleUpdateProject);
  app.post("/api/projects/:id/view", handleViewProject);
  app.post("/api/projects/:id/rate", handleRateProject);
  app.post("/api/projects/:id/faculty-validation", handleFacultyValidation);

  return app;
}
