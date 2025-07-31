import { RequestHandler } from "express";

// Mock user database (in a real app, this would be a proper database)
const users: Array<{
  id: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  rollNumber: string;
  department: string;
  semester: string;
  profilePhoto?: string;
  githubId?: string;
  gmailId?: string;
  createdAt: string;
}> = [
  {
    id: "1",
    email: "testuser@gmail.com",
    password: "testuser@123", // In real app, this would be hashed
    firstName: "Test",
    lastName: "User",
    rollNumber: "XXERWCSXXX",
    department: "CSE",
    semester: "5",
    createdAt: new Date().toISOString(),
  },
];

// Roll number validation function
const validateRollNumber = (rollNumber: string): boolean => {
  // Roll number format: 23ERWCS028 (2 digits + ERW + 2-3 chars department + 3 digits)
  const rollNumberPattern = /^\d{2}ERW[A-Z]{2,3}\d{3}$/;
  return rollNumberPattern.test(rollNumber.toUpperCase());
};

// Register new user
export const handleRegister: RequestHandler = (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      rollNumber,
      department,
      semester,
      password,
    } = req.body;

    // Validate required fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !rollNumber ||
      !department ||
      !semester ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Validate roll number format
    if (!validateRollNumber(rollNumber)) {
      return res.status(400).json({
        success: false,
        message: "Invalid roll number format. Must be like: 23ERWCS028",
      });
    }

    // Check if user already exists
    const existingUser = users.find(
      (user) =>
        user.email === email || user.rollNumber === rollNumber.toUpperCase(),
    );
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or roll number already exists",
      });
    }

    // Create new user
    const newUser = {
      id: Date.now().toString(),
      email,
      password, // In real app, hash this password
      firstName,
      lastName,
      rollNumber: rollNumber.toUpperCase(),
      department,
      semester,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    res.json({
      success: true,
      message: "User registered successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Login user
export const handleLogin: RequestHandler = (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = users.find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Validate that user has a proper roll number
    if (!user.rollNumber || !validateRollNumber(user.rollNumber)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Valid RCEW roll number required.",
      });
    }

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token: "mock-jwt-token", // In real app, generate actual JWT
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Get user profile
export const handleProfile: RequestHandler = (req, res) => {
  try {
    // In real app, verify JWT token from Authorization header
    const userId = "1"; // Mock user ID

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Upload profile photo
export const handleUploadPhoto: RequestHandler = (req, res) => {
  try {
    const { photo } = req.body;
    const userId = "1"; // In real app, get from JWT token

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update user's profile photo
    user.profilePhoto = photo;

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      success: true,
      message: "Profile photo updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
