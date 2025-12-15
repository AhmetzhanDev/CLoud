-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  level INTEGER DEFAULT 1,
  points INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL
);

-- User achievements junction table
CREATE TABLE IF NOT EXISTS user_achievements (
  user_id TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, achievement_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT NOT NULL, -- JSON array stored as text
  abstract TEXT NOT NULL,
  content TEXT NOT NULL,
  source TEXT NOT NULL CHECK(source IN ('upload', 'arxiv', 'semantic-scholar', 'url')),
  source_id TEXT,
  file_path TEXT,
  url TEXT,
  publication_date TEXT,
  keywords TEXT NOT NULL, -- JSON array stored as text
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Summaries table
CREATE TABLE IF NOT EXISTS summaries (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  objective TEXT NOT NULL,
  methodology TEXT NOT NULL,
  results TEXT NOT NULL,
  conclusions TEXT NOT NULL,
  key_findings TEXT NOT NULL, -- JSON array stored as text
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Research directions table
CREATE TABLE IF NOT EXISTS research_directions (
  id TEXT PRIMARY KEY,
  article_ids TEXT NOT NULL, -- JSON array stored as text
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  research_questions TEXT NOT NULL, -- JSON array stored as text
  methodology TEXT, -- JSON object stored as text
  pipeline TEXT,
  relevance_score REAL NOT NULL,
  novelty_score REAL NOT NULL,
  rationale TEXT NOT NULL,
  risks TEXT, -- JSON array stored as text
  limitations TEXT, -- JSON array stored as text
  future_work TEXT, -- JSON array stored as text
  key_references TEXT, -- JSON array stored as text
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Quizzes table
CREATE TABLE IF NOT EXISTS quizzes (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL,
  questions TEXT NOT NULL, -- JSON array stored as text
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Quiz results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  answers TEXT NOT NULL, -- JSON array stored as text
  score REAL NOT NULL,
  completed_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  article_id TEXT NOT NULL,
  content TEXT NOT NULL,
  article_section TEXT,
  tags TEXT NOT NULL, -- JSON array stored as text
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_articles_source ON articles(source);
CREATE INDEX IF NOT EXISTS idx_articles_created_at ON articles(created_at);
CREATE INDEX IF NOT EXISTS idx_summaries_article_id ON summaries(article_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_article_id ON quizzes(article_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_quiz_id ON quiz_results(quiz_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_article_id ON notes(article_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);

-- Full-text search for notes
CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
  note_id UNINDEXED,
  content,
  tags
);

-- Trigger to keep FTS table in sync with notes
CREATE TRIGGER IF NOT EXISTS notes_fts_insert AFTER INSERT ON notes BEGIN
  INSERT INTO notes_fts(note_id, content, tags) VALUES (new.id, new.content, new.tags);
END;

CREATE TRIGGER IF NOT EXISTS notes_fts_update AFTER UPDATE ON notes BEGIN
  UPDATE notes_fts SET content = new.content, tags = new.tags WHERE note_id = new.id;
END;

CREATE TRIGGER IF NOT EXISTS notes_fts_delete AFTER DELETE ON notes BEGIN
  DELETE FROM notes_fts WHERE note_id = old.id;
END;
