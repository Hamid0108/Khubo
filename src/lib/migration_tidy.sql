-- Migration Script to Tidy Up profiles Table Schema
-- Execute this script in your Supabase SQL Editor (Dashboard > SQL Editor > New query > Run).

-- 1. Add new columns to public.profiles table if they do not exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS nickname TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS school_or_company TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lifestyle TEXT[];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sleep_schedule TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cleanliness INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS noise_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_photo_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS id_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;

-- Add new columns to public.reservations table if they do not exist
ALTER TABLE public.reservations ADD COLUMN IF NOT EXISTS tenant_gender TEXT;

-- 2. Safely parse and migrate any JSON data previously stored in the public.profiles.phone column
DO $$
DECLARE
    r RECORD;
    meta JSONB;
BEGIN
    FOR r IN SELECT id, phone FROM public.profiles WHERE phone LIKE '{%}' LOOP
        BEGIN
            meta := r.phone::jsonb;
            
            -- Extract fields from JSON metadata
            UPDATE public.profiles
            SET
                nickname = COALESCE(meta->>'nickname', nickname),
                bio = COALESCE(meta->>'bio', bio),
                location = COALESCE(meta->>'location', location),
                occupation = COALESCE(meta->>'occupation', occupation),
                school_or_company = COALESCE(meta->>'school_or_company', school_or_company),
                sleep_schedule = COALESCE(meta->>'sleep_schedule', sleep_schedule),
                noise_level = COALESCE(meta->>'noise_level', noise_level),
                id_type = COALESCE(meta->>'id_type', id_type),
                id_photo_url = COALESCE(meta->>'id_photo_url', id_photo_url),
                gender = COALESCE(meta->>'gender', gender),
                
                -- Handle array casting
                lifestyle = CASE 
                    WHEN meta ? 'lifestyle' AND jsonb_typeof(meta->'lifestyle') = 'array' 
                    THEN ARRAY(SELECT jsonb_array_elements_text(meta->'lifestyle'))
                    ELSE lifestyle 
                END,
                
                -- Handle integer casting
                cleanliness = CASE 
                    WHEN meta ? 'cleanliness' AND jsonb_typeof(meta->'cleanliness') = 'number'
                    THEN (meta->>'cleanliness')::integer
                    ELSE cleanliness 
                END,
                
                -- Handle boolean casting
                onboarding_complete = CASE 
                    WHEN meta ? 'onboarding_complete' 
                    THEN (meta->>'onboarding_complete')::boolean
                    ELSE TRUE 
                END,
                
                id_verified = CASE 
                    WHEN meta ? 'id_verified' 
                    THEN (meta->>'id_verified')::boolean
                    ELSE id_verified 
                END,
                
                -- Restore the nested text phone number
                phone = COALESCE(meta->>'phone', '')
            WHERE id = r.id;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Skipped migrating JSON profile for user % due to error: %', r.id, SQLERRM;
        END;
    END LOOP;
END $$;

-- 3. Update the handle_new_user trigger function to include onboarding_complete = false
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

-- Realtime publication for messages and conversations tables has been removed.

-- 7. Drop the FYP videos table completely
DROP TABLE IF EXISTS public.fyp_videos CASCADE;

-- 8. Add barangay and city columns to listings table if they do not exist
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS barangay TEXT;
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS city TEXT;

-- 9. Add post_mode column to roommates table if it does not exist
ALTER TABLE public.roommates ADD COLUMN IF NOT EXISTS post_mode TEXT DEFAULT 'applying' CHECK (post_mode IN ('applying', 'finding'));


