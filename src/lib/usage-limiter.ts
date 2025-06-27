
"use client";

const USAGE_STORAGE_KEY = 'petedianoProUsage';
const VIP_INFO_KEY = 'petedianoProVipInfo'; // Use the same key as passkeys.ts
const DAILY_LIMIT_PER_FEATURE = 5;

interface DailyUsage {
  [featureName: string]: number;
}

interface UsageData {
  [date: string]: DailyUsage;
}

interface VipInfo {
  passkey: string;
  type: 'monthly' | 'quarterly' | 'yearly' | 'lifetime';
  activationDate: string;
  expiryDate: string | null;
}

function getTodayDateString(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, '0');
  const day = today.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getUsageData(): UsageData {
  if (typeof window === 'undefined') return {};
  try {
    const rawData = localStorage.getItem(USAGE_STORAGE_KEY);
    return rawData ? JSON.parse(rawData) : {};
  } catch (error) {
    console.error("Error reading usage data from localStorage:", error);
    return {};
  }
}

function saveUsageData(data: UsageData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(USAGE_STORAGE_KEY, JSON.stringify(data));
  } catch (error)
    {
    console.error("Error saving usage data to localStorage:", error);
  }
}

export function isUserVip(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const vipInfoRaw = localStorage.getItem(VIP_INFO_KEY);
    if (!vipInfoRaw) {
      return false;
    }
    
    const vipInfo: VipInfo = JSON.parse(vipInfoRaw);

    if (vipInfo.type === 'lifetime') {
      return true;
    }

    if (vipInfo.expiryDate) {
      const expiry = new Date(vipInfo.expiryDate);
      if (expiry > new Date()) {
        return true; // Still valid
      } else {
        // Membership has expired, clear the info
        localStorage.removeItem(VIP_INFO_KEY);
        return false;
      }
    }
    
    return false; // Should not happen if data is well-formed
  } catch (error) {
    console.error("Error reading VIP status from localStorage:", error);
    // In case of parsing error, clear potentially corrupted data
    localStorage.removeItem(VIP_INFO_KEY);
    return false;
  }
}

export function canUseFeature(featureName: string): boolean {
  if (typeof window === 'undefined') return true; // Allow SSR or if localStorage fails
  if (isUserVip()) {
    return true;
  }

  const today = getTodayDateString();
  const usageData = getUsageData();
  
  const todayUsage = usageData[today]?.[featureName] || 0;
  return todayUsage < DAILY_LIMIT_PER_FEATURE;
}

export function recordFeatureUsage(featureName: string): void {
  if (typeof window === 'undefined') return;
  if (isUserVip()) {
    return; // VIP users don't have usage tracked against limits
  }

  const today = getTodayDateString();
  const usageData = getUsageData();

  if (!usageData[today]) {
    usageData[today] = {};
  }
  
  usageData[today][featureName] = (usageData[today][featureName] || 0) + 1;
  saveUsageData(usageData);
}

export const FEATURE_NAMES = {
  QUOTES: 'QUOTES_GENERATOR',
  STORIES: 'STORY_GENERATOR',
  PHOTO_EDITOR: 'PHOTO_EDITOR',
  PICTURE_GENERATOR: 'PICTURE_GENERATOR',
  FILE_ANALYZER: 'FILE_ANALYZER',
  ANIME_STORY_GENERATOR: 'ANIME_STORY_GENERATOR',
  VIDEO_SCRIPT_GENERATOR: 'VIDEO_SCRIPT_GENERATOR',
  BLOG_POST_WRITER: 'BLOG_POST_WRITER',
  PRESENTATION_GENERATOR: 'PRESENTATION_GENERATOR',
  SOCIAL_MEDIA_CAMPAIGN_PLANNER: 'SOCIAL_MEDIA_CAMPAIGN_PLANNER',
  CHARACTER_PERSONA_GENERATOR: 'CHARACTER_PERSONA_GENERATOR',
  WHAT_IF_SCENARIO_GENERATOR: 'WHAT_IF_SCENARIO_GENERATOR',
  LIVE_DIALOGUE_GENERATOR: 'LIVE_DIALOGUE_GENERATOR',
};
