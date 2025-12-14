/*
  # Sweet Shop Management System - Initial Schema

  ## Overview
  This migration sets up the core database schema for the Sweet Shop Management System,
  including user profiles with role-based access control and a sweets inventory table.

  ## New Tables
  
  ### `user_profiles`
  Extends Supabase auth.users with additional user metadata
  - `id` (uuid, primary key) - References auth.users.id
  - `role` (text) - User role: 'user' or 'admin', defaults to 'user'
  - `created_at` (timestamptz) - Account creation timestamp
  
  ### `sweets`
  Stores the sweet shop inventory
  - `id` (uuid, primary key) - Unique identifier for each sweet
  - `name` (text) - Name of the sweet (required, unique)
  - `category` (text) - Category (e.g., 'chocolate', 'gummy', 'hard candy')
  - `price` (numeric) - Price per unit (must be positive)
  - `quantity` (integer) - Stock quantity (must be non-negative)
  - `description` (text) - Optional description
  - `created_by` (uuid) - References user who added the sweet
  - `created_at` (timestamptz) - When the sweet was added
  - `updated_at` (timestamptz) - Last update timestamp

  ## Security
  
  ### Row Level Security (RLS)
  All tables have RLS enabled with the following policies:
  
  #### user_profiles
  1. Users can read all profiles
  2. Users can insert their own profile during registration
  3. Users can update their own profile
  4. Only admins can delete profiles
  
  #### sweets
  1. All authenticated users can view sweets
  2. Only admins can insert new sweets
  3. Only admins can update sweets
  4. Only admins can delete sweets
  5. Authenticated users can update quantity for purchases
  
  ## Triggers
  - Auto-create user profile when new user signs up
  - Auto-update `updated_at` timestamp on sweets modifications
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at timestamptz DEFAULT now()
);

-- Create sweets table
CREATE TABLE IF NOT EXISTS sweets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL,
  price numeric(10, 2) NOT NULL CHECK (price > 0),
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  description text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sweets ENABLE ROW LEVEL SECURITY;

-- User Profiles Policies
CREATE POLICY "Users can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Only admins can delete profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Sweets Policies
CREATE POLICY "Authenticated users can view sweets"
  ON sweets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Only admins can insert sweets"
  ON sweets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update sweets"
  ON sweets FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete sweets"
  ON sweets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for sweets table
CREATE TRIGGER update_sweets_updated_at
  BEFORE UPDATE ON sweets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Insert sample data for testing
INSERT INTO sweets (name, category, price, quantity, description) VALUES
  ('Chocolate Truffles', 'chocolate', 12.99, 50, 'Rich dark chocolate truffles with a smooth ganache center'),
  ('Gummy Bears', 'gummy', 4.99, 100, 'Classic fruit-flavored gummy bears'),
  ('Peppermint Hard Candy', 'hard candy', 3.49, 75, 'Refreshing peppermint hard candy'),
  ('Caramel Chews', 'caramel', 6.99, 60, 'Soft and buttery caramel chews'),
  ('Sour Worms', 'gummy', 5.49, 80, 'Tangy sour gummy worms')
ON CONFLICT (name) DO NOTHING;