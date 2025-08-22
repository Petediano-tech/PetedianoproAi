
"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from '@/components/ui/separator';
import { Upload, Trash2, Palette, User, ShieldCheck, Volume2, VolumeX, Zap, Settings2, Loader2 } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import { useTheme } from 'next-themes';
import { toast } from '@/hooks/use-toast';
import { useFontTheme } from '@/hooks/useFontTheme';
import { AVAILABLE_FONTS } from '@/lib/fonts.config';
import { useSoundSettings } from '@/hooks/useSoundSettings';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { updateMasterVolume } from '@/utils/audioPlayer';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAccessibility } from '@/hooks/useAccessibility';
import type { TextSizeType } from '@/context/AccessibilityProvider';
import { useAuth } from '@/context/AuthProvider';
import { updateProfile, updatePassword, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from 'firebase/auth';
import { doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U';
  const names = name.split(' ');
  if (names.length === 1 && names[0].length > 0) return names[0][0].toUpperCase();
  if (names.length > 1 && names[0].length > 0 && names[names.length-1].length > 0) {
    return names[0][0].toUpperCase() + names[names.length - 1][0].toUpperCase();
  }
  return 'U';
};

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const { fontThemeKey, setFontTheme } = useFontTheme();
  const { soundSettings, setGlobalMuted, setGlobalVolume, setTypingVibration } = useSoundSettings();
  const { textSize, setTextSize } = useAccessibility();

  const [name, setName] = useState('');
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [deleteAccountPassword, setDeleteAccountPassword] = useState('');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setPreviewUrl(user.photoURL);
    }
  }, [user]);

  useEffect(() => {
    updateMasterVolume(soundSettings.globalVolume);
  }, [soundSettings.globalVolume]);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsUpdatingProfile(true);

    try {
      let photoURL = user.photoURL;

      if (profilePicture) {
        setIsUploading(true);
        const storage = getStorage();
        const storageRef = ref(storage, `profilePictures/${user.uid}`);
        const snapshot = await uploadBytes(storageRef, profilePicture);
        photoURL = await getDownloadURL(snapshot.ref);
        setIsUploading(false);
      }

      await updateProfile(user, { displayName: name, photoURL });
      await updateDoc(doc(db, "users", user.uid), { displayName: name, photoURL });
      
      toast({ title: "Profile Updated", description: "Your profile information has been saved." });
    } catch (error: any) {
      console.error("Profile update failed:", error);
      toast({ title: "Error", description: "Failed to update profile. " + error.message, variant: "destructive" });
    } finally {
      setIsUpdatingProfile(false);
      setIsUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !user.email) return;
    if (newPassword !== confirmNewPassword) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    setIsUpdatingPassword(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast({ title: "Password Changed", description: "Your password has been updated." });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      console.error("Password change failed:", error);
      toast({ title: "Error", description: "Failed to change password. " + error.message, variant: "destructive" });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || !user.email) return;
    if (!deleteAccountPassword) {
       toast({ title: "Error", description: "Please enter your password to confirm deletion.", variant: "destructive" });
      return;
    }
    setIsDeletingAccount(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, deleteAccountPassword);
      await reauthenticateWithCredential(user, credential);
      await deleteDoc(doc(db, "users", user.uid));
      await deleteUser(user);
      toast({ title: "Account Deleted", description: "Your account has been permanently deleted." });
      logout(); // This should redirect
    } catch (error: any) {
      console.error("Account deletion failed:", error);
      toast({ title: "Error", description: "Failed to delete account. " + error.message, variant: "destructive" });
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Settings</CardTitle>
          <CardDescription>Manage your account, appearance, sounds, and preferences.</CardDescription>
        </CardHeader>
      </Card>

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
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={user.email || ''} disabled />
            </div>
          </div>
          <Button onClick={handleProfileUpdate} disabled={isUpdatingProfile}>
            {(isUpdatingProfile || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : isUpdatingProfile ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </CardContent>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Settings2 className="mr-2 h-5 w-5 text-primary" />Accessibility</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div>
            <Label>Text Size</Label>
            <p className="text-xs text-muted-foreground mb-2">Adjust the text size for better readability across the app.</p>
            <RadioGroup value={textSize} onValueChange={(v) => setTextSize(v as TextSizeType)} className="flex flex-wrap gap-4">
                <div><RadioGroupItem value="sm" id="ts-sm" /><Label htmlFor="ts-sm" className="ml-2">Small</Label></div>
                <div><RadioGroupItem value="md" id="ts-md" /><Label htmlFor="ts-md" className="ml-2">Default</Label></div>
                <div><RadioGroupItem value="lg" id="ts-lg" /><Label htmlFor="ts-lg" className="ml-2">Large</Label></div>
                <div><RadioGroupItem value="xl" id="ts-xl" /><Label htmlFor="ts-xl" className="ml-2">Extra Large</Label></div>
            </RadioGroup>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl flex items-center"><Volume2 className="mr-2 h-5 w-5 text-primary" />Sound & Haptics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="master-mute">Master Sound</Label>
              <Switch
                id="master-mute"
                checked={!soundSettings.isGlobalMuted}
                onCheckedChange={(checked) => setGlobalMuted(!checked)}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Toggle all application notification sounds on or off.</p>
          </div>
          <div>
            <Label htmlFor="master-volume">Master Volume</Label>
            <div className="flex items-center gap-2">
              <VolumeX className="h-4 w-4 text-muted-foreground" />
              <Slider
                id="master-volume"
                min={0}
                max={1}
                step={0.01}
                value={[soundSettings.globalVolume]}
                onValueChange={(value) => setGlobalVolume(value[0])}
                disabled={soundSettings.isGlobalMuted}
              />
              <Volume2 className="h-4 w-4 text-muted-foreground" />
            </div>
             <p className="text-xs text-muted-foreground mt-1">Adjust the volume for all application sounds. Effective if Master Sound is ON.</p>
          </div>
           <Separator />
            <div>
                <div className="flex items-center justify-between">
                <Label htmlFor="typing-vibration" className="flex items-center gap-2"><Zap className="h-4 w-4" />Typing Vibration</Label>
                <Switch
                    id="typing-vibration"
                    checked={soundSettings.isTypingVibrationEnabled}
                    onCheckedChange={setTypingVibration}
                />
                </div>
                <p className="text-xs text-muted-foreground mt-1">Enable a subtle vibration when typing in major text fields on supported mobile devices.</p>
            </div>
        </CardContent>
      </Card>

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
            <Button onClick={handleChangePassword} className="mt-4" disabled={isUpdatingPassword}>
              {isUpdatingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Password
            </Button>
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
            <Button variant="destructive" onClick={handleDeleteAccount} className="mt-4" disabled={isDeletingAccount}>
              {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
