CREATE TABLE IF NOT EXISTS user_friends (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  friend_id UUID NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, blocked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_friends_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
    
  CONSTRAINT fk_user_friends_friend
    FOREIGN KEY (friend_id) REFERENCES users(id)
    ON DELETE CASCADE,
    
  -- Prevent self-friendship
  CONSTRAINT chk_no_self_friend CHECK (user_id != friend_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_friends_user_id ON user_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_friend_id ON user_friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON user_friends(status);

-- Create unique constraint to prevent duplicate friend relationships
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_friends_unique ON user_friends(user_id, friend_id);
