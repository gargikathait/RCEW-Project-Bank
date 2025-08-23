import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, UserPlus, Mail, Lock, User, Calendar, BookOpen } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    rollNumber: "",
    department: "",
    semester: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false
  });

  const validateRollNumber = (rollNumber: string): boolean => {
    // Roll number format: 23ERWCS029 (2 digits + ERW + 2-3 chars department + 3 digits)
    const rollNumberPattern = /^\d{2}ERW[A-Z]{2,3}\d{3}$/;
    return rollNumberPattern.test(rollNumber.toUpperCase());
  };

  const validatePassword = (password: string): boolean => {
    // Minimum 8 characters with uppercase, lowercase, and number
    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordPattern.test(password);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!validateRollNumber(formData.rollNumber)) {
      toast({
        title: "Invalid Roll Number",
        description: "Roll number must be in format: 23ERWCS029 (e.g., year + ERW + department code + number)",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!validatePassword(formData.password)) {
      toast({
        title: "Invalid Password",
        description: "Password must be at least 8 characters with uppercase, lowercase, and number",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Password Mismatch",
        description: "Password and confirm password do not match",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    if (!formData.agreeToTerms) {
      toast({
        title: "Terms Required",
        description: "You must agree to the terms and conditions",
        variant: "destructive",
      });
      setLoading(false);
      return;
    }

    try {
      const result = await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        rollNumber: formData.rollNumber.toUpperCase(),
        department: formData.department,
        semester: formData.semester,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        agreeToTerms: formData.agreeToTerms
      });

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: "Your account has been created! Please login to continue.",
        });
        navigate('/login');
      } else {
        toast({
          title: "Registration Failed",
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
                  <p className="text-sm text-gray-600">Student Registration</p>
                </div>
              </Link>
            </div>
            <nav className="flex items-center gap-6">
              <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                Home
              </Link>
              <Link to="/login" className="text-gray-700 hover:text-red-600 transition-colors">
                Already have an account?
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2F348b0cf0cd1044f492a3a092345ae992%2F0f1c1f69ae12496285f964f5ac1b8373?format=webp&width=800"
              alt="RCEW Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Join RCEW Project Bank</h1>
          <p className="text-gray-600">Create your account to share and discover innovative projects</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-red-600" />
              Student Registration
            </CardTitle>
            <CardDescription>
              Please fill in your details to create your RCEW Project Bank account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="firstName"
                        placeholder="Enter first name"
                        className="pl-10"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="lastName"
                        placeholder="Enter last name"
                        className="pl-10"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
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
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Academic Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="rollNumber">Roll Number *</Label>
                  <Input
                    id="rollNumber"
                    placeholder="e.g., 23ERWCS029"
                    value={formData.rollNumber}
                    onChange={(e) => handleInputChange("rollNumber", e.target.value.toUpperCase())}
                    required
                  />
                  <p className="text-xs text-gray-500">Format: YearERWDepartmentNumber (e.g., 23ERWCS029)</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department *</Label>
                    <Select onValueChange={(value) => handleInputChange("department", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cse">Computer Science Engineering</SelectItem>
                        <SelectItem value="it">Information Technology</SelectItem>
                        <SelectItem value="ece">Electronics & Communication Engineering</SelectItem>
                        <SelectItem value="eee">Electrical & Electronics Engineering</SelectItem>
                        <SelectItem value="me">Mechanical Engineering</SelectItem>
                        <SelectItem value="ce">Civil Engineering</SelectItem>
                        <SelectItem value="che">Chemical Engineering</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="semester">Current Semester *</Label>
                    <Select onValueChange={(value) => handleInputChange("semester", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1st Semester</SelectItem>
                        <SelectItem value="2">2nd Semester</SelectItem>
                        <SelectItem value="3">3rd Semester</SelectItem>
                        <SelectItem value="4">4th Semester</SelectItem>
                        <SelectItem value="5">5th Semester</SelectItem>
                        <SelectItem value="6">6th Semester</SelectItem>
                        <SelectItem value="7">7th Semester</SelectItem>
                        <SelectItem value="8">8th Semester</SelectItem>
                        <SelectItem value="alumni">Alumni</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Account Security</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="Create password"
                        className="pl-10"
                        value={formData.password}
                        onChange={(e) => handleInputChange("password", e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500">Minimum 8 characters with uppercase, lowercase, and number</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirm password"
                        className="pl-10"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm">
                  I agree to the <Link to="/terms" className="text-red-600 hover:underline">Terms of Service</Link> and{" "}
                  <Link to="/privacy" className="text-red-600 hover:underline">Privacy Policy</Link>
                </Label>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800"
                disabled={!formData.agreeToTerms || loading}
              >
                <UserPlus className="w-5 h-5 mr-2" />
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="mt-6 border-0 shadow-lg bg-blue-50/80 backdrop-blur-sm">
          <CardContent className="p-6 text-center">
            <h4 className="font-semibold text-blue-900 mb-2">Already have an account?</h4>
            <p className="text-blue-800 mb-4">Sign in to access your projects and continue contributing to RCEW innovation</p>
            <Button variant="outline" asChild className="border-red-600 text-red-600 hover:bg-red-50">
              <Link to="/login">Sign In Instead</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
