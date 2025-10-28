
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useSoundSettings } from "@/hooks/useSoundSettings";
import { useFontTheme } from "@/hooks/useFontTheme";
import { AVAILABLE_FONTS } from "@/lib/fonts.config";
import { useAccessibility } from "@/hooks/useAccessibility";
import { useUser, useAuth, useFirestore } from '@/firebase';
import { updateProfile, updateEmail, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { toast } from '@/hooks/use-toast';
import { useState } from "react";
import { Loader2, Palette, Type, Music, Accessibility, User, KeyRound, Bell } from "lucide-react";
import { ProfilePictureUploader } from "@/components/settings/ProfilePictureUploader";

export default function SettingsPage() {
  const { soundSettings, setGlobalMuted, setGlobalVolume } = useSoundSettings();
  const { fontThemeKey, setFontTheme } = useFontTheme();
  const { textSize, setTextSize } = useAccessibility();
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleProfileUpdate = async () => {
      if (!user) return;
      if (email !== user.email && !currentPassword) {
        toast({title: "Password Required", description: "Please enter your current password to change your email.", variant: "destructive"});
        return;
      }

      setIsUpdating(true);
      try {
        if (displayName !== user.displayName) {
          await updateProfile(user, { displayName });
        }
        if (email !== user.email) {
          const credential = EmailAuthProvider.credential(user.email!, currentPassword);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, email);
        }
        toast({title: "Success", description: "Profile updated successfully."});
      } catch (error: any) {
        let message = "An error occurred during profile update.";
        if (error.code === 'auth/wrong-password') {
            message = "Incorrect password. Please try again."
        } else if (error.code === 'auth/email-already-in-use') {
            message = "This email address is already in use by another account."
        }
        toast({title: "Update Failed", description: message, variant: "destructive"});
        console.error(error);
      } finally {
        setIsUpdating(false);
        setCurrentPassword('');
      }
  };


  return (
    <div className="container mx-auto py-8 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-3xl text-primary">Settings</CardTitle>
          <CardDescription>Customize your Petediano Pro experience.</CardDescription>
        </CardHeader>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center"><User className="mr-2 h-5 w-5 text-accent"/> Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProfilePictureUploader />
                 <div className="space-y-4">
                    {isUserLoading ? <Loader2 className="animate-spin" /> : (
                        <>
                            <div><Label htmlFor="displayName">Display Name</Label><Input id="displayName" value={displayName} onChange={(e) => setDisplayName(e.target.value)} /></div>
                            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                            {email !== user?.email && (
                                <div><Label htmlFor="currentPassword">Current Password (to change email)</Label><Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} /></div>
                            )}
                            <Button onClick={handleProfileUpdate} disabled={isUpdating}>
                                {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                                Update Profile
                            </Button>
                        </>
                    )}
                 </div>
            </CardContent>
        </Card>

        {/* Theme & Font Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Palette className="mr-2 h-5 w-5 text-accent"/> Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="font-select">Font Theme</Label>
              <Select value={fontThemeKey} onValueChange={setFontTheme}>
                <SelectTrigger id="font-select"><SelectValue placeholder="Select a font theme" /></SelectTrigger>
                <SelectContent>
                  {AVAILABLE_FONTS.map(font => (
                    <SelectItem key={font.key} value={font.key}>{font.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sound Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Music className="mr-2 h-5 w-5 text-accent"/> Sound</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="mute-switch">Mute All Sounds</Label>
              <Switch id="mute-switch" checked={soundSettings.isGlobalMuted} onCheckedChange={setGlobalMuted} />
            </div>
            <div>
              <Label htmlFor="volume-slider">Global Volume</Label>
              <Slider id="volume-slider" min={0} max={1} step={0.05} value={[soundSettings.globalVolume]} onValueChange={(value) => setGlobalVolume(value[0])} disabled={soundSettings.isGlobalMuted} />
            </div>
          </CardContent>
        </Card>
        
        {/* Accessibility Settings */}
         <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Accessibility className="mr-2 h-5 w-5 text-accent"/> Accessibility</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div>
              <Label htmlFor="text-size-select">Text Size</Label>
              <Select value={textSize} onValueChange={setTextSize}>
                <SelectTrigger id="text-size-select"><SelectValue placeholder="Select text size" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sm">Small</SelectItem>
                  <SelectItem value="md">Default</SelectItem>
                  <SelectItem value="lg">Large</SelectItem>
                  <SelectItem value="xl">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="md:col-span-2 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center"><KeyRound className="mr-2 h-5 w-5 text-accent"/> Account Management</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
             <Button variant="outline" onClick={() => auth.sendPasswordResetEmail(user?.email || '')
                .then(() => toast({title: "Password Reset Email Sent"}))
                .catch(() => toast({title: "Error", variant: "destructive"}))
             }>
                Send Password Reset Email
            </Button>
            <Button variant="destructive">Delete Account</Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
