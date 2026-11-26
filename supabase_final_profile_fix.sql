-- ============================================================
-- SUPER FIX: Upload Foto Profil & Toko (Storage + RLS Profiles)
-- Jalankan SEMUA perintah ini di Supabase SQL Editor
-- Project: ecommerce (Seragam Sekolah)
-- ============================================================

-- 1. PASTIKAN TABEL PROFILES MEMILIKI KOLOM YANG DIBUTUHKAN
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS store_photo_url TEXT;

-- 2. PERBAIKI RLS (ROW LEVEL SECURITY) PADA TABEL PROFILES
-- Jika user tidak diizinkan update data mereka sendiri di tabel profiles, maka akan gagal saat simpan
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 3. BUAT / UPDATE BUCKET 'avatar' (Wajib Public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatar',
  'avatar',
  true,
  5242880,  -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

-- 4. HAPUS SEMUA POLICY LAMA AGAR TIDAK KONFLIK
DROP POLICY IF EXISTS "avatar_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_update_policy" ON storage.objects;

-- 5. BUAT POLICY STORAGE YANG BENAR
-- A. Izinkan siapapun melihat foto (Public Read)
CREATE POLICY "avatar_read_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatar');

-- B. Izinkan user login untuk upload (Insert)
CREATE POLICY "avatar_upload_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatar');

-- C. Izinkan user login untuk update foto yang sudah ada
CREATE POLICY "avatar_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatar');

-- D. Izinkan user login untuk menghapus foto
CREATE POLICY "avatar_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatar');

-- 6. PERBAIKI TRIGGER SINKRONISASI (auth.users -> public.profiles)
CREATE OR REPLACE FUNCTION public.handle_update_user()
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET
    full_name = NEW.raw_user_meta_data->>'full_name',
    company_name = NEW.raw_user_meta_data->>'company_name',
    whatsapp = NEW.raw_user_meta_data->>'whatsapp',
    business_type = NEW.raw_user_meta_data->>'business_type',
    avatar_url = COALESCE(
      NEW.raw_user_meta_data->>'custom_avatar_url',
      NEW.raw_user_meta_data->>'avatar_url'
    ),
    store_photo_url = NEW.raw_user_meta_data->>'store_photo_url'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aktifkan trigger jika belum ada
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- SELESAI.
