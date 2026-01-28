-- ============================================
-- ShiftSync Database Schema
-- Premium Event Staffing Platform
-- ============================================
-- This schema is IDEMPOTENT - it can be run multiple times safely

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('business', 'talent')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
DROP POLICY IF EXISTS "Users can read own data" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
DROP POLICY IF EXISTS "Users can update own data" ON public.users;
CREATE POLICY "Users can update own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Service role can insert (for triggers)
DROP POLICY IF EXISTS "Service role can insert users" ON public.users;
CREATE POLICY "Service role can insert users" ON public.users
  FOR INSERT WITH CHECK (true);

-- ============================================
-- BUSINESS PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  logo_url TEXT,
  brand_colors JSONB DEFAULT '{"primary": "#c9a962"}',
  billing_email TEXT,
  stripe_account_id TEXT,
  onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;

-- Business owners can manage their profile
DROP POLICY IF EXISTS "Business owners manage profile" ON public.business_profiles;
CREATE POLICY "Business owners manage profile" ON public.business_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Talent can view business profiles (for gig listings)
DROP POLICY IF EXISTS "Talent can view businesses" ON public.business_profiles;
CREATE POLICY "Talent can view businesses" ON public.business_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'talent')
  );

-- ============================================
-- TALENT PROFILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.talent_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  bio TEXT,
  skills TEXT[] DEFAULT '{}',
  photo_urls TEXT[] DEFAULT '{}',
  phone TEXT,
  hourly_rate_min DECIMAL(10,2),
  available_now BOOLEAN DEFAULT TRUE,
  rating_avg DECIMAL(3,2) DEFAULT 0.00,
  total_shifts INTEGER DEFAULT 0,
  pending_balance DECIMAL(10,2) DEFAULT 0.00,
  available_balance DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.talent_profiles ENABLE ROW LEVEL SECURITY;

-- Talent owns their profile
DROP POLICY IF EXISTS "Talent owns profile" ON public.talent_profiles;
CREATE POLICY "Talent owns profile" ON public.talent_profiles
  FOR ALL USING (auth.uid() = user_id);

-- Business can view talent profiles (for hiring)
DROP POLICY IF EXISTS "Business can view talent" ON public.talent_profiles;
CREATE POLICY "Business can view talent" ON public.talent_profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'business')
  );

-- ============================================
-- SHIFTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.shifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  venue_name TEXT NOT NULL,
  venue_address TEXT,
  role_type TEXT NOT NULL CHECK (role_type IN ('bartender', 'server', 'host', 'valet', 'security', 'coat_check', 'sommelier')),
  workers_needed INTEGER NOT NULL DEFAULT 1,
  workers_confirmed INTEGER DEFAULT 0,
  hourly_rate DECIMAL(10,2) NOT NULL,
  attire_code TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'filled', 'in_progress', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Business manages their own shifts
DROP POLICY IF EXISTS "Business manages own shifts" ON public.shifts;
CREATE POLICY "Business manages own shifts" ON public.shifts
  FOR ALL USING (
    business_id IN (SELECT id FROM public.business_profiles WHERE user_id = auth.uid())
  );

-- Talent can view open shifts
DROP POLICY IF EXISTS "Talent views open shifts" ON public.shifts;
CREATE POLICY "Talent views open shifts" ON public.shifts
  FOR SELECT USING (
    status IN ('open', 'filled', 'in_progress', 'completed')
    AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'talent')
  );

-- ============================================
-- SHIFT ASSIGNMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'invited' CHECK (status IN ('invited', 'pending', 'accepted', 'declined', 'completed', 'no_show')),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  responded_at TIMESTAMPTZ,
  UNIQUE(shift_id, talent_id)
);

ALTER TABLE public.shift_assignments ENABLE ROW LEVEL SECURITY;

-- Business can manage assignments for their shifts
DROP POLICY IF EXISTS "Business manages assignments" ON public.shift_assignments;
CREATE POLICY "Business manages assignments" ON public.shift_assignments
  FOR ALL USING (
    shift_id IN (
      SELECT s.id FROM public.shifts s 
      JOIN public.business_profiles bp ON s.business_id = bp.id
      WHERE bp.user_id = auth.uid()
    )
  );

-- Talent can view their own assignments
DROP POLICY IF EXISTS "Talent views own assignments" ON public.shift_assignments;
CREATE POLICY "Talent views own assignments" ON public.shift_assignments
  FOR SELECT USING (
    talent_id IN (SELECT id FROM public.talent_profiles WHERE user_id = auth.uid())
  );

-- Talent can update their own assignments
DROP POLICY IF EXISTS "Talent updates own assignments" ON public.shift_assignments;
CREATE POLICY "Talent updates own assignments" ON public.shift_assignments
  FOR UPDATE USING (
    talent_id IN (SELECT id FROM public.talent_profiles WHERE user_id = auth.uid())
  );

-- ============================================
-- TIME ENTRIES
-- ============================================
CREATE TABLE IF NOT EXISTS public.time_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.shift_assignments(id) ON DELETE CASCADE,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  hours_worked DECIMAL(5,2),
  amount_earned DECIMAL(10,2),
  approved BOOLEAN DEFAULT FALSE,
  UNIQUE(assignment_id)
);

ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;

-- Business can view and approve time entries for their shifts
DROP POLICY IF EXISTS "Business manages time entries" ON public.time_entries;
CREATE POLICY "Business manages time entries" ON public.time_entries
  FOR ALL USING (
    assignment_id IN (
      SELECT sa.id FROM public.shift_assignments sa
      JOIN public.shifts s ON sa.shift_id = s.id
      JOIN public.business_profiles bp ON s.business_id = bp.id
      WHERE bp.user_id = auth.uid()
    )
  );

-- Talent can view and create their own time entries
DROP POLICY IF EXISTS "Talent manages own time entries" ON public.time_entries;
CREATE POLICY "Talent manages own time entries" ON public.time_entries
  FOR ALL USING (
    assignment_id IN (
      SELECT sa.id FROM public.shift_assignments sa
      JOIN public.talent_profiles tp ON sa.talent_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
  );

-- ============================================
-- AVAILABILITY BLOCKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.availability_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  reason TEXT
);

ALTER TABLE public.availability_blocks ENABLE ROW LEVEL SECURITY;

-- Talent manages their own availability
DROP POLICY IF EXISTS "Talent manages availability" ON public.availability_blocks;
CREATE POLICY "Talent manages availability" ON public.availability_blocks
  FOR ALL USING (
    talent_id IN (SELECT id FROM public.talent_profiles WHERE user_id = auth.uid())
  );

-- ============================================
-- RATINGS
-- ============================================
CREATE TABLE IF NOT EXISTS public.ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.shift_assignments(id) ON DELETE CASCADE,
  rater_id UUID NOT NULL REFERENCES public.users(id),
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
  comment TEXT,
  type TEXT NOT NULL CHECK (type IN ('business_to_talent', 'talent_to_business')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Users can create ratings for their assignments
DROP POLICY IF EXISTS "Users can create ratings" ON public.ratings;
CREATE POLICY "Users can create ratings" ON public.ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Users can view all ratings
DROP POLICY IF EXISTS "Users can view ratings" ON public.ratings;
CREATE POLICY "Users can view ratings" ON public.ratings
  FOR SELECT USING (true);

-- ============================================
-- PAYOUTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  talent_id UUID NOT NULL REFERENCES public.talent_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_payout_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Talent can view their own payouts
DROP POLICY IF EXISTS "Talent views own payouts" ON public.payouts;
CREATE POLICY "Talent views own payouts" ON public.payouts
  FOR SELECT USING (
    talent_id IN (SELECT id FROM public.talent_profiles WHERE user_id = auth.uid())
  );

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update workers_confirmed count
CREATE OR REPLACE FUNCTION public.update_workers_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.shifts
  SET workers_confirmed = (
    SELECT COUNT(*) FROM public.shift_assignments
    WHERE shift_id = COALESCE(NEW.shift_id, OLD.shift_id)
    AND status = 'accepted'
  )
  WHERE id = COALESCE(NEW.shift_id, OLD.shift_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on assignment status change
DROP TRIGGER IF EXISTS on_assignment_status_change ON public.shift_assignments;
CREATE TRIGGER on_assignment_status_change
  AFTER INSERT OR UPDATE OF status ON public.shift_assignments
  FOR EACH ROW EXECUTE FUNCTION public.update_workers_confirmed();

-- Function to update talent rating average
CREATE OR REPLACE FUNCTION public.update_talent_rating()
RETURNS TRIGGER AS $$
DECLARE
  talent_profile_id UUID;
BEGIN
  -- Get the talent_id from the assignment
  SELECT talent_id INTO talent_profile_id
  FROM public.shift_assignments
  WHERE id = NEW.assignment_id;

  -- Update the talent's average rating
  UPDATE public.talent_profiles
  SET rating_avg = (
    SELECT COALESCE(AVG(r.score), 0)
    FROM public.ratings r
    JOIN public.shift_assignments sa ON r.assignment_id = sa.id
    WHERE sa.talent_id = talent_profile_id
    AND r.type = 'business_to_talent'
  )
  WHERE id = talent_profile_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on new rating
DROP TRIGGER IF EXISTS on_rating_created ON public.ratings;
CREATE TRIGGER on_rating_created
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  WHEN (NEW.type = 'business_to_talent')
  EXECUTE FUNCTION public.update_talent_rating();

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_shifts_business_id ON public.shifts(business_id);
CREATE INDEX IF NOT EXISTS idx_shifts_event_date ON public.shifts(event_date);
CREATE INDEX IF NOT EXISTS idx_shifts_status ON public.shifts(status);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_shift_id ON public.shift_assignments(shift_id);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_talent_id ON public.shift_assignments(talent_id);
CREATE INDEX IF NOT EXISTS idx_talent_profiles_skills ON public.talent_profiles USING GIN(skills);
CREATE INDEX IF NOT EXISTS idx_availability_blocks_date ON public.availability_blocks(blocked_date);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================
-- Enable realtime for key tables (ignore errors if already added)
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.shifts;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.shift_assignments;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;

DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.time_entries;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END $$;
