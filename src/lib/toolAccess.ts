import { PlanFeatures, SubscriptionPlan } from './planAccess';

export interface ToolConfig {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  category: string;
  badge: string;
  features: string[];
  requiredFeature: keyof PlanFeatures;
  requiredPlan: SubscriptionPlan;
}

// Comprehensive mapping of all 18 parent tools to their subscription requirements
export const getToolRequiredPlan = (requiredFeature: keyof PlanFeatures): SubscriptionPlan => {
  // Free tier tools
  const freeFeatures: (keyof PlanFeatures)[] = [
    'ideaRightsGuide',
    'ferpaOverview', 
    'timelineCalculator',
    'smartLetterGenerator', // Limited to 2/month for free
    'studentProfileManagement' // Limited to 1 child for free
  ];

  // Essential tier tools  
  const essentialFeatures: (keyof PlanFeatures)[] = [
    'goalManagement',
    'meetingScheduler',
    'aiInsights',
    'progressAnalytics',
    'iepReviewTool',
    'unifiedIEPReview',
    'askAIAboutDocs',
    'aiIEPReview',
    'documentVault',
    'parentMessages',
    'communicationTracker',
    'progressNotes',
    'meetingPrepWizard',
    'meetingPrepAssistant',
    'parentMeetingPrep',
    'accommodationBuilder',
    'plan504Builder',
    'goalGenerator',
    'plan504Guide',
    'emotionTracker',
    'parentEmotionTracker'
  ];

  // Premium tier tools
  const premiumFeatures: (keyof PlanFeatures)[] = [
    'expertAnalysis',
    'autismAccommodationBuilder',
    'giftedTwoeSupport',
    'otActivityRecommender'
  ];

  // Hero tier tools
  const heroFeatures: (keyof PlanFeatures)[] = [
    'heroPlan',
    'advocateMatchingTool',
    'expertSupport'
  ];

  if (freeFeatures.includes(requiredFeature)) {
    return 'free';
  } else if (essentialFeatures.includes(requiredFeature)) {
    return 'essential';
  } else if (premiumFeatures.includes(requiredFeature)) {
    return 'premium';
  } else if (heroFeatures.includes(requiredFeature)) {
    return 'hero';
  }
  
  // Default to essential for unknown features
  return 'essential';
};

export const getToolCategory = (title: string): string => {
  const categoryMap: { [key: string]: string } = {
    'Unified IEP Review': 'AI Analysis',
    'Autism Accommodation Builder': 'Specialized Support', 
    'Advocate Matching Tool': 'Professional Support',
    'Gifted & 2e Learners': 'Specialized Support',
    'Smart Letter Generator': 'Communication',
    'Meeting Prep Wizard': 'Meeting Support',
    'Document Vault': 'Organization',
    'Student Profiles': 'Student Management',
    'Expert Analysis': 'Professional Support',
    'Emotion Tracker': 'Wellness Support',
    'IEP Goal Helper': 'IEP Planning',
    'Parent IEP Helper Suite': 'IEP Analysis',
    'Your Child\'s Rights Guide': 'Legal & Rights',
    'Plan 504 Guide': 'Legal & Rights',
    'Progress Notes Tracker': 'Student Management',
    'Ask AI About Documents': 'AI Support',
    'Communication Tracker': 'Communication',
    'OT Activity Recommender': 'Therapy Support'
  };
  
  return categoryMap[title] || 'General';
};