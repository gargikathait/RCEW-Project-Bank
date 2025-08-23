import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User, Mail, IdCard, Building, Calendar, Camera } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "@/components/UserProfile";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please sign in to access your profile
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

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        
        try {
          const response = await fetch('/api/auth/upload-photo', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({ photo: base64 }),
          });
          
          const data = await response.json();
          
          if (data.success) {
            updateUser(data.user);
            toast({
              title: "Photo Updated",
              description: "Your profile photo has been updated successfully",
            });
          } else {
            throw new Error(data.message);
          }
        } catch (apiError) {
          const updatedUser = { ...user, profilePhoto: base64 };
          updateUser(updatedUser);
          toast({
            title: "Photo Updated",
            description: "Photo saved locally. Upload to server failed.",
          });
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to update profile photo",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

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
                  <p className="text-sm text-gray-600">Profile Settings</p>
                </div>
              </Link>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link to="/browse" className="text-gray-700 hover:text-red-600 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1 inline" />
                Back to Browse
              </Link>
              <Link to="/upload" className="text-gray-700 hover:text-red-600 transition-colors">
                Upload Project
              </Link>
              <UserProfile />
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Settings</h1>
          <p className="text-gray-600">Manage your account information and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Photo Section */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Profile Photo</CardTitle>
                <CardDescription>
                  Update your profile picture
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <div className="mb-6">
                  <Avatar className="h-32 w-32 mx-auto">
                    <AvatarImage src={user.profilePhoto} alt={`${user.firstName} ${user.lastName}`} />
                    <AvatarFallback className="bg-red-600 text-white text-2xl">
                      {getInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  <Button 
                    className="w-full bg-red-600 hover:bg-red-700"
                    disabled={uploadingPhoto}
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    {uploadingPhoto ? "Uploading..." : "Change Photo"}
                  </Button>
                </label>
                
                <p className="text-xs text-gray-500 mt-2">
                  Max size: 5MB. Formats: JPG, PNG, GIF
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Profile Information */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Your account details and academic information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="firstName"
                        value={user.firstName}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="lastName"
                        value={user.lastName}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="email"
                      value={user.email}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rollNumber">Roll Number</Label>
                    <div className="relative">
                      <IdCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="rollNumber"
                        value={user.rollNumber}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="semester">Current Semester</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        id="semester"
                        value={`${user.semester}${user.semester === 'alumni' ? '' : getSemesterSuffix(user.semester)} Semester`}
                        className="pl-10"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="department"
                      value={getDepartmentName(user.department)}
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Account Information</h4>
                  <p className="text-sm text-blue-800">
                    To update your personal information, please contact the administration at{" "}
                    <a href="mailto:admin@rcew.edu.in" className="underline">admin@rcew.edu.in</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function getSemesterSuffix(semester: string): string {
  const num = parseInt(semester);
  if (num === 1) return 'st';
  if (num === 2) return 'nd';
  if (num === 3) return 'rd';
  return 'th';
}

function getDepartmentName(dept: string): string {
  const departmentMap: Record<string, string> = {
    'cse': 'Computer Science Engineering',
    'it': 'Information Technology',
    'ece': 'Electronics & Communication Engineering',
    'eee': 'Electrical & Electronics Engineering',
    'me': 'Mechanical Engineering',
    'ce': 'Civil Engineering',
    'che': 'Chemical Engineering'
  };
  return departmentMap[dept] || dept;
}
