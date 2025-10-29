
'use client';

import { useState, useRef } from 'react';
import { useUser, useFirebase, useFirestore } from '@/firebase';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, UploadCloud } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { defaultAvatars } from '@/lib/default-avatars';

export function ProfilePictureUploader() {
  const { user } = useUser();
  const { firebaseApp } = useFirebase();
  const firestore = useFirestore();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!user || !firestore || !firebaseApp) return;

      setIsLoading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const dataUrl = reader.result as string;
            const storage = getStorage(firebaseApp);
            const storageRef = ref(storage, `profilePictures/${user.uid}`);
            
            await uploadString(storageRef, dataUrl, 'data_url');
            const downloadURL = await getDownloadURL(storageRef);

            await updateProfile(user, { photoURL: downloadURL });
            const userDocRef = doc(firestore, 'users', user.uid);
            await updateDoc(userDocRef, { photoURL: downloadURL });
            
            toast({ title: "Success", description: "Profile picture updated." });
            if (e.target) e.target.value = '';
        };
        reader.onerror = (error) => {
            throw error;
        }
      } catch (error) {
        console.error("Error uploading profile picture: ", error);
        toast({ title: "Upload Failed", description: "Could not update your profile picture.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSetDefaultAvatar = async (avatarUrl: string) => {
    if (!user || !firestore) return;
    setIsLoading(true);
    try {
        await updateProfile(user, { photoURL: avatarUrl });
        const userDocRef = doc(firestore, 'users', user.uid);
        await updateDoc(userDocRef, { photoURL: avatarUrl });
        toast({ title: "Success", description: "Avatar updated." });
    } catch (error) {
        console.error("Error setting default avatar:", error);
        toast({ title: "Update Failed", description: "Could not set default avatar.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }

  const triggerFileInput = () => {
      fileInputRef.current?.click();
  }

  return (
    <div className="space-y-4 text-center">
      <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" disabled={isLoading}/>
      <div className="relative w-32 h-32 mx-auto">
        <Avatar className="w-32 h-32 text-4xl">
          <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
          <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
        </Avatar>
        <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full h-10 w-10" onClick={triggerFileInput} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5"/>}
        </Button>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Or choose a default avatar:</p>
        <div className="flex flex-wrap gap-2 justify-center">
            {defaultAvatars.map((url) => (
                <Button key={url} variant="ghost" className="p-0 h-14 w-14 rounded-full" onClick={() => handleSetDefaultAvatar(url)} disabled={isLoading}>
                    <Image src={url} alt="Default Avatar" width={56} height={56} className="rounded-full" />
                </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
