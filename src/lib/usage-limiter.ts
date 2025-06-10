
"use client";

const USAGE_STORAGE_KEY = 'petedianoProUsage';
const VIP_STATUS_KEY = 'isPetedianoProVip';
const DAILY_LIMIT_PER_FEATURE = 5;

interface DailyUsage {
  [featureName: string]: number;
}

interface UsageData {
  [date: string]: DailyUsage;
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
    return localStorage.getItem(VIP_STATUS_KEY) === 'true';
  } catch (error) {
    console.error("Error reading VIP status from localStorage:", error);
    return false;
  }
}

export function setVipStatus(status: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIP_STATUS_KEY, status.toString());
  } catch (error) {
    console.error("Error saving VIP status to localStorage:", error);
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
  ANIMATION_GENERATOR: 'ANIMATION_GENERATOR',
  // New Features
  VIDEO_SCRIPT_GENERATOR: 'VIDEO_SCRIPT_GENERATOR',
  BLOG_POST_WRITER: 'BLOG_POST_WRITER',
  PRESENTATION_GENERATOR: 'PRESENTATION_GENERATOR',
  SOCIAL_MEDIA_CAMPAIGN_PLANNER: 'SOCIAL_MEDIA_CAMPAIGN_PLANNER',
  MUSIC_SUGGESTER: 'MUSIC_SUGGESTER',
  IMAGE_UPSCALER: 'IMAGE_UPSCALER',
  ADVANCED_BACKGROUND_REMOVER: 'ADVANCED_BACKGROUND_REMOVER',
  OBJECT_REMOVER: 'OBJECT_REMOVER',
  DOCUMENT_SUMMARIZER: 'DOCUMENT_SUMMARIZER',
  PROJECT_WORKSPACE: 'PROJECT_WORKSPACE', // Not AI generation, may not need usage limit
  BATCH_PROCESSING: 'BATCH_PROCESSING', // VIP, so limit handled by isUserVip
  BRAND_KIT_MANAGEMENT: 'BRAND_KIT_MANAGEMENT', // VIP, so limit handled by isUserVip
  CHARACTER_PERSONA_GENERATOR: 'CHARACTER_PERSONA_GENERATOR',
  WHAT_IF_SCENARIO_GENERATOR: 'WHAT_IF_SCENARIO_GENERATOR',
};

