import { getDatabase } from '../config/database';
import { User, CreateUser, Achievement, UserSchema, AchievementSchema } from '../../../shared/src/types/user';
import { v4 as uuidv4 } from 'uuid';
import { queryAll, queryOne, execute } from '../utils/db';

export class UserModel {
  static create(data: CreateUser): User {
    const db = getDatabase();
    const id = uuidv4();
    const now = new Date().toISOString();

    execute(
      db,
      `INSERT INTO users (id, name, email, level, points, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.name, data.email, 1, 0, now]
    );

    const user = this.findById(id);
    if (!user) {
      throw new Error('Failed to create user');
    }

    return UserSchema.parse(user);
  }

  static findById(id: string): User | null {
    const db = getDatabase();
    const row = queryOne(db, 'SELECT * FROM users WHERE id = ?', [id]);

    if (!row) return null;

    const achievements = this.getUserAchievements(id);

    return UserSchema.parse({
      ...row,
      createdAt: row.created_at,
      achievements,
    });
  }

  static findByEmail(email: string): User | null {
    const db = getDatabase();
    const row = queryOne(db, 'SELECT * FROM users WHERE email = ?', [email]);

    if (!row) return null;

    const achievements = this.getUserAchievements(row.id);

    return UserSchema.parse({
      ...row,
      createdAt: row.created_at,
      achievements,
    });
  }

  static findAll(options?: { limit?: number; offset?: number }): User[] {
    const db = getDatabase();
    let sql = 'SELECT * FROM users ORDER BY points DESC';
    const params: any[] = [];

    if (options?.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);
    }

    if (options?.offset) {
      sql += ' OFFSET ?';
      params.push(options.offset);
    }

    const rows = queryAll(db, sql, params);
    return rows.map(row => {
      const achievements = this.getUserAchievements(row.id);
      return UserSchema.parse({
        ...row,
        createdAt: row.created_at,
        achievements,
      });
    });
  }

  static update(id: string, data: Partial<{ name: string; email: string; level: number; points: number }>): User | null {
    const db = getDatabase();
    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.email !== undefined) {
      updates.push('email = ?');
      params.push(data.email);
    }
    if (data.level !== undefined) {
      updates.push('level = ?');
      params.push(data.level);
    }
    if (data.points !== undefined) {
      updates.push('points = ?');
      params.push(data.points);
    }

    if (updates.length === 0) {
      return this.findById(id);
    }

    params.push(id);

    execute(db, `UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  static addPoints(id: string, points: number): User | null {
    const db = getDatabase();
    execute(db, 'UPDATE users SET points = points + ? WHERE id = ?', [points, id]);
    
    // Check if user should level up (every 100 points = 1 level)
    const user = this.findById(id);
    if (user) {
      const newLevel = Math.floor(user.points / 100) + 1;
      if (newLevel > user.level) {
        this.update(id, { level: newLevel });
      }
    }

    return this.findById(id);
  }

  static delete(id: string): boolean {
    const db = getDatabase();
    const result = execute(db, 'DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }

  // Achievement methods
  static getUserAchievements(userId: string): Achievement[] {
    const db = getDatabase();
    const rows = queryAll(
      db,
      `SELECT a.*, ua.unlocked_at
       FROM achievements a
       JOIN user_achievements ua ON a.id = ua.achievement_id
       WHERE ua.user_id = ?
       ORDER BY ua.unlocked_at DESC`,
      [userId]
    );

    return rows.map(row =>
      AchievementSchema.parse({
        ...row,
        unlockedAt: row.unlocked_at,
      })
    );
  }

  static unlockAchievement(userId: string, achievementId: string): boolean {
    const db = getDatabase();
    const now = new Date().toISOString();

    try {
      execute(
        db,
        `INSERT INTO user_achievements (user_id, achievement_id, unlocked_at)
         VALUES (?, ?, ?)`,
        [userId, achievementId, now]
      );
      return true;
    } catch (error) {
      // Achievement already unlocked or doesn't exist
      return false;
    }
  }

  static getAllAchievements(): Achievement[] {
    const db = getDatabase();
    const rows = queryAll(db, 'SELECT * FROM achievements ORDER BY name');

    return rows.map(row =>
      AchievementSchema.parse({
        ...row,
        unlockedAt: undefined,
      })
    );
  }
}
