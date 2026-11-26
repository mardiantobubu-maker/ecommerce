-- SQL MIGRATION: B2B Wholesale Support
-- Paste this into your Supabase SQL Editor

-- 1. Tambahkan kolom metode pembayaran ke tabel orders
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS payment_method TEXT DEFAULT 'bank';

-- 2. Pastikan tabel profiles memiliki kolom B2B (untuk join di Dashboard Admin)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS business_type TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

-- 3. Catatan: Kolom 'items' pada tabel orders harus bertipe JSONB 
-- agar data kuantitas dan kodi tersimpan dengan aman.

-- 4. TRIGGER: Sinkronisasi Metadata Auth ke Tabel Profiles
-- Gunakan ini agar data 'company_name' di Admin Dashboard selalu update
CREATE OR REPLACE FUNCTION public.handle_update_user() 
RETURNS trigger AS $$
BEGIN
  UPDATE public.profiles
  SET 
    full_name = NEW.raw_user_meta_data->>'full_name',
    company_name = NEW.raw_user_meta_data->>'company_name',
    whatsapp = NEW.raw_user_meta_data->>'whatsapp',
    business_type = NEW.raw_user_meta_data->>'business_type'
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Jalankan ini jika ingin sinkron otomatis setiap ada perubahan user
-- DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
-- CREATE TRIGGER on_auth_user_updated
--   AFTER UPDATE ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_update_user();
