
'use client';

import { useState, useRef, useCallback } from 'react';
import { useUser, useFirebase, useFirestore } from '@/firebase';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import Image from 'next/image';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Loader2, UploadCloud } from 'lucide-react';
import Cropper, { type Area } from 'react-easy-crop';
import { toast } from '@/hooks/use-toast';
import { defaultAvatars } from '@/lib/default-avatars';

export function ProfilePictureUploader() {
  const { user } = useUser();
  const { firebaseApp } = useFirebase();
  const firestore = useFirestore();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setIsDialogOpen(true);
      };
    }
  };

  const handleUploadCroppedImage = async () => {
    if (!croppedAreaPixels || !imageSrc || !user || !firestore) return;

    setIsLoading(true);
    try {
      const canvas = document.createElement('canvas');
      const image = document.createElement('img');
      image.src = imageSrc;
      await new Promise(resolve => { image.onload = resolve; });

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      ctx.drawImage(
        image,
        croppedAreaPixels.x * scaleX,
        croppedAreaPixels.y * scaleY,
        croppedAreaPixels.width * scaleX,
        croppedAreaPixels.height * scaleY,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      
      const storage = getStorage(firebaseApp);
      const storageRef = ref(storage, `profilePictures/${user.uid}`);
      
      await uploadString(storageRef, dataUrl, 'data_url');
      const downloadURL = await getDownloadURL(storageRef);

      await updateProfile(user, { photoURL: downloadURL });
      const userDocRef = doc(firestore, 'users', user.uid);
      await updateDoc(userDocRef, { photoURL: downloadURL });
      
      toast({ title: "Success", description: "Profile picture updated." });
    } catch (error) {
      console.error("Error uploading profile picture: ", error);
      toast({ title: "Upload Failed", description: "Could not update your profile picture.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
      setImageSrc(null);
      setZoom(1);
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

  return (
    <div className="space-y-4 text-center">
      <div className="relative w-32 h-32 mx-auto">
        <Avatar className="w-32 h-32 text-4xl">
          <AvatarImage src={user?.photoURL || undefined} alt={user?.displayName || 'User'} />
          <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
        </Avatar>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="icon" className="absolute -bottom-2 -right-2 rounded-full h-10 w-10">
                    <UploadCloud className="h-5 w-5"/>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Profile Picture</DialogTitle>
                    <DialogDescription>
                        {imageSrc ? "Crop your new picture." : "Upload a new photo to use as your profile picture."}
                    </DialogDescription>
                </DialogHeader>
                {imageSrc ? (
                    <div className="space-y-4">
                        <div className="relative h-64 w-full bg-muted-foreground/20">
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete}
                                cropShape="round"
                            />
                        </div>
                         <div className="space-y-2">
                             <Label>Zoom</Label>
                            <Slider min={1} max={3} step={0.1} value={[zoom]} onValueChange={(val) => setZoom(val[0])} />
                         </div>
                    </div>
                ) : (
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="picture">Picture</Label>
                        <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} />
                    </div>
                )}
                <DialogFooter>
                    {imageSrc && (
                        <Button onClick={handleUploadCroppedImage} disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                            Save Changes
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
      </div>
      <div>
        <p className="text-sm text-muted-foreground mb-2">Or choose a default avatar:</p>
        <div className="flex flex-wrap gap-2 justify-center">
            {defaultAvatars.map((url) => (
                <Button key={url} variant="ghost" className="p-0 h-14 w-14 rounded-full" onClick={() => handleSetDefaultAvatar(url)}>
                    <Image src={url} alt="Default Avatar" width={56} height={56} className="rounded-full" />
                </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
