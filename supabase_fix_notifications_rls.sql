-- ============================================================
-- FIX: RLS Policy Notifications Table
-- Jalankan di Supabase > SQL Editor
-- ============================================================

-- 1. Pastikan RLS aktif pada tabel notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 2. Hapus semua policy lama yang konflik (jika ada)
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to read own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow users to delete own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Service role can do anything" ON public.notifications;

-- 3. Policy: User bisa SELECT notifikasi miliknya sendiri
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- 4. Policy: User bisa UPDATE notifikasi miliknya (untuk tandai dibaca)
CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 5. Policy: User bisa DELETE notifikasi miliknya
CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- 6. Policy: Service role (backend/admin) bisa INSERT notifikasi untuk siapapun
CREATE POLICY "Service role full access"
ON public.notifications
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Policy: Authenticated user bisa INSERT untuk dirinya sendiri (jika perlu)
CREATE POLICY "Users can insert own notifications"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- Verifikasi: cek semua policy yang aktif
-- ============================================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY cmd;
