/*
  # Create Chat Tables for AI Assistant

  1. New Tables
    - `chat_sessions`
      - `id` (uuid, primary key) - Unique identifier for chat session
      - `user_id` (uuid, foreign key to auth.users) - User who owns the session
      - `document_id` (text) - Associated PLU document ID
      - `created_at` (timestamptz) - When session was created
      - `last_message_at` (timestamptz) - Timestamp of last message in session
      - `is_active` (boolean) - Whether session is currently active
    
    - `chat_messages`
      - `id` (uuid, primary key) - Unique identifier for message
      - `session_id` (uuid, foreign key to chat_sessions) - Associated session
      - `user_id` (uuid, foreign key to auth.users) - User who owns the message
      - `document_id` (text) - Associated PLU document ID for quick queries
      - `role` (text) - Either 'user' or 'assistant'
      - `message` (text) - The actual message content
      - `metadata` (jsonb) - Additional metadata like tokens, model used, etc.
      - `created_at` (timestamptz) - When message was created

  2. Security
    - Enable RLS on both tables
    - Users can only read their own chat sessions and messages
    - Users can only insert their own messages
    - Authenticated users only

  3. Indexes
    - Index on user_id and document_id for fast session lookup
    - Index on session_id for message retrieval
    - Index on created_at for chronological ordering
*/

-- Create chat_sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_message_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  message text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_document 
  ON chat_sessions(user_id, document_id);

CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_active 
  ON chat_sessions(user_id, is_active) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_chat_messages_session 
  ON chat_messages(session_id, created_at);

CREATE INDEX IF NOT EXISTS idx_chat_messages_user_document 
  ON chat_messages(user_id, document_id);

-- Enable Row Level Security
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for chat_sessions
CREATE POLICY "Users can view own chat sessions"
  ON chat_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat sessions"
  ON chat_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for chat_messages
CREATE POLICY "Users can view own chat messages"
  ON chat_messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chat messages"
  ON chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chat messages"
  ON chat_messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own chat messages"
  ON chat_messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);