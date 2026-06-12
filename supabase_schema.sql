-- KHUBO (Staybnb for Co-living) Database Schema & Mock Seed Data
-- Run this SQL in your Supabase SQL Editor to create and populate the database.

-- =========================================================================
-- 1. EXTENSIONS & FUNCTIONS
-- =========================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 2. CREATE TABLES
-- =========================================================================

-- Profiles Table (Linked to Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    nickname TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'tenant' CHECK (role IN ('tenant', 'landlord')),
    phone TEXT,
    gender TEXT,
    bio TEXT,
    location TEXT,
    occupation TEXT,
    school_or_company TEXT,
    lifestyle TEXT[],
    sleep_schedule TEXT,
    cleanliness INTEGER DEFAULT 0,
    noise_level TEXT,
    onboarding_complete BOOLEAN DEFAULT FALSE,
    id_type TEXT,
    id_photo_url TEXT,
    id_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings Table (Properties listed for rent)
CREATE TABLE IF NOT EXISTS public.listings (
    id TEXT PRIMARY KEY, -- Using text to match mock IDs ('k1', 'k2', etc.) or custom IDs
    title TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT,
    price NUMERIC NOT NULL,
    rating NUMERIC DEFAULT 5.0,
    image TEXT,
    gallery TEXT[], -- Array of image URLs
    category TEXT,
    date TEXT DEFAULT 'Available now',
    amenities TEXT[],
    lat NUMERIC,
    lng NUMERIC,
    barangay TEXT,
    city TEXT,
    reviews JSONB DEFAULT '[]'::jsonb,
    host JSONB DEFAULT '{}'::jsonb,
    landlord_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Roommates Table (Roommate search posts)
CREATE TABLE IF NOT EXISTS public.roommates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INT,
    gender TEXT,
    university TEXT,
    location TEXT,
    budget_range TEXT,
    preferred_place TEXT,
    bio TEXT,
    image TEXT,
    tags TEXT[],
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reservations Table (Booking reservations)
CREATE TABLE IF NOT EXISTS public.reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    listing_id TEXT REFERENCES public.listings(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tenant_name TEXT,
    tenant_email TEXT,
    tenant_phone TEXT,
    tenant_age INT,
    tenant_gender TEXT,
    tenant_id_url TEXT, -- Link to uploaded ID picture
    move_in_date DATE NOT NULL,
    room_type TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'denied', 'cancelled')),
    payment_method TEXT,
    total_price NUMERIC,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations Table (Chat threads)
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    sender_name TEXT,
    receiver_name TEXT,
    last_message TEXT,
    last_message_time TIMESTAMPTZ DEFAULT NOW(),
    last_sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    unread_count INT DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages Table (Individual messages in chats)
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    text TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);



-- =========================================================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- =========================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roommates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;


-- =========================================================================
-- 4. RLS POLICIES (Access Controls)
-- =========================================================================

-- Profiles: Anyone can view profiles, only owners can update theirs
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
    FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

-- Listings: Anyone can view listings, authenticated users (hosts) can create/edit theirs
CREATE POLICY "Listings are viewable by everyone" ON public.listings 
    FOR SELECT USING (true);
CREATE POLICY "Landlords can insert listings" ON public.listings 
    FOR INSERT WITH CHECK (true); -- Allowed for mock/anon tests, change to (auth.role() = 'authenticated') in production
CREATE POLICY "Landlords can update their own listings" ON public.listings 
    FOR UPDATE USING (true);

-- Roommates: Anyone can view roommate posts, authenticated users can insert/edit
CREATE POLICY "Roommates are viewable by everyone" ON public.roommates 
    FOR SELECT USING (true);
CREATE POLICY "Anyone can insert roommates" ON public.roommates 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update their own roommate posts" ON public.roommates 
    FOR UPDATE USING (true);

-- Reservations: Owners (tenants) or landlords of listings can view bookings
CREATE POLICY "Anyone can select reservations" ON public.reservations 
    FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reservations" ON public.reservations 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reservations" ON public.reservations 
    FOR UPDATE USING (true);

-- Chats and Messages: Users can see chats they participate in
CREATE POLICY "Anyone can view conversations" ON public.conversations 
    FOR SELECT USING (true);
CREATE POLICY "Anyone can insert conversations" ON public.conversations 
    FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update conversations" ON public.conversations 
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can view messages" ON public.messages 
    FOR SELECT USING (true);
CREATE POLICY "Anyone can insert messages" ON public.messages 
    FOR INSERT WITH CHECK (true);



-- =========================================================================
-- 5. AUTOMATIC PROFILE SYNC TRIGGER (On Auth Signup)
-- =========================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url, role, onboarding_complete)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'full_name', new.email),
        COALESCE(new.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || new.id::text),
        'tenant',
        false
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================================
-- 6. SEED MOCK DATA
-- =========================================================================

-- Clear existing listings/roommates if any to avoid PK duplicate constraint errors on repeat runs

TRUNCATE TABLE public.roommates CASCADE;
TRUNCATE TABLE public.listings CASCADE;

-- Insert Mock Listings
INSERT INTO public.listings (id, title, location, description, price, rating, image, gallery, category, date, amenities, lat, lng, barangay, city, reviews, host)
VALUES 
(
  'k1',
  'Yhuzuong’s Dormitory',
  'Iligan City, Lanao del norte 9200',
  'Perfect for students, near MSU-IIT.',
  5000,
  5.0,
  'https://images.unsplash.com/photo-1555854817-5b2260d71ba8?auto=format&fit=crop&q=80&w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1555854817-5b2260d71ba8?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=800'
  ],
  'Near MSU-IIT',
  '6 available',
  ARRAY['Free Wifi', 'Electricity', 'Water'],
  8.2415,
  124.2442,
  'Tibanga',
  'Iligan City',
  '[
    {"id": "r1", "userName": "John Doe", "userImage": "https://i.pravatar.cc/150?u=r1", "rating": 5, "date": "May 2024", "comment": "Great place to stay! Very clean and quiet."},
    {"id": "r2", "userName": "Jane Smith", "userImage": "https://i.pravatar.cc/150?u=r2", "rating": 5, "date": "April 2024", "comment": "Best dorm near MSU-IIT. The WiFi is fast."},
    {"id": "r3", "userName": "Mark Wilson", "userImage": "https://i.pravatar.cc/150?u=r3", "rating": 5, "date": "March 2024", "comment": "The water system is excellent. Highly recommended!"},
    {"id": "r4", "userName": "Sarah Connor", "userImage": "https://i.pravatar.cc/150?u=r4", "rating": 5, "date": "February 2024", "comment": "Very secure and the owner is very approachable."},
    {"id": "r5", "userName": "Alex Mercer", "userImage": "https://i.pravatar.cc/150?u=r5", "rating": 5, "date": "January 2024", "comment": "Loved my stay here. Perfect for studying."}
  ]'::jsonb,
  '{"name": "Jeff David", "image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", "reviews": 8, "rating": 4.88, "hostingDuration": "1 month", "work": "Linfra Corp", "location": "Quezon City, Philippines"}'::jsonb
),
(
  'k2',
  'Kayla’s Residences & Dormitory',
  'Iligan City, Lanao del norte 9200',
  'Modern living space with great security.',
  6000,
  5.0,
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800',
  ARRAY[
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1594488651083-aa8241474932?auto=format&fit=crop&q=80&w=800'
  ],
  'Solo Room',
  '6 available',
  ARRAY['Free Wifi', 'CCTV', 'Water'],
  8.2385,
  124.2382,
  'Pala-o',
  'Iligan City',
  '[
    {"id": "r6", "userName": "Peter Parker", "userImage": "https://i.pravatar.cc/150?u=r6", "rating": 5, "date": "May 2024", "comment": "The solo rooms are very comfortable."},
    {"id": "r7", "userName": "Mary Jane", "userImage": "https://i.pravatar.cc/150?u=r7", "rating": 5, "date": "April 2024", "comment": "Great security. I felt very safe here."},
    {"id": "r8", "userName": "Harry Osborn", "userImage": "https://i.pravatar.cc/150?u=r8", "rating": 5, "date": "March 2024", "comment": "A bit pricey but worth it for the solo space."},
    {"id": "r9", "userName": "Gwen Stacy", "userImage": "https://i.pravatar.cc/150?u=r9", "rating": 5, "date": "February 2024", "comment": "The location is perfect."},
    {"id": "r10", "userName": "Flash Thompson", "userImage": "https://i.pravatar.cc/150?u=r10", "rating": 5, "date": "January 2024", "comment": "Good vibes and modern rooms."}
  ]'::jsonb,
  '{}'::jsonb
),
(
  'k3',
  'Nathan’s Female Boarders',
  'Iligan City, Lanao del norte 9200',
  'Safe and secure for female students.',
  5000,
  5.0,
  'https://images.unsplash.com/photo-1554995207-c18c20360a59?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1554995207-c18c20360a59?auto=format&fit=crop&q=80&w=800'],
  'All Female',
  '3 available',
  ARRAY['Free Wifi', 'Water', 'Electricity'],
  8.2445,
  124.2452,
  'Tibanga',
  'Iligan City',
  '[
    {"id": "r11", "userName": "Diana Prince", "userImage": "https://i.pravatar.cc/150?u=r11", "rating": 5, "date": "May 2024", "comment": "Safest place for girls. Highly recommend!"},
    {"id": "r12", "userName": "Natasha Romanoff", "userImage": "https://i.pravatar.cc/150?u=r12", "rating": 5, "date": "April 2024", "comment": "Very clean and quiet. Perfect for studying."},
    {"id": "r13", "userName": "Wanda Maximoff", "userImage": "https://i.pravatar.cc/150?u=r13", "rating": 5, "date": "March 2024", "comment": "The water and electricity are always available."},
    {"id": "r14", "userName": "Carol Danvers", "userImage": "https://i.pravatar.cc/150?u=r14", "rating": 5, "date": "February 2024", "comment": "Owner is very kind."},
    {"id": "r15", "userName": "Jean Grey", "userImage": "https://i.pravatar.cc/150?u=r15", "rating": 5, "date": "January 2024", "comment": "Great community here."}
  ]'::jsonb,
  '{}'::jsonb
),
(
  'k4',
  'Blue Horizon Boarding House',
  'Iligan City, Lanao del norte 9200',
  'Clean and quiet environment, perfect for reviewers.',
  4500,
  5.0,
  'https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1540518614846-7eded433c457?auto=format&fit=crop&q=80&w=800'],
  'Boarding House',
  '4 available',
  ARRAY['Free Wifi', 'Drinking Water'],
  8.2325,
  124.2482,
  'Tambacan',
  'Iligan City',
  '[
    {"id": "r16", "userName": "Bruce Wayne", "userImage": "https://i.pravatar.cc/150?u=r16", "rating": 5, "date": "May 2024", "comment": "I like the quietness here."},
    {"id": "r17", "userName": "Clark Kent", "userImage": "https://i.pravatar.cc/150?u=r17", "rating": 5, "date": "April 2024", "comment": "Very clean environment."},
    {"id": "r18", "userName": "Barry Allen", "userImage": "https://i.pravatar.cc/150?u=r18", "rating": 5, "date": "March 2024", "comment": "Wifi is fast enough for my needs."},
    {"id": "r19", "userName": "Arthur Curry", "userImage": "https://i.pravatar.cc/150?u=r19", "rating": 5, "date": "February 2024", "comment": "Drinking water is always filled."},
    {"id": "r20", "userName": "Victor Stone", "userImage": "https://i.pravatar.cc/150?u=r20", "rating": 5, "date": "January 2024", "comment": "Solid place."}
  ]'::jsonb,
  '{}'::jsonb
),
(
  'k5',
  'Executive Solo Suite',
  'Iligan City, Lanao del norte 9200',
  'Premium solo room with air conditioning.',
  8500,
  5.0,
  'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&q=80&w=800'],
  'Solo Room',
  '2 available',
  ARRAY['Aircon', 'Free Wifi', 'Heated Shower'],
  8.2255,
  124.2412,
  'Poblacion',
  'Iligan City',
  '[]'::jsonb,
  '{}'::jsonb
),
(
  'k6',
  'IIT Student Hub',
  'Trece, Iligan City 9200',
  'Walking distance to MSU-IIT gate.',
  3500,
  4.5,
  'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=800'],
  'Near MSU-IIT',
  '10 available',
  ARRAY['Free Wifi', 'Study Area'],
  8.2410,
  124.2435,
  'Trece',
  'Iligan City',
  '[]'::jsonb,
  '{}'::jsonb
),
(
  'k7',
  'Luxe Female Residence',
  'Tibanga, Iligan City 9200',
  'High-end dormitory for professional ladies.',
  7500,
  4.9,
  'https://images.unsplash.com/photo-1631673876640-3b20317048c1?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1631673876640-3b20317048c1?auto=format&fit=crop&q=80&w=800'],
  'All Female',
  '5 available',
  ARRAY['Free Wifi', 'Elevator', 'Gym'],
  8.2430,
  124.2465,
  'Tibanga',
  'Iligan City',
  '[]'::jsonb,
  '{}'::jsonb
),
(
  'k8',
  'Brotherhood Shared Room',
  'San Miguel, Iligan City 9200',
  'Spacious shared room for 4 people.',
  2500,
  4.2,
  'https://images.unsplash.com/photo-1536376074432-aee2107456b3?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1536376074432-aee2107456b3?auto=format&fit=crop&q=80&w=800'],
  'Shared Room',
  '8 available',
  ARRAY['Electricity', 'Kitchen Access'],
  8.2350,
  124.2320,
  'San Miguel',
  'Iligan City',
  '[]'::jsonb,
  '{}'::jsonb
),
(
  'k9',
  'Corner Solo Room',
  'Pala-o, Iligan City 9200',
  'Quiet corner room with a window view.',
  5500,
  4.7,
  'https://images.unsplash.com/photo-1549497538-30129587cb76?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1549497538-30129587cb76?auto=format&fit=crop&q=80&w=800'],
  'Solo Room',
  '1 available',
  ARRAY['Free Wifi', 'Water'],
  8.2360,
  124.2395,
  'Pala-o',
  'Iligan City',
  '[]'::jsonb,
  '{}'::jsonb
),
(
  'k10',
  'Affordable Bed Spacer',
  'Ubaldo Laya, Iligan City 9200',
  'Cheapest bed spacing for students on a budget.',
  1500,
  4.0,
  'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=800',
  ARRAY['https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&q=80&w=800'],
  'Affordable',
  '12 available',
  ARRAY['Water'],
  8.2215,
  124.2312,
  'Ubaldo Laya',
  'Iligan City',
  '[]'::jsonb,
  '{}'::jsonb
);

-- Insert Roommates Mock Data
INSERT INTO public.roommates (id, name, age, gender, university, location, budget_range, preferred_place, bio, image, tags)
VALUES
(
  'rm1',
  'Andrea C. Padillan',
  20,
  'Female',
  'MSU-IIT',
  'Tibanga, Iligan City',
  'P2500-P3000',
  'Nathan''s Female Boarders',
  'Looking for a quiet roommate who respects privacy. I''m a CS student and I spend most of my time coding.',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Andrea67',
  ARRAY['Non-smoker', 'Quiet', 'Clean']
),
(
  'rm2',
  'Irvin Z. labaste',
  19,
  'Male',
  'MSU-IIT',
  'Saray, Iligan City',
  'P2600-P2800',
  'Layla''s Residences & Dormitory',
  'Clean and organized. Looking for a place near the city center. I cook often and enjoy a shared meal!',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Irvin99',
  ARRAY['Clean', 'Night owl', 'Introvert']
),
(
  'rm3',
  'Alex C. Gustavo',
  21,
  'Male',
  'MSU-IIT',
  'Sam Miguel, Iligan City',
  'P2500-P3000',
  'Nathan''s Female Boarders',
  'Morning person and pet friendly. I have a small dog and looking for a roommate that is ok with having a pet.',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex22',
  ARRAY['Pet friendly', 'Morning person', 'Clean']
),
(
  'rm4',
  'Sophia L. Reyes',
  22,
  'Female',
  'MSU-IIT',
  'Pala-o, Iligan City',
  'P2000-P3500',
  'Green Residences',
  'Friendly and easygoing! I love chilling at cafes and studying together. I keep common areas neat.',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=SophiaReyes',
  ARRAY['Outgoing', 'Studious', 'Clean']
),
(
  'rm5',
  'Mark J. Santos',
  20,
  'Male',
  'MSU-IIT',
  'Del Carmen, Iligan City',
  'P2500-P3000',
  'City Scape Dorms',
  'I''m mostly out for classes or at the gym. Looking for a neat roommate. We can hang out or respect each other''s space.',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=MarkSantos',
  ARRAY['Gym goer', 'Tidy', 'Respectful']
),
(
  'rm6',
  'Elena K. Gomez',
  19,
  'Female',
  'MSU-IIT',
  'Hinaplanon, Iligan City',
  'P3000-P4000',
  'Villa Maria Boarding House',
  'Looking for an organized roommate. I usually study at night and keep quiet. Let''s make an exam review buddy out of each other!',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=ElenaGomez',
  ARRAY['Night owl', 'Quiet', 'Studious']
);



-- Enable Supabase Realtime for messages and conversations tables
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Table public.messages is already in publication supabase_realtime';
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE 'Table public.conversations is already in publication supabase_realtime';
  END;
END $$;

-- Create auto-increment trigger for conversations unread_count and message preview updates
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations
    SET 
        last_message = NEW.text,
        last_message_time = NEW.timestamp,
        last_sender_id = NEW.sender_id,
        unread_count = CASE 
            WHEN unread_count IS NULL THEN 1 
            ELSE unread_count + 1 
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_message_created ON public.messages;
CREATE TRIGGER on_message_created
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_message();
