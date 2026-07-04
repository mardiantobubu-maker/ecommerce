-- SQL MIGRATION: Home Banners & Promo Notifications
-- Paste this into your Supabase SQL Editor

-- 1. Create notifications table (if not exists)
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    message TEXT,
    link TEXT,
    status TEXT DEFAULT 'Unread',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create home_banners table
CREATE TABLE IF NOT EXISTS home_banners (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    type TEXT NOT NULL, -- 'BIG', 'SMALL_1', 'SMALL_2'
    title TEXT NOT NULL,
    subtitle TEXT,
    discount_text TEXT,
    coupon_code TEXT, -- Added to sync with code
    image_url TEXT,
    button_text TEXT DEFAULT 'Beli Sekarang',
    button_link TEXT DEFAULT '/shop',
    bg_color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE home_banners ENABLE ROW LEVEL SECURITY;

-- 3. Create policies (Public Read, Admin All)
DROP POLICY IF EXISTS "Public Read Home Banners" ON home_banners;
DROP POLICY IF EXISTS "Admin All Home Banners" ON home_banners;
CREATE POLICY "Public Read Home Banners" ON home_banners FOR SELECT USING (true);
CREATE POLICY "Admin All Home Banners" ON home_banners FOR ALL USING (true);

-- 4. Create RPC Function for Broadcasting Promo Notifications
-- This function sends a notification to ALL users (profiles)
CREATE OR REPLACE FUNCTION broadcast_promo_notification(p_title TEXT, p_message TEXT, p_link TEXT)
RETURNS VOID AS $$
BEGIN
    INSERT INTO notifications (user_id, type, title, message, link, status)
    SELECT id, 'promo', p_title, p_message, p_link, 'Unread'
    FROM profiles;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Insert default data
INSERT INTO home_banners (type, title, subtitle, discount_text, coupon_code, image_url, button_text, button_link, bg_color)
VALUES 
('BIG', 'Koleksi Seragam Sekolah 2026', 'Persiapkan putra-putri Anda dengan seragam sekolah berkualitas terbaik. Nyaman dipakai, tahan lama, dan sesuai standar nasional.', 'DISKON HINGGA 30%', 'SERAGAM2026', '/images/products/terbaru-seragam-sd.png', 'Beli Sekarang', '/shop-with-sidebar', '#F5F5F7'),
('SMALL_1', 'Kualitas Premium', 'Seragam SMP & SMA', 'Diskon tetap 20%', 'MITRA20', '/images/products/seragam-smp.png', 'Dapatkan Sekarang', '/shop-with-sidebar', '#DBF4F3'),
('SMALL_2', 'Seragam Pramuka', 'Lengkapi atribut pramuka lengkap untuk kegiatan ekstrakurikuler yang lebih bersemangat.', 'Diskon hingga 40%', 'PRAMUKA40', '/images/products/seragam-pramuka.png', 'Beli Sekarang', '/shop-with-sidebar', '#FFECE1')
ON CONFLICT DO NOTHING;
