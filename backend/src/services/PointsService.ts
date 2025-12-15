import { UserModel } from '../models/User';

export enum PointAction {
  UPLOAD_ARTICLE = 'upload_article',
  GENERATE_SUMMARY = 'generate_summary',
  GENERATE_QUIZ = 'generate_quiz',
  COMPLETE_QUIZ = 'complete_quiz',
  PERFECT_QUIZ = 'perfect_quiz',
  CREATE_NOTE = 'create_note',
  GENERATE_DIRECTIONS = 'generate_directions',
  IMPORT_ARTICLE = 'import_article',
}

const POINT_VALUES: Record<PointAction, number> = {
  [PointAction.UPLOAD_ARTICLE]: 10,
  [PointAction.GENERATE_SUMMARY]: 20,
  [PointAction.GENERATE_QUIZ]: 15,
  [PointAction.COMPLETE_QUIZ]: 25,
  [PointAction.PERFECT_QUIZ]: 50,
  [PointAction.CREATE_NOTE]: 5,
  [PointAction.GENERATE_DIRECTIONS]: 30,
  [PointAction.IMPORT_ARTICLE]: 10,
};

export class PointsService {
  /**
   * Award points to a user for a specific action
   */
  static awardPoints(userId: string, action: PointAction): number {
    const points = POINT_VALUES[action];
    
    if (!points) {
      throw new Error(`Invalid point action: ${action}`);
    }

    UserModel.addPoints(userId, points);
    
    return points;
  }

  /**
   * Award custom points amount to a user
   */
  static awardCustomPoints(userId: string, points: number): void {
    if (points <= 0) {
      throw new Error('Points must be positive');
    }

    UserModel.addPoints(userId, points);
  }

  /**
   * Get point value for a specific action
   */
  static getPointValue(action: PointAction): number {
    return POINT_VALUES[action] || 0;
  }

  /**
   * Get all point values
   */
  static getAllPointValues(): Record<PointAction, number> {
    return { ...POINT_VALUES };
  }
}
