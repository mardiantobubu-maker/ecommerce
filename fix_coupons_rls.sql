-- SQL FIX: Coupons Table RLS & Data Synchronization
-- Jalankan skrip ini di Supabase SQL Editor

-- 1. Buat tabel coupons (jika belum ada)
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT NOT NULL DEFAULT 'percentage', -- 'percentage' atau 'flat'
    discount_value NUMERIC NOT NULL,
    min_purchase NUMERIC DEFAULT 0,
    expiry_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan (RLS Policies)
-- Izinkan siapa saja (Publik) untuk membaca data kupon untuk validasi saat checkout
DROP POLICY IF EXISTS "Public Read Coupons" ON coupons;
CREATE POLICY "Public Read Coupons" ON coupons FOR SELECT USING (true);

-- Izinkan Admin untuk mengelola semua data kupon
DROP POLICY IF EXISTS "Admin All Coupons" ON coupons;
CREATE POLICY "Admin All Coupons" ON coupons FOR ALL USING (true);

-- 4. Sinkronisasi Data Kupon Utama
-- Menambahkan kupon yang ada di banner promo agar bisa digunakan
INSERT INTO coupons (code, discount_type, discount_value, min_purchase, expiry_date)
VALUES 
('SERAGAM2026', 'percentage', 30, 0, '2026-12-31'),
('MITRA20', 'percentage', 20, 0, '2026-12-31'),
('PRAMUKA40', 'percentage', 40, 0, '2026-12-31')
ON CONFLICT (code) DO UPDATE SET 
    discount_type = EXCLUDED.discount_type,
    discount_value = EXCLUDED.discount_value,
    expiry_date = EXCLUDED.expiry_date;

-- 5. Berikan izin akses ke tabel
GRANT ALL ON TABLE coupons TO postgres;
GRANT ALL ON TABLE coupons TO anon;
GRANT ALL ON TABLE coupons TO authenticated;
GRANT ALL ON TABLE coupons TO service_role;
