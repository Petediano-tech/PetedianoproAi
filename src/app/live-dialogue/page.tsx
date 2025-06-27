
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RedirectToAppLiveDialogue() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/(app)/live-dialogue');
  }, [router]);
  return null; 
}
