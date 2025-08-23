import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  R
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">RCEW Project Bank</h1>
                  <p className="text-sm text-gray-600">{title}</p>
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-violet-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                Home
              </Link>
              <Link to="/browse" className="text-gray-700 hover:text-violet-600 transition-colors">
                Browse Projects
              </Link>
              <Link to="/upload" className="text-gray-700 hover:text-violet-600 transition-colors">
                Upload Project
              </Link>
              <Button asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Construction className="w-10 h-10 text-white" />
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">{title}</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                {description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-8">
                This page is currently under development. We're working hard to bring you this feature soon!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700">
                  <Link to="/">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link to="/browse">Browse Projects</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
