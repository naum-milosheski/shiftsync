-- ============================================
-- ShiftSync Seed Data
-- Premium Event Staffing Platform
-- ============================================
-- This script populates the database with realistic demo data
-- Run this after the schema has been created
--
-- NOTE: This uses a workaround to insert demo users without 
-- requiring auth.users entries. For production, users would
-- be created through Supabase Auth.
-- ============================================

-- ============================================
-- STEP 1: Temporarily disable the FK constraint on users table
-- ============================================
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_id_fkey;

-- ============================================
-- STEP 2: Insert demo users without auth.users reference
-- ============================================

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
  -- Bartenders (7)
  ('a1000000-0000-0000-0000-000000000001', 'marcus.beaumont@email.com', 'talent', NOW() - INTERVAL '120 days'),
  ('a1000000-0000-0000-0000-000000000002', 'isabella.vance@email.com', 'talent', NOW() - INTERVAL '115 days'),
  ('a1000000-0000-0000-0000-000000000003', 'james.thornton@email.com', 'talent', NOW() - INTERVAL '110 days'),
  ('a1000000-0000-0000-0000-000000000004', 'sophia.chen@email.com', 'talent', NOW() - INTERVAL '105 days'),
  ('a1000000-0000-0000-0000-000000000005', 'olivier.dubois@email.com', 'talent', NOW() - INTERVAL '100 days'),
  ('a1000000-0000-0000-0000-000000000006', 'elena.rossi@email.com', 'talent', NOW() - INTERVAL '95 days'),
  ('a1000000-0000-0000-0000-000000000007', 'william.sterling@email.com', 'talent', NOW() - INTERVAL '90 days'),
  -- Servers (8)
  ('a1000000-0000-0000-0000-000000000008', 'charlotte.ashford@email.com', 'talent', NOW() - INTERVAL '88 days'),
  ('a1000000-0000-0000-0000-000000000009', 'sebastian.wright@email.com', 'talent', NOW() - INTERVAL '86 days'),
  ('a1000000-0000-0000-0000-000000000010', 'victoria.hayes@email.com', 'talent', NOW() - INTERVAL '84 days'),
  ('a1000000-0000-0000-0000-000000000011', 'alexander.reed@email.com', 'talent', NOW() - INTERVAL '82 days'),
  ('a1000000-0000-0000-0000-000000000012', 'emma.blackwell@email.com', 'talent', NOW() - INTERVAL '80 days'),
  ('a1000000-0000-0000-0000-000000000013', 'nicholas.crane@email.com', 'talent', NOW() - INTERVAL '78 days'),
  ('a1000000-0000-0000-0000-000000000014', 'amelia.frost@email.com', 'talent', NOW() - INTERVAL '76 days'),
  ('a1000000-0000-0000-0000-000000000015', 'benjamin.cole@email.com', 'talent', NOW() - INTERVAL '74 days'),
  -- Hosts (5)
  ('a1000000-0000-0000-0000-000000000016', 'alexandra.weston@email.com', 'talent', NOW() - INTERVAL '72 days'),
  ('a1000000-0000-0000-0000-000000000017', 'christian.blake@email.com', 'talent', NOW() - INTERVAL '70 days'),
  ('a1000000-0000-0000-0000-000000000018', 'diana.pierce@email.com', 'talent', NOW() - INTERVAL '68 days'),
  ('a1000000-0000-0000-0000-000000000019', 'maxfield.grant@email.com', 'talent', NOW() - INTERVAL '66 days'),
  ('a1000000-0000-0000-0000-000000000020', 'natalie.sinclair@email.com', 'talent', NOW() - INTERVAL '64 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- BUSINESS PROFILES (5)
-- ============================================

INSERT INTO public.business_profiles (id, user_id, company_name, logo_url, brand_colors, billing_email, onboarding_complete) VALUES
  (
    'bb100000-0000-0000-0000-000000000001',
    'b1000000-0000-0000-0000-000000000001',
    'Sterling Events',
    'https://api.dicebear.com/7.x/shapes/svg?seed=sterling',
    '{"primary": "#1a365d", "secondary": "#3182ce"}',
    'billing@sterling-events.com',
    true
  ),
  (
    'bb100000-0000-0000-0000-000000000002',
    'b1000000-0000-0000-0000-000000000002',
    'Luxe Occasions',
    'https://api.dicebear.com/7.x/shapes/svg?seed=luxe',
    '{"primary": "#7c3aed", "secondary": "#a78bfa"}',
    'billing@luxe-occasions.com',
    true
  ),
  (
    'bb100000-0000-0000-0000-000000000003',
    'b1000000-0000-0000-0000-000000000003',
    'The Grand Collective',
    'https://api.dicebear.com/7.x/shapes/svg?seed=grand',
    '{"primary": "#c9a962", "secondary": "#fbbf24"}',
    'billing@grandcollective.com',
    true
  ),
  (
    'bb100000-0000-0000-0000-000000000004',
    'b1000000-0000-0000-0000-000000000004',
    'Obsidian Affairs',
    'https://api.dicebear.com/7.x/shapes/svg?seed=obsidian',
    '{"primary": "#0f0f0f", "secondary": "#374151"}',
    'billing@obsidian-affairs.com',
    true
  ),
  (
    'bb100000-0000-0000-0000-000000000005',
    'b1000000-0000-0000-0000-000000000005',
    'Rose & Ivy Catering',
    'https://api.dicebear.com/7.x/shapes/svg?seed=roseivy',
    '{"primary": "#be185d", "secondary": "#f472b6"}',
    'billing@roseivy.com',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- TALENT PROFILES (20)
-- ============================================

INSERT INTO public.talent_profiles (id, user_id, full_name, bio, skills, photo_urls, phone, hourly_rate_min, available_now, rating_avg, total_shifts, pending_balance, available_balance) VALUES
  -- BARTENDERS (7)
  (
    'aa100000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Marcus Beaumont',
    'Master mixologist with 12 years of experience at world-class establishments including The Savoy and The Ritz. Specialist in craft cocktails and molecular mixology. Former brand ambassador for premium spirits.',
    ARRAY['Bartender', 'Mixology', 'Craft Cocktails', 'Molecular Mixology', 'Wine Service'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=marcus'],
    '+1 (555) 100-0001',
    55.00,
    true,
    4.95,
    47,
    0.00,
    2840.00
  ),
  (
    'aa100000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002',
    'Isabella Vance',
    'Award-winning bartender with expertise in classic cocktails and speakeasy-style service. Featured in Imbibe Magazine. Certified sommelier with a passion for wine and spirits pairing.',
    ARRAY['Bartender', 'Classic Cocktails', 'Wine Service', 'Sommelier', 'Spirits Pairing'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=isabella'],
    '+1 (555) 100-0002',
    50.00,
    true,
    4.88,
    52,
    380.00,
    3200.00
  ),
  (
    'aa100000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003',
    'James Thornton',
    'British-trained bartender specializing in high-volume luxury events. Experienced with private yachts, celebrity gatherings, and Fortune 500 corporate functions. Impeccable presentation.',
    ARRAY['Bartender', 'High-Volume Service', 'Corporate Events', 'VIP Service'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=james'],
    '+1 (555) 100-0003',
    48.00,
    true,
    4.72,
    38,
    0.00,
    1920.00
  ),
  (
    'aa100000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000004',
    'Sophia Chen',
    'Contemporary cocktail artist blending Eastern and Western techniques. Trained in Tokyo and New York. Expert in sake service and Japanese whisky. Creates bespoke cocktail menus.',
    ARRAY['Bartender', 'Sake Service', 'Japanese Whisky', 'Bespoke Menus', 'Asian Fusion'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=sophia'],
    '+1 (555) 100-0004',
    52.00,
    true,
    4.91,
    29,
    520.00,
    1560.00
  ),
  (
    'aa100000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000005',
    'Olivier Dubois',
    'French-trained beverage specialist with expertise in champagne service and fine wine. Former head bartender at a 3-Michelin star establishment in Paris. Fluent in French and English.',
    ARRAY['Bartender', 'Champagne Service', 'Fine Wine', 'French Service', 'Bilingual'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=olivier'],
    '+1 (555) 100-0005',
    55.00,
    false,
    4.96,
    61,
    0.00,
    4270.00
  ),
  (
    'aa100000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000006',
    'Elena Rossi',
    'Italian hospitality professional with a focus on aperitivo culture and Mediterranean cocktails. Ten years of experience in resort and destination wedding settings. Known for warm, engaging service.',
    ARRAY['Bartender', 'Aperitivo', 'Mediterranean Cocktails', 'Wedding Service'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=elena'],
    '+1 (555) 100-0006',
    45.00,
    true,
    4.68,
    44,
    180.00,
    2100.00
  ),
  (
    'aa100000-0000-0000-0000-000000000007',
    'a1000000-0000-0000-0000-000000000007',
    'William Sterling',
    'Executive bartender specializing in private estates and black-tie affairs. Discrete and professional with experience serving heads of state and celebrities. Security clearance held.',
    ARRAY['Bartender', 'VIP Service', 'Private Events', 'Executive Service', 'Discrete'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=william'],
    '+1 (555) 100-0007',
    60.00,
    true,
    5.00,
    15,
    0.00,
    900.00
  ),

  -- SERVERS (8)
  (
    'aa100000-0000-0000-0000-000000000008',
    'a1000000-0000-0000-0000-000000000008',
    'Charlotte Ashford',
    'Classically trained in French service with 8 years at Michelin-starred establishments. Certified sommelier. Expert in multi-course tasting menus and wine pairing service.',
    ARRAY['Server', 'Fine Dining', 'French Service', 'Sommelier', 'Wine Pairing'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=charlotte'],
    '+1 (555) 100-0008',
    42.00,
    true,
    4.92,
    67,
    420.00,
    4200.00
  ),
  (
    'aa100000-0000-0000-0000-000000000009',
    'a1000000-0000-0000-0000-000000000009',
    'Sebastian Wright',
    'Luxury banquet captain with experience leading teams of 20+ servers. Specialized in gala events and fundraisers. Strong communication skills and natural leadership ability.',
    ARRAY['Server', 'Banquet Captain', 'Team Leadership', 'Gala Events', 'Fundraisers'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=sebastian'],
    '+1 (555) 100-0009',
    45.00,
    true,
    4.85,
    83,
    0.00,
    4980.00
  ),
  (
    'aa100000-0000-0000-0000-000000000010',
    'a1000000-0000-0000-0000-000000000010',
    'Victoria Hayes',
    'Elegant server with runway model poise. Extensive experience with fashion industry events, product launches, and celebrity parties. Photogenic and media-trained.',
    ARRAY['Server', 'Fashion Events', 'Product Launches', 'Media', 'Promotional'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=victoria'],
    '+1 (555) 100-0010',
    40.00,
    true,
    4.78,
    39,
    280.00,
    1820.00
  ),
  (
    'aa100000-0000-0000-0000-000000000011',
    'a1000000-0000-0000-0000-000000000011',
    'Alexander Reed',
    'Former yacht steward transitioning to land-based luxury events. Discrete, professional, and experienced with UHNW clients. Trained in Butler Academy fundamentals.',
    ARRAY['Server', 'Yacht Service', 'Butler Service', 'UHNW Clients', 'Discrete'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=alexander'],
    '+1 (555) 100-0011',
    50.00,
    false,
    4.90,
    28,
    0.00,
    1680.00
  ),
  (
    'aa100000-0000-0000-0000-000000000012',
    'a1000000-0000-0000-0000-000000000012',
    'Emma Blackwell',
    'Detail-oriented server with expertise in dietary accommodations and allergy awareness. Trained in communicating with guests about special dietary needs without disrupting service flow.',
    ARRAY['Server', 'Dietary Specialist', 'Allergy Awareness', 'Guest Communication', 'Fine Dining'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=emma'],
    '+1 (555) 100-0012',
    38.00,
    true,
    4.82,
    55,
    190.00,
    2475.00
  ),
  (
    'aa100000-0000-0000-0000-000000000013',
    'a1000000-0000-0000-0000-000000000013',
    'Nicholas Crane',
    'Energetic and efficient server excelling in high-paced cocktail receptions. Strong memory for faces and drink preferences. Known for anticipating guest needs before asked.',
    ARRAY['Server', 'Cocktail Receptions', 'High-Volume', 'Guest Relations', 'Attentive'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=nicholas'],
    '+1 (555) 100-0013',
    35.00,
    true,
    4.65,
    72,
    0.00,
    2880.00
  ),
  (
    'aa100000-0000-0000-0000-000000000014',
    'a1000000-0000-0000-0000-000000000014',
    'Amelia Frost',
    'Refined server with a background in five-star hotel dining rooms. Expert in tableside presentations, guéridon service, and synchronized service timing.',
    ARRAY['Server', 'Hotel Dining', 'Tableside Service', 'Guéridon', 'Five-Star'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=amelia'],
    '+1 (555) 100-0014',
    43.00,
    true,
    4.88,
    48,
    344.00,
    2408.00
  ),
  (
    'aa100000-0000-0000-0000-000000000015',
    'a1000000-0000-0000-0000-000000000015',
    'Benjamin Cole',
    'Versatile server comfortable in any setting from intimate dinners to 500-guest galas. Quick learner who adapts to unique venue requirements. Positive team player.',
    ARRAY['Server', 'Versatile', 'Large Events', 'Team Player', 'Adaptable'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=benjamin'],
    '+1 (555) 100-0015',
    32.00,
    true,
    4.55,
    91,
    128.00,
    3276.00
  ),

  -- HOSTS (5)
  (
    'aa100000-0000-0000-0000-000000000016',
    'a1000000-0000-0000-0000-000000000016',
    'Alexandra Weston',
    'Premier event hostess with a background in luxury brand ambassadorship. Fluent in four languages. Experienced with international dignitaries and cultural protocol awareness.',
    ARRAY['Host', 'Brand Ambassador', 'Multilingual', 'VIP Reception', 'Protocol'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=alexandra'],
    '+1 (555) 100-0016',
    40.00,
    true,
    4.97,
    34,
    0.00,
    1700.00
  ),
  (
    'aa100000-0000-0000-0000-000000000017',
    'a1000000-0000-0000-0000-000000000017',
    'Christian Blake',
    'Charismatic host specializing in guest flow management and VIP handling. Strong background in nightlife and exclusive club environments. Excellent under pressure.',
    ARRAY['Host', 'Guest Flow', 'VIP Handling', 'Nightlife', 'Security Coordination'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=christian'],
    '+1 (555) 100-0017',
    38.00,
    true,
    4.72,
    56,
    228.00,
    2508.00
  ),
  (
    'aa100000-0000-0000-0000-000000000018',
    'a1000000-0000-0000-0000-000000000018',
    'Diana Pierce',
    'Elegant hostess with exceptional memory for names and faces. Creates genuine connections that make guests feel personally welcomed. Background in executive assistance.',
    ARRAY['Host', 'Guest Relations', 'Name Recall', 'Executive Support', 'Welcoming'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=diana'],
    '+1 (555) 100-0018',
    36.00,
    false,
    4.85,
    42,
    0.00,
    1764.00
  ),
  (
    'aa100000-0000-0000-0000-000000000019',
    'a1000000-0000-0000-0000-000000000019',
    'Maxfield Grant',
    'Professional coat check and cloakroom attendant with luxury hotel experience. Meticulous attention to detail and care with valuables. Fast, organized, and trustworthy.',
    ARRAY['Host', 'Coat Check', 'Cloakroom', 'Valuables Care', 'Organization'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=maxfield'],
    '+1 (555) 100-0019',
    32.00,
    true,
    4.68,
    63,
    96.00,
    2268.00
  ),
  (
    'aa100000-0000-0000-0000-000000000020',
    'a1000000-0000-0000-0000-000000000020',
    'Natalie Sinclair',
    'Warm and gracious hostess who sets the tone for memorable events. Experienced with charity galas, museum openings, and cultural events. Natural ability to make everyone feel included.',
    ARRAY['Host', 'Charity Events', 'Cultural Events', 'Museum', 'Gracious'],
    ARRAY['https://api.dicebear.com/7.x/avataaars/svg?seed=natalie'],
    '+1 (555) 100-0020',
    35.00,
    true,
    4.80,
    45,
    175.00,
    1750.00
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- PAST SHIFTS (10 Completed)
-- ============================================

INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at) VALUES
  (
    'cc100000-0000-0000-0000-000000000001',
    'bb100000-0000-0000-0000-000000000001',
    'Annual Charity Gala - Server Staff',
    'Black-tie charity gala for 400 guests. Three-course plated dinner with wine service.',
    CURRENT_DATE - INTERVAL '45 days',
    '17:00',
    '23:30',
    'The Metropolitan Club',
    '1 East 60th Street, New York, NY',
    'server',
    8,
    8,
    45.00,
    'Black tuxedo, white gloves',
    'completed',
    CURRENT_DATE - INTERVAL '52 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000002',
    'bb100000-0000-0000-0000-000000000002',
    'Luxury Wedding Reception',
    'Intimate wedding celebration for 150 guests at a private estate.',
    CURRENT_DATE - INTERVAL '38 days',
    '16:00',
    '00:00',
    'Oheka Castle',
    '135 West Gate Drive, Huntington, NY',
    'server',
    6,
    6,
    50.00,
    'All black formal attire',
    'completed',
    CURRENT_DATE - INTERVAL '45 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000003',
    'bb100000-0000-0000-0000-000000000003',
    'Private Birthday Celebration',
    'Milestone birthday for a VIP client. Cocktail service followed by seated dinner.',
    CURRENT_DATE - INTERVAL '30 days',
    '19:00',
    '01:00',
    'Private Residence - Upper East Side',
    NULL,
    'bartender',
    3,
    3,
    55.00,
    'White jacket, black bow tie',
    'completed',
    CURRENT_DATE - INTERVAL '35 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000004',
    'bb100000-0000-0000-0000-000000000004',
    'Fashion Week After Party',
    'Exclusive after party for fashion industry insiders. Cocktails and passed canapés.',
    CURRENT_DATE - INTERVAL '25 days',
    '22:00',
    '04:00',
    'The Standard High Line',
    '848 Washington Street, New York, NY',
    'bartender',
    4,
    4,
    52.00,
    'All black, minimalist',
    'completed',
    CURRENT_DATE - INTERVAL '30 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000005',
    'bb100000-0000-0000-0000-000000000005',
    'Wine Tasting Dinner',
    'Intimate 12-course wine pairing dinner for 30 collectors.',
    CURRENT_DATE - INTERVAL '21 days',
    '18:30',
    '23:00',
    'Eleven Madison Park Private Dining',
    '11 Madison Ave, New York, NY',
    'server',
    4,
    4,
    48.00,
    'Black suit, no tie',
    'completed',
    CURRENT_DATE - INTERVAL '26 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000006',
    'bb100000-0000-0000-0000-000000000001',
    'Corporate Product Launch',
    'Tech company product reveal for press and VIP clients.',
    CURRENT_DATE - INTERVAL '18 days',
    '14:00',
    '19:00',
    'Chelsea Piers - Pier Sixty',
    '23rd Street & Hudson River, New York, NY',
    'host',
    5,
    5,
    42.00,
    'Branded polo provided',
    'completed',
    CURRENT_DATE - INTERVAL '22 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000007',
    'bb100000-0000-0000-0000-000000000002',
    'Engagement Party',
    'Elegant cocktail engagement celebration for 100 guests.',
    CURRENT_DATE - INTERVAL '14 days',
    '18:00',
    '22:00',
    'The Rainbow Room',
    '30 Rockefeller Plaza, New York, NY',
    'bartender',
    2,
    2,
    50.00,
    'Black vest, gold accents',
    'completed',
    CURRENT_DATE - INTERVAL '18 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000008',
    'bb100000-0000-0000-0000-000000000003',
    'Art Gallery Opening',
    'Private viewing and cocktail reception for new exhibition.',
    CURRENT_DATE - INTERVAL '10 days',
    '19:00',
    '23:00',
    'Gagosian Gallery',
    '980 Madison Avenue, New York, NY',
    'server',
    4,
    4,
    44.00,
    'All black, gallery appropriate',
    'completed',
    CURRENT_DATE - INTERVAL '14 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000009',
    'bb100000-0000-0000-0000-000000000004',
    'Executive Dinner Party',
    'Intimate dinner for C-suite executives and board members.',
    CURRENT_DATE - INTERVAL '7 days',
    '19:30',
    '23:30',
    'Private Club - Midtown',
    NULL,
    'server',
    3,
    3,
    55.00,
    'Black tuxedo required',
    'completed',
    CURRENT_DATE - INTERVAL '10 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000010',
    'bb100000-0000-0000-0000-000000000005',
    'Holiday Cocktail Reception',
    'Annual holiday party for luxury real estate firm.',
    CURRENT_DATE - INTERVAL '4 days',
    '18:00',
    '21:00',
    'The Pierre Hotel',
    '2 East 61st Street, New York, NY',
    'bartender',
    3,
    3,
    48.00,
    'Festive black tie',
    'completed',
    CURRENT_DATE - INTERVAL '8 days'
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SHIFT ASSIGNMENTS (for completed shifts)
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

-- ============================================
-- TIME ENTRIES (for all completed assignments)
-- ============================================

INSERT INTO public.time_entries (id, assignment_id, clock_in, clock_out, hours_worked, amount_earned, approved) VALUES
  -- Shift 1 time entries (6.5 hour shift)
  ('ee100000-0000-0000-0001-000000000001', 'dd100000-0000-0000-0001-000000000001', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '17:00', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '23:30', 6.50, 292.50, true),
  ('ee100000-0000-0000-0001-000000000002', 'dd100000-0000-0000-0001-000000000002', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '17:00', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '23:30', 6.50, 292.50, true),
  ('ee100000-0000-0000-0001-000000000003', 'dd100000-0000-0000-0001-000000000003', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '17:00', (CURRENT_DATE - INTERVAL '45 days')::date + TIME '23:30', 6.50, 292.50, true),
  
  -- Shift 3 time entries (6 hour shift)
  ('ee100000-0000-0000-0003-000000000001', 'dd100000-0000-0000-0003-000000000001', (CURRENT_DATE - INTERVAL '30 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '30 days')::date + TIME '01:00', 6.00, 330.00, true),
  ('ee100000-0000-0000-0003-000000000002', 'dd100000-0000-0000-0003-000000000002', (CURRENT_DATE - INTERVAL '30 days')::date + TIME '19:00', (CURRENT_DATE - INTERVAL '30 days')::date + TIME '01:00', 6.00, 330.00, true),
  
  -- Shift 10 time entries (3 hour shift)
  ('ee100000-0000-0000-0010-000000000001', 'dd100000-0000-0000-0010-000000000001', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '21:00', 3.00, 144.00, true),
  ('ee100000-0000-0000-0010-000000000002', 'dd100000-0000-0000-0010-000000000002', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '18:00', (CURRENT_DATE - INTERVAL '4 days')::date + TIME '21:00', 3.00, 144.00, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- UPCOMING/OPEN SHIFTS (for testing the job feed)
-- ============================================

INSERT INTO public.shifts (id, business_id, title, description, event_date, start_time, end_time, venue_name, venue_address, role_type, workers_needed, workers_confirmed, hourly_rate, attire_code, status, created_at) VALUES
  (
    'cc100000-0000-0000-0000-000000000011',
    'bb100000-0000-0000-0000-000000000001',
    'New Year''s Eve Gala - Bartenders',
    'Upscale New Year''s celebration. Premium open bar service.',
    CURRENT_DATE + INTERVAL '10 days',
    '20:00',
    '02:00',
    'The Plaza Hotel',
    '768 5th Ave, New York, NY',
    'bartender',
    5,
    2,
    65.00,
    'Black tuxedo, bow tie',
    'open',
    CURRENT_DATE - INTERVAL '2 days'
  ),
  (
    'cc100000-0000-0000-0000-000000000012',
    'bb100000-0000-0000-0000-000000000002',
    'Winter Wedding - Full Service',
    'Winter wonderland themed wedding for 200 guests.',
    CURRENT_DATE + INTERVAL '14 days',
    '15:00',
    '23:00',
    'The Foundry',
    '42-38 9th Street, Long Island City, NY',
    'server',
    10,
    3,
    48.00,
    'All white formal attire',
    'open',
    CURRENT_DATE - INTERVAL '1 day'
  ),
  (
    'cc100000-0000-0000-0000-000000000013',
    'bb100000-0000-0000-0000-000000000003',
    'Private Dinner Party - Hosts',
    'Intimate dinner requiring experienced hosts for coat check and guest reception.',
    CURRENT_DATE + INTERVAL '7 days',
    '18:00',
    '22:00',
    'Private Residence - Tribeca',
    NULL,
    'host',
    2,
    0,
    45.00,
    'Elegant black cocktail attire',
    'open',
    CURRENT_DATE
  )
ON CONFLICT (id) DO NOTHING;

-- Add some assignments to the open shifts (showing partial fill)
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
-- STEP 3: Note about future auth integration
-- ============================================
-- For production use, the FK constraint should be re-enabled:
-- ALTER TABLE public.users 
--   ADD CONSTRAINT users_id_fkey 
--   FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
--
-- Demo users will work for testing the app UI and matching algorithms.
-- When real users sign up through Supabase Auth, they'll be properly linked.
-- ============================================

-- ============================================
-- SUMMARY
-- ============================================
-- Seeded data:
-- - 5 Business Users + Profiles
-- - 20 Talent Users + Profiles (7 bartenders, 8 servers, 5 hosts)
-- - 10 Completed Shifts with assignments, time entries
-- - 3 Open/Upcoming Shifts with partial assignments
-- ============================================
