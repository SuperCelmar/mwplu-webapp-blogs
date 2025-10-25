/*
  # Add User ID Tracking to Webhook Tables

  ## Overview
  This migration adds user_id tracking to contact_messages and donations tables
  to enable better user analytics, support tracking, and personalized services.

  ## New Tables Created
  
  ### 1. contact_messages
    - `id` (uuid, primary key) - Unique identifier for each contact message
    - `name` (text, required) - Name of the person contacting
    - `email` (text, required) - Email address of the contact
    - `subject` (text, required) - Subject/category of the message
    - `message` (text, required) - The actual message content
    - `user_id` (uuid, optional) - Foreign key to auth.users for authenticated users
    - `status` (text, default 'pending') - Status of message processing
    - `created_at` (timestamptz) - When the message was created
    - `updated_at` (timestamptz) - When the message was last updated

  ### 2. donations
    - `id` (uuid, primary key) - Unique identifier for each donation
    - `amount` (numeric, required) - Donation amount
    - `reference` (text, required) - Payment reference/transaction ID
    - `email` (text, required) - Email address of donor
    - `payment_method` (text, default 'stripe') - Payment method used
    - `user_id` (uuid, optional) - Foreign key to auth.users for authenticated users
    - `status` (text, default 'completed') - Status of donation
    - `created_at` (timestamptz) - When the donation was made

  ## Security Features (RLS Policies)
  
  ### contact_messages policies:
    - Users can view their own messages
    - Users can insert their own messages
    - Anonymous users can insert messages (user_id will be null)
    - Service role can manage all messages
  
  ### donations policies:
    - Users can view their own donations
    - Authenticated users can insert donations
    - Service role can manage all donations
  
  ## Indexes
  - user_id indexes on both tables for query performance
  - email indexes for lookups
  - created_at indexes for time-based queries

  ## Important Notes
  - user_id is optional to support anonymous contact/donation submissions
  - RLS is enabled on all tables for security
  - Policies are restrictive by default - only authenticated users can access their own data
  - Anonymous submissions are allowed but have no read access
*/

-- ============================================================================
-- CONTACT MESSAGES TABLE
-- ============================================================================

-- Create contact_messages table
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on contact_messages
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for contact_messages
DROP POLICY IF EXISTS "Users can view own messages" ON contact_messages;
CREATE POLICY "Users can view own messages"
  ON contact_messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert own messages" ON contact_messages;
CREATE POLICY "Authenticated users can insert own messages"
  ON contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous users can insert messages" ON contact_messages;
CREATE POLICY "Anonymous users can insert messages"
  ON contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Service role can manage all messages" ON contact_messages;
CREATE POLICY "Service role can manage all messages"
  ON contact_messages
  FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for contact_messages
CREATE INDEX IF NOT EXISTS idx_contact_messages_user_id ON contact_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ============================================================================
-- DONATIONS TABLE
-- ============================================================================

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC(10,2) NOT NULL,
  reference TEXT NOT NULL,
  email TEXT NOT NULL,
  payment_method TEXT DEFAULT 'stripe',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'completed',
  currency TEXT DEFAULT 'eur',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for donations
DROP POLICY IF EXISTS "Users can view own donations" ON donations;
CREATE POLICY "Users can view own donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert donations" ON donations;
CREATE POLICY "Authenticated users can insert donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anonymous users can insert donations" ON donations;
CREATE POLICY "Anonymous users can insert donations"
  ON donations
  FOR INSERT
  TO anon
  WITH CHECK (user_id IS NULL);

DROP POLICY IF EXISTS "Service role can manage all donations" ON donations;
CREATE POLICY "Service role can manage all donations"
  ON donations
  FOR ALL
  USING (auth.role() = 'service_role');

-- Indexes for donations
CREATE INDEX IF NOT EXISTS idx_donations_user_id ON donations(user_id);
CREATE INDEX IF NOT EXISTS idx_donations_email ON donations(email);
CREATE INDEX IF NOT EXISTS idx_donations_status ON donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_created_at ON donations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_donations_reference ON donations(reference);

-- ============================================================================
-- TRIGGER FUNCTION FOR AUTO-UPDATING updated_at
-- ============================================================================

-- Create or replace the trigger function (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to contact_messages
DROP TRIGGER IF EXISTS update_contact_messages_updated_at ON contact_messages;
CREATE TRIGGER update_contact_messages_updated_at
    BEFORE UPDATE ON contact_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
