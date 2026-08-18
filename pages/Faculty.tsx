import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Project } from "@shared/api";

export default function Faculty() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch("/api/projects/faculty/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load projects");
      }

      setProjects(data.projects);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to load pending projects",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading pending projects...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Faculty Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Review and validate student projects.
          </p>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold">
                No pending projects
              </h2>
              <p className="text-gray-500 mt-2">
                All submitted projects have been reviewed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {projects.map((project) => (
              <Card key={project.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{project.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Submitted by {project.author}
                      </p>
                    </div>

                    <Badge variant="secondary">
                      Pending Review
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-700 mb-4">
                    {project.description}
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-6">
                    <div>
                      <p className="text-gray-500">Department</p>
                      <p className="font-medium">{project.department}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Year</p>
                      <p className="font-medium">{project.year}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Category</p>
                      <p className="font-medium">{project.category}</p>
                    </div>

                    <div>
                      <p className="text-gray-500">Level</p>
                      <p className="font-medium">{project.level}</p>
                    </div>
                  </div>

                  <Button asChild>
                    <Link to={`/projects/${project.id}`}>
                      Review Project
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}