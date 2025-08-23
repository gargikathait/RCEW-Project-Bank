import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Eye, Star, ArrowLeft, Calendar, TrendingUp, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/UserProfile";
import { Project, ProjectsResponse, ProjectStatsResponse, AvailableYearsResponse } from "@shared/api";

export default function Browse() {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedYear, setSelectedYear] = useState("all");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchTerm, setSearchTerm] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [customYear, setCustomYear] = useState("");
  const [showAddYear, setShowAddYear] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, [selectedYear, selectedDepartment, sortBy, searchTerm]);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear !== "all") params.append("year", selectedYear);
      if (selectedDepartment !== "all") params.append("department", selectedDepartment);
      if (sortBy) params.append("sortBy", sortBy);
      if (searchTerm) params.append("search", searchTerm);

      const response = await fetch(`/api/projects?${params}`);
      const data: ProjectsResponse = await response.json();

      if (data.success) {
        setProjects(data.projects);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error", 
        description: "Network error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const [statsResponse, yearsResponse] = await Promise.all([
        fetch('/api/projects/stats'),
        fetch('/api/projects/years')
      ]);

      const statsData: ProjectStatsResponse = await statsResponse.json();
      const yearsData: AvailableYearsResponse = await yearsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats.byYear);
      }

      if (yearsData.success) {
        setAvailableYears(yearsData.years);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleViewDetails = async (projectId: string) => {
    try {
      const response = await fetch(`/api/projects/${projectId}/view`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        // View count updated, refresh projects
        fetchProjects();
      }
    } catch (error) {
      console.error('Failed to record view:', error);
    }
  };

  const addCustomYear = () => {
    if (customYear && !availableYears.includes(customYear)) {
      setAvailableYears(prev => [customYear, ...prev].sort((a, b) => b.localeCompare(a)));
      setSelectedYear(customYear);
      setCustomYear("");
      setShowAddYear(false);
    }
  };

  const filteredProjects = projects;

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
                  <p className="text-sm text-gray-600">Browse Projects</p>
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/upload" className="text-gray-700 hover:text-red-600 transition-colors">
                    Upload Project
                  </Link>
                  <UserProfile />
                </>
              ) : (
                <>
                  <Link to="/upload" className="text-gray-700 hover:text-red-600 transition-colors">
                    Upload Project
                  </Link>
                  <Button asChild className="bg-red-600 hover:bg-red-700">
                    <Link to="/login">Sign In</Link>
                  </Button>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Projects</h1>
          <p className="text-gray-600">Discover innovative projects from talented students at RCEW</p>
        </div>

        {/* Year Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {availableYears.map((year) => (
            <Card 
              key={year} 
              className={`text-center cursor-pointer transition-all border-0 shadow-md bg-white/60 backdrop-blur-sm hover:shadow-lg ${
                selectedYear === year ? 'ring-2 ring-red-500 bg-red-50/80' : ''
              }`}
              onClick={() => setSelectedYear(selectedYear === year ? "all" : year)}
            >
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600 mb-1">{year}</div>
                <div className="text-sm text-gray-600">{stats[year] || 0} Projects</div>
                {selectedYear === year && (
                  <Badge className="mt-2 bg-red-600">Selected</Badge>
                )}
              </CardContent>
            </Card>
          ))}
          
          {/* Add Custom Year Card */}
          <Card 
            className="text-center cursor-pointer transition-all border-2 border-dashed border-gray-300 bg-white/60 backdrop-blur-sm hover:shadow-lg hover:border-red-400"
            onClick={() => setShowAddYear(true)}
          >
            <CardContent className="p-4">
              {showAddYear ? (
                <div className="space-y-2">
                  <Input
                    placeholder="2023"
                    value={customYear}
                    onChange={(e) => setCustomYear(e.target.value)}
                    className="text-center"
                  />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={addCustomYear} className="bg-red-600 hover:bg-red-700">
                      Add
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setShowAddYear(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <div className="text-sm text-gray-600">Add Year</div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 mb-8 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search projects, authors, or technologies..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger>
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="computer science">Computer Science Engineering</SelectItem>
                <SelectItem value="information technology">Information Technology</SelectItem>
                <SelectItem value="electronics">Electronics & Communication</SelectItem>
                <SelectItem value="electrical">Electrical Engineering</SelectItem>
                <SelectItem value="mechanical">Mechanical Engineering</SelectItem>
                <SelectItem value="civil">Civil Engineering</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="downloads">Most Downloaded</SelectItem>
                <SelectItem value="year">By Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {(selectedYear !== "all" || selectedDepartment !== "all" || searchTerm) && (
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="text-sm text-gray-600">Active filters:</span>
              {selectedYear !== "all" && (
                <Badge variant="outline" className="border-red-200 text-red-700">
                  Year: {selectedYear}
                  <button 
                    onClick={() => setSelectedYear("all")}
                    className="ml-2 hover:text-red-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedDepartment !== "all" && (
                <Badge variant="outline" className="border-red-200 text-red-700">
                  Department: {selectedDepartment}
                  <button 
                    onClick={() => setSelectedDepartment("all")}
                    className="ml-2 hover:text-red-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="outline" className="border-red-200 text-red-700">
                  Search: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm("")}
                    className="ml-2 hover:text-red-900"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Results Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-red-600" />
            <span className="text-gray-700">
              {loading ? "Loading..." : `Showing ${filteredProjects.length} projects`}
              {selectedYear !== "all" && ` from ${selectedYear}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Updated in real-time</span>
          </div>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters or search terms</p>
            {isAuthenticated && (
              <Button asChild className="bg-red-600 hover:bg-red-700">
                <Link to="/upload">Upload First Project</Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-white/60 backdrop-blur-sm group">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">
                      {project.department}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs border-red-200 bg-red-50">
                        <Calendar className="w-3 h-3 mr-1" />
                        {project.year}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm text-gray-600">{project.rating}</span>
                      </div>
                    </div>
                  </div>
                  <CardTitle className="group-hover:text-red-600 transition-colors line-clamp-2">
                    {project.title}
                  </CardTitle>
                  <CardDescription>
                    by {project.author}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {project.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{project.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {project.views || 0} views
                    </div>
                    <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      asChild
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                      onClick={() => handleViewDetails(project.id)}
                    >
                      <Link to={`/project/${project.id}`}>View Details</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Project Statistics */}
        {Object.keys(stats).length > 0 && (
          <div className="mt-16 bg-white/60 backdrop-blur-sm rounded-lg p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Project Statistics by Year</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {Object.entries(stats).slice(0, 4).map(([year, count]) => (
                <div key={year} className="text-center">
                  <div className="text-3xl font-bold text-red-600 mb-2">{count}</div>
                  <div className="text-gray-600">Projects in {year}</div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div 
                      className="bg-red-600 h-2 rounded-full" 
                      style={{ width: `${(count / Math.max(...Object.values(stats))) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
