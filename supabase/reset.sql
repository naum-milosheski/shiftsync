-- ============================================
-- ShiftSync Auto-Healing Database Reset
-- ============================================
-- This script creates a function that resets the database
-- to its "Golden State" and schedules it to run every 30 minutes.
--
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
-- ============================================

-- Enable pg_cron extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Grant usage to postgres (required for cron jobs)
GRANT USAGE ON SCHEMA cron TO postgres;

-- ============================================
-- RESET FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION reset_to_golden_state()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- ============================================
  -- STEP 1: TRUNCATE ALL DATA TABLES
  -- Order matters due to foreign key constraints
  -- ============================================
  
  TRUNCATE TABLE public.time_entries CASCADE;
  TRUNCATE TABLE public.ratings CASCADE;
  TRUNCATE TABLE public.payouts CASCADE;
  TRUNCATE TABLE public.availability_blocks CASCADE;
  TRUNCATE TABLE public.shift_assignments CASCADE;
  TRUNCATE TABLE public.shifts CASCADE;
  TRUNCATE TABLE public.talent_profiles CASCADE;
  TRUNCATE TABLE public.business_profiles CASCADE;
  -- Note: We don't truncate public.users as they're linked to auth.users
  -- Instead, we'll delete non-auth users and re-insert demo data
  
  DELETE FROM public.users WHERE id NOT IN (
    SELECT id FROM auth.users
  );

  -- ============================================
  -- STEP 2: RE-INSERT SEED DATA
  -- ============================================

  -- Temporarily disable the FK constraint on users table
  ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

  -- Business Users
  INSERT INTO public.users (id, email, role, created_at) VALUES
    ('b1000000-0000-0000-0000-000000000001', 'contact@sterling-events.com', 'business', NOW() - INTERVAL '90 days'),
    ('b1000000-0000-0000-0000-000000000002', 'hello@luxe-occasions.com', 'business', NOW() - INTERVAL '85 days'),
    ('b1000000-0000-0000-0000-000000000003', 'info@grandcollective.com', 'business', NOW() - INTERVAL '80 days'),
    ('b1000000-0000-0000-0000-000000000004', 'team@obsidian-affairs.com', 'business', NOW() - INTERVAL '75 days'),
    ('b1000000-0000-0000-0000-000000000005', 'events@roseivy.com', 'business', NOW() - INTERVAL '70 days')
  ON CONFLICT (id) DO NOTHING;

  -- Talent Users
  INSERT INTO public.users (id, email, role, created_at) VALUES
    ('a1000000-0000-0000-0000-000000000001', 'marcus.beaumont@email.com', 'talent', NOW() - INTERVAL '120 days'),
    ('a1000000-0000-0000-0000-000000000002', 'isabella.vance@email.com', 'talent', NOW() - INTERVAL '115 days'),
    ('a1000000-0000-0000-0000-000000000003', 'james.thornton@email.com', 'talent', NOW() - INTERVAL '110 days'),
    ('a1000000-0000-0000-0000-000000000004', 'sophia.chen@email.com', 'talent', NOW() - INTERVAL '105 days'),
    ('a1000000-0000-0000-0000-000000000005', 'olivier.dubois@email.com', 'talent', NOW() - INTERVAL '100 days'),
    ('a1000000-0000-0000-0000-000000000006', 'elena.rossi@email.com', 'talent', NOW() - INTERVAL '95 days'),
    ('a1000000-0000-0000-0000-000000000007', 'william.sterling@email.com', 'talent', NOW() - INTERVAL '90 days'),
    ('a1000000-0000-0000-0000-000000000008', 'charlotte.ashford@email.com', 'talent', NOW() - INTERVAL '88 days'),
    ('a1000000-0000-0000-0000-000000000009', 'sebastian.wright@email.com', 'talent', NOW() - INTERVAL '86 days'),
    ('a1000000-0000-0000-0000-000000000010', 'victoria.hayes@email.com', 'talent', NOW() - INTERVAL '84 days'),
    ('a1000000-0000-0000-0000-000000000011', 'alexander.reed@email.com', 'talent', NOW() - INTERVAL '82 days'),
    ('a1000000-0000-0000-0000-000000000012', 'emma.blackwell@email.com', 'talent', NOW() - INTERVAL '80 days'),
    ('a1000000-0000-0000-0000-000000000013', 'nicholas.crane@email.com', 'talent', NOW() - INTERVAL '78 days'),
    ('a1000000-0000-0000-0000-000000000014', 'amelia.frost@email.com', 'talent', NOW() - INTERVAL '76 days'),
    ('a1000000-0000-0000-0000-000000000015', 'benjamin.cole@email.com', 'talent', NOW() - INTERVAL '74 days'),
    ('a1000000-0000-0000-0000-000000000016', 'alexandra.weston@email.com', 'talent', NOW() - INTERVAL '72 days'),
    ('a1000000-0000-0000-0000-000000000017', 'christian.blake@email.com', 'talent', NOW() - INTERVAL '70 days'),
    ('a1000000-0000-0000-0000-000000000018', 'diana.pierce@email.com', 'talent', NOW() - INTERVAL '68 days'),
    ('a1000000-0000-0000-0000-000000000019', 'maxfield.grant@email.com', 'talent', NOW() - INTERVAL '66 days'),
    ('a1000000-0000-0000-0000-000000000020', 'natalie.sinclair@email.com', 'talent', NOW() - INTERVAL '64 days')
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- BUSINESS PROFILES
  -- ============================================
  INSERT INTO public.business_profiles (id, user_id, company_name, logo_url, brand_colors, billing_email, onboarding_complete) VALUES
    ('bb100000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Sterling Events', 'https://api.dicebear.com/7.x/shapes/svg?seed=sterling', '{"primary": "#1a365d", "secondary": "#3182ce"}', 'billing@sterling-events.com', true),
    ('bb100000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000002', 'Luxe Occasions', 'https://api.dicebear.com/7.x/shapes/svg?seed=luxe', '{"primary": "#7c3aed", "secondary": "#a78bfa"}', 'billing@luxe-occasions.com', true),
    ('bb100000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000003', 'The Grand Collective', 'https://api.dicebear.com/7.x/shapes/svg?seed=grand', '{"primary": "#c9a962", "secondary": "#fbbf24"}', 'billing@grandcollective.com', true),
    ('bb100000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000004', 'Obsidian Affairs', 'https://api.dicebear.com/7.x/shapes/svg?seed=obsidian', '{"primary": "#0f0f0f", "secondary": "#374151"}', 'billing@obsidian-affairs.com', true),
    ('bb100000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000005', 'Rose & Ivy Catering', 'https://api.dicebear.com/7.x/shapes/svg?seed=roseivy', '{"primary": "#be185d", "secondary": "#f472b6"}', 'billing@roseivy.com', true)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- TALENT PROFILES
  -- ============================================
  INSERT INTO public.talent_profiles (id, user_id, full_name, bio, skills, photo_urls, phone, hourly_rate_min, available_now, rating_avg, total_shifts, pending_balance, available_balance) VALUES
    ('aa100000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Marcus Beaumont', 'Master mixologist with 12 years of experience at world-class establishments including The Savoy and The Ritz.', ARRAY['Bartender', 'Mixology', 'Craft Cocktails', 'Molecular Mixology', 'Wine Service'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'], '+1 (555) 100-0001', 55.00, true, 4.95, 47, 0.00, 2840.00),
    ('aa100000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Isabella Vance', 'Award-winning bartender with expertise in classic cocktails and speakeasy-style service.', ARRAY['Bartender', 'Classic Cocktails', 'Wine Service', 'Sommelier', 'Spirits Pairing'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=isabella'], '+1 (555) 100-0002', 50.00, true, 4.88, 52, 380.00, 3200.00),
    ('aa100000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000003', 'James Thornton', 'British-trained bartender specializing in high-volume luxury events.', ARRAY['Bartender', 'High-Volume Service', 'Corporate Events', 'VIP Service'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=james'], '+1 (555) 100-0003', 48.00, true, 4.72, 38, 0.00, 1920.00),
    ('aa100000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000004', 'Sophia Chen', 'Contemporary cocktail artist blending Eastern and Western techniques.', ARRAY['Bartender', 'Sake Service', 'Japanese Whisky', 'Bespoke Menus', 'Asian Fusion'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=sophia'], '+1 (555) 100-0004', 52.00, true, 4.91, 29, 520.00, 1560.00),
    ('aa100000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000005', 'Olivier Dubois', 'French-trained beverage specialist with expertise in champagne service and fine wine.', ARRAY['Bartender', 'Champagne Service', 'Fine Wine', 'French Service', 'Bilingual'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=olivier'], '+1 (555) 100-0005', 55.00, false, 4.96, 61, 0.00, 4270.00),
    ('aa100000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000006', 'Elena Rossi', 'Italian hospitality professional with a focus on aperitivo culture and Mediterranean cocktails.', ARRAY['Bartender', 'Aperitivo', 'Mediterranean Cocktails', 'Wedding Service'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=elena'], '+1 (555) 100-0006', 45.00, true, 4.68, 44, 180.00, 2100.00),
    ('aa100000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000007', 'William Sterling', 'Executive bartender specializing in private estates and black-tie affairs.', ARRAY['Bartender', 'VIP Service', 'Private Events', 'Executive Service', 'Discrete'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=william'], '+1 (555) 100-0007', 60.00, true, 5.00, 15, 0.00, 900.00),
    ('aa100000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000008', 'Charlotte Ashford', 'Classically trained in French service with 8 years at Michelin-starred establishments.', ARRAY['Server', 'Fine Dining', 'French Service', 'Sommelier', 'Wine Pairing'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=charlotte'], '+1 (555) 100-0008', 42.00, true, 4.92, 67, 420.00, 4200.00),
    ('aa100000-0000-0000-0000-000000000009', 'a1000000-0000-0000-0000-000000000009', 'Sebastian Wright', 'Luxury banquet captain with experience leading teams of 20+ servers.', ARRAY['Server', 'Banquet Captain', 'Team Leadership', 'Gala Events', 'Fundraisers'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=sebastian'], '+1 (555) 100-0009', 45.00, true, 4.85, 83, 0.00, 4980.00),
    ('aa100000-0000-0000-0000-000000000010', 'a1000000-0000-0000-0000-000000000010', 'Victoria Hayes', 'Elegant server with runway model poise. Extensive experience with fashion industry events.', ARRAY['Server', 'Fashion Events', 'Product Launches', 'Media', 'Promotional'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=victoria'], '+1 (555) 100-0010', 40.00, true, 4.78, 39, 280.00, 1820.00),
    ('aa100000-0000-0000-0000-000000000011', 'a1000000-0000-0000-0000-000000000011', 'Alexander Reed', 'Former yacht steward transitioning to land-based luxury events.', ARRAY['Server', 'Yacht Service', 'Butler Service', 'UHNW Clients', 'Discrete'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=alexander'], '+1 (555) 100-0011', 50.00, false, 4.90, 28, 0.00, 1680.00),
    ('aa100000-0000-0000-0000-000000000012', 'a1000000-0000-0000-0000-000000000012', 'Emma Blackwell', 'Detail-oriented server with expertise in dietary accommodations and allergy awareness.', ARRAY['Server', 'Dietary Specialist', 'Allergy Awareness', 'Guest Communication', 'Fine Dining'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=emma'], '+1 (555) 100-0012', 38.00, true, 4.82, 55, 190.00, 2475.00),
    ('aa100000-0000-0000-0000-000000000013', 'a1000000-0000-0000-0000-000000000013', 'Nicholas Crane', 'Energetic and efficient server excelling in high-paced cocktail receptions.', ARRAY['Server', 'Cocktail Receptions', 'High-Volume', 'Guest Relations', 'Attentive'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=nicholas'], '+1 (555) 100-0013', 35.00, true, 4.65, 72, 0.00, 2880.00),
    ('aa100000-0000-0000-0000-000000000014', 'a1000000-0000-0000-0000-000000000014', 'Amelia Frost', 'Refined server with a background in five-star hotel dining rooms.', ARRAY['Server', 'Hotel Dining', 'Tableside Service', 'Guéridon', 'Five-Star'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=amelia'], '+1 (555) 100-0014', 43.00, true, 4.88, 48, 344.00, 2408.00),
    ('aa100000-0000-0000-0000-000000000015', 'a1000000-0000-0000-0000-000000000015', 'Benjamin Cole', 'Versatile server comfortable in any setting from intimate dinners to 500-guest galas.', ARRAY['Server', 'Versatile', 'Large Events', 'Team Player', 'Adaptable'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=benjamin'], '+1 (555) 100-0015', 32.00, true, 4.55, 91, 128.00, 3276.00),
    ('aa100000-0000-0000-0000-000000000016', 'a1000000-0000-0000-0000-000000000016', 'Alexandra Weston', 'Premier event hostess with a background in luxury brand ambassadorship.', ARRAY['Host', 'Brand Ambassador', 'Multilingual', 'VIP Reception', 'Protocol'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=alexandra'], '+1 (555) 100-0016', 40.00, true, 4.97, 34, 0.00, 1700.00),
    ('aa100000-0000-0000-0000-000000000017', 'a1000000-0000-0000-0000-000000000017', 'Christian Blake', 'Charismatic host specializing in guest flow management and VIP handling.', ARRAY['Host', 'Guest Flow', 'VIP Handling', 'Nightlife', 'Security Coordination'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=christian'], '+1 (555) 100-0017', 38.00, true, 4.72, 56, 228.00, 2508.00),
    ('aa100000-0000-0000-0000-000000000018', 'a1000000-0000-0000-0000-000000000018', 'Diana Pierce', 'Elegant hostess with exceptional memory for names and faces.', ARRAY['Host', 'Guest Relations', 'Name Recall', 'Executive Support', 'Welcoming'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=diana'], '+1 (555) 100-0018', 36.00, false, 4.85, 42, 0.00, 1764.00),
    ('aa100000-0000-0000-0000-000000000019', 'a1000000-0000-0000-0000-000000000019', 'Maxfield Grant', 'Professional coat check and cloakroom attendant with luxury hotel experience.', ARRAY['Host', 'Coat Check', 'Cloakroom', 'Valuables Care', 'Organization'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=maxfield'], '+1 (555) 100-0019', 32.00, true, 4.68, 63, 96.00, 2268.00),
    ('aa100000-0000-0000-0000-000000000020', 'a1000000-0000-0000-0000-000000000020', 'Natalie Sinclair', 'Warm and gracious hostess who sets the tone for memorable events.', ARRAY['Host', 'Charity Events', 'Cultural Events', 'Museum', 'Gracious'], ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=natalie'], '+1 (555) 100-0020', 35.00, true, 4.80, 45, 175.00, 1750.00)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- DEMO LOGIN ACCOUNTS (Password-authenticated)
  -- These are the demo accounts created by seed-demo-users.ts
  -- We look them up dynamically by email from auth.users
  -- ============================================
  
  -- Re-create demo business user entry
  INSERT INTO public.users (id, email, role, created_at)
  SELECT id, email, 'business', NOW()
  FROM auth.users 
  WHERE email = 'demo.business@shiftsync.com'
  ON CONFLICT (id) DO UPDATE SET role = 'business';

  -- Re-create demo business profile
  INSERT INTO public.business_profiles (user_id, company_name, logo_url, brand_colors, billing_email, onboarding_complete)
  SELECT 
    id,
    'Demo Events Co.',
    'https://api.dicebear.com/7.x/shapes/svg?seed=demo',
    '{"primary": "#c9a962", "secondary": "#1a1a2e"}',
    'demo.business@shiftsync.com',
    true
  FROM auth.users 
  WHERE email = 'demo.business@shiftsync.com'
  ON CONFLICT (user_id) DO NOTHING;

  -- Re-create demo talent user entry
  INSERT INTO public.users (id, email, role, created_at)
  SELECT id, email, 'talent', NOW()
  FROM auth.users 
  WHERE email = 'demo.talent@shiftsync.com'
  ON CONFLICT (id) DO UPDATE SET role = 'talent';

  -- Re-create demo talent profile
  INSERT INTO public.talent_profiles (user_id, full_name, bio, skills, photo_urls, hourly_rate_min, available_now, rating_avg, total_shifts, pending_balance, available_balance)
  SELECT 
    id,
    'Demo Talent',
    'Demo account for testing the ShiftSync talent experience. Try accepting shifts, managing availability, and exploring the earnings dashboard.',
    ARRAY['Bartender', 'Server', 'Host'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=demo-talent'],
    35.00,
    true,
    4.85,
    12,
    0.00,
    450.00
  FROM auth.users 
  WHERE email = 'demo.talent@shiftsync.com'
  ON CONFLICT (user_id) DO NOTHING;

  -- ============================================
  -- DEMO EVENTS CO. SHIFTS (7 Completed + 3 Upcoming)
  -- ============================================
  -- Insert shifts for the demo business account using dynamic lookup
  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000001'::uuid,
    bp.id,
    'Private Wine Dinner',
    'Intimate wine pairing dinner for distinguished collectors. Sommelier knowledge preferred.',
    CURRENT_DATE - INTERVAL '52 days',
    '18:30',
    '23:30',
    'The Wine Cellar at Gramercy',
    '28 Gramercy Park South, New York, NY',
    'server',
    4,
    4,
    55.00,
    'Black suit, burgundy tie',
    'completed',
    CURRENT_DATE - INTERVAL '58 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000002'::uuid,
    bp.id,
    'Film Premiere After-Party',
    'Exclusive after-party for major studio film premiere. High-profile guests expected.',
    CURRENT_DATE - INTERVAL '42 days',
    '22:00',
    '03:00',
    'Cipriani Wall Street',
    '55 Wall Street, New York, NY',
    'bartender',
    5,
    5,
    60.00,
    'All black, sleek modern',
    'completed',
    CURRENT_DATE - INTERVAL '48 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000003'::uuid,
    bp.id,
    'Executive Board Dinner',
    'Private dinner for Fortune 500 board of directors. Discretion paramount.',
    CURRENT_DATE - INTERVAL '35 days',
    '19:00',
    '23:00',
    'Private Club - Fifth Avenue',
    NULL,
    'server',
    3,
    3,
    58.00,
    'Black tuxedo required',
    'completed',
    CURRENT_DATE - INTERVAL '40 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000004'::uuid,
    bp.id,
    'Charity Auction Gala',
    'Annual fundraiser supporting arts education. Black-tie affair for 300 guests.',
    CURRENT_DATE - INTERVAL '28 days',
    '18:00',
    '00:00',
    'The Metropolitan Museum of Art',
    '1000 Fifth Avenue, New York, NY',
    'server',
    8,
    8,
    52.00,
    'Black tuxedo, white gloves',
    'completed',
    CURRENT_DATE - INTERVAL '33 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000005'::uuid,
    bp.id,
    'Anniversary Celebration',
    'Golden anniversary celebration at a private estate. Elegant garden party atmosphere.',
    CURRENT_DATE - INTERVAL '21 days',
    '16:00',
    '22:00',
    'Westbury Gardens',
    '71 Old Westbury Road, Old Westbury, NY',
    'bartender',
    3,
    3,
    50.00,
    'White jacket, black bow tie',
    'completed',
    CURRENT_DATE - INTERVAL '26 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000006'::uuid,
    bp.id,
    'Art Collection Preview',
    'Private viewing of rare art collection for select buyers. Champagne service required.',
    CURRENT_DATE - INTERVAL '14 days',
    '19:00',
    '22:30',
    'Sotheby''s Private Gallery',
    '1334 York Avenue, New York, NY',
    'host',
    2,
    2,
    48.00,
    'Elegant black, gallery appropriate',
    'completed',
    CURRENT_DATE - INTERVAL '18 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000007'::uuid,
    bp.id,
    'VIP Client Appreciation Night',
    'Exclusive cocktail reception thanking top clients. Premium spirits and passed hors d''oeuvres.',
    CURRENT_DATE - INTERVAL '5 days',
    '18:00',
    '22:00',
    'The Vessel at Hudson Yards',
    '20 Hudson Yards, New York, NY',
    'bartender',
    4,
    4,
    54.00,
    'Black vest, gold accents',
    'completed',
    CURRENT_DATE - INTERVAL '9 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  -- Demo Events Co. Upcoming/Open Shifts
  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000008'::uuid,
    bp.id,
    'Black Tie Charity Gala',
    'Annual charity gala benefiting children''s hospitals. Full bar service with signature cocktails.',
    CURRENT_DATE + INTERVAL '8 days',
    '19:00',
    '01:00',
    'The Plaza Hotel',
    '768 5th Ave, New York, NY',
    'bartender',
    6,
    3,
    62.00,
    'Black tuxedo, bow tie',
    'open',
    CURRENT_DATE - INTERVAL '3 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000009'::uuid,
    bp.id,
    'Luxury Brand Launch Event',
    'Exclusive product launch for luxury fashion brand. High-profile media and influencers attending.',
    CURRENT_DATE + INTERVAL '12 days',
    '17:00',
    '23:00',
    'Spring Studios',
    '6 St Johns Lane, New York, NY',
    'server',
    8,
    2,
    55.00,
    'All black, contemporary chic',
    'open',
    CURRENT_DATE - INTERVAL '2 days'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at)
  SELECT 
    'dd000000-0000-0000-0000-000000000010'::uuid,
    bp.id,
    'Private Estate Dinner Party',
    'Intimate dinner for hedge fund principals. Experience with UHNW clients essential.',
    CURRENT_DATE + INTERVAL '18 days',
    '18:30',
    '23:30',
    'Private Residence - The Hamptons',
    NULL,
    'host',
    3,
    0,
    50.00,
    'Elegant evening wear',
    'open',
    CURRENT_DATE - INTERVAL '1 day'
  FROM public.business_profiles bp
  WHERE bp.company_name = 'Demo Events Co.'
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- DEMO EVENTS CO. SHIFT ASSIGNMENTS
  -- ============================================
  -- Shift 1: Private Wine Dinner - 4 servers
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0001-000000000001', 'dd000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000008', 'completed', CURRENT_DATE - INTERVAL '57 days', CURRENT_DATE - INTERVAL '56 days'),
    ('de100000-0000-0000-0001-000000000002', 'dd000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000009', 'completed', CURRENT_DATE - INTERVAL '57 days', CURRENT_DATE - INTERVAL '56 days'),
    ('de100000-0000-0000-0001-000000000003', 'dd000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000012', 'completed', CURRENT_DATE - INTERVAL '57 days', CURRENT_DATE - INTERVAL '55 days'),
    ('de100000-0000-0000-0001-000000000004', 'dd000000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000014', 'completed', CURRENT_DATE - INTERVAL '57 days', CURRENT_DATE - INTERVAL '55 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 2: Film Premiere After-Party - 5 bartenders
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0002-000000000001', 'dd000000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000001', 'completed', CURRENT_DATE - INTERVAL '46 days', CURRENT_DATE - INTERVAL '45 days'),
    ('de100000-0000-0000-0002-000000000002', 'dd000000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000002', 'completed', CURRENT_DATE - INTERVAL '46 days', CURRENT_DATE - INTERVAL '45 days'),
    ('de100000-0000-0000-0002-000000000003', 'dd000000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000003', 'completed', CURRENT_DATE - INTERVAL '46 days', CURRENT_DATE - INTERVAL '44 days'),
    ('de100000-0000-0000-0002-000000000004', 'dd000000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000004', 'completed', CURRENT_DATE - INTERVAL '46 days', CURRENT_DATE - INTERVAL '44 days'),
    ('de100000-0000-0000-0002-000000000005', 'dd000000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000006', 'completed', CURRENT_DATE - INTERVAL '46 days', CURRENT_DATE - INTERVAL '44 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 3: Executive Board Dinner - 3 servers
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0003-000000000001', 'dd000000-0000-0000-0000-000000000003', 'aa100000-0000-0000-0000-000000000008', 'completed', CURRENT_DATE - INTERVAL '38 days', CURRENT_DATE - INTERVAL '37 days'),
    ('de100000-0000-0000-0003-000000000002', 'dd000000-0000-0000-0000-000000000003', 'aa100000-0000-0000-0000-000000000011', 'completed', CURRENT_DATE - INTERVAL '38 days', CURRENT_DATE - INTERVAL '37 days'),
    ('de100000-0000-0000-0003-000000000003', 'dd000000-0000-0000-0000-000000000003', 'aa100000-0000-0000-0000-000000000014', 'completed', CURRENT_DATE - INTERVAL '38 days', CURRENT_DATE - INTERVAL '36 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 4: Charity Auction Gala - 8 servers
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0004-000000000001', 'dd000000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000008', 'completed', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '30 days'),
    ('de100000-0000-0000-0004-000000000002', 'dd000000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000009', 'completed', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '30 days'),
    ('de100000-0000-0000-0004-000000000003', 'dd000000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000010', 'completed', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '29 days'),
    ('de100000-0000-0000-0004-000000000004', 'dd000000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000011', 'completed', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '29 days'),
    ('de100000-0000-0000-0004-000000000005', 'dd000000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000012', 'completed', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '29 days'),
    ('de100000-0000-0000-0004-000000000006', 'dd000000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000013', 'completed', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '28 days'),
    ('de100000-0000-0000-0004-000000000007', 'dd000000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000014', 'completed', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '28 days'),
    ('de100000-0000-0000-0004-000000000008', 'dd000000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000015', 'completed', CURRENT_DATE - INTERVAL '31 days', CURRENT_DATE - INTERVAL '28 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 5: Anniversary Celebration - 3 bartenders
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0005-000000000001', 'dd000000-0000-0000-0000-000000000005', 'aa100000-0000-0000-0000-000000000001', 'completed', CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE - INTERVAL '23 days'),
    ('de100000-0000-0000-0005-000000000002', 'dd000000-0000-0000-0000-000000000005', 'aa100000-0000-0000-0000-000000000002', 'completed', CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE - INTERVAL '23 days'),
    ('de100000-0000-0000-0005-000000000003', 'dd000000-0000-0000-0000-000000000005', 'aa100000-0000-0000-0000-000000000007', 'completed', CURRENT_DATE - INTERVAL '24 days', CURRENT_DATE - INTERVAL '22 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 6: Art Collection Preview - 2 hosts
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0006-000000000001', 'dd000000-0000-0000-0000-000000000006', 'aa100000-0000-0000-0000-000000000016', 'completed', CURRENT_DATE - INTERVAL '17 days', CURRENT_DATE - INTERVAL '16 days'),
    ('de100000-0000-0000-0006-000000000002', 'dd000000-0000-0000-0000-000000000006', 'aa100000-0000-0000-0000-000000000017', 'completed', CURRENT_DATE - INTERVAL '17 days', CURRENT_DATE - INTERVAL '15 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 7: VIP Client Appreciation Night - 4 bartenders
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0007-000000000001', 'dd000000-0000-0000-0000-000000000007', 'aa100000-0000-0000-0000-000000000001', 'completed', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '7 days'),
    ('de100000-0000-0000-0007-000000000002', 'dd000000-0000-0000-0000-000000000007', 'aa100000-0000-0000-0000-000000000003', 'completed', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '7 days'),
    ('de100000-0000-0000-0007-000000000003', 'dd000000-0000-0000-0000-000000000007', 'aa100000-0000-0000-0000-000000000004', 'completed', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '6 days'),
    ('de100000-0000-0000-0007-000000000004', 'dd000000-0000-0000-0000-000000000007', 'aa100000-0000-0000-0000-000000000006', 'completed', CURRENT_DATE - INTERVAL '8 days', CURRENT_DATE - INTERVAL '6 days')
  ON CONFLICT (id) DO NOTHING;

  -- Upcoming shift assignments (partial fill for open shifts)
  -- Shift 8: Black Tie Charity Gala - 3 of 6 bartenders confirmed
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0008-000000000001', 'dd000000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000001', 'accepted', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '2 days'),
    ('de100000-0000-0000-0008-000000000002', 'dd000000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000002', 'accepted', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day'),
    ('de100000-0000-0000-0008-000000000003', 'dd000000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000004', 'accepted', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day'),
    ('de100000-0000-0000-0008-000000000004', 'dd000000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000003', 'invited', CURRENT_DATE - INTERVAL '1 day', NULL),
    ('de100000-0000-0000-0008-000000000005', 'dd000000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000006', 'pending', CURRENT_DATE, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- Shift 9: Luxury Brand Launch Event - 2 of 8 servers confirmed
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('de100000-0000-0000-0009-000000000001', 'dd000000-0000-0000-0000-000000000009', 'aa100000-0000-0000-0000-000000000008', 'accepted', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE),
    ('de100000-0000-0000-0009-000000000002', 'dd000000-0000-0000-0000-000000000009', 'aa100000-0000-0000-0000-000000000009', 'accepted', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE),
    ('de100000-0000-0000-0009-000000000003', 'dd000000-0000-0000-0000-000000000009', 'aa100000-0000-0000-0000-000000000010', 'invited', CURRENT_DATE, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- DEMO EVENTS CO. TIME ENTRIES
  -- ============================================
  INSERT INTO public.time_entries (id, assignment_id, clock_in, clock_out, hours_worked, amount_earned, approved) VALUES
    -- Shift 1: Private Wine Dinner (5 hours @ $55/hr)
    ('df100000-0000-0000-0001-000000000001', 'de100000-0000-0000-0001-000000000001', (CURRENT_DATE - INTERVAL '52 days')::date + TIME '18:30', (CURRENT_DATE - INTERVAL '52 days')::date + TIME '23:30', 5.00, 275.00, true),
    ('df100000-0000-0000-0001-000000000002', 'de100000-0000-0000-0001-000000000002', (CURRENT_DATE - INTERVAL '52 days')::date + TIME '18:30', (CURRENT_DATE - INTERVAL '52 days')::date + TIME '23:30', 5.00, 275.00, true),
    ('df100000-0000-0000-0001-000000000003', 'de100000-0000-0000-0001-000000000003', (CURRENT_DATE - INTERVAL '52 days')::date + TIME '18:30', (CURRENT_DATE - INTERVAL '52 days')::date + TIME '23:30', 5.00, 275.00, true),
    ('df100000-0000-0000-0001-000000000004', 'de100000-0000-0000-0001-000000000004', (CURRENT_DATE - INTERVAL '52 days')::date + TIME '18:30', (CURRENT_DATE - INTERVAL '52 days')::date + TIME '23:30', 5.00, 275.00, true),
    -- Shift 2: Film Premiere After-Party (5 hours @ $60/hr)
    ('df100000-0000-0000-0002-000000000001', 'de100000-0000-0000-0002-000000000001', (CURRENT_DATE - INTERVAL '42 days')::date + TIME '22:00', (CURRENT_DATE - INTERVAL '41 days')::date + TIME '03:00', 5.00, 300.00, true),
    ('df100000-0000-0000-0002-000000000002', 'de100000-0000-0000-0002-000000000002', (CURRENT_DATE - INTERVAL '42 days')::date + TIME '22:00', (CURRENT_DATE - INTERVAL '41 days')::date + TIME '03:00', 5.00, 300.00, true),
    ('df100000-0000-0000-0002-000000000003', 'de100000-0000-0000-0002-000000000003', (CURRENT_DATE - INTERVAL '42 days')::date + TIME '22:00', (CURRENT_DATE - INTERVAL '41 days')::date + TIME '03:00', 5.00, 300.00, true),
    ('df100000-0000-0000-0002-000000000004', 'de100000-0000-0000-0002-000000000004', (CURRENT_DATE - INTERVAL '42 days')::date + TIME '22:00', (CURRENT_DATE - INTERVAL '41 days')::date + TIME '03:00', 5.00, 300.00, true),
    ('df100000-0000-0000-0002-000000000005', 'de100000-0000-0000-0002-000000000005', (CURRENT_DATE - INTERVAL '42 days')::date + TIME '22:00', (CURRENT_DATE - INTERVAL '41 days')::date + TIME '03:00', 5.00, 300.00, true),
    -- Shift 3: Executive Board Dinner (4 hours @ $58/hr)
    ('df100000-0000-0000-0003-000000000001', 'de100000-0000-0000-0003-000000000001', (CURRENT_DATE - INTERVAL '35 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '35 days')::date + TIME '23:00', 4.00, 232.00, true),
    ('df100000-0000-0000-0003-000000000002', 'de100000-0000-0000-0003-000000000002', (CURRENT_DATE - INTERVAL '35 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '35 days')::date + TIME '23:00', 4.00, 232.00, true),
    ('df100000-0000-0000-0003-000000000003', 'de100000-0000-0000-0003-000000000003', (CURRENT_DATE - INTERVAL '35 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '35 days')::date + TIME '23:00', 4.00, 232.00, true),
    -- Shift 4: Charity Auction Gala (6 hours @ $52/hr)
    ('df100000-0000-0000-0004-000000000001', 'de100000-0000-0000-0004-000000000001', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '00:00', 6.00, 312.00, true),
    ('df100000-0000-0000-0004-000000000002', 'de100000-0000-0000-0004-000000000002', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '00:00', 6.00, 312.00, true),
    ('df100000-0000-0000-0004-000000000003', 'de100000-0000-0000-0004-000000000003', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '00:00', 6.00, 312.00, true),
    ('df100000-0000-0000-0004-000000000004', 'de100000-0000-0000-0004-000000000004', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '00:00', 6.00, 312.00, true),
    ('df100000-0000-0000-0004-000000000005', 'de100000-0000-0000-0004-000000000005', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '00:00', 6.00, 312.00, true),
    ('df100000-0000-0000-0004-000000000006', 'de100000-0000-0000-0004-000000000006', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '00:00', 6.00, 312.00, true),
    ('df100000-0000-0000-0004-000000000007', 'de100000-0000-0000-0004-000000000007', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '00:00', 6.00, 312.00, true),
    ('df100000-0000-0000-0004-000000000008', 'de100000-0000-0000-0004-000000000008', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '28 days')::date + TIME '00:00', 6.00, 312.00, true),
    -- Shift 5: Anniversary Celebration (6 hours @ $50/hr)  
    ('df100000-0000-0000-0005-000000000001', 'de100000-0000-0000-0005-000000000001', (CURRENT_DATE - INTERVAL '21 days')::date + TIME '16:00', (CURRENT_DATE - INTERVAL '21 days')::date + TIME '22:00', 6.00, 300.00, true),
    ('df100000-0000-0000-0005-000000000002', 'de100000-0000-0000-0005-000000000002', (CURRENT_DATE - INTERVAL '21 days')::date + TIME '16:00', (CURRENT_DATE - INTERVAL '21 days')::date + TIME '22:00', 6.00, 300.00, true),
    ('df100000-0000-0000-0005-000000000003', 'de100000-0000-0000-0005-000000000003', (CURRENT_DATE - INTERVAL '21 days')::date + TIME '16:00', (CURRENT_DATE - INTERVAL '21 days')::date + TIME '22:00', 6.00, 300.00, true),
    -- Shift 6: Art Collection Preview (3.5 hours @ $48/hr)
    ('df100000-0000-0000-0006-000000000001', 'de100000-0000-0000-0006-000000000001', (CURRENT_DATE - INTERVAL '14 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '14 days')::date + TIME '22:30', 3.50, 168.00, true),
    ('df100000-0000-0000-0006-000000000002', 'de100000-0000-0000-0006-000000000002', (CURRENT_DATE - INTERVAL '14 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '14 days')::date + TIME '22:30', 3.50, 168.00, true),
    -- Shift 7: VIP Client Appreciation Night (4 hours @ $54/hr)
    ('df100000-0000-0000-0007-000000000001', 'de100000-0000-0000-0007-000000000001', (CURRENT_DATE - INTERVAL '5 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '5 days')::date + TIME '22:00', 4.00, 216.00, true),
    ('df100000-0000-0000-0007-000000000002', 'de100000-0000-0000-0007-000000000002', (CURRENT_DATE - INTERVAL '5 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '5 days')::date + TIME '22:00', 4.00, 216.00, true),
    ('df100000-0000-0000-0007-000000000003', 'de100000-0000-0000-0007-000000000003', (CURRENT_DATE - INTERVAL '5 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '5 days')::date + TIME '22:00', 4.00, 216.00, true),
    ('df100000-0000-0000-0007-000000000004', 'de100000-0000-0000-0007-000000000004', (CURRENT_DATE - INTERVAL '5 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '5 days')::date + TIME '22:00', 4.00, 216.00, true)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- SHIFTS (Past + Upcoming)
  -- ============================================
  INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at) VALUES
    -- Past completed shifts
    ('cc100000-0000-0000-0000-000000000001', 'bb100000-0000-0000-0000-000000000001', 'Annual Charity Gala - Server Staff', 'Black-tie charity gala for 400 guests.', CURRENT_DATE - INTERVAL '45 days', '17:00', '23:30', 'The Metropolitan Club', '1 East 60th Street, New York, NY', 'server', 8, 8, 45.00, 'Black tuxedo, white gloves', 'completed', CURRENT_DATE - INTERVAL '52 days'),
    ('cc100000-0000-0000-0000-000000000002', 'bb100000-0000-0000-0000-000000000002', 'Luxury Wedding Reception', 'Intimate wedding celebration for 150 guests.', CURRENT_DATE - INTERVAL '38 days', '16:00', '00:00', 'Oheka Castle', '135 West Gate Drive, Huntington, NY', 'server', 6, 6, 50.00, 'All black formal attire', 'completed', CURRENT_DATE - INTERVAL '45 days'),
    ('cc100000-0000-0000-0000-000000000003', 'bb100000-0000-0000-0000-000000000003', 'Private Birthday Celebration', 'Milestone birthday for a VIP client.', CURRENT_DATE - INTERVAL '30 days', '19:00', '01:00', 'Private Residence - Upper East Side', NULL, 'bartender', 3, 3, 55.00, 'White jacket, black bow tie', 'completed', CURRENT_DATE - INTERVAL '35 days'),
    ('cc100000-0000-0000-0000-000000000004', 'bb100000-0000-0000-0000-000000000004', 'Fashion Week After Party', 'Exclusive after party for fashion industry insiders.', CURRENT_DATE - INTERVAL '25 days', '22:00', '04:00', 'The Standard High Line', '848 Washington Street, New York, NY', 'bartender', 4, 4, 52.00, 'All black, minimalist', 'completed', CURRENT_DATE - INTERVAL '30 days'),
    ('cc100000-0000-0000-0000-000000000005', 'bb100000-0000-0000-0000-000000000005', 'Wine Tasting Dinner', 'Intimate 12-course wine pairing dinner.', CURRENT_DATE - INTERVAL '21 days', '18:30', '23:00', 'Eleven Madison Park Private Dining', '11 Madison Ave, New York, NY', 'server', 4, 4, 48.00, 'Black suit, no tie', 'completed', CURRENT_DATE - INTERVAL '26 days'),
    ('cc100000-0000-0000-0000-000000000006', 'bb100000-0000-0000-0000-000000000001', 'Corporate Product Launch', 'Tech company product reveal.', CURRENT_DATE - INTERVAL '18 days', '14:00', '19:00', 'Chelsea Piers - Pier Sixty', '23rd Street & Hudson River, NY', 'host', 5, 5, 42.00, 'Branded polo provided', 'completed', CURRENT_DATE - INTERVAL '22 days'),
    ('cc100000-0000-0000-0000-000000000007', 'bb100000-0000-0000-0000-000000000002', 'Engagement Party', 'Elegant cocktail engagement celebration.', CURRENT_DATE - INTERVAL '14 days', '18:00', '22:00', 'The Rainbow Room', '30 Rockefeller Plaza, NY', 'bartender', 2, 2, 50.00, 'Black vest, gold accents', 'completed', CURRENT_DATE - INTERVAL '18 days'),
    ('cc100000-0000-0000-0000-000000000008', 'bb100000-0000-0000-0000-000000000003', 'Art Gallery Opening', 'Private viewing and cocktail reception.', CURRENT_DATE - INTERVAL '10 days', '19:00', '23:00', 'Gagosian Gallery', '980 Madison Avenue, NY', 'server', 4, 4, 44.00, 'All black, gallery appropriate', 'completed', CURRENT_DATE - INTERVAL '14 days'),
    ('cc100000-0000-0000-0000-000000000009', 'bb100000-0000-0000-0000-000000000004', 'Executive Dinner Party', 'Intimate dinner for C-suite executives.', CURRENT_DATE - INTERVAL '7 days', '19:30', '23:30', 'Private Club - Midtown', NULL, 'server', 3, 3, 55.00, 'Black tuxedo required', 'completed', CURRENT_DATE - INTERVAL '10 days'),
    ('cc100000-0000-0000-0000-000000000010', 'bb100000-0000-0000-0000-000000000005', 'Holiday Cocktail Reception', 'Annual holiday party for luxury real estate firm.', CURRENT_DATE - INTERVAL '4 days', '18:00', '21:00', 'The Pierre Hotel', '2 East 61st Street, NY', 'bartender', 3, 3, 48.00, 'Festive black tie', 'completed', CURRENT_DATE - INTERVAL '8 days'),
    -- Upcoming open shifts
    ('cc100000-0000-0000-0000-000000000011', 'bb100000-0000-0000-0000-000000000001', 'New Year''s Eve Gala - Bartenders', 'Upscale New Year''s celebration. Premium open bar.', CURRENT_DATE + INTERVAL '10 days', '20:00', '02:00', 'The Plaza Hotel', '768 5th Ave, New York, NY', 'bartender', 5, 2, 65.00, 'Black tuxedo, bow tie', 'open', CURRENT_DATE - INTERVAL '2 days'),
    ('cc100000-0000-0000-0000-000000000012', 'bb100000-0000-0000-0000-000000000002', 'Winter Wedding - Full Service', 'Winter wonderland themed wedding for 200 guests.', CURRENT_DATE + INTERVAL '14 days', '15:00', '23:00', 'The Foundry', '42-38 9th Street, Long Island City, NY', 'server', 10, 3, 48.00, 'All white formal attire', 'open', CURRENT_DATE - INTERVAL '1 day'),
    ('cc100000-0000-0000-0000-000000000013', 'bb100000-0000-0000-0000-000000000003', 'Private Dinner Party - Hosts', 'Intimate dinner requiring experienced hosts.', CURRENT_DATE + INTERVAL '7 days', '18:00', '22:00', 'Private Residence - Tribeca', NULL, 'host', 2, 0, 45.00, 'Elegant black cocktail attire', 'open', CURRENT_DATE)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- SHIFT ASSIGNMENTS
  -- ============================================
  -- Shift 1: 8 servers
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0001-000000000001', 'cc100000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000008', 'completed', CURRENT_DATE - INTERVAL '51 days', CURRENT_DATE - INTERVAL '50 days'),
    ('dd100000-0000-0000-0001-000000000002', 'cc100000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000009', 'completed', CURRENT_DATE - INTERVAL '51 days', CURRENT_DATE - INTERVAL '50 days'),
    ('dd100000-0000-0000-0001-000000000003', 'cc100000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000010', 'completed', CURRENT_DATE - INTERVAL '51 days', CURRENT_DATE - INTERVAL '50 days'),
    ('dd100000-0000-0000-0001-000000000004', 'cc100000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000011', 'completed', CURRENT_DATE - INTERVAL '51 days', CURRENT_DATE - INTERVAL '50 days'),
    ('dd100000-0000-0000-0001-000000000005', 'cc100000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000012', 'completed', CURRENT_DATE - INTERVAL '51 days', CURRENT_DATE - INTERVAL '50 days'),
    ('dd100000-0000-0000-0001-000000000006', 'cc100000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000013', 'completed', CURRENT_DATE - INTERVAL '51 days', CURRENT_DATE - INTERVAL '50 days'),
    ('dd100000-0000-0000-0001-000000000007', 'cc100000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000014', 'completed', CURRENT_DATE - INTERVAL '51 days', CURRENT_DATE - INTERVAL '50 days'),
    ('dd100000-0000-0000-0001-000000000008', 'cc100000-0000-0000-0000-000000000001', 'aa100000-0000-0000-0000-000000000015', 'completed', CURRENT_DATE - INTERVAL '51 days', CURRENT_DATE - INTERVAL '50 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 2: 6 servers
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0002-000000000001', 'cc100000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000008', 'completed', CURRENT_DATE - INTERVAL '43 days', CURRENT_DATE - INTERVAL '42 days'),
    ('dd100000-0000-0000-0002-000000000002', 'cc100000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000009', 'completed', CURRENT_DATE - INTERVAL '43 days', CURRENT_DATE - INTERVAL '42 days'),
    ('dd100000-0000-0000-0002-000000000003', 'cc100000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000012', 'completed', CURRENT_DATE - INTERVAL '43 days', CURRENT_DATE - INTERVAL '42 days'),
    ('dd100000-0000-0000-0002-000000000004', 'cc100000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000013', 'completed', CURRENT_DATE - INTERVAL '43 days', CURRENT_DATE - INTERVAL '42 days'),
    ('dd100000-0000-0000-0002-000000000005', 'cc100000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000014', 'completed', CURRENT_DATE - INTERVAL '43 days', CURRENT_DATE - INTERVAL '42 days'),
    ('dd100000-0000-0000-0002-000000000006', 'cc100000-0000-0000-0000-000000000002', 'aa100000-0000-0000-0000-000000000015', 'completed', CURRENT_DATE - INTERVAL '43 days', CURRENT_DATE - INTERVAL '42 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 3: 3 bartenders
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0003-000000000001', 'cc100000-0000-0000-0000-000000000003', 'aa100000-0000-0000-0000-000000000001', 'completed', CURRENT_DATE - INTERVAL '34 days', CURRENT_DATE - INTERVAL '33 days'),
    ('dd100000-0000-0000-0003-000000000002', 'cc100000-0000-0000-0000-000000000003', 'aa100000-0000-0000-0000-000000000002', 'completed', CURRENT_DATE - INTERVAL '34 days', CURRENT_DATE - INTERVAL '33 days'),
    ('dd100000-0000-0000-0003-000000000003', 'cc100000-0000-0000-0000-000000000003', 'aa100000-0000-0000-0000-000000000004', 'completed', CURRENT_DATE - INTERVAL '34 days', CURRENT_DATE - INTERVAL '33 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 4: 4 bartenders
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0004-000000000001', 'cc100000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000001', 'completed', CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE - INTERVAL '28 days'),
    ('dd100000-0000-0000-0004-000000000002', 'cc100000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000003', 'completed', CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE - INTERVAL '28 days'),
    ('dd100000-0000-0000-0004-000000000003', 'cc100000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000006', 'completed', CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE - INTERVAL '28 days'),
    ('dd100000-0000-0000-0004-000000000004', 'cc100000-0000-0000-0000-000000000004', 'aa100000-0000-0000-0000-000000000007', 'completed', CURRENT_DATE - INTERVAL '29 days', CURRENT_DATE - INTERVAL '28 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 5: 4 servers
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0005-000000000001', 'cc100000-0000-0000-0000-000000000005', 'aa100000-0000-0000-0000-000000000008', 'completed', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '24 days'),
    ('dd100000-0000-0000-0005-000000000002', 'cc100000-0000-0000-0000-000000000005', 'aa100000-0000-0000-0000-000000000010', 'completed', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '24 days'),
    ('dd100000-0000-0000-0005-000000000003', 'cc100000-0000-0000-0000-000000000005', 'aa100000-0000-0000-0000-000000000011', 'completed', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '24 days'),
    ('dd100000-0000-0000-0005-000000000004', 'cc100000-0000-0000-0000-000000000005', 'aa100000-0000-0000-0000-000000000014', 'completed', CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE - INTERVAL '24 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 6: 5 hosts
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0006-000000000001', 'cc100000-0000-0000-0000-000000000006', 'aa100000-0000-0000-0000-000000000016', 'completed', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '20 days'),
    ('dd100000-0000-0000-0006-000000000002', 'cc100000-0000-0000-0000-000000000006', 'aa100000-0000-0000-0000-000000000017', 'completed', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '20 days'),
    ('dd100000-0000-0000-0006-000000000003', 'cc100000-0000-0000-0000-000000000006', 'aa100000-0000-0000-0000-000000000018', 'completed', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '20 days'),
    ('dd100000-0000-0000-0006-000000000004', 'cc100000-0000-0000-0000-000000000006', 'aa100000-0000-0000-0000-000000000019', 'completed', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '20 days'),
    ('dd100000-0000-0000-0006-000000000005', 'cc100000-0000-0000-0000-000000000006', 'aa100000-0000-0000-0000-000000000020', 'completed', CURRENT_DATE - INTERVAL '21 days', CURRENT_DATE - INTERVAL '20 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 7: 2 bartenders
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0007-000000000001', 'cc100000-0000-0000-0000-000000000007', 'aa100000-0000-0000-0000-000000000002', 'completed', CURRENT_DATE - INTERVAL '17 days', CURRENT_DATE - INTERVAL '16 days'),
    ('dd100000-0000-0000-0007-000000000002', 'cc100000-0000-0000-0000-000000000007', 'aa100000-0000-0000-0000-000000000004', 'completed', CURRENT_DATE - INTERVAL '17 days', CURRENT_DATE - INTERVAL '16 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 8: 4 servers
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0008-000000000001', 'cc100000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000009', 'completed', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE - INTERVAL '12 days'),
    ('dd100000-0000-0000-0008-000000000002', 'cc100000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000012', 'completed', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE - INTERVAL '12 days'),
    ('dd100000-0000-0000-0008-000000000003', 'cc100000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000013', 'completed', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE - INTERVAL '12 days'),
    ('dd100000-0000-0000-0008-000000000004', 'cc100000-0000-0000-0000-000000000008', 'aa100000-0000-0000-0000-000000000015', 'completed', CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE - INTERVAL '12 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 9: 3 servers
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0009-000000000001', 'cc100000-0000-0000-0000-000000000009', 'aa100000-0000-0000-0000-000000000008', 'completed', CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE - INTERVAL '8 days'),
    ('dd100000-0000-0000-0009-000000000002', 'cc100000-0000-0000-0000-000000000009', 'aa100000-0000-0000-0000-000000000011', 'completed', CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE - INTERVAL '8 days'),
    ('dd100000-0000-0000-0009-000000000003', 'cc100000-0000-0000-0000-000000000009', 'aa100000-0000-0000-0000-000000000014', 'completed', CURRENT_DATE - INTERVAL '9 days', CURRENT_DATE - INTERVAL '8 days')
  ON CONFLICT (id) DO NOTHING;

  -- Shift 10: 3 bartenders
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0010-000000000001', 'cc100000-0000-0000-0000-000000000010', 'aa100000-0000-0000-0000-000000000001', 'completed', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '6 days'),
    ('dd100000-0000-0000-0010-000000000002', 'cc100000-0000-0000-0000-000000000010', 'aa100000-0000-0000-0000-000000000002', 'completed', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '6 days'),
    ('dd100000-0000-0000-0010-000000000003', 'cc100000-0000-0000-0000-000000000010', 'aa100000-0000-0000-0000-000000000006', 'completed', CURRENT_DATE - INTERVAL '7 days', CURRENT_DATE - INTERVAL '6 days')
  ON CONFLICT (id) DO NOTHING;

  -- Upcoming shift assignments (partial fill)
  INSERT INTO public.shift_assignments (id, shift_id, talent_id, status, invited_at, responded_at) VALUES
    ('dd100000-0000-0000-0011-000000000001', 'cc100000-0000-0000-0000-000000000011', 'aa100000-0000-0000-0000-000000000001', 'accepted', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE - INTERVAL '1 day'),
    ('dd100000-0000-0000-0011-000000000002', 'cc100000-0000-0000-0000-000000000011', 'aa100000-0000-0000-0000-000000000002', 'accepted', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE),
    ('dd100000-0000-0000-0011-000000000003', 'cc100000-0000-0000-0000-000000000011', 'aa100000-0000-0000-0000-000000000003', 'invited', CURRENT_DATE, NULL),
    ('dd100000-0000-0000-0012-000000000001', 'cc100000-0000-0000-0000-000000000012', 'aa100000-0000-0000-0000-000000000008', 'accepted', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE),
    ('dd100000-0000-0000-0012-000000000002', 'cc100000-0000-0000-0000-000000000012', 'aa100000-0000-0000-0000-000000000009', 'accepted', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE),
    ('dd100000-0000-0000-0012-000000000003', 'cc100000-0000-0000-0000-000000000012', 'aa100000-0000-0000-0000-000000000012', 'accepted', CURRENT_DATE, CURRENT_DATE),
    ('dd100000-0000-0000-0012-000000000004', 'cc100000-0000-0000-0000-000000000012', 'aa100000-0000-0000-0000-000000000014', 'pending', CURRENT_DATE, NULL)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- TIME ENTRIES
  -- ============================================
  INSERT INTO public.time_entries (id, assignment_id, clock_in, clock_out, hours_worked, amount_earned, approved) VALUES
    ('ee100000-0000-0000-0001-000000000001', 'dd100000-0000-0000-0001-000000000001', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '17:00', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '23:30', 6.50, 292.50, true),
    ('ee100000-0000-0000-0001-000000000002', 'dd100000-0000-0000-0001-000000000002', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '17:00', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '23:30', 6.50, 292.50, true),
    ('ee100000-0000-0000-0001-000000000003', 'dd100000-0000-0000-0001-000000000003', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '17:00', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '23:30', 6.50, 292.50, true),
    ('ee100000-0000-0000-0003-000000000001', 'dd100000-0000-0000-0003-000000000001', (CURRENT_DATE - INTERVAL '30 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '30 days')::date + TIME '01:00', 6.00, 330.00, true),
    ('ee100000-0000-0000-0003-000000000002', 'dd100000-0000-0000-0003-000000000002', (CURRENT_DATE - INTERVAL '30 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '30 days')::date + TIME '01:00', 6.00, 330.00, true),
    ('ee100000-0000-0000-0010-000000000001', 'dd100000-0000-0000-0010-000000000001', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '21:00', 3.00, 144.00, true),
    ('ee100000-0000-0000-0010-000000000002', 'dd100000-0000-0000-0010-000000000002', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '21:00', 3.00, 144.00, true)
  ON CONFLICT (id) DO NOTHING;

  -- ============================================
  -- FIX: Update workers_confirmed counts
  -- The trigger only counts 'accepted' status, but completed
  -- shifts have 'completed' status assignments
  -- ============================================
  UPDATE public.shifts s
  SET workers_confirmed = (
    SELECT COUNT(*) FROM public.shift_assignments sa
    WHERE sa.shift_id = s.id
    AND sa.status IN ('accepted', 'completed')
  );

  RAISE NOTICE 'Database reset to Golden State complete!';
END;
$$;

-- ============================================
-- SCHEDULE THE CRON JOB (every 30 minutes)
-- ============================================

-- Remove existing job if it exists (ignore error if not found)
DO $$
BEGIN
  PERFORM cron.unschedule('reset-database-golden-state');
EXCEPTION WHEN OTHERS THEN
  -- Job doesn't exist yet, that's fine
  NULL;
END $$;

-- Schedule new job
SELECT cron.schedule(
  'reset-database-golden-state',  -- Job name
  '*/30 * * * *',                 -- Every 30 minutes
  'SELECT reset_to_golden_state();'
);

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify setup:
--
-- Check scheduled jobs:
-- SELECT * FROM cron.job;
--
-- Check recent executions:
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;
--
-- Manual test:
-- SELECT reset_to_golden_state();
-- ============================================
