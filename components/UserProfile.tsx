import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  User,
  LogOut,
  Upload,
  Camera,
  FileImage
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export function UserProfile() {
  const { user, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  if (!user) return null;

  const handleSignOut = () => {
    logout();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out",
    });
  };

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
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;

        try {
          // Upload to backend
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
            // Update user in auth context
            updateUser(data.user);

            toast({
              title: "Photo Updated",
              description: "Your profile photo has been updated successfully",
            });
          } else {
            throw new Error(data.message);
          }
        } catch (apiError) {
          // Fallback to localStorage only if API fails
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profilePhoto} alt={`${user.firstName} ${user.lastName}`} />
            <AvatarFallback className="bg-red-600 text-white">
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.rollNumber} • Semester {user.semester}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {/* Upload Photo */}
        <DropdownMenuItem asChild>
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={uploadingPhoto}
            />
            <div className="flex items-center">
              {uploadingPhoto ? (
                <FileImage className="mr-2 h-4 w-4 animate-pulse" />
              ) : (
                <Camera className="mr-2 h-4 w-4" />
              )}
              {uploadingPhoto ? "Uploading..." : "Update Photo"}
            </div>
          </label>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/upload" className="flex items-center">
            <Upload className="mr-2 h-4 w-4" />
            Upload Project
          </Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link to="/profile" className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile Settings
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
