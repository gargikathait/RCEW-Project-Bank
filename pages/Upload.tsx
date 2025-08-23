import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload as UploadIcon, FileText, Image, Code, X, LogIn, Github, Globe, Mail } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/UserProfile";
import { CreateProjectRequest } from "@shared/api";

export default function Upload() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    department: "",
    year: "",
    level: "",
    description: "",
    category: "",
    features: "",
    supervisor: "",
    collaborators: "",
    githubRepo: "",
    deployLink: "",
    githubId: "",
    gmailId: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload projects",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, toast]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user) {
      toast({
        title: "Authentication Required",
        description: "Please login to upload projects",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    setLoading(true);

    // Validation
    if (!formData.title || !formData.description || !formData.department || !formData.year) {
      toast({
        title: "Missing Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const projectData: CreateProjectRequest = {
        title: formData.title,
        description: formData.description,
        department: formData.department,
        year: formData.year,
        category: formData.category || "other",
        level: formData.level || "semester",
        tags: tags,
        features: formData.features,
        supervisor: formData.supervisor,
        collaborators: formData.collaborators,
        githubRepo: formData.githubRepo,
        deployLink: formData.deployLink,
        githubId: formData.githubId,
        gmailId: formData.gmailId,
      };

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(projectData),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: "Project Uploaded Successfully",
          description: "Your project has been published and is now available for browsing",
        });
        navigate('/browse');
      } else {
        toast({
          title: "Upload Failed", 
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage as draft
    const draftData = {
      ...formData,
      tags,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem('projectDraft', JSON.stringify(draftData));
    toast({
      title: "Draft Saved",
      description: "Your project has been saved as a draft",
    });
  };

  // Load draft on component mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('projectDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData({
          title: draftData.title || "",
          department: draftData.department || "",
          year: draftData.year || "",
          level: draftData.level || "",
          description: draftData.description || "",
          category: draftData.category || "",
          features: draftData.features || "",
          supervisor: draftData.supervisor || "",
          collaborators: draftData.collaborators || "",
          githubRepo: draftData.githubRepo || "",
          deployLink: draftData.deployLink || "",
          githubId: draftData.githubId || "",
          gmailId: draftData.gmailId || "",
        });
        setTags(draftData.tags || []);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-red-600" />
              Authentication Required
            </CardTitle>
            <CardDescription>
              You need to be logged in to upload projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-red-600 hover:bg-red-700">
              <Link to="/login">Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-4">
                <img 
                  src="https://cdn.builder.io/api/v1/image/assets%2F348b0cf0cd1044f492a3a092345ae992%2F0f1c1f69ae12496285f964f5ac1b8373?format=webp&width=800" 
                  alt="RCEW Logo" 
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">RCEW Project Bank</h1>
                  <p className="text-sm text-gray-600">Upload Project</p>
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                Home
              </Link>
              <Link to="/browse" className="text-gray-700 hover:text-red-600 transition-colors">
                Browse Projects
              </Link>
              <UserProfile />
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Share Your Project</h1>
          <p className="text-gray-600">Help fellow students learn and innovate by sharing your project with the RCEW community</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Fill in the information about your project to help others discover and understand your work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter your project title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science Engineering">Computer Science Engineering</SelectItem>
                      <SelectItem value="Information Technology">Information Technology</SelectItem>
                      <SelectItem value="Electronics & Communication Engineering">Electronics & Communication Engineering</SelectItem>
                      <SelectItem value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Academic Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="year">Academic Year *</Label>
                  <Select value={formData.year} onValueChange={(value) => handleInputChange("year", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select academic year" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 11 }, (_, i) => {
                        const year = new Date().getFullYear() + i;
                        return (
                          <SelectItem key={year} value={year.toString()}>
                            {year} {i === 0 ? "(Current Year)" : ""}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="level">Academic Level</Label>
                  <Select value={formData.level} onValueChange={(value) => handleInputChange("level", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="semester">Semester Project</SelectItem>
                      <SelectItem value="minor">Minor Project</SelectItem>
                      <SelectItem value="major">Major Project</SelectItem>
                      <SelectItem value="thesis">B.Tech Thesis</SelectItem>
                      <SelectItem value="internship">Internship Project</SelectItem>
                      <SelectItem value="research">Research Project</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Project Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe your project, its purpose, methodology, and key features..."
                  className="min-h-32"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  required
                />
              </div>

              {/* Technology Tags */}
              <div className="space-y-2">
                <Label htmlFor="tags">Technologies & Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-red-100 text-red-700">
                      {tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => removeTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Add technologies, frameworks, languages..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <Button type="button" variant="outline" onClick={addTag} className="border-red-600 text-red-600 hover:bg-red-50">
                    Add
                  </Button>
                </div>
                <p className="text-sm text-gray-500">Press Enter or click Add to include a tag</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Project Category</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web">Web Development</SelectItem>
                    <SelectItem value="mobile">Mobile Application</SelectItem>
                    <SelectItem value="iot">IoT & Embedded Systems</SelectItem>
                    <SelectItem value="ai">AI & Machine Learning</SelectItem>
                    <SelectItem value="robotics">Robotics</SelectItem>
                    <SelectItem value="data">Data Science & Analytics</SelectItem>
                    <SelectItem value="security">Cybersecurity</SelectItem>
                    <SelectItem value="hardware">Hardware Design</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Information */}
              <div className="space-y-2">
                <Label htmlFor="features">Key Features</Label>
                <Textarea
                  id="features"
                  placeholder="List the main features and functionalities of your project..."
                  className="min-h-24"
                  value={formData.features}
                  onChange={(e) => handleInputChange("features", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="supervisor">Project Supervisor</Label>
                  <Input
                    id="supervisor"
                    placeholder="Faculty name (optional)"
                    value={formData.supervisor}
                    onChange={(e) => handleInputChange("supervisor", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="collaborators">Team Members</Label>
                  <Input
                    id="collaborators"
                    placeholder="Other team member names (optional)"
                    value={formData.collaborators}
                    onChange={(e) => handleInputChange("collaborators", e.target.value)}
                  />
                </div>
              </div>

              {/* Project Links and IDs */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Project Links & Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="githubRepo">GitHub Repository</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="githubRepo"
                        placeholder="https://github.com/username/repo"
                        className="pl-10"
                        value={formData.githubRepo}
                        onChange={(e) => handleInputChange("githubRepo", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="deployLink">Live Demo Link</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="deployLink"
                        placeholder="https://your-project-demo.com"
                        className="pl-10"
                        value={formData.deployLink}
                        onChange={(e) => handleInputChange("deployLink", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="githubId">GitHub Username</Label>
                    <div className="relative">
                      <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="githubId"
                        placeholder="your-github-username"
                        className="pl-10"
                        value={formData.githubId}
                        onChange={(e) => handleInputChange("githubId", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gmailId">Contact Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="gmailId"
                        placeholder="your.email@gmail.com"
                        className="pl-10"
                        value={formData.gmailId}
                        onChange={(e) => handleInputChange("gmailId", e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-6">
                <Button 
                  type="submit" 
                  size="lg" 
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                  disabled={loading}
                >
                  <UploadIcon className="w-5 h-5 mr-2" />
                  {loading ? "Publishing..." : "Publish Project"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="lg" 
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={handleSaveDraft}
                  disabled={loading}
                >
                  Save as Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Guidelines */}
        <Card className="mt-8 border-0 shadow-lg bg-blue-50/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-900">Submission Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="text-blue-800">
            <ul className="space-y-2">
              <li>• Ensure your project documentation is clear and well-structured</li>
              <li>• Include proper citations and references if applicable</li>
              <li>• Make sure source code is properly commented and organized</li>
              <li>• Specify the correct academic year for your project</li>
              <li>• Test all uploaded files to ensure they work correctly</li>
              <li>• Your project will be available immediately after submission</li>
              <li>• By uploading, you agree to share your work under the academic fair use policy</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
