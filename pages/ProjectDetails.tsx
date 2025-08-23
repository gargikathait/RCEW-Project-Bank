import { Link, useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Star,
  Calendar,
  User,
  GraduationCap,
  Building,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Github,
  Globe,
  Mail
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/UserProfile";
import { Project, ProjectResponse } from "@shared/api";

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (id) {
      fetchProject(id);
      // Record view when project is loaded
      recordView(id);
    }
  }, [id]);

  const fetchProject = async (projectId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      const data: ProjectResponse = await response.json();

      if (data.success) {
        setProject(data.project);
      } else {
        toast({
          title: "Error",
          description: "Project not found",
          variant: "destructive",
        });
        navigate('/browse');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load project details",
        variant: "destructive",
      });
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const recordView = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/view`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // Update local project data
        setProject(prev => prev ? { ...prev, views: data.views } : null);
      }
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  };

  const handleRate = async (rating: number) => {
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${project.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ rating }),
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Rating Submitted",
          description: "Thank you for rating this project!",
        });
        setProject(prev => prev ? { ...prev, rating: data.rating } : null);
      } else {
        toast({
          title: "Rating Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  const handleFacultyValidation = async (status: 'approved' | 'disapproved') => {
    if (!project) return;

    try {
      const response = await fetch(`/api/projects/${project.id}/faculty-validation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status,
          comments: status === 'approved' ? 'Project approved by faculty' : 'Project needs revision'
        }),
      });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Validation Updated",
          description: `Project ${status} successfully`,
        });
        setProject(data.project);
      } else {
        toast({
          title: "Validation Failed",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update validation",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Project Not Found</CardTitle>
            <CardDescription>
              The project you're looking for doesn't exist or has been removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-red-600 hover:bg-red-700">
              <Link to="/browse">Browse Projects</Link>
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
                  <p className="text-sm text-gray-600">Project Details</p>
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/browse" className="text-gray-700 hover:text-red-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                Back to Browse
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/upload" className="text-gray-700 hover:text-red-600 transition-colors">
                    Upload Project
                  </Link>
                  <UserProfile />
                </>
              ) : (
                <Button asChild className="bg-red-600 hover:bg-red-700">
                  <Link to="/login">Sign In</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Project Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{project.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  <span>by {project.author}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  <span>{project.department}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{project.year}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="capitalize">{project.level}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Eye className="w-4 h-4" />
                <span>{project.views} views</span>
              </div>
            </div>
          </div>

          {/* Stats and Rating */}
          <div className="flex flex-wrap items-center gap-6 mb-6">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{project.rating}</span>
              <span className="text-gray-600">({project.ratings.length} ratings)</span>
            </div>
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              {project.category}
            </Badge>
            <span className="text-gray-600 text-sm">
              Updated {new Date(project.updatedAt).toLocaleDateString()}
            </span>
          </div>

          {/* Rate Project */}
          {isAuthenticated && (
            <Card className="mb-6 bg-blue-50/80 backdrop-blur-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Rate this project:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => handleRate(rating)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star className="w-5 h-5 text-yellow-400 hover:fill-yellow-400" />
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Project Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">{project.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            {project.features && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Key Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-wrap">{project.features}</p>
                </CardContent>
              </Card>
            )}

            {/* Technologies */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Technologies Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="border-red-200 text-red-700">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Project Links */}
            {(project.githubRepo || project.deployLink) && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Project Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.githubRepo && (
                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-gray-600" />
                      <a
                        href={project.githubRepo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        View Source Code
                      </a>
                    </div>
                  )}
                  {project.deployLink && (
                    <div className="flex items-center gap-3">
                      <Globe className="w-5 h-5 text-gray-600" />
                      <a
                        href={project.deployLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Live Demo
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Contact Information */}
            {(project.githubId || project.gmailId) && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle>Contact Author</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.githubId && (
                    <div className="flex items-center gap-3">
                      <Github className="w-5 h-5 text-gray-600" />
                      <a
                        href={`https://github.com/${project.githubId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        @{project.githubId}
                      </a>
                    </div>
                  )}
                  {project.gmailId && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-gray-600" />
                      <a
                        href={`mailto:${project.gmailId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {project.gmailId}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Author</Label>
                  <p className="font-semibold">{project.author}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Department</Label>
                  <p className="font-semibold">{project.department}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Academic Year</Label>
                  <p className="font-semibold">{project.year}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label className="text-sm font-medium text-gray-600">Project Level</Label>
                  <p className="font-semibold capitalize">{project.level}</p>
                </div>

                {project.supervisor && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Supervisor</Label>
                      <p className="font-semibold">{project.supervisor}</p>
                    </div>
                  </>
                )}

                {project.collaborators && (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Team Members</Label>
                      <p className="font-semibold">{project.collaborators}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Faculty Validation */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Faculty Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  {project.facultyValidation === 'approved' && (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Approved</span>
                    </>
                  )}
                  {project.facultyValidation === 'disapproved' && (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-600 font-medium">Disapproved</span>
                    </>
                  )}
                  {project.facultyValidation === 'pending' && (
                    <>
                      <Clock className="w-5 h-5 text-yellow-600" />
                      <span className="text-yellow-600 font-medium">Pending Review</span>
                    </>
                  )}
                </div>

                {project.facultyComments && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Faculty Comments:</strong> {project.facultyComments}
                    </p>
                  </div>
                )}

                {/* Faculty can update validation status */}
                {isAuthenticated && (
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={() => handleFacultyValidation('approved')}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-red-600 text-red-600 hover:bg-red-50"
                      onClick={() => handleFacultyValidation('disapproved')}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Disapprove
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-semibold">{project.views}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rating</span>
                  <span className="font-semibold">{project.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created</span>
                  <span className="font-semibold">{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Label({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <span className={`block text-sm font-medium ${className}`}>{children}</span>;
}
