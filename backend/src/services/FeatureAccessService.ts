import { UserModel } from '../models/User';

export enum Feature {
  BASIC_ANALYSIS = 'basic_analysis',
  ADVANCED_SEARCH = 'advanced_search',
  QUIZ_GENERATION = 'quiz_generation',
  RESEARCH_DIRECTIONS = 'research_directions',
  EXPORT_SUMMARIES = 'export_summaries',
  BULK_IMPORT = 'bulk_import',
  ADVANCED_NOTES = 'advanced_notes',
  CUSTOM_ACHIEVEMENTS = 'custom_achievements',
}

interface FeatureRequirement {
  feature: Feature;
  minLevel: number;
  description: string;
}

const FEATURE_REQUIREMENTS: FeatureRequirement[] = [
  {
    feature: Feature.BASIC_ANALYSIS,
    minLevel: 1,
    description: 'Generate summaries and analyze articles',
  },
  {
    feature: Feature.ADVANCED_SEARCH,
    minLevel: 2,
    description: 'Search across multiple scientific databases',
  },
  {
    feature: Feature.QUIZ_GENERATION,
    minLevel: 2,
    description: 'Generate quizzes to test your understanding',
  },
  {
    feature: Feature.RESEARCH_DIRECTIONS,
    minLevel: 3,
    description: 'Get AI-powered research direction suggestions',
  },
  {
    feature: Feature.EXPORT_SUMMARIES,
    minLevel: 3,
    description: 'Export summaries and notes',
  },
  {
    feature: Feature.BULK_IMPORT,
    minLevel: 4,
    description: 'Import multiple articles at once',
  },
  {
    feature: Feature.ADVANCED_NOTES,
    minLevel: 4,
    description: 'Advanced note-taking with rich text and tags',
  },
  {
    feature: Feature.CUSTOM_ACHIEVEMENTS,
    minLevel: 5,
    description: 'Create custom achievements and goals',
  },
];

export class FeatureAccessService {
  /**
   * Check if a user has access to a specific feature
   */
  static hasAccess(userId: string, feature: Feature): boolean {
    const user = UserModel.findById(userId);
    
    if (!user) {
      return false;
    }

    const requirement = FEATURE_REQUIREMENTS.find((req) => req.feature === feature);
    
    if (!requirement) {
      // Feature not found, deny access by default
      return false;
    }

    return user.level >= requirement.minLevel;
  }

  /**
   * Get all features with access status for a user
   */
  static getUserFeatures(userId: string): Array<{
    feature: Feature;
    hasAccess: boolean;
    minLevel: number;
    description: string;
  }> {
    const user = UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return FEATURE_REQUIREMENTS.map((req) => ({
      feature: req.feature,
      hasAccess: user.level >= req.minLevel,
      minLevel: req.minLevel,
      description: req.description,
    }));
  }

  /**
   * Get required level for a feature
   */
  static getRequiredLevel(feature: Feature): number | null {
    const requirement = FEATURE_REQUIREMENTS.find((req) => req.feature === feature);
    return requirement ? requirement.minLevel : null;
  }

  /**
   * Get all locked features for a user
   */
  static getLockedFeatures(userId: string): FeatureRequirement[] {
    const user = UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return FEATURE_REQUIREMENTS.filter((req) => user.level < req.minLevel);
  }

  /**
   * Get all unlocked features for a user
   */
  static getUnlockedFeatures(userId: string): FeatureRequirement[] {
    const user = UserModel.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    return FEATURE_REQUIREMENTS.filter((req) => user.level >= req.minLevel);
  }
}
