"use client";
import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

const ProfileStatusChecker = () => {
  useEffect(() => {
    let isMounted = true;
    const checkProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!isMounted) return;

      if (!user) {
        localStorage.setItem('profile_incomplete', 'false');
        return;
      }

      // 1. Cek metadata terlebih dahulu
      const meta = user.user_metadata;
      let isComplete = false;

      if (meta && meta.company_name && meta.whatsapp && meta.business_type && meta.store_photo_url) {
        isComplete = true;
      } else {
        // 2. Fallback cek ke tabel profiles
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_name, whatsapp, business_type, store_photo_url')
          .eq('id', user.id)
          .single();

        if (profile && profile.company_name && profile.whatsapp && profile.business_type && profile.store_photo_url) {
          isComplete = true;
        }
      }

      if (isMounted) {
        localStorage.setItem('profile_incomplete', (!isComplete).toString());
      }
    };

    const deferCheck = () => {
      if (typeof window !== "undefined" && "requestIdleCallback" in window) {
        window.requestIdleCallback(() => { if (isMounted) checkProfile(); });
      } else {
        setTimeout(() => { if (isMounted) checkProfile(); }, 3000);
      }
    };

    deferCheck();
    
    // Check periodically or on focus
    const interval = setInterval(() => {
      if (isMounted) checkProfile();
    }, 30000); // 30s
    const focusHandler = () => { if (isMounted) checkProfile(); };
    window.addEventListener('focus', focusHandler);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', focusHandler);
    };
  }, []);

  return null;
};

export default ProfileStatusChecker;
