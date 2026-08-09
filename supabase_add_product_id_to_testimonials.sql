-- ============================================================
-- FIX: Hubungkan Ulasan (Testimonials) dengan Produk
-- ============================================================

-- Tambahkan kolom product_id ke tabel testimonials (opsional: referensi ke tabel products)
ALTER TABLE public.testimonials 
ADD COLUMN IF NOT EXISTS product_id BIGINT;

-- Jika Anda memiliki tabel products dengan primary key id (BIGINT), bisa gunakan ini:
-- ALTER TABLE public.testimonials 
-- ADD COLUMN IF NOT EXISTS product_id BIGINT REFERENCES public.products(id) ON DELETE CASCADE;

-- Update RLS Policy agar ulasan bisa difilter dan dilihat oleh publik
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
CREATE POLICY "Public can view testimonials" 
ON public.testimonials FOR SELECT 
USING (true);

-- Izinkan user (atau anon) menambahkan ulasan
DROP POLICY IF EXISTS "Anyone can insert testimonials" ON public.testimonials;
CREATE POLICY "Anyone can insert testimonials" 
ON public.testimonials FOR INSERT 
WITH CHECK (true);
