import React, { useState, useEffect } from "react";
import OrderActions from "./OrderActions";
import OrderModal from "./OrderModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch } from "@/redux/store";
import { addItemToCart } from "@/redux/features/cart-slice";

const SingleOrder = ({ orderItem }: any) => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const orderIdFromUrl = searchParams.get("id");

  const [showDetails, setShowDetails] = useState(orderIdFromUrl === orderItem.id);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (orderIdFromUrl === orderItem.id) {
      setShowDetails(true);
    }
  }, [orderIdFromUrl, orderItem.id]);

  const toggleDetails = () => {
    setShowDetails(!showDetails);
  };

  const toggleEdit = () => {
    setShowEdit(!showEdit);
  };

  const toggleModal = (status: boolean) => {
    setShowDetails(status);
    setShowEdit(status);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderItem.id);

    setIsDeleting(false);
    setShowDeleteConfirm(false);

    if (error) {
      toast.error("Gagal menghapus pesanan: " + translateError(error.message));
    } else {
      toast.success("Pesanan berhasil dihapus");
      window.location.reload();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleReorder = async () => {
    // Fetch langsung dari Supabase untuk data terkini
    const { data: orderData } = await supabase
      .from('orders')
      .select('items')
      .eq('id', orderId)
      .single();

    const items = orderData?.items || [];

    if (items.length === 0) {
      toast.error("Tidak ada produk untuk dibeli ulang");
      return;
    }

    items.forEach((item: any) => {
      dispatch(addItemToCart({
        id: item.id || item.product_id,
        title: item.title || item.product_name || item.name || "Produk",
        price: item.price || item.discountedPrice || 0,
        discountedPrice: item.discountedPrice || item.price || 0,
        quantity: item.quantity || 1,
        color: item.color,
        sleeve: item.sleeve,
        fit: item.fit,
        variantBreakdown: item.variantBreakdown || item.variant_details,
        imgs: item.imgs || (item.image_url ? { thumbnails: [item.image_url], previews: [item.image_url] } : undefined)
      }));
    });

    router.push("/cart");
  };

  // Handle data from Supabase (snake_case) or Mock (camelCase)
  const orderId = orderItem.id || orderItem.orderId || "";
  const createdAt = orderItem.created_at || orderItem.createdAt || "";
  const status = orderItem.status?.toLowerCase() || "pending";
  const total = orderItem.total_amount || orderItem.total || "0";

  // Get product titles and counts
  // Data produk disimpan di kolom 'items' (JSONB) di tabel orders
  const items = orderItem.items || orderItem.order_items || [];
  const firstItemName = items[0]?.title || items[0]?.product_name || items[0]?.name || orderItem.title || "Pesanan Produk";
  const otherItemsCount = items.length > 1 ? items.length - 1 : 0;
  const title = otherItemsCount > 0 ? `${firstItemName} (+${otherItemsCount} produk lainnya)` : firstItemName;

  const formattedDate = createdAt ? new Date(createdAt).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }) : "-";

  const formattedTotal = typeof total === 'string' && total.startsWith('Rp')
    ? total
    : new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(total));

  return (
    <>
      {/* Desktop View Row */}
      <div className="items-center justify-between border-t border-gray-3 py-5 px-7.5 hidden md:flex hover:bg-gray-2/30 transition-colors">
        <div className="min-w-[120px]">
          <p className="text-custom-sm font-semibold text-blue">
            #{orderId.slice(-8).toUpperCase()}
          </p>
        </div>
        <div className="min-w-[150px]">
          <p className="text-custom-sm text-dark-3">{formattedDate}</p>
        </div>

        <div className="min-w-[150px]">
          <p
            className={`inline-flex items-center gap-1.5 text-[12px] font-bold py-1 px-3 rounded-full uppercase tracking-wider ${status === "delivered" || status === "completed"
                ? "text-green bg-green/10"
                : status === "on-hold" || status === "pending"
                  ? "text-red bg-red/10"
                  : status === "processing" || status === "shipped" || status === "shipping"
                    ? "text-yellow bg-yellow/10"
                    : "text-dark-4 bg-gray-2"
              }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${status === "delivered" || status === "completed" ? "bg-green" :
                  status === "on-hold" || status === "pending" ? "bg-red" :
                    status === "processing" || status === "shipped" || status === "shipping" ? "bg-yellow" : "bg-dark-4"
                }`}
              style={{ animation: 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
            ></span>
            {status === "delivered" || status === "completed" ? "Selesai" :
              status === "processing" ? "Diproses" :
                status === "pending" ? "Menunggu" :
                  status === "shipped" || status === "shipping" ? "Dikirim" :
                    status === "on-hold" ? "Ditahan" :
                      status === "canceled" ? "Batal" : status}
          </p>
          {orderItem.payment_method === 'bank' && !orderItem.payment_proof && (status === 'pending' || status === 'on-hold') && (
            <span className="block text-[11px] text-red font-black mt-1.5 tracking-tighter">BUKTI BELUM DIUNGGAH</span>
          )}
          {status === 'canceled' && orderItem.cancellation_note && (
            <div className="mt-2 p-2 bg-red/5 rounded border border-red/10 w-full max-w-[200px]">
              <p className="text-[10px] font-bold text-red uppercase tracking-tight leading-snug">Alasan: {orderItem.cancellation_note}</p>
            </div>
          )}
          {(status === 'shipped' || status === 'shipping') && (
            <Link
              href={`/tracking?id=${orderId}`}
              className="inline-flex items-center gap-1.5 mt-2 bg-green text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-dark transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
              </svg>
              Lacak
            </Link>
          )}
        </div>

        <div className="min-w-[200px]">
          <p className="text-custom-sm text-dark font-medium truncate max-w-[180px]" title={title}>{title}</p>
        </div>

        <div className="min-w-[120px]">
          <p className="text-custom-sm font-bold text-dark">{formattedTotal}</p>
        </div>

        <div className="min-w-[100px] flex justify-end items-center gap-2">
          <OrderActions
            toggleDetails={toggleDetails}
            handleDelete={handleDelete}
            handleReorder={handleReorder}
            orderId={orderId}
            status={status}
          />
        </div>
      </div>

      {/* Mobile View Card */}
      <div className="block md:hidden mx-1 my-2">
        <div className="bg-white rounded-2xl border border-gray-3 shadow-sm px-5 py-5 flex flex-col gap-4">
          {/* Row 1: ID & Date */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col gap-0.5">
              <p className="text-sm font-bold text-blue uppercase tracking-widest">
                #{orderId.slice(-8).toUpperCase()}
              </p>
              <p className="text-sm text-dark-4 font-medium">{formattedDate}</p>
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <span
                className={`inline-flex items-center gap-1.5 text-[12px] font-bold py-0.5 px-2.5 rounded-full uppercase tracking-wider ${status === "delivered" || status === "completed"
                    ? "text-green bg-green/10"
                    : status === "on-hold" || status === "pending"
                      ? "text-red bg-red/10"
                      : status === "processing" || status === "shipped" || status === "shipping"
                        ? "text-yellow bg-yellow/10"
                        : "text-dark-4 bg-gray-2"
                  }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${status === "delivered" || status === "completed" ? "bg-green" :
                      status === "on-hold" || status === "pending" ? "bg-red" :
                        status === "processing" || status === "shipped" || status === "shipping" ? "bg-yellow" : "bg-dark-4"
                    }`}
                  style={{ animation: 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                ></span>
                {status === "delivered" || status === "completed" ? "Selesai" :
                  status === "processing" ? "Diproses" :
                    status === "pending" ? "Menunggu" :
                      status === "shipped" || status === "shipping" ? "Dikirim" :
                        status === "on-hold" ? "Ditahan" :
                          status === "canceled" ? "Batal" : status}
              </span>
              {(status === 'shipped' || status === 'shipping') && (
                <Link
                  href={`/tracking?id=${orderId}`}
                  className="inline-flex items-center gap-1.5 mt-1 bg-green text-white text-[11px] font-bold px-3 py-1.5 rounded-lg hover:bg-green-dark transition-all"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
                  </svg>
                  Lacak
                </Link>
              )}
            </div>
          </div>

          {/* Row 2: Product Name & Items */}
          <div>
            <p className="text-[12px] font-black text-dark-4 uppercase tracking-widest mb-2">Pesanan Produk</p>
            {items.length > 0 ? (
              <div className="space-y-2">
                {items.map((item: any, idx: number) => {
                  const itemName = item.title || item.product_name || item.name || "Produk";
                  const itemImg = item.image_url || item.imgs?.thumbnails?.[0] || item.imgs?.previews?.[0];
                  const itemPrice = item.discountedPrice || item.price || 0;
                  const itemQty = item.quantity || 1;
                  return (
                    <div key={idx} className="flex items-center gap-3 p-2.5 bg-gray-1 rounded-xl">
                      {itemImg && (
                        <img src={itemImg} alt={itemName} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-dark truncate">{itemName}</p>
                        <p className="text-[12px] text-[#212121]">
                          {itemQty} pcs
                          {item.color && ` · ${item.color}`}
                          {item.size && ` · ${item.size}`}
                          {item.sleeve && ` · ${item.sleeve}`}
                        </p>
                      </div>
                      <p className="text-[14px] font-bold text-dark whitespace-nowrap">
                        Rp{(itemPrice * itemQty).toLocaleString("id-ID")}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-custom-sm text-dark font-bold leading-snug">{title}</p>
            )}
            {orderItem.payment_method === 'bank' && !orderItem.payment_proof && (status === 'pending' || status === 'on-hold') && (
              <span className="inline-block text-[11px] text-red font-black tracking-tighter mt-2 bg-red/5 px-2 py-0.5 rounded">
                ⚠️ BUKTI PEMBAYARAN BELUM DIUNGGAH
              </span>
            )}
            {status === 'canceled' && orderItem.cancellation_note && (
              <div className="mt-3 bg-red/5 p-3 rounded-xl border border-red/10 w-full">
                <p className="text-[11px] font-black text-red uppercase tracking-widest leading-normal">
                  Alasan Batal: {orderItem.cancellation_note}
                </p>
              </div>
            )}
          </div>

          {/* Row 3: Total & Actions */}
          <div className="flex flex-col gap-4 pt-3 border-t border-gray-2 mt-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-dark-4 font-bold uppercase tracking-wider mb-0.5">Total Pesanan</p>
                <p className="text-base font-black text-dark">
                  {formattedTotal}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={toggleDetails}
                className="w-full bg-blue/10 text-blue text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue hover:text-white transition-all text-center"
              >
                Lihat Detail
              </button>
              <button
                onClick={handleReorder}
                className="w-full bg-blue text-white text-sm font-bold px-4 py-2.5 rounded-lg hover:bg-blue-dark transition-all flex items-center justify-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" />
                </svg>
                Beli Lagi
              </button>
            </div>
          </div>
        </div>
      </div>

      <OrderModal
        showDetails={showDetails}
        showEdit={showEdit}
        toggleModal={toggleModal}
        order={{
          ...orderItem,
          orderId,
          createdAt: formattedDate,
          status,
          total: formattedTotal,
          title
        }}
      />

      <ConfirmDeleteModal
        isOpen={showDeleteConfirm}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isDeleting}
      />
    </>
  );
};

export default SingleOrder;
