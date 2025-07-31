import { RequestHandler } from "express";

// Mock projects database
const projects: Array<{
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  department: string;
  year: string;
  category: string;
  level: string;
  tags: string[];
  features?: string;
  supervisor?: string;
  collaborators?: string;
  githubRepo?: string;
  deployLink?: string;
  githubId?: string;
  gmailId?: string;
  views: number;
  rating: number;
  ratings: Array<{ userId: string; rating: number }>;
  files: Array<{ type: string; name: string; url: string }>;
  facultyValidation: "pending" | "approved" | "disapproved";
  facultyComments?: string;
  createdAt: string;
  updatedAt: string;
}> = [];

// Get all projects with filtering
export const handleGetProjects: RequestHandler = (req, res) => {
  try {
    const {
      year,
      department,
      category,
      search,
      sortBy = "recent",
      limit = "20",
      offset = "0",
    } = req.query;

    let filteredProjects = [...projects];

    // Apply filters
    if (year && year !== "all") {
      filteredProjects = filteredProjects.filter((p) => p.year === year);
    }

    if (department && department !== "all") {
      filteredProjects = filteredProjects.filter((p) =>
        p.department
          .toLowerCase()
          .includes((department as string).toLowerCase()),
      );
    }

    if (category && category !== "all") {
      filteredProjects = filteredProjects.filter(
        (p) => p.category === category,
      );
    }

    if (search) {
      const searchTerm = (search as string).toLowerCase();
      filteredProjects = filteredProjects.filter(
        (p) =>
          p.title.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.author.toLowerCase().includes(searchTerm) ||
          p.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
      );
    }

    // Apply sorting
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
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        break;
    }

    // Apply pagination
    const limitNum = parseInt(limit as string);
    const offsetNum = parseInt(offset as string);
    const paginatedProjects = filteredProjects.slice(
      offsetNum,
      offsetNum + limitNum,
    );

    res.json({
      success: true,
      projects: paginatedProjects,
      total: filteredProjects.length,
      hasMore: offsetNum + limitNum < filteredProjects.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get single project
export const handleGetProject: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const project = projects.find((p) => p.id === id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Create new project
export const handleCreateProject: RequestHandler = (req, res) => {
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
      gmailId,
    } = req.body;

    // In real app, get user ID from JWT token
    const authorId = "123";
    const author = "Gargi Kathait"; // In real app, get from user database

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.push(newProject);

    res.json({
      success: true,
      message: "Project created successfully",
      project: newProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Update project
export const handleUpdateProject: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const projectIndex = projects.findIndex((p) => p.id === id);

    if (projectIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // In real app, check if user owns the project
    const updatedProject = {
      ...projects[projectIndex],
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    projects[projectIndex] = updatedProject;

    res.json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// View project (increment view count)
export const handleViewProject: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const project = projects.find((p) => p.id === id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Increment view count
    project.views += 1;

    res.json({
      success: true,
      message: "View recorded",
      views: project.views,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Faculty validation
export const handleFacultyValidation: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const project = projects.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Update faculty validation
    project.facultyValidation = status;
    project.facultyComments = comments;
    project.updatedAt = new Date().toISOString();

    res.json({
      success: true,
      message: "Faculty validation updated successfully",
      project,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Rate project
export const handleRateProject: RequestHandler = (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;
    const userId = "1"; // In real app, get from JWT token

    const project = projects.find((p) => p.id === id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Check if user already rated
    const existingRatingIndex = project.ratings.findIndex(
      (r) => r.userId === userId,
    );

    if (existingRatingIndex >= 0) {
      // Update existing rating
      project.ratings[existingRatingIndex].rating = rating;
    } else {
      // Add new rating
      project.ratings.push({ userId, rating });
    }

    // Recalculate average rating
    const totalRating = project.ratings.reduce((sum, r) => sum + r.rating, 0);
    project.rating =
      Math.round((totalRating / project.ratings.length) * 10) / 10;

    res.json({
      success: true,
      message: "Rating submitted successfully",
      rating: project.rating,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get projects by year statistics
export const handleGetProjectStats: RequestHandler = (req, res) => {
  try {
    const stats = {
      byYear: {} as Record<string, number>,
      byDepartment: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      total: projects.length,
      totalViews: projects.reduce((sum, p) => sum + p.views, 0),
    };

    projects.forEach((project) => {
      // By year
      stats.byYear[project.year] = (stats.byYear[project.year] || 0) + 1;

      // By department
      stats.byDepartment[project.department] =
        (stats.byDepartment[project.department] || 0) + 1;

      // By category
      stats.byCategory[project.category] =
        (stats.byCategory[project.category] || 0) + 1;
    });

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get available years
export const handleGetAvailableYears: RequestHandler = (req, res) => {
  try {
    const years = [...new Set(projects.map((p) => p.year))].sort((a, b) =>
      b.localeCompare(a),
    );

    res.json({
      success: true,
      years: years,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
