import path from "path";
import "dotenv/config";
import * as express from "express";
import express__default from "express";
import cors from "cors";
const handleDemo = (req, res) => {
  const response = {
    message: "Hello from Express server"
  };
  res.status(200).json(response);
};
const users = [
  {
    id: "1",
    email: "testuser@gmail.com",
    password: "testuser@123",
    // In real app, this would be hashed
    firstName: "Test",
    lastName: "User",
    rollNumber: "XXERWCSXXX",
    department: "CSE",
    semester: "5",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  }
];
const validateRollNumber = (rollNumber) => {
  const rollNumberPattern = /^\d{2}ERW[A-Z]{2,3}\d{3}$/;
  return rollNumberPattern.test(rollNumber.toUpperCase());
};
const handleRegister = (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      rollNumber,
      department,
      semester,
      password
    } = req.body;
    if (!firstName || !lastName || !email || !rollNumber || !department || !semester || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }
    if (!validateRollNumber(rollNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roll number format. Must be like: 23ERWCS028"
      });
    }
    const existingUser = users.find(
      (user) => user.email === email || user.rollNumber === rollNumber.toUpperCase()
    );
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or roll number already exists"
      });
    }
    const newUser = {
      id: Date.now().toString(),
      email,
      password,
      // In real app, hash this password
      firstName,
      lastName,
      rollNumber: rollNumber.toUpperCase(),
      department,
      semester,
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    users.push(newUser);
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleLogin = (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }
    const user = users.find(
      (u) => u.email === email && u.password === password
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }
    if (!user.rollNumber || !validateRollNumber(user.rollNumber)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Valid RCEW roll number required."
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token: "mock-jwt-token"
      // In real app, generate actual JWT
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleProfile = (req, res) => {
  try {
    const userId = "1";
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleUploadPhoto = (req, res) => {
  try {
    const { photo } = req.body;
    const userId = "1";
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }
    user.profilePhoto = photo;
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: "Profile photo updated successfully",
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const projects = [];
const handleGetProjects = (req, res) => {
  try {
    const {
      year,
      department,
      category,
      search,
      sortBy = "recent",
      limit = "20",
      offset = "0"
    } = req.query;
    let filteredProjects = [...projects];
    if (year && year !== "all") {
      filteredProjects = filteredProjects.filter((p) => p.year === year);
    }
    if (department && department !== "all") {
      filteredProjects = filteredProjects.filter(
        (p) => p.department.toLowerCase().includes(department.toLowerCase())
      );
    }
    if (category && category !== "all") {
      filteredProjects = filteredProjects.filter(
        (p) => p.category === category
      );
    }
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredProjects = filteredProjects.filter(
        (p) => p.title.toLowerCase().includes(searchTerm) || p.description.toLowerCase().includes(searchTerm) || p.author.toLowerCase().includes(searchTerm) || p.tags.some((tag) => tag.toLowerCase().includes(searchTerm))
      );
    }
    switch (sortBy) {
      case "popular":
        filteredProjects.sort((a, b) => b.views - a.views);
        break;
      case "rating":
        filteredProjects.sort((a, b) => b.rating - a.rating);
        break;
      case "year":
        filteredProjects.sort((a, b) => b.year.localeCompare(a.year));
        break;
      case "recent":
      default:
        filteredProjects.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
    }
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedProjects = filteredProjects.slice(
      offsetNum,
      offsetNum + limitNum
    );
    res.json({
      success: true,
      projects: paginatedProjects,
      total: filteredProjects.length,
      hasMore: offsetNum + limitNum < filteredProjects.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleGetProject = (req, res) => {
  try {
    const { id } = req.params;
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    res.json({
      success: true,
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleCreateProject = (req, res) => {
  try {
    const {
      title,
      description,
      department,
      year,
      category,
      level,
      tags,
      features,
      supervisor,
      collaborators,
      githubRepo,
      deployLink,
      githubId,
      gmailId
    } = req.body;
    const authorId = "123";
    const author = "Gargi Kathait";
    const newProject = {
      id: Date.now().toString(),
      title,
      description,
      author,
      authorId,
      department,
      year,
      category,
      level,
      tags: tags || [],
      features,
      supervisor,
      collaborators,
      githubRepo,
      deployLink,
      githubId,
      gmailId,
      views: 0,
      rating: 0,
      ratings: [],
      files: [],
      facultyValidation: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    projects.push(newProject);
    res.json({
      success: true,
      message: "Project created successfully",
      project: newProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleUpdateProject = (req, res) => {
  try {
    const { id } = req.params;
    const projectIndex = projects.findIndex((p) => p.id === id);
    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    const updatedProject = {
      ...projects[projectIndex],
      ...req.body,
      updatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    projects[projectIndex] = updatedProject;
    res.json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleViewProject = (req, res) => {
  try {
    const { id } = req.params;
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    project.views += 1;
    res.json({
      success: true,
      message: "View recorded",
      views: project.views
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleFacultyValidation = (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    project.facultyValidation = status;
    project.facultyComments = comments;
    project.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
    res.json({
      success: true,
      message: "Faculty validation updated successfully",
      project
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleRateProject = (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = "1";
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }
    const existingRatingIndex = project.ratings.findIndex(
      (r) => r.userId === userId
    );
    if (existingRatingIndex >= 0) {
      project.ratings[existingRatingIndex].rating = rating;
    } else {
      project.ratings.push({ userId, rating });
    }
    const totalRating = project.ratings.reduce((sum, r) => sum + r.rating, 0);
    project.rating = Math.round(totalRating / project.ratings.length * 10) / 10;
    res.json({
      success: true,
      message: "Rating submitted successfully",
      rating: project.rating
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleGetProjectStats = (req, res) => {
  try {
    const stats = {
      byYear: {},
      byDepartment: {},
      byCategory: {},
      total: projects.length,
      totalViews: projects.reduce((sum, p) => sum + p.views, 0)
    };
    projects.forEach((project) => {
      stats.byYear[project.year] = (stats.byYear[project.year] || 0) + 1;
      stats.byDepartment[project.department] = (stats.byDepartment[project.department] || 0) + 1;
      stats.byCategory[project.category] = (stats.byCategory[project.category] || 0) + 1;
    });
    res.json({
      success: true,
      stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
const handleGetAvailableYears = (req, res) => {
  try {
    const years = [...new Set(projects.map((p) => p.year))].sort(
      (a, b) => b.localeCompare(a)
    );
    res.json({
      success: true,
      years
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
function createServer() {
  const app2 = express__default();
  app2.use(cors());
  app2.use(express__default.json());
  app2.use(express__default.urlencoded({ extended: true }));
  app2.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });
  app2.get("/api/demo", handleDemo);
  app2.post("/api/auth/register", handleRegister);
  app2.post("/api/auth/login", handleLogin);
  app2.get("/api/auth/profile", handleProfile);
  app2.post("/api/auth/upload-photo", handleUploadPhoto);
  app2.get("/api/projects", handleGetProjects);
  app2.get("/api/projects/stats", handleGetProjectStats);
  app2.get("/api/projects/years", handleGetAvailableYears);
  app2.get("/api/projects/:id", handleGetProject);
  app2.post("/api/projects", handleCreateProject);
  app2.put("/api/projects/:id", handleUpdateProject);
  app2.post("/api/projects/:id/view", handleViewProject);
  app2.post("/api/projects/:id/rate", handleRateProject);
  app2.post("/api/projects/:id/faculty-validation", handleFacultyValidation);
  return app2;
}
const app = createServer();
const port = process.env.PORT || 3e3;
const __dirname = import.meta.dirname;
const distPath = path.join(__dirname, "../spa");
app.use(express.static(distPath));
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/") || req.path.startsWith("/health")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(distPath, "index.html"));
});
app.listen(port, () => {
  console.log(`🚀 Fusion Starter server running on port ${port}`);
  console.log(`📱 Frontend: http://localhost:${port}`);
  console.log(`🔧 API: http://localhost:${port}/api`);
});
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});
process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
//# sourceMappingURL=node-build.mjs.map
