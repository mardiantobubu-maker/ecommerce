import React, { useEffect, useState } from "react";
import SingleOrder from "./SingleOrder";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PreLoader from "../Common/PreLoader";
import Skeleton from "../Common/Skeleton";
const StatusDropdown = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const options = [
    { label: "Semua Status", value: "all" },
    { label: "Menunggu", value: "pending" },
    { label: "Diproses", value: "processing" },
    { label: "Dikirim", value: "shipped" },
    { label: "Selesai", value: "delivered" },
  ];

  const currentLabel = options.find(opt => opt.value === value)?.label || "Semua Status";

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-3 rounded-lg px-4 py-3 text-sm font-medium flex items-center justify-between focus:border-blue outline-none transition-all shadow-sm active:scale-[0.99]"
      >
        <span className={value === "all" ? "text-dark" : "text-blue"}>{currentLabel}</span>
        <svg 
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6"/>
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-1.5 w-full bg-white border border-gray-3 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 origin-top">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-2 ${
                value === opt.value ? "bg-blue/5 text-blue font-bold" : "text-dark-4"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Orders = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchOrders = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setUser(null);
      setLoading(false);
      return;
    }
    setUser(user);

    let query = supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', user.id);

    if (statusFilter !== "all") {
      query = query.eq('status', statusFilter);
    }


    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      // Fallback
      let fallbackQuery = supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', user.id);

      if (statusFilter !== "all") {
        fallbackQuery = fallbackQuery.eq('status', statusFilter);
      }
      
      const { data: fallbackData } = await fallbackQuery.order('created_at', { ascending: false });
      if (fallbackData) {
        setOrders(fallbackData);
        checkAndAutoPop(fallbackData);
      }
    } else if (data) {
      setOrders(data);
      checkAndAutoPop(data);
    }
    setLoading(false);
  };

  const checkAndAutoPop = (ordersList: any[]) => {
    // If no specific ID is already in URL
    const searchParams = new URLSearchParams(window.location.search);
    if (!searchParams.get('id')) {
      // Find the most recent unpaid bank transfer order
      const unpaidOrder = ordersList.find(o => 
        o.status === 'pending' && 
        o.payment_method === 'bank' && 
        !o.payment_proof
      );

      if (unpaidOrder) {
        // Update URL to trigger SingleOrder's useEffect via router
        router.replace(`${window.location.pathname}?id=${unpaidOrder.id}`, { scroll: false });
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    const fetchOrdersOnMount = async () => {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (!isMounted) return;
      
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      setUser(currentUser);

      let query = supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('user_id', currentUser.id);

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (isMounted) {
        if (data && !error) {
          setOrders(data);
          checkAndAutoPop(data);
        }
        setLoading(false);
      }
    };

    fetchOrdersOnMount();

    // Setup Realtime Subscription for Orders
    let channel: any = null;

    const setupOrdersSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !isMounted) return;

      channel = supabase
        .channel(`user_orders_realtime_${user.id}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen for any event (UPDATE, INSERT, DELETE)
            schema: 'public',
            table: 'orders',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            if (!isMounted) return;
            console.log('Realtime order change detected:', payload);
            if (payload.eventType === 'UPDATE') {
              setOrders(prev => prev.map(o => o.id === payload.new.id ? { ...o, ...payload.new } : o));
            } else if (payload.eventType === 'INSERT') {
              setOrders(prev => {
                const exists = prev.some(o => o.id === payload.new.id);
                if (exists) return prev;
                return [payload.new, ...prev];
              });
            } else if (payload.eventType === 'DELETE') {
              setOrders(prev => prev.filter(o => o.id !== payload.old.id));
            }
          }
        )
        .subscribe();
    };

    setupOrdersSubscription();

    return () => {
      isMounted = false;
      if (channel) supabase.removeChannel(channel);
    };
  }, [statusFilter]);

  return (
    <>
      {/* Filter UI - Only show if there are orders or active filters */}
      {user && (orders.length > 0 || statusFilter !== "all") && (
        <div className="p-0 mb-6 px-1">
          <div className="w-full">
            <label className="block text-[14px] font-bold mb-1.5 ml-1" style={{color: '#212121'}}>Status Transaksi</label>
            <StatusDropdown value={statusFilter} onChange={setStatusFilter} />
          </div>
        </div>
      )}

      {loading ? (
        <div className="w-full flex flex-col gap-4 mt-6">
          <Skeleton className="w-full h-16 rounded-lg" />
          <Skeleton className="w-full h-16 rounded-lg" />
          <Skeleton className="w-full h-16 rounded-lg" />
        </div>
      ) : !user ? (
        /* === Tampilan untuk pengguna yang belum login === */
        <div className="flex flex-col items-center justify-center bg-white rounded-[10px] py-16 px-4">
          <div className="w-20 h-20 mb-6 text-blue/20">
            <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
          </div>
          <h3 className="text-xl font-bold text-dark mb-2 text-center">Belum ada transaksi</h3>
          <p className="text-dark-4 mb-8 text-center max-w-[400px]">
            Anda belum melakukan pembelian apapun. Mulai belanja sekarang untuk melihat riwayat pesanan Anda di sini.
          </p>
          <Link
            href="/shop-with-sidebar"
            className="inline-flex justify-center items-center py-3 px-10 text-white bg-blue font-bold rounded-full ease-out duration-200 hover:bg-blue-dark shadow-lg transform active:scale-95"
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="w-full">
          {orders.length > 0 ? (
            <div className="md:min-w-[770px]">
              {/* <!-- order header - only desktop --> */}
              <div className="items-center justify-between py-4.5 px-7.5 hidden md:flex ">
                <div className="min-w-[120px]">
                  <p className="text-custom-sm font-bold text-dark-4 uppercase">ID Pesanan</p>
                </div>
                <div className="min-w-[150px]">
                  <p className="text-custom-sm font-bold text-dark-4 uppercase">Tanggal</p>
                </div>

                <div className="min-w-[120px]">
                  <p className="text-custom-sm font-bold text-dark-4 uppercase">Status</p>
                </div>

                <div className="min-w-[200px]">
                  <p className="text-custom-sm font-bold text-dark-4 uppercase">Produk</p>
                </div>

                <div className="min-w-[120px]">
                  <p className="text-custom-sm font-bold text-dark-4 uppercase">Total</p>
                </div>

                <div className="min-w-[100px] text-right">
                  <p className="text-custom-sm font-bold text-dark-4 uppercase pr-5">Aksi</p>
                </div>
              </div>

              {orders.map((orderItem, key) => (
                <SingleOrder key={key} orderItem={orderItem} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white rounded-[10px] py-16 px-4">
              <div className="w-20 h-20 mb-6 text-blue/20">
                <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark mb-2 text-center">Belum ada transaksi</h3>
              <p className="text-dark-4 mb-8 text-center max-w-[400px]">
                Anda belum melakukan pembelian apapun. Mulai belanja sekarang untuk melihat riwayat pesanan Anda di sini.
              </p>
              <Link
                href="/shop-with-sidebar"
                className="inline-flex justify-center items-center py-3 px-10 text-white bg-blue font-bold rounded-full ease-out duration-200 hover:bg-blue-dark shadow-lg transform active:scale-95"
              >
                Mulai Belanja
              </Link>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default Orders;
