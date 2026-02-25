-- Add language preference to profiles table
ALTER TABLE profiles ADD COLUMN language_preference TEXT DEFAULT 'en';

-- Create index for faster queries
CREATE INDEX idx_profiles_language_preference ON profiles(language_preference);

-- Add constraint to ensure only valid languages are stored
ALTER TABLE profiles ADD CONSTRAINT check_valid_language 
CHECK (language_preference IN ('en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru', 'ar'));
