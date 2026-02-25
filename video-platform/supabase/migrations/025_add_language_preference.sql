-- Add language_preference column to profiles if it doesn't exist
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create an index on language_preference for faster queries
CREATE INDEX IF NOT EXISTS idx_profiles_language_preference ON public.profiles(language_preference);
