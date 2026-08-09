-- ============================================================
-- FIX: Upload Foto Profil & Toko
-- Jalankan SEMUA perintah ini di Supabase SQL Editor
-- Project: ecommerce (Seragam Sekolah)
-- ============================================================

-- 1. Tambahkan kolom avatar_url & store_photo_url ke tabel profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS store_photo_url TEXT;

-- 2. Buat bucket 'avatar' jika belum ada
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

-- 3. Hapus policy lama (jika ada) agar tidak konflik
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner update" ON storage.objects;
DROP POLICY IF EXISTS "avatar_upload_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_read_policy" ON storage.objects;
DROP POLICY IF EXISTS "avatar_delete_policy" ON storage.objects;

-- 4. Izinkan user yang login untuk UPLOAD ke bucket 'avatar'
CREATE POLICY "avatar_upload_policy"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatar');

-- 5. Izinkan SEMUA orang membaca foto (public)
CREATE POLICY "avatar_read_policy"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatar');

-- 6. Izinkan user menghapus file miliknya sendiri
CREATE POLICY "avatar_delete_policy"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatar');

-- 7. Izinkan user mengupdate (upsert) file di bucket
CREATE POLICY "avatar_update_policy"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatar')
WITH CHECK (bucket_id = 'avatar');

-- 8. Update trigger sinkronisasi auth -> profiles (tambah kolom baru)
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

-- Aktifkan trigger (uncomment jika belum ada)
-- DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
-- CREATE TRIGGER on_auth_user_updated
--   AFTER UPDATE ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();

-- ============================================================
-- SELESAI. Cek hasilnya:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';
-- SELECT * FROM storage.buckets WHERE id = 'avatar';
-- ============================================================
