"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";

interface NotificationItem {
  id: string;
  type: "order" | "promo";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  status?: string;
  link: string;
  created_at: string;
}

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"order" | "promo">("order");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [shouldWiggle, setShouldWiggle] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio on mount
  useEffect(() => {
    audioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3");
    audioRef.current.volume = 0.5;
  }, []);

  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.warn("Audio play failed:", err));
    }
  };

  const triggerWiggle = () => {
    setShouldWiggle(true);
    setTimeout(() => setShouldWiggle(false), 1000);
  };

  const fetchNotifications = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setNotifications(data.map(n => {
        const title = n.title?.toLowerCase() || "";
        const message = n.message?.toLowerCase() || "";
        const isOrder = n.type === 'order' || 
                        title.includes('pesanan') || title.includes('transaksi') || title.includes('bayar') ||
                        message.includes('pesanan') || message.includes('transaksi') || message.includes('bayar');
        
        const finalType = isOrder ? 'order' : 'promo';
        const orderId = n.order_id || n.metadata?.order_id;
        // Aggressively force /transactions for any order-related notification
        const targetLink = isOrder ? (orderId ? `/transactions?id=${orderId}` : '/transactions') : (n.link || '/shop');

        return {
          ...n,
          type: finalType,
          isRead: n.is_read,
          time: formatRelativeTime(n.created_at),
          link: targetLink
        };
      }));
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return "Baru saja";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`;
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
  };

  useEffect(() => {
    fetchNotifications();

    let notificationChannel: ReturnType<typeof supabase.channel> | null = null;
    let adminChannel: ReturnType<typeof supabase.channel> | null = null;
    let isMounted = true;

    // Setup Realtime Subscription
    const setupSubscriptions = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = localStorage.getItem("isAdminLoggedIn") === "true";

      if (isMounted) {
        // Clean up any existing channels
        const existingChannels = supabase.getChannels();
        existingChannels.forEach((ch) => {
          if (ch.topic.includes('user_notifications_') || 
              ch.topic === 'realtime:admin_orders_realtime' ||
              ch.topic === 'realtime:admin_messages_realtime' ||
              ch.topic === 'promotions_global') {
            supabase.removeChannel(ch);
          }
        });

        // 1. Subscribe to User's Notifications
        if (user) {
          notificationChannel = supabase
            .channel(`user_notifications_${user.id}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'notifications',
                filter: `user_id=eq.${user.id}`,
              },
              (payload) => {
                const newNotif = payload.new as any;
                const title = newNotif.title?.toLowerCase() || "";
                const message = newNotif.message?.toLowerCase() || "";
                const isOrder = newNotif.type === 'order' || 
                                title.includes('pesanan') || title.includes('transaksi') || title.includes('bayar') ||
                                message.includes('pesanan') || message.includes('transaksi') || message.includes('bayar');
                const orderId = newNotif.order_id || newNotif.metadata?.order_id;
                const targetLink = isOrder ? (orderId ? `/transactions?id=${orderId}` : '/transactions') : (newNotif.link || '/shop');

                if (isMounted) {
                  setNotifications(prev => {
                    if (prev.some(n => n.id === newNotif.id)) return prev;
                    return [{
                      ...newNotif,
                      type: isOrder ? 'order' : 'promo',
                      isRead: newNotif.is_read,
                      time: "Baru saja",
                      link: targetLink
                    }, ...prev];
                  });
                  triggerWiggle();
                  playNotificationSound();
                  showNotificationToast(newNotif.title, newNotif.message, 'blue', targetLink);
                }
              }
            )
            .subscribe();
        }

        // 2. Global Promotions Broadcast (Instant for everyone)
        const promoChannel = supabase.channel('promotions_global')
          .on('broadcast', { event: 'new_promo' }, (payload) => {
            if (isMounted) {
              const { title, message } = payload.payload;
              triggerWiggle();
              playNotificationSound();
              showNotificationToast(title, message, 'orange');
              
              // Also add to local state if applicable
              setNotifications(prev => [{
                id: Date.now().toString(),
                type: 'promo',
                title,
                message,
                time: "Baru saja",
                isRead: false,
                link: "/shop",
                created_at: new Date().toISOString()
              }, ...prev]);
            }
          })
          .subscribe();

        // 3. Admin Realtime (Orders & Messages)
        if (isAdmin) {
          adminChannel = supabase.channel('admin_orders_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, (payload) => {
              const newOrder = payload.new as any;
              triggerWiggle();
              playNotificationSound();
              showNotificationToast("Transaksi Baru!", `Pesanan baru senilai Rp${newOrder.total_amount.toLocaleString('id-ID')}`, 'green', '/seragamsekolah-admin');
            })
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, (payload) => {
              const newOrder = payload.new as any;
              const oldOrder = payload.old as any;
              
              // Detect if payment_proof was just added
              if (isMounted && newOrder.payment_proof && (!oldOrder.payment_proof || oldOrder.payment_proof === null)) {
                triggerWiggle();
                playNotificationSound();
                showNotificationToast("Bukti Pembayaran!", `Pelanggan mengunggah bukti transfer untuk pesanan #${newOrder.id.toString().slice(-6).toUpperCase()}`, 'blue', '/seragamsekolah-admin');
              }
            })
            .subscribe();

          const messageChannel = supabase.channel('admin_messages_realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, (payload) => {
              const newMsg = payload.new as any;
              triggerWiggle();
              playNotificationSound();
              showNotificationToast("Pesan Baru!", `${newMsg.first_name}: ${newMsg.subject || "Pesan Masuk"}`, 'blue', '/seragamsekolah-admin');
            })
            .subscribe();
        }
      }
    };

    const showNotificationToast = (title: string, message: string, color: string, link?: string) => {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto flex border border-gray-2 border-l-4 border-blue`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className={`h-10 w-10 rounded-full bg-blue/10 flex items-center justify-center text-blue`}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-bold text-dark">{title}</p>
                <p className="mt-1 text-xs text-dark-4">{message}</p>
              </div>
            </div>
          </div>
          <div className="flex">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                if (link) window.location.href = link;
              }}
              className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue hover:text-blue-dark focus:outline-none"
            >
              {link ? "Cek" : "Tutup"}
            </button>
          </div>
        </div>
      ), { id: "global-notification", duration: 6000 });
    };

    setupSubscriptions();

    const pollInterval = setInterval(() => {
      if (isMounted) fetchNotifications();
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(pollInterval);
      if (notificationChannel) supabase.removeChannel(notificationChannel);
      if (adminChannel) supabase.removeChannel(adminChannel);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Optimistic update dulu agar UI langsung berubah
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    if (error) {
      // Jika gagal, rollback dan fetch ulang dari DB
      fetchNotifications();
    } else {
      // Sukses: fetch ulang dari DB untuk konfirmasi
      await fetchNotifications();
      toast.success("Semua notifikasi ditandai dibaca", { id: 'mark-all-read' });
    }
  };

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    if (!error) {
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const deleteNotification = async (id: string) => {
    // Optimistic update: langsung hapus dari UI
    setNotifications(prev => prev.filter(n => n.id !== id));

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id);

    if (error) {
      // Rollback jika gagal
      fetchNotifications();
      toast.error('Gagal menghapus notifikasi');
    }
  };

  const filteredNotifications = notifications.filter(n => n.type === activeTab);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
        className="relative flex items-center justify-center w-12 h-12 lg:w-10 lg:h-10 rounded-full bg-gray-2 transition-all hover:bg-blue/10 group"
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`transition-colors duration-200 w-[26px] h-[26px] lg:w-[22px] lg:h-[22px] ${isOpen ? "text-blue" : "text-dark-4 group-hover:text-blue"} ${unreadCount > 0 || shouldWiggle ? "animate-wiggle" : ""}`}
        >
          <path
            d="M12.0205 2.91016C8.71047 2.91016 6.02047 5.60016 6.02047 8.91016V11.8C6.02047 12.41 5.76047 13.56 5.44047 14.15L4.28047 16.09C3.57047 17.28 4.06047 18.61 5.37047 19.07C9.69047 20.58 14.3305 20.58 18.6505 19.07C19.8705 18.65 20.4005 17.21 19.7405 16.09L18.5805 14.15C18.2705 13.56 18.0105 12.41 18.0105 11.8V8.91016C18.0105 5.61016 15.3205 2.91016 12.0205 2.91016Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
          />
          <path
            d="M13.87 3.2002C13.56 3.1102 13.24 3.0402 12.91 3.0002C11.95 2.8802 11.03 2.9502 10.17 3.2002C10.46 2.4602 11.18 1.9402 12.02 1.9402C12.86 1.9402 13.58 2.4602 13.87 3.2002Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M15.0205 19.0605C15.0205 20.7105 13.6705 22.0605 12.0205 22.0605C11.2005 22.0605 10.4505 21.7305 9.90047 21.2005C9.35047 20.6705 9.02047 19.9205 9.02047 19.1005"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeMiterlimit="10"
          />
        </svg>
        <span className="absolute -right-1.5 -top-1.5 flex h-5.5 w-5.5">
          {unreadCount > 0 && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue opacity-75"></span>}
          <span className="relative flex items-center justify-center font-bold text-xs bg-blue w-5.5 h-5.5 rounded-full text-white ring-2 ring-white shadow-sm">
            {unreadCount}
          </span>
        </span>
      </button>

      {isOpen && (
        <>
          {/* Mobile Overlay & Full Page Menu */}
          <div className="fixed inset-0 z-[9999] lg:absolute lg:inset-auto lg:right-0 lg:mt-3 lg:w-[360px] lg:max-w-[calc(100vw-32px)]">
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 bg-dark/60 lg:hidden"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Notification Panel */}
            <div className="relative h-full w-full bg-white flex flex-col lg:h-auto lg:rounded-2xl lg:shadow-2xl lg:border lg:border-gray-2 animate-in slide-in-from-right-10 lg:animate-in lg:fade-in lg:zoom-in duration-300">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-2 px-5 py-4 shrink-0">
                <div className="flex items-center gap-3">
                  {/* Close button for mobile */}
                  <button 
                    onClick={() => setIsOpen(false)}
                    aria-label="Close notifications"
                    className="lg:hidden p-1 -ml-1 text-dark-4 hover:text-dark"
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                  </button>
                  <h3 className="text-lg font-bold text-dark">Notifikasi</h3>
                </div>
                <button 
                  onClick={markAllAsRead}
                  className="text-base lg:text-xs font-semibold text-blue hover:underline"
                >
                  Tandai semua dibaca
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-2 bg-gray-1/50 p-1 mx-4 my-3 rounded-xl shrink-0">
                <button
                  onClick={() => setActiveTab("order")}
                  className={`flex-1 rounded-lg py-2 text-base lg:text-sm font-medium transition-all ${
                    activeTab === "order" 
                      ? "bg-white text-blue shadow-sm" 
                      : "text-dark-4 hover:text-dark"
                  }`}
                >
                  Pesanan
                </button>
                <button
                  onClick={() => setActiveTab("promo")}
                  className={`flex-1 rounded-lg py-2 text-base lg:text-sm font-medium transition-all ${
                    activeTab === "promo" 
                      ? "bg-white text-blue shadow-sm" 
                      : "text-dark-4 hover:text-dark"
                  }`}
                >
                  Promosi
                </button>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto no-scrollbar pb-10 lg:max-h-[400px] lg:pb-3">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((item) => (
                    <div
                      key={item.id}
                      className={`group relative flex items-stretch border-b border-gray-2/50 transition-colors hover:bg-gray-1/50 ${
                        !item.isRead ? "bg-blue/[0.08]" : ""
                      }`}
                    >
                      {/* Clickable notification area */}
                      <Link
                        href={item.link || "#"}
                        className="flex flex-1 gap-4 px-5 py-4"
                        onClick={() => {
                          markAsRead(item.id);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex-shrink-0">
                          <div className={`flex h-10 w-10 items-center justify-center rounded-full bg-blue/10 text-blue`}>
                            {item.type === "order" ? (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                              </svg>
                            ) : (
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 pr-1">
                            <p className={`text-base lg:text-sm font-bold truncate flex-1 ${!item.isRead ? "text-dark" : "text-dark-4"}`}>
                              {item.title}
                            </p>
                            {!item.isRead && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-blue"></span>}
                          </div>
                          <p className="mt-0.5 text-sm lg:text-xs leading-relaxed text-dark-4 line-clamp-2">
                            {item.message.includes("Gunakan kode kupon:") ? (
                              <>
                                {item.message.split("Gunakan kode kupon:")[0]}
                                Gunakan kode kupon:{" "}
                                <span 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    const code = item.message.split("Gunakan kode kupon:")[1].split(".")[0].trim();
                                    navigator.clipboard.writeText(code);
                                    toast.success(`Kode ${code} disalin!`, { id: 'copy-notif' });
                                  }}
                                  className="text-blue font-bold cursor-pointer hover:underline"
                                >
                                  {item.message.split("Gunakan kode kupon:")[1].split(".")[0]}
                                </span>
                                {item.message.split("Gunakan kode kupon:")[1].split(".").slice(1).join(".")}
                              </>
                            ) : (
                              item.message
                            )}
                          </p>
                          <div className="mt-2 flex items-center">
                            <span className="text-xs lg:text-[10px] font-medium text-dark-5">
                              {item.time}
                            </span>
                          </div>
                        </div>
                      </Link>

                      {/* Kolom kanan: icon hapus (atas) + badge status (bawah) */}
                      <div className="flex flex-col items-center justify-between py-4 pr-3 pl-1 flex-shrink-0 gap-2">
                        {/* Tombol Hapus - selalu terlihat, posisi atas */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(item.id);
                          }}
                          title="Hapus notifikasi"
                          className="flex items-center justify-center w-7 h-7 rounded-full text-dark-5 hover:text-red hover:bg-red/10 transition-all duration-200"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18"/>
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                            <line x1="10" y1="11" x2="10" y2="17"/>
                            <line x1="14" y1="11" x2="14" y2="17"/>
                          </svg>
                        </button>
                        {/* Badge status - posisi bawah */}
                        {item.status ? (
                          <span className="rounded-full bg-blue/10 px-2 py-0.5 text-[10px] font-bold text-blue whitespace-nowrap">
                            {item.status}
                          </span>
                        ) : (
                          <span className="w-7 h-5" /> 
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-2 text-gray-4">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-dark-4">Belum ada notifikasi {activeTab === "order" ? "pesanan" : "promosi"}.</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-2 bg-gray-1/30 px-5 py-4 lg:py-3 shrink-0">
                <Link 
                  href="/transactions" 
                  className="block text-center text-sm lg:text-xs font-bold text-dark-4 hover:text-blue transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Lihat Semua Pesanan
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationDropdown;
