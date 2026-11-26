-- ============================================================
-- FIX: Google OAuth - "Database error saving new user"
-- Root Cause: Trigger handle_new_user tidak ada atau gagal INSERT ke profiles
-- Jalankan SEMUA perintah ini di Supabase SQL Editor
-- Project: Seragam Sekolah
-- ============================================================

-- STEP 1: Pastikan tabel profiles memiliki semua kolom yang diperlukan
-- dengan DEFAULT yang aman (agar trigger tidak gagal karena NOT NULL)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS store_photo_url TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- STEP 2: Buat/Update fungsi handle_new_user
-- Fungsi ini dijalankan otomatis setiap ada user baru (termasuk via Google OAuth)
-- SECURITY DEFINER = berjalan dengan hak superuser, melewati RLS
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  user_full_name TEXT;
  user_email TEXT;
  user_avatar TEXT;
BEGIN
  -- Ambil data dari metadata Google OAuth atau email signup
  user_full_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',           -- Google OAuth menggunakan 'name'
    split_part(NEW.email, '@', 1)              -- fallback: gunakan bagian depan email
  );
  
  user_email := COALESCE(
    NEW.email,
    NEW.raw_user_meta_data->>'email'
  );
  
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'custom_avatar_url',
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture'         -- Google OAuth menggunakan 'picture'
  );

  -- INSERT ke profiles, abaikan jika sudah ada (upsert aman)
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    avatar_url,
    company_name,
    business_type,
    whatsapp,
    role,
    created_at
  )
  VALUES (
    NEW.id,
    user_full_name,
    user_email,
    user_avatar,
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'business_type',
    NEW.raw_user_meta_data->>'whatsapp',
    'user',
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Jika profil sudah ada (misal: re-login Google), update data yang kosong saja
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    email = COALESCE(EXCLUDED.email, public.profiles.email),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error tapi JANGAN gagalkan proses auth
    -- Ini mencegah "Database error saving new user"
    RAISE WARNING 'handle_new_user error (non-fatal): %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 3: Pasang trigger ke auth.users
-- Drop dulu jika sudah ada (agar tidak duplikat)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- STEP 4: Pastikan RLS pada profiles mengizinkan INSERT dari service_role
-- (trigger berjalan sebagai service_role karena SECURITY DEFINER)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy untuk service_role (trigger berjalan dengan role ini)
DROP POLICY IF EXISTS "Service role full access on profiles." ON public.profiles;
CREATE POLICY "Service role full access on profiles."
  ON public.profiles FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- STEP 5: Buat profil untuk user Google yang sudah ada tapi belum punya profil
-- (Backfill: perbaiki user lama yang sudah terlanjur daftar via Google tapi gagal)
INSERT INTO public.profiles (id, full_name, email, avatar_url, role, created_at)
SELECT 
  au.id,
  COALESCE(
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'name',
    split_part(au.email, '@', 1)
  ),
  au.email,
  COALESCE(
    au.raw_user_meta_data->>'avatar_url',
    au.raw_user_meta_data->>'picture'
  ),
  'user',
  NOW()
FROM auth.users au
LEFT JOIN public.profiles p ON p.id = au.id
WHERE p.id IS NULL  -- hanya user yang belum punya profil
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- VERIFIKASI: Jalankan query ini untuk memastikan trigger sudah terpasang
-- ============================================================
SELECT 
  tgname AS trigger_name,
  tgtype,
  proname AS function_name
FROM pg_trigger t
JOIN pg_proc p ON p.oid = t.tgfoid
WHERE tgrelid = 'auth.users'::regclass
  AND tgname = 'on_auth_user_created';

-- Cek profil yang ada:
-- SELECT id, full_name, email, role, created_at FROM public.profiles ORDER BY created_at DESC LIMIT 10;
