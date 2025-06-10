
"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Upload, Trash2, Palette, Type, User, ShieldCheck, Moon, Sun } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { useTheme } from 'next-themes';
import { toast } from '@/hooks/use-toast';
import { useFontTheme } from '@/hooks/useFontTheme'; // Added
import { AVAILABLE_FONTS, DEFAULT_FONT_THEME_KEY } from '@/lib/fonts.config'; // Added

// Dummy user data and functions - replace with actual auth and state management
const user = {
  name: 'Peter Damiano',
  username: 'Petediano',
  email: 'peterdamiano12masterpro@gmail.com',
  profilePictureUrl: '', // URL to profile picture
};

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length === 1) return names[0][0].toUpperCase();
  return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
};

export default function SettingsPage() {
  const { theme } = useTheme(); // Removed setTheme as it's in ModeToggle
  const { fontThemeKey, setFontTheme } = useFontTheme(); // Use new font hook

  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.profilePictureUrl || `https://placehold.co/128x128.png?text=${getInitials(user.name)}`);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = () => {
    // Logic to update profile (name, username, email, profile picture)
    toast({ title: "Profile Updated", description: "Your profile information has been saved." });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    // Logic to change password
    toast({ title: "Password Changed", description: "Your password has been updated." });
  };

  const handleDeleteAccount = () => {
    if (!deleteAccountPassword) {
       toast({ title: "Error", description: "Please enter your password to confirm deletion.", variant: "destructive" });
      return;
    }
    // Logic to delete account, requires password confirmation
    toast({ title: "Account Deletion Requested", description: "Your account deletion request is being processed." });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Settings</CardTitle>
          <CardDescription>Manage your account, appearance, and preferences.</CardDescription>
        </CardHeader>
      </Card>

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><User className="mr-2 h-5 w-5 text-primary" />Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewUrl || ''} alt={name} data-ai-hint="profile image"/>
              <AvatarFallback>{getInitials(name)}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="profile-picture-upload" className="cursor-pointer text-primary hover:underline">
                <Upload className="inline mr-1 h-4 w-4" />Change Profile Picture
              </Label>
              <Input id="profile-picture-upload" type="file" className="hidden" onChange={handleProfilePictureChange} accept="image/*" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button onClick={handleProfileUpdate}>Save Profile Changes</Button>
        </CardContent>
      </Card>

      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Palette className="mr-2 h-5 w-5 text-primary" />Appearance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Theme</Label>
            <div className="flex items-center space-x-2 mt-1">
               <ModeToggle />
               <span className="text-sm text-muted-foreground">Current: {theme}</span>
            </div>
          </div>
          <div>
            <Label htmlFor="font-select">Application Font Theme</Label>
            <Select value={fontThemeKey} onValueChange={setFontTheme}>
              <SelectTrigger id="font-select">
                <SelectValue placeholder="Select font theme" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_FONTS.map(font => (
                  <SelectItem key={font.key} value={font.key}>{font.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">Changes how text and headlines appear across the app.</p>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" />Security</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="font-semibold mb-2">Change Password</h3>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input id="new-password" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>
            <div className="space-y-2 mt-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input id="confirm-new-password" type="password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} />
            </div>
            <Button onClick={handleChangePassword} className="mt-4">Update Password</Button>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2 text-destructive">Delete Account</h3>
            <p className="text-sm text-muted-foreground mb-2">
              This action is irreversible. All your data will be permanently deleted.
            </p>
            <div className="space-y-2">
              <Label htmlFor="delete-account-password">Enter Your Password to Confirm</Label>
              <Input id="delete-account-password" type="password" value={deleteAccountPassword} onChange={(e) => setDeleteAccountPassword(e.target.value)} className="border-destructive focus:ring-destructive" />
            </div>
            <Button variant="destructive" onClick={handleDeleteAccount} className="mt-4">
              <Trash2 className="mr-2 h-4 w-4" />Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
