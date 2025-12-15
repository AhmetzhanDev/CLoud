import { getDatabase } from './database';
import fs from 'fs';
import path from 'path';

export const runMigrations = (): void => {
  const db = getDatabase();
  
  console.log('🔄 Running database migrations...');

  try {
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    
    // Execute the entire schema at once
    // better-sqlite3 can handle multiple statements in exec()
    db.exec(schema);

    // Run additional migrations for existing tables
    migrateResearchDirections(db);

    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Migrate research_directions table to add new columns
const migrateResearchDirections = (db: any): void => {
  try {
    // Check if new columns exist
    const tableInfo = db.prepare("PRAGMA table_info(research_directions)").all();
    const columnNames = tableInfo.map((col: any) => col.name);

    // Add new columns if they don't exist
    if (!columnNames.includes('methodology')) {
      db.exec('ALTER TABLE research_directions ADD COLUMN methodology TEXT');
      console.log('  ✓ Added methodology column to research_directions');
    }
    
    if (!columnNames.includes('pipeline')) {
      db.exec('ALTER TABLE research_directions ADD COLUMN pipeline TEXT');
      console.log('  ✓ Added pipeline column to research_directions');
    }
    
    if (!columnNames.includes('risks')) {
      db.exec('ALTER TABLE research_directions ADD COLUMN risks TEXT');
      console.log('  ✓ Added risks column to research_directions');
    }
    
    if (!columnNames.includes('limitations')) {
      db.exec('ALTER TABLE research_directions ADD COLUMN limitations TEXT');
      console.log('  ✓ Added limitations column to research_directions');
    }
    
    if (!columnNames.includes('future_work')) {
      db.exec('ALTER TABLE research_directions ADD COLUMN future_work TEXT');
      console.log('  ✓ Added future_work column to research_directions');
    }
    
    if (!columnNames.includes('key_references')) {
      db.exec('ALTER TABLE research_directions ADD COLUMN key_references TEXT');
      console.log('  ✓ Added key_references column to research_directions');
    }
  } catch (error) {
    console.error('  ⚠️ Research directions migration warning:', error);
    // Don't throw - this is not critical
  }
};

// Seed initial achievements
export const seedAchievements = (): void => {
  const db = getDatabase();
  
  const achievements = [
    {
      id: 'first-article',
      name: 'First Steps',
      description: 'Upload your first article',
      icon: '📄',
    },
    {
      id: 'first-summary',
      name: 'Quick Learner',
      description: 'Generate your first summary',
      icon: '📝',
    },
    {
      id: 'first-quiz',
      name: 'Test Taker',
      description: 'Complete your first quiz',
      icon: '✅',
    },
    {
      id: 'perfect-score',
      name: 'Perfect Score',
      description: 'Get 100% on a quiz',
      icon: '🏆',
    },
    {
      id: 'ten-articles',
      name: 'Researcher',
      description: 'Analyze 10 articles',
      icon: '📚',
    },
    {
      id: 'level-5',
      name: 'Expert',
      description: 'Reach level 5',
      icon: '⭐',
    },
    {
      id: 'hundred-notes',
      name: 'Note Master',
      description: 'Create 100 notes',
      icon: '📓',
    },
  ];

  const insert = db.prepare(`
    INSERT OR IGNORE INTO achievements (id, name, description, icon)
    VALUES (?, ?, ?, ?)
  `);

  db.transaction(() => {
    for (const achievement of achievements) {
      insert.run(achievement.id, achievement.name, achievement.description, achievement.icon);
    }
  })();

  console.log('✅ Achievements seeded');
};
