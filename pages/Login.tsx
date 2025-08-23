import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, LogIn, Mail, Lock, UserPlus } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic validation
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing Information",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe
      });

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome back to RCEW Project Bank!",
        });
        navigate('/browse');
      } else {
        toast({
          title: "Login Failed",
          description: result.message || "Invalid email or password",
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

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
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
                  <p className="text-sm text-gray-600">Student Sign In</p>
                </div>
              </Link>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                Home
              </Link>
              <Link to="/register" className="text-gray-700 hover:text-red-600 transition-colors">
                Create Account
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F348b0cf0cd1044f492a3a092345ae992%2F0f1c1f69ae12496285f964f5ac1b8373?format=webp&width=800"
              alt="RCEW Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your RCEW Project Bank account</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LogIn className="w-5 h-5 text-red-600" />
              Student Sign In
            </CardTitle>
            <CardDescription>
              Enter your email and password. You must have a valid RCEW roll number to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email address"
                      className="pl-10"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link to="/forgot-password" className="text-sm text-red-600 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                disabled={loading}
              >
                <LogIn className="w-5 h-5 mr-2" />
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Registration Call to Action */}
        <Card className="mt-6 border-0 shadow-lg bg-blue-50/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold text-blue-900 mb-2">New to RCEW Project Bank?</h4>
            <p className="text-blue-800 mb-4">Join our community of innovative students and start sharing your projects</p>
            <Button variant="outline" asChild className="border-red-600 text-red-600 hover:bg-red-50">
              <Link to="/register">
                <UserPlus className="w-4 h-4 mr-2" />
                Create Account
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Access for Demo */}
        <Card className="mt-6 border-0 shadow-lg bg-green-50/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold text-green-900 mb-2">Quick Demo Access</h4>
            <p className="text-green-800 mb-4">Test the platform with sample credentials</p>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Email:</strong> gunjansingla574@gmail.com</p>
              <p><strong>Password:</strong> Rcew@123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
