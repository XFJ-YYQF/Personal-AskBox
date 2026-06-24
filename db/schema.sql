CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  nickname TEXT,
  content TEXT NOT NULL,
  answer TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  ip_hash TEXT,
  user_agent TEXT,
  attachment_key TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  answered_at TEXT,
  published_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_questions_status_created
ON questions (status, created_at DESC);
