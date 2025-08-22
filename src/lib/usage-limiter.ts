
"use client";

import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from './firebase';

const DAILY_LIMIT_PER_FEATURE = 5;

interface VipInfo {
  vipStatus: 'free' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  vipExpiry: string | null;
}

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function getUserVipInfo(): Promise<VipInfo | null> {
  const user = auth.currentUser;
  if (!user) return null;

  const userDocRef = doc(db, 'users', user.uid);
  try {
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const data = userDoc.data();
      return {
        vipStatus: data.vipStatus || 'free',
        vipExpiry: data.vipExpiry || null,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user VIP info:", error);
    return null;
  }
}

export function setVipStatus(type: VipInfo['vipStatus']): void {
    // This function is now mostly conceptual as passkey activation handles the update.
    // However, it can be used for direct "purchases" if that flow is implemented.
    if (typeof window === 'undefined') return;
    const user = auth.currentUser;
    if (!user) return;
    
    const activationDate = new Date();
    const expiryDate = calculateExpiry(type, activationDate);
    
    const userDocRef = doc(db, 'users', user.uid);
    updateDoc(userDocRef, {
        vipStatus: type,
        vipActivationDate: activationDate.toISOString(),
        vipExpiry: expiryDate ? expiryDate.toISOString() : null,
    }).catch(error => console.error("Failed to set VIP status:", error));
}


export async function isUserVip(): Promise<boolean> {
  const vipInfo = await getUserVipInfo();
  if (!vipInfo) return false;

  if (vipInfo.vipStatus === 'lifetime') return true;
  if (vipInfo.vipStatus === 'free') return false;

  if (vipInfo.vipExpiry) {
    const expiry = new Date(vipInfo.vipExpiry);
    if (expiry > new Date()) {
      return true; // Still valid
    } else {
      // Membership has expired, reset status in Firestore
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid);
        await updateDoc(userDocRef, {
          vipStatus: 'free',
          vipExpiry: null,
          vipActivationDate: null,
        }).catch(err => console.error("Failed to reset expired VIP status:", err));
      }
      return false;
    }
  }
  return false;
}

export async function canUseFeature(featureName: string): Promise<boolean> {
  if (await isUserVip()) {
    return true;
  }
  
  const user = auth.currentUser;
  if (!user) return false; // Or handle as a guest user with limits

  const today = getTodayDateString();
  const usageDocRef = doc(db, 'usage', user.uid, 'daily', today);
  
  try {
    const usageDoc = await getDoc(usageDocRef);
    if (usageDoc.exists()) {
      const todayUsage = usageDoc.data()[featureName] || 0;
      return todayUsage < DAILY_LIMIT_PER_FEATURE;
    }
    return true; // No record for today means they haven't used it yet
  } catch (error) {
    console.error("Error checking feature usage:", error);
    return false; // Fail safely
  }
}

export async function recordFeatureUsage(featureName: string): Promise<void> {
  if (await isUserVip()) {
    return; // VIP users don't have usage tracked against limits
  }

  const user = auth.currentUser;
  if (!user) return;
  
  const today = getTodayDateString();
  const usageDocRef = doc(db, 'usage', user.uid, 'daily', today);

  try {
    await updateDoc(usageDocRef, {
        [featureName]: increment(1)
    });
  } catch (error) {
    // If the document doesn't exist, 'updateDoc' fails. We need to 'set' it instead.
    if ((error as any).code === 'not-found') {
        await setDoc(usageDocRef, { [featureName]: 1 }, { merge: true });
    } else {
        console.error("Error recording feature usage:", error);
    }
  }
}

export const FEATURE_NAMES = {
  QUOTES: 'QUOTES_GENERATOR',
  STORIES: 'STORY_GENERATOR',
  PHOTO_EDITOR: 'PHOTO_EDITOR',
  PICTURE_GENERATOR: 'PICTURE_GENERATOR',
  FILE_ANALYZER: 'FILE_ANALYZER',
  VIDEO_SCRIPT_GENERATOR: 'VIDEO_SCRIPT_GENERATOR',
  BLOG_POST_WRITER: 'BLOG_POST_WRITER',
  PRESENTATION_GENERATOR: 'PRESENTATION_GENERATOR',
  SOCIAL_MEDIA_CAMPAIGN_PLANNER: 'SOCIAL_MEDIA_CAMPAIGN_PLANNER',
  CHARACTER_PERSONA_GENERATOR: 'CHARACTER_PERSONA_GENERATOR',
  WHAT_IF_SCENARIO_GENERATOR: 'WHAT_IF_SCENARIO_GENERATOR',
  BUSINESS_NAME_GENERATOR: 'BUSINESS_NAME_GENERATOR',
  RECIPE_GENERATOR: 'RECIPE_GENERATOR',
  TRIP_PLANNER: 'TRIP_PLANNER',
  IMAGE_CAPTION_GENERATOR: 'IMAGE_CAPTION_GENERATOR',
  CODE_EXPLAINER: 'CODE_EXPLAINER',
  MUSIC_GENERATOR: 'MUSIC_GENERATOR',
  VIDEO_SLIDESHOW_CREATOR: 'VIDEO_SLIDESHOW_CREATOR',
  INTERACTIVE_STORY_GENERATOR: 'INTERACTIVE_STORY_GENERATOR',
};

function calculateExpiry(type: VipInfo['vipStatus'], activationDate: Date): Date | null {
  const expiry = new Date(activationDate);
  switch (type) {
    case 'monthly':
      expiry.setMonth(expiry.getMonth() + 1);
      return expiry;
    case 'quarterly':
      expiry.setMonth(expiry.getMonth() + 3);
      return expiry;
    case 'yearly':
      expiry.setFullYear(expiry.getFullYear() + 1);
      return expiry;
    case 'lifetime':
    case 'free':
      return null;
    default:
      return null;
  }
}
