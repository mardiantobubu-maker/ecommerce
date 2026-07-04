"use client";
// Vercel trigger commit - 2026-05-04
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");

  const fetchAllOrders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const response = await fetch('/api/admin/orders', { cache: 'no-store' });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengambil data");
      }
      const data = await response.json();
      setOrders(data || []);
    } catch (err: any) {
      console.error("Fetch all orders failed:", err);
      if (!isSilent) toast.error("Gagal mengambil data pesanan: " + translateError(err.message));
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const fetchOrdersSafe = async (isSilent = false) => {
      if (!isSilent) setLoading(true);
      try {
        const response = await fetch('/api/admin/orders', { cache: 'no-store' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Gagal mengambil data");
        }
        const data = await response.json();
        if (isMounted) setOrders(data || []);
      } catch (err: any) {
        console.error("Fetch all orders failed:", err);
        if (!isSilent && isMounted) toast.error("Gagal mengambil data pesanan: " + translateError(err.message));
      } finally {
        if (!isSilent && isMounted) setLoading(false);
      }
    };

    fetchOrdersSafe();

    // Fallback polling (10 seconds)
    const pollInterval = setInterval(() => {
      if (isMounted) fetchOrdersSafe(true);
    }, 10000);

    const channel = supabase
      .channel('admin_orders_realtime_v3') // Increment version to avoid collision
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          if (!isMounted) return;
          console.log("Realtime Order Update:", payload);
          
          if (payload.eventType === 'INSERT') {
            toast.success("🔔 Pesanan Baru Masuk!", {
              duration: 5000,
              icon: '📦',
              style: {
                borderRadius: '10px',
                background: '#3C50E0',
                color: '#fff',
                fontWeight: 'bold'
              }
            });
            try {
              const audio = new Audio('/sounds/notification.mp3');
              audio.play().catch(() => {});
            } catch (e) {}
          }
          
          fetchOrdersSafe(true);
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, newStatus: string, note?: string) => {
    try {
      const response = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus, cancellation_note: note })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal update status");
      }

      // Realtime will handle the UI update via fetchAllOrders(true)
    } catch (err: any) {
      toast.error(translateError(err.message));
    }
  };

  const handlePrintInvoice = (o: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const invoiceHtml = `
      <html>
        <head>
          <title>Invoice #${o.id.slice(-6).toUpperCase()}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #3C50E0; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: 800; color: #3C50E0; }
            .invoice-title { font-size: 32px; font-weight: 900; color: #1e293b; margin: 0; }
            .section { margin-bottom: 30px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
            .label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em; }
            .value { font-size: 14px; font-weight: 500; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #f8fafc; text-align: left; padding: 14px 12px; font-size: 11px; font-weight: 800; color: #64748b; border-bottom: 2px solid #e2e8f0; text-transform: uppercase; letter-spacing: 0.05em; }
            td { padding: 14px 12px; font-size: 14px; border-bottom: 1px solid #e2e8f0; }
            .total-section { margin-left: auto; width: 320px; margin-top: 40px; }
            .total-row { display: flex; justify-content: space-between; padding: 10px 0; }
            .total-final { border-top: 2px solid #3C50E0; margin-top: 15px; padding-top: 15px; font-weight: 900; font-size: 20px; color: #3C50E0; }
            .footer { margin-top: 60px; font-size: 12px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 25px; }
            @media print { 
              .no-print { display: none; } 
              body { padding: 0; } 
              @page { margin: 1cm; }
            }
          </style>
        </head>

        <body>
          <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; padding-top: 10px;">
            <div style="flex: 1;">
              <svg xmlns="http://www.w3.org/2000/svg" width="171" height="42" viewBox="0 0 171 42" fill="none" style="height: 60px; width: auto; display: block;">
                <path d="M18 36C27.9411 36 36 27.9411 36 18C36 8.05887 27.9411 0 18 0C8.05887 0 0 8.05887 0 18C0 27.9411 8.05887 36 18 36Z" fill="#3C50E0"/>
                <path d="M20.9858 13.5653C20.9176 12.8778 20.625 12.3437 20.108 11.9631C19.5909 11.5824 18.8892 11.392 18.0028 11.392C17.4006 11.392 16.892 11.4773 16.4773 11.6477C16.0625 11.8125 15.7443 12.0426 15.5227 12.3381C15.3068 12.6335 15.1989 12.9688 15.1989 13.3438C15.1875 13.6562 15.2528 13.929 15.3949 14.1619C15.5426 14.3949 15.7443 14.5966 16 14.767C16.2557 14.9318 16.5511 15.0767 16.8864 15.2017C17.2216 15.321 17.5795 15.4233 17.9602 15.5085L19.5284 15.8835C20.2898 16.054 20.9886 16.2812 21.625 16.5653C22.2614 16.8494 22.8125 17.1989 23.2784 17.6136C23.7443 18.0284 24.1051 18.517 24.3608 19.0795C24.6222 19.642 24.7557 20.2869 24.7614 21.0142C24.7557 22.0824 24.483 23.0085 23.9432 23.7926C23.4091 24.571 22.6364 25.1761 21.625 25.608C20.6193 26.0341 19.4063 26.2472 17.9858 26.2472C16.5767 26.2472 15.3494 26.0312 14.304 25.5994C13.2642 25.1676 12.4517 24.5284 11.8665 23.6818C11.2869 22.8295 10.983 21.7756 10.9545 20.5199H14.5256C14.5653 21.1051 14.733 21.5937 15.0284 21.9858C15.3295 22.3722 15.7301 22.6648 16.2301 22.8636C16.7358 23.0568 17.3068 23.1534 17.9432 23.1534C18.5682 23.1534 19.1108 23.0625 19.571 22.8807C20.0369 22.6989 20.3977 22.446 20.6534 22.1222C20.9091 21.7983 21.0369 21.4261 21.0369 21.0057C21.0369 20.6136 20.9205 20.2841 20.6875 20.017C20.4602 19.75 20.125 19.5227 19.6818 19.3352C19.2443 19.1477 18.7074 18.9773 18.071 18.8239L16.1705 18.3466C14.6989 17.9886 13.5369 17.429 12.6847 16.6676C11.8324 15.9062 11.4091 14.8807 11.4148 13.5909C11.4091 12.5341 11.6903 11.6108 12.2585 10.8210C12.8324 10.0312 13.6193 9.41477 14.6193 8.97159C15.6193 8.52841 16.7557 8.30682 18.0284 8.30682C19.3239 8.30682 20.4545 8.52841 21.4205 8.97159C22.392 9.41477 23.1477 10.0312 23.6875 10.821C24.2273 11.6108 24.5057 12.5256 24.5227 13.5653H20.9858Z" fill="white"/>
                <path d="M46.4148 26.2557C45.0682 26.2557 43.9091 25.983 42.9375 25.4375C41.9716 24.8864 41.2273 24.108 40.7045 23.1023C40.1818 22.0909 39.9205 20.8949 39.9205 19.5142C39.9205 18.1676 40.1818 16.9858 40.7045 15.9688C41.2273 14.9517 41.9631 14.1591 42.9119 13.5909C43.8665 13.0227 44.9858 12.7386 46.2699 12.7386C47.1335 12.7386 47.9375 12.8778 48.6818 13.1562C49.4318 13.429 50.0852 13.8409 50.642 14.392C51.2045 14.9432 51.642 15.6364 51.9545 16.4716C52.267 17.3011 52.4233 18.2727 52.4233 19.3864V20.3835H41.3693V18.1335H49.0057C49.0057 17.6108 48.892 17.1477 48.6648 16.7443C48.4375 16.3409 48.1222 16.0256 47.7188 15.7983C47.321 15.5653 46.858 15.4489 46.3295 15.4489C45.7784 15.4489 45.2898 15.5767 44.8636 15.8324C44.4432 16.0824 44.1136 16.4205 43.875 16.8466C43.6364 17.267 43.5142 17.7358 43.5085 18.2528V20.392C43.5085 21.0398 43.6278 21.5994 43.8265 22.071C44.1108 22.5426 44.4545 22.9062 44.8977 23.1619C45.3409 23.4176 45.8665 23.5455 46.4744 23.5455C46.8778 23.5455 47.2472 23.4886 47.5824 23.375C47.9176 23.2614 48.2045 23.0909 48.4432 22.8636C48.6818 22.6364 48.8636 22.358 48.9886 22.0284L52.3466 22.25C52.1761 23.0568 51.8267 23.7614 51.2983 24.3636C50.7756 24.9602 50.0994 25.4261 49.2699 25.7614C48.446 26.0909 47.4943 26.2557 46.4148 26.2557ZM54.7926 26V12.9091H58.3125V15.1932H58.4489C58.6875 14.3807 59.0881 13.767 59.6506 13.3523C60.2131 12.9318 60.8608 12.7216 61.5938 12.7216C61.7756 12.7216 61.9716 12.7330 62.1818 12.7557C62.392 12.7784 62.5767 12.8097 62.7358 12.8494V16.071C62.5653 16.0199 62.3295 15.9744 62.0284 15.9347C61.7273 15.8949 61.4017 15.875 61.2017 15.875C60.6676 15.875 60.1903 15.9915 59.7699 16.2244C59.3551 16.4517 59.0256 16.7699 58.7812 17.179C58.5426 17.5881 58.4233 18.0597 58.4233 18.5938V26H54.7926ZM67.9709 26.2472C67.1357 26.2472 66.3913 26.1023 65.7379 25.8125C65.0845 25.5170 64.5675 25.0824 64.1868 24.5085C63.8118 23.9290 63.6243 23.2074 63.6243 22.3438C63.6243 21.6165 63.7578 21.0057 64.0249 20.5114C64.2919 20.0170 64.6555 19.6193 65.1158 19.3182C65.5760 19.0170 66.0987 18.7898 66.6839 18.6364C67.2749 18.4830 67.8942 18.3750 68.5419 18.3125C69.3033 18.2330 69.9169 18.1591 70.3828 18.0909C70.8487 18.0170 71.1868 17.9091 71.3970 17.7670C71.6072 17.6250 71.7124 17.4148 71.7124 17.1364V17.0852C71.7124 16.5455 71.5419 16.1278 71.2010 15.8324C70.8658 15.5369 70.3885 15.3892 69.7692 15.3892C69.1158 15.3892 68.5959 15.5341 68.2095 15.8239C67.8232 16.1080 67.5675 16.4659 67.4425 16.8977L64.0845 16.625C64.2550 15.8295 64.5902 15.1420 65.0902 14.5625C65.5902 13.9773 66.2351 13.5284 67.0249 13.2159C67.8203 12.8977 68.7408 12.7386 69.7862 12.7386C70.5135 12.7386 71.2095 12.8239 71.8743 12.9943C72.5447 13.1648 73.1385 13.4290 73.6555 13.7869C74.1783 14.1449 74.5902 14.6051 74.8913 15.1676C75.1925 15.7244 75.3430 16.3920 75.3430 17.1705V26H71.8999V24.1847H71.7976C71.5874 24.5938 71.3061 24.9545 70.9538 25.2670C70.6016 25.5739 70.1783 25.8153 69.6839 25.9915C69.1896 26.1619 68.6186 26.2472 67.9709 26.2472ZM69.0107 23.7415C69.5447 23.7415 70.0163 23.6364 70.4254 23.4261C70.8345 23.2102 71.1555 22.9205 71.3885 22.5568C71.6214 22.1932 71.7379 21.7812 71.7379 21.321V19.9318C71.6243 20.0057 71.4680 20.0739 71.2692 20.1364C71.0760 20.1932 70.8572 20.2472 70.6129 20.2983C70.3686 20.3437 70.1243 20.3864 69.8800 20.4261C69.6357 20.4602 69.4141 20.4915 69.2152 20.5199C68.7891 20.5824 68.4169 20.6818 68.0987 20.8182C67.7805 20.9545 67.5334 21.1392 67.3572 21.3722C67.1811 21.5994 67.0930 21.8835 67.0930 22.2244C67.0930 22.7188 67.2720 23.0966 67.6300 23.3580C67.9936 23.6136 68.4538 23.7415 69.0107 23.7415ZM84.0575 31.1818C82.8814 31.1818 81.8729 31.0199 81.0320 30.6960C80.1967 30.3778 79.5320 29.9432 79.0376 29.3920C78.5433 28.8409 78.2223 28.2216 78.0746 27.5341L81.4325 27.0824C81.5348 27.3438 81.6967 27.5881 81.9183 27.8153C82.1399 28.0426 82.4325 28.2244 82.7962 28.3608C83.1655 28.5028 83.6143 28.5739 84.1428 28.5739C84.9325 28.5739 85.5831 28.3807 86.0945 27.9943C86.6115 27.6136 86.8700 26.9744 86.8700 26.0767V23.6818H86.7166C86.5575 24.0455 86.3189 24.3892 86.0007 24.7131C85.6825 25.0369 85.2734 25.3011 84.7734 25.5057C84.2734 25.7102 83.6768 25.8125 82.9837 25.8125C82.0007 25.8125 81.1058 25.5852 80.2990 25.1307C79.4979 24.6705 78.8587 23.9687 78.3814 23.0256C77.9098 22.0767 77.6740 20.8778 77.6740 19.4290C77.6740 17.9460 77.9155 16.7074 78.3984 15.7131C78.8814 14.7187 79.5234 13.9744 80.3246 13.4801C81.1314 12.9858 82.0149 12.7386 82.9751 12.7386C83.7081 12.7386 84.3217 12.8636 84.8161 13.1136C85.3104 13.3580 85.7081 13.6648 86.0092 14.0341C86.3161 14.3977 86.5518 14.7557 86.7166 15.1080H86.8530V12.9091H90.4581V26.1278C90.4581 27.2415 90.1854 28.1733 89.6399 28.9233C89.0945 29.6733 88.3388 30.2358 87.3729 30.6108C86.4126 30.9915 85.3075 31.1818 84.0575 31.1818ZM84.1342 23.0852C84.7195 23.0852 85.2138 22.9403 85.6172 22.6506C86.0263 22.3551 86.3388 21.9347 86.5547 21.3892C86.7763 20.8381 86.8871 20.1790 86.8871 19.4119C86.8871 18.6449 86.7791 17.9801 86.5632 17.4176C86.3473 16.8494 86.0348 16.4091 85.6257 16.0966C85.2166 15.7841 84.7195 15.6278 84.1342 15.6278C83.5376 15.6278 83.0348 15.7898 82.6257 16.1136C82.2166 16.4318 81.9070 16.8750 81.6967 17.4432C81.4865 18.0114 81.3814 18.6676 81.3814 19.4119C81.3814 20.1676 81.4865 20.8210 81.6967 21.3722C81.9126 21.9176 82.2223 22.3409 82.6257 22.6420C83.0348 22.9375 83.5376 23.0852 84.1342 23.0852ZM97.0803 26.2472C96.2450 26.2472 95.5007 26.1023 94.8473 25.8125C94.1939 25.5170 93.6768 25.0824 93.2962 24.5085C92.9212 23.9290 92.7337 23.2074 92.7337 22.3438C92.7337 21.6165 92.8672 21.0057 93.1342 20.5114C93.4013 20.0170 93.7649 19.6193 94.2251 19.3182C94.6854 19.0170 95.2081 18.7898 95.7933 18.6364C96.3842 18.4830 97.0036 18.3750 97.6513 18.3125C98.4126 18.2330 99.0263 18.1591 99.4922 18.0909C99.9581 18.0170 100.296 17.9091 100.506 17.7670C100.717 17.6250 100.822 17.4148 100.822 17.1364V17.0852C100.822 16.5455 100.651 16.1278 100.310 15.8324C99.9751 15.5369 99.4979 15.3892 98.8786 15.3892C98.2251 15.3892 97.7053 15.5341 97.3189 15.8239C96.9325 16.1080 96.6768 16.4659 96.5518 16.8977L93.1939 16.625C93.3643 15.8295 93.6996 15.1420 94.1996 14.5625C94.6996 13.9773 95.3445 13.5284 96.1342 13.2159C96.9297 12.8977 97.8501 12.7386 98.8956 12.7386C99.6229 12.7386 100.319 12.8239 100.984 12.9943C101.654 13.1648 102.248 13.4290 102.765 13.7869C103.288 14.1449 103.700 14.6051 104.001 15.1676C104.302 15.7244 104.452 16.3920 104.452 17.1705V26H101.009V24.1847H100.907C100.697 24.5938 100.415 24.9545 100.063 25.2670C99.7109 25.5739 99.2876 25.8153 98.7933 25.9915C98.2990 26.1619 97.7280 26.2472 97.0803 26.2472ZM98.1200 23.7415C98.6541 23.7415 99.1257 23.6364 99.5348 23.4261C99.9439 23.2102 100.265 22.9205 100.498 22.5568C100.731 22.1932 100.847 21.7812 100.847 21.321V19.9318C100.734 20.0057 100.577 20.0739 100.379 20.1364C100.185 20.1932 99.9666 20.2472 99.7223 20.2983C99.4780 20.3437 99.2337 20.3864 98.9893 20.4261C98.7450 20.4602 98.5234 20.4915 98.3246 20.5199C97.8984 20.5824 97.5263 20.6818 97.2081 20.8182C96.8899 20.9545 96.6428 21.1392 96.4666 21.3722C96.2905 21.5994 96.2024 21.8835 96.2024 22.2244C96.2024 22.7188 96.3814 23.0966 96.7393 23.3580C97.1030 23.6136 97.5632 23.7415 98.1200 23.7415ZM107.269 26V12.9091H110.729V15.2188H110.883C111.156 14.4517 111.610 13.8466 112.246 13.4034C112.883 12.9602 113.644 12.7386 114.531 12.7386C115.428 12.7386 116.192 12.9631 116.823 13.4119C117.454 13.8551 117.874 14.4574 118.085 15.2188H118.221C118.488 14.4688 118.971 13.8693 119.670 13.4205C120.374 12.9659 121.207 12.7386 122.167 12.7386C123.388 12.7386 124.380 13.1278 125.141 13.9062C125.908 14.6790 126.292 15.7756 126.292 17.1960V26H122.670V17.9119C122.670 17.1847 122.477 16.6392 122.090 16.2756C121.704 15.9119 121.221 15.7301 120.641 15.7301C119.982 15.7301 119.468 15.9403 119.099 16.3608C118.729 16.7756 118.545 17.3239 118.545 18.0057V26H115.025V17.8352C115.025 17.1932 114.840 16.6818 114.471 16.3011C114.107 15.9205 113.627 15.7301 113.031 15.7301C112.627 15.7301 112.263 15.8324 111.940 16.0369C111.621 16.2358 111.369 16.5170 111.181 16.8807C110.994 17.2386 110.900 17.6591 110.900 18.1420V26H107.269Z" fill="#1C274C"/>
              </svg>
            </div>

            <div style="text-align: right">
              <h1 class="invoice-title" style="margin: 0;">INVOICE</h1>
              <div class="value" style="font-weight: 800; color: #3C50E0;">#${o.id.slice(-6).toUpperCase()}</div>
              <div class="value">${new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
          </div>

          <div class="grid section">
            <div>
              <div class="label">Ditagih ke:</div>
              <div class="value" style="font-weight: 800; font-size: 16px; margin-bottom: 4px;">${o.profiles?.full_name || 'Pelanggan'}</div>
              <div class="value">${o.profiles?.company_name || 'Personal'}</div>
              <div class="value">${o.profiles?.whatsapp || '-'}</div>
            </div>
            <div>
              <div class="label">Alamat Pengiriman (Penerima):</div>
              <div class="value" style="font-weight: 700;">${o.shipping_address?.recipientName || '-'}</div>
              <div class="value" style="color: #3C50E0; font-weight: 600; margin-bottom: 2px;">Telp: ${o.shipping_address?.phone || '-'}</div>
              <div class="value">${o.shipping_address?.streetAddress || '-'}</div>
              <div class="value">${o.shipping_address?.kelurahan ? o.shipping_address.kelurahan + ', ' : ''} ${o.shipping_address?.kecamatan || ''}</div>
              <div class="value">${o.shipping_address?.kota ? o.shipping_address.kota + ', ' : ''} ${o.shipping_address?.provinsi || ''} ${o.shipping_address?.kodePos || ''}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 50%">PRODUK</th>
                <th>UNIT/KODI</th>
                <th style="text-align: right">SUBTOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${o.items.map((item: any) => `
                <tr>
                  <td>
                    <div style="font-weight: 800; color: #1e293b;">${item.title}</div>
                    <div style="font-size: 11px; color: #64748b; margin-top: 2px;">${item.color || ''} ${item.sleeve || ''}</div>
                  </td>
                  <td style="font-weight: 600;">${item.quantity.toLocaleString('id-ID')} Unit (${(item.quantity / 20).toLocaleString('id-ID')} Kodi)</td>
                  <td style="text-align: right; font-weight: 800; color: #1e293b;">Rp${(item.discountedPrice * item.quantity).toLocaleString('id-ID')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <div class="label">Metode Bayar:</div>
              <div class="value" style="text-transform: uppercase; font-weight: 800; color: #3C50E0;">
                ${o.payment_method === 'invoice' ? 'B2B Invoice' : o.payment_method === 'cash' ? 'Cash on Delivery' : 'Transfer Bank'}
              </div>
            </div>
            <div class="total-row" style="border-top: 1px dashed #e2e8f0; margin-top: 10px; padding-top: 10px;">
              <div class="label">Subtotal:</div>
              <div class="value" style="font-weight: 700;">Rp${o.total_amount.toLocaleString('id-ID')}</div>
            </div>
            <div class="total-final">
              <div class="total-row">
                <span style="letter-spacing: 0.1em;">TOTAL</span>
                <span>Rp${o.total_amount.toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>

          <div class="footer">
            <div style="margin-bottom: 8px; font-weight: 700; color: #64748b;">Terima kasih atas kepercayaan Anda kepada Seragam Sekolah.</div>
            <div>Faktur ini dihasilkan secara otomatis dan sah sebagai bukti transaksi.</div>
          </div>

          <script>
            window.onload = function() { 
              window.print(); 
              window.onafterprint = function() { window.close(); } 
            }
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  };

  const filteredOrders = orders.filter(o => 
    o.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.profiles?.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-2xl font-bold text-dark">Manajemen Pesanan</h2>
        <button
          onClick={() => fetchAllOrders()}
          className="w-full sm:w-auto bg-gray-1 text-dark border border-gray-3 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-3 transition-all shadow-sm"
        >
          Refresh Manual
        </button>
      </div>

      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-dark-4 opacity-50">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
        <input
          type="text"
          placeholder="Cari pesanan (nama pelanggan, ID pesanan...)"
          className="w-full bg-white border border-gray-3 rounded-xl py-3.5 pl-11 pr-4 text-sm font-medium text-dark focus:border-blue focus:ring-4 focus:ring-blue/5 outline-none transition-all shadow-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-dark-4 hover:text-dark transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((o) => {
            const totalPcs = o.items?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;
            const isWholesale = totalPcs >= 20;
            return (
              <div key={o.id} className="bg-white border border-gray-3 rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5">
                <div className="flex justify-between items-center border-b border-gray-1 pb-2">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-dark-4 uppercase tracking-widest opacity-60">ID Pesanan</span>
                    <span className="font-bold text-blue text-sm">#{o.id.slice(-6).toUpperCase()}</span>
                  </div>
                  <span className={`py-1.5 px-4 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-sm text-center ${
                    o.status === 'delivered' ? 'bg-green' :
                    o.status === 'shipping' ? 'bg-blue' :
                    o.status === 'processing' ? 'bg-orange' :
                    o.status === 'pending' ? 'bg-red' :
                    o.status === 'canceled' ? 'bg-dark-5' :
                    'bg-gray-4'
                  }`}>
                    {o.status === 'delivered' ? 'Selesai' : 
                     o.status === 'shipping' ? 'Dikirim' :
                     o.status === 'processing' ? 'Diproses' : 
                     o.status === 'pending' ? 'Menunggu' : 
                     o.status === 'canceled' ? 'Batal' : o.status}
                  </span>
                </div>
                {o.status === 'canceled' && o.cancellation_note && (
                  <p className="text-[12px] font-bold text-red mt-0.5 leading-tight uppercase tracking-widest">{o.cancellation_note}</p>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[11px] font-bold text-dark-4 uppercase">Pelanggan</span>
                    <div className="text-right">
                      <div className="text-sm font-bold text-dark">{o.profiles?.full_name || "Unknown"}</div>
                      <div className="text-[10px] text-dark-4">{o.profiles?.company_name || "Personal"}</div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[11px] font-bold text-dark-4 uppercase">Tipe & Unit</span>
                    <div className="flex flex-col items-end">
                      <div className="flex flex-wrap gap-1 mb-1 justify-end">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase ${isWholesale ? 'bg-blue/10 text-blue' : 'bg-orange/10 text-orange'}`}>
                          {isWholesale ? 'Grosir' : 'Reguler'}
                        </span>
                        {o.shipping_method === 'free' && (
                          <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-black uppercase bg-green/10 text-green">
                            Ambil di Toko
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-dark">
                        {totalPcs.toLocaleString("id-ID")} Unit {isWholesale && `(${(totalPcs/20).toLocaleString("id-ID")} Kodi)`}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-gray-2 border-dashed">
                    <span className="text-[11px] font-bold text-dark-4 uppercase">Total Bayar</span>
                    <div className="flex flex-col items-end">
                      <div className="font-black text-dark text-xl">Rp{o.total_amount.toLocaleString()}</div>
                      <div className="mt-1">
                        {o.payment_method === 'invoice' ? (
                          <span className="bg-blue text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider">B2B INVOICE</span>
                        ) : o.payment_method === 'cash' ? (
                          <span className="bg-blue text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider">BAYAR COD</span>
                        ) : (
                          <span className="bg-green text-white px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider">TRANSFER BANK</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                    <button 
                      onClick={() => handlePrintInvoice(o)}
                      className="flex-[2] flex items-center justify-center gap-1.5 py-1.5 bg-blue text-white rounded-lg font-black text-[9px] uppercase shadow-sm active:scale-95 transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                      Cetak Invoice
                    </button>
                  
                  <button 
                    onClick={() => {
                      if (o.status === 'pending' || o.status === 'processing') {
                        const newStatus = o.status === 'pending' ? 'processing' : 'shipping';
                        updateStatus(o.id, newStatus);
                      }
                    }}
                    disabled={o.status === 'shipping' || o.status === 'delivered' || o.status === 'canceled'}
                    className={`flex-1 py-1.5 rounded-lg transition-all font-black text-[9px] uppercase shadow-sm active:scale-95 border ${
                      o.status === 'pending' ? 'bg-white text-orange border-orange hover:bg-orange hover:text-white' :
                      o.status === 'processing' ? 'bg-white text-blue border-blue hover:bg-blue hover:text-white' :
                      o.status === 'shipping' ? 'bg-green/10 text-green border-green/20 opacity-80 cursor-default' :
                      o.status === 'canceled' ? 'bg-red/10 text-red border-red/20' :
                      'bg-gray-1 text-dark-4 border-gray-2 opacity-60'
                    }`}
                  >
                    {o.status === 'pending' ? 'Proses' : o.status === 'processing' ? 'Kirim' : o.status === 'shipping' ? 'Dikirim' : o.status === 'canceled' ? 'Batal' : 'Selesai'}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-20 text-center bg-white rounded-xl border border-gray-3 shadow-sm">
            <div className="w-16 h-16 bg-gray-1 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#AAB4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
              </svg>
            </div>
            <p className="text-dark-4 font-bold">Tidak ada data pesanan.</p>
            <p className="text-xs text-dark-5 mt-1">Coba refresh halaman atau periksa login Anda.</p>
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto bg-white rounded-xl border border-gray-3">
        <table className="w-full text-left border-separate border-spacing-0">
          <thead>
            <tr className="bg-gray-1">
              <th className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 w-[120px]">Pesanan</th>
              <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 hidden md:table-cell">Pelanggan</th>
              <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 hidden md:table-cell w-[140px]">Tipe & Unit</th>
              <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 min-w-[180px]">Total & Bayar</th>
              <th className="py-5 px-4 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 w-[120px]">Status</th>
              <th className="py-5 px-6 font-black text-[10px] uppercase tracking-widest text-dark-4 border-b border-gray-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length > 0 ? (
              filteredOrders.map((o) => {
              const totalPcs = o.items?.reduce((acc, curr) => acc + (curr.quantity || 0), 0) || 0;
              const isWholesale = totalPcs >= 20;
              return (
                <tr key={o.id} className="border-b border-gray-2 hover:bg-gray-1/30 transition-all group">
                  <td className="py-6 px-6 align-top">
                    <div className="flex flex-col">
                      <span className="font-bold text-blue text-xs mb-0.5">#{o.id.slice(-6).toUpperCase()}</span>
                      <span className="text-[12px] font-bold" style={{color: '#212121'}}>
                        {new Date(o.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </td>
                  <td className="py-6 px-4 align-top hidden md:table-cell">
                    <div className="flex flex-col">
                      <span className="font-bold text-[12px]" style={{color: '#212121'}}>{o.profiles?.full_name || "Unknown"}</span>
                      <span className="text-[12px] font-black uppercase tracking-wider" style={{color: '#212121', opacity: 0.6}}>{o.profiles?.company_name || "Personal"}</span>
                      {o.profiles?.whatsapp && (
                        <a href={`https://wa.me/${o.profiles.whatsapp.replace(/\D/g, '')}`} target="_blank" className="text-[12px] font-bold text-blue hover:underline mt-0.5">
                          WA: {o.profiles.whatsapp}
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-4 align-top hidden md:table-cell">
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap gap-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase ${isWholesale ? 'bg-blue/10 text-blue border border-blue/20' : 'bg-orange/10 text-orange border border-orange/20'}`}>
                          {isWholesale ? 'Grosir' : 'Reguler'}
                        </span>
                        {o.shipping_method === 'free' ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase bg-green/5 text-green-600 border border-green-500/20">
                            Ambil di Toko
                          </span>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase border ${
                            o.shipping_method?.toLowerCase().includes('jne') ? 'bg-blue/5 text-[#00529C] border-[#00529C]/30' :
                            o.shipping_method?.toLowerCase().includes('jnt') || o.shipping_method?.toLowerCase().includes('j&t') ? 'bg-red/5 text-[#ED1C24] border-[#ED1C24]/30' :
                            o.shipping_method?.toLowerCase().includes('sicepat') ? 'bg-orange/5 text-[#F15A24] border-[#F15A24]/30' :
                            o.shipping_method?.toLowerCase().includes('anteraja') ? 'bg-pink/5 text-[#E91E63] border-[#E91E63]/30' :
                            'bg-blue/5 text-blue-600 border-blue-500/20'
                          }`}>
                            {o.shipping_method?.toUpperCase() || 'KIRIM'}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold text-dark">
                        {totalPcs.toLocaleString("id-ID")} Unit
                      </span>
                    </div>
                   </td>
                  <td className="py-6 px-4 align-top">
                    <div className="flex flex-col">
                      <span className="text-dark font-black text-sm">Rp{o.total_amount.toLocaleString()}</span>
                      {o.is_booking && o.dp_amount && (
                        <div className="mt-1 bg-blue/5 border border-blue/20 rounded p-1.5">
                          <p className="text-[9px] font-black text-blue uppercase tracking-wider">Pre-Order DP</p>
                          <p className="text-[11px] font-bold text-blue">DP: Rp{o.dp_amount.toLocaleString()}</p>
                          {o.dp_option !== 'lunas' && (
                            <p className="text-[10px] text-dark-4 font-medium">Sisa: Rp{(o.total_amount - o.dp_amount).toLocaleString()}</p>
                          )}
                        </div>
                      )}
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1.5">
                          {o.payment_method === 'invoice' ? (
                            <span className="bg-blue text-white px-2 py-0.5 rounded text-[8px] font-black uppercase">B2B INVOICE</span>
                          ) : o.payment_method === 'cash' ? (
                            <span className="bg-blue text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">BAYAR COD</span>
                          ) : (
                            <span className="bg-green text-white px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter">TRANSFER BANK</span>
                          )}
                        </div>
                        {!o.payment_proof && (o.payment_method === 'bank' || o.payment_method === 'invoice') && (
                          <span className="text-[12px] font-black text-red uppercase leading-tight">
                            ⚠️ {o.payment_method === 'invoice' ? 'MOU' : 'BUKTI'} BELUM DIUNGGAH
                          </span>
                        )}
                        {o.payment_proof && (
                          <a href={o.payment_proof} target="_blank" className="text-[12px] font-black text-green underline uppercase">
                            {o.payment_method === 'invoice' ? 'Lihat MOU' : 'Lihat Bukti'}
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4 align-top">
                    <div className="flex flex-col gap-1">
                      <span className={`inline-block py-1.5 px-3 rounded-full text-[9px] font-black uppercase tracking-widest text-white shadow-sm text-center ${
                        o.status === 'delivered' ? 'bg-green' :
                        o.status === 'shipping' ? 'bg-blue' :
                        o.status === 'processing' ? 'bg-orange' :
                        o.status === 'pending' ? 'bg-red' :
                        o.status === 'canceled' ? 'bg-dark-5' :
                        'bg-gray-4'
                      }`}>
                        {o.status === 'delivered' ? 'Selesai' : 
                         o.status === 'shipping' ? 'Dikirim' :
                         o.status === 'processing' ? 'Diproses' : 
                         o.status === 'pending' ? 'Menunggu' : 
                         o.status === 'canceled' ? 'Batal' : o.status}
                      </span>
                      {o.status === 'canceled' && o.cancellation_note && (
                        <p className="text-[12px] font-bold text-red mt-0.5 leading-tight uppercase tracking-widest">{o.cancellation_note}</p>
                      )}
                    </div>
                  </td>
                  <td className="py-6 px-6 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handlePrintInvoice(o)}
                          className="p-2 bg-blue/5 text-blue rounded-lg hover:bg-blue hover:text-white transition-all border border-blue/10"
                          title="Cetak Invoice"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                        </button>
                      
                      <select
                        className="text-[9px] font-black uppercase border border-gray-3 p-1.5 rounded-lg outline-none bg-white focus:border-blue transition-colors cursor-pointer w-[100px]"
                        value={o.status}
                        onChange={(e) => {
                          const newStatus = e.target.value;
                          if (newStatus === 'canceled') {
                            setCancelingOrderId(o.id);
                            setIsCancelModalOpen(true);
                          } else {
                            updateStatus(o.id, newStatus);
                          }
                        }}
                      >
                        <option value="pending">Menunggu</option>
                        <option value="processing">Diproses</option>
                        <option value="shipping">Dikirim</option>
                        <option value="canceled">Batal</option>
                      </select>
                      
                      <button 
                        onClick={async () => {
                          if (confirm('Hapus pesanan ini permanen?')) {
                            try {
                              await fetch(`/api/admin/orders?id=${o.id}`, { method: 'DELETE' });
                              // fetchAllOrders is handled by realtime
                            } catch (e) {}
                          }
                        }}
                        className="p-2 bg-red/5 text-red rounded-lg hover:bg-red hover:text-white transition-all border border-red/10"
                        title="Hapus"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={6} className="py-20 text-center">
                <div className="w-16 h-16 bg-gray-1 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#AAB4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                </div>
                <p className="text-dark-4 font-bold text-base">Tidak ada data pesanan ditemukan.</p>
                <p className="text-sm text-dark-5 mt-1">Coba refresh halaman atau periksa status login Anda.</p>
              </td>
            </tr>
          )}
          </tbody>
        </table>
      </div>

      {/* Custom Cancellation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-dark mb-2">Alasan Pembatalan</h3>
              <p className="text-sm text-dark-4 mb-6">Mohon berikan alasan mengapa pesanan ini dibatalkan agar pelanggan dapat memahaminya.</p>
              
              <textarea
                className="w-full bg-gray-1 border border-gray-3 rounded-xl p-4 text-sm font-medium text-dark focus:border-red focus:ring-4 focus:ring-red/5 outline-none transition-all resize-none h-32"
                placeholder="Contoh: Stok barang habis atau lokasi pengiriman tidak terjangkau..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                autoFocus
              ></textarea>
            </div>
            
            <div className="flex border-t border-gray-2 bg-gray-1/50 p-4 gap-3">
              <button
                onClick={() => {
                  setIsCancelModalOpen(false);
                  setCancelingOrderId(null);
                  setCancelReason("");
                }}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-sm text-dark-4 hover:bg-white transition-all border border-transparent hover:border-gray-3"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  if (cancelingOrderId && cancelReason.trim()) {
                    updateStatus(cancelingOrderId, 'canceled', cancelReason);
                    setIsCancelModalOpen(false);
                    setCancelingOrderId(null);
                    setCancelReason("");
                  } else {
                    toast.error("Mohon isi alasan pembatalan");
                  }
                }}
                className="flex-1 py-3 px-6 rounded-xl font-bold text-sm text-white bg-red hover:bg-red-dark transition-all shadow-lg shadow-red/20 active:scale-95"
              >
                Konfirmasi Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
