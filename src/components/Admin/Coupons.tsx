"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const [formData, setFormData] = useState({
    code: "",
    discount_type: "percentage", // percentage or flat
    discount_value: "",
    min_purchase: "0",
    expiry_date: ""
  });

  const fetchCoupons = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    let isMounted = true;
    const fetchCouponsSafe = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
      if (isMounted) {
        if (data) setCoupons(data);
        setLoading(false);
      }
    };
    fetchCouponsSafe();
    return () => { isMounted = false; };
  }, []);

  const formatInput = (val: string) => {
    const numeric = val.replace(/\D/g, "");
    return numeric ? parseInt(numeric).toLocaleString("id-ID") : "";
  };

  const [broadcast, setBroadcast] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const submitData = {
      code: formData.code.trim().toUpperCase(),
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value.replace(/\./g, '')),
      min_purchase: parseFloat(formData.min_purchase.replace(/\./g, '')) || 0,
      expiry_date: formData.expiry_date || null
    };

    try {
      let error;
      if (editingItem) {
        const { error: err } = await supabase.from('coupons').update(submitData).eq('id', editingItem.id);
        error = err;
      } else {
        const { error: err } = await supabase.from('coupons').insert([submitData]);
        error = err;
      }

      if (error) throw error;

      // Broadcast logic
      if (broadcast) {
        const discText = submitData.discount_type === 'percentage' ? `${submitData.discount_value}%` : `Rp${submitData.discount_value.toLocaleString('id-ID')}`;
        const { error: broadcastErr } = await supabase.rpc('broadcast_promo_notification', {
          p_title: "Voucher Diskon Baru!",
          p_message: `Gunakan kode promo ${submitData.code} dan dapatkan diskon ${discText} untuk pesanan Anda!`,
          p_link: "/shop"
        });

        if (broadcastErr) {
          console.error("Broadcast failed:", broadcastErr);
        } else {
          // Realtime Broadcast for active users
          supabase.channel('promotions_global').send({
            type: 'broadcast',
            event: 'new_promo',
            payload: { title: "Voucher Diskon Baru!", message: `Gunakan kode promo ${submitData.code} dan dapatkan diskon ${discText}!` }
          });
        }
      }

      setShowForm(false);
      setEditingItem(null);
      setFormData({ code: "", discount_type: "percentage", discount_value: "", min_purchase: "0", expiry_date: "" });
      setBroadcast(false);
      fetchCoupons();
    } catch (err: any) {
      toast.error(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus kupon ini?")) return;
    
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      fetchCoupons();
    } catch (err: any) {
      toast.error(translateError(err.message));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-2xl font-bold text-dark">Manajemen Kupon</h2>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingItem(null);
            setFormData({ code: "", discount_type: "percentage", discount_value: "", min_purchase: "0", expiry_date: "" });
          }}
          className="w-full sm:w-auto bg-blue text-white py-3 px-8 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-dark transition-all shadow-md"
        >
          {showForm ? "Batal" : "+ Tambah Kupon"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-12 p-8 bg-gray-1 rounded-xl border border-gray-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Kode Kupon</label>
              <input
                required
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({...formData, code: e.target.value})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue uppercase"
                placeholder="mis: DISKON10"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tipe Diskon</label>
              <select
                value={formData.discount_type}
                onChange={(e) => setFormData({...formData, discount_type: e.target.value})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue bg-white"
              >
                <option value="percentage">Persentase (%)</option>
                <option value="flat">Potongan Harga (Rp)</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Nilai Diskon</label>
              <input
                required
                type="text"
                value={formData.discount_value}
                onChange={(e) => setFormData({...formData, discount_value: formatInput(e.target.value)})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
                placeholder={formData.discount_type === 'percentage' ? "mis: 10" : "mis: 5.000"}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Min. Pembelian (Rp)</label>
              <input
                type="text"
                value={formData.min_purchase}
                onChange={(e) => setFormData({...formData, min_purchase: formatInput(e.target.value)})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
                placeholder="mis: 100.000"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Tanggal Kedaluwarsa</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                className="p-3 border border-gray-3 rounded-md outline-none focus:border-blue"
              />
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 bg-blue/5 p-4 rounded-lg border border-blue/10">
            <input 
              type="checkbox" 
              id="broadcast"
              checked={broadcast}
              onChange={(e) => setBroadcast(e.target.checked)}
              className="w-5 h-5 cursor-pointer accent-blue"
            />
            <label htmlFor="broadcast" className="text-sm font-bold text-blue cursor-pointer">
              Kirim notifikasi promo ini ke seluruh pelanggan sekarang
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-8 bg-blue text-white py-3 px-10 rounded-md font-bold hover:bg-blue-dark transition-all"
          >
            {loading ? "Menyimpan..." : (editingItem ? "Perbarui Kupon" : "Simpan Kupon")}
          </button>
        </form>
      )}

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-4 md:hidden">
        {coupons.map((c) => (
          <div key={c.id} className="bg-white border border-gray-3 rounded-xl p-5 shadow-sm flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-gray-1 pb-3">
              <span className="font-black text-blue text-sm uppercase tracking-wider">{c.code}</span>
              <span className="text-[10px] font-bold text-dark-4 bg-gray-1 px-2 py-0.5 rounded border border-gray-2">
                {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('id-ID') : "Tanpa Batas"}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-dark-4 uppercase tracking-widest opacity-60">Diskon</span>
                <div className="font-black text-green text-sm">
                  {c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rp${c.discount_value?.toLocaleString('id-ID')}`}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] font-bold text-dark-4 uppercase tracking-widest opacity-60">Min. Beli</span>
                <div className="font-black text-dark text-sm">
                  Rp{c.min_purchase?.toLocaleString('id-ID')}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-gray-2 border-dashed">
              <button
                onClick={() => {
                  setEditingItem(c);
                  setFormData({
                    code: c.code,
                    discount_type: c.discount_type,
                    discount_value: formatInput(c.discount_value.toString()),
                    min_purchase: formatInput(c.min_purchase.toString()),
                    expiry_date: c.expiry_date ? c.expiry_date.split('T')[0] : ""
                  });
                  setShowForm(true);
                  setBroadcast(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex-1 py-2.5 rounded-lg bg-blue/5 text-blue font-bold text-xs hover:bg-blue hover:text-white transition-all border border-blue/10"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(c.id)}
                className="flex-1 py-2.5 rounded-lg bg-red/5 text-red font-bold text-xs hover:bg-red hover:text-white transition-all border border-red/10"
              >
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-3 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-1 border-b border-gray-3">
              <th className="py-4 px-6 font-bold text-dark">Kode</th>
              <th className="py-4 px-4 font-bold text-dark">Diskon</th>
              <th className="py-4 px-4 font-bold text-dark text-nowrap">Min. Beli</th>
              <th className="py-4 px-4 font-bold text-dark">Berlaku Sampai</th>
              <th className="py-4 px-6 font-bold text-dark text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.id} className="border-b border-gray-2 hover:bg-gray-1 transition-colors">
                <td className="py-4 px-6 font-bold text-blue">{c.code}</td>
                <td className="py-4 px-4 text-sm text-dark">
                  {c.discount_type === 'percentage' ? `${c.discount_value}%` : `Rp${c.discount_value?.toLocaleString('id-ID')}`}
                </td>
                <td className="py-4 px-4 text-sm text-dark-4 text-nowrap">Rp{c.min_purchase?.toLocaleString('id-ID')}</td>
                <td className="py-4 px-4 text-sm text-dark-4">
                  {c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('id-ID') : "Tanpa Batas"}
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex justify-end gap-3">
                    <button onClick={() => {
                      setEditingItem(c);
                      setFormData({
                        code: c.code,
                        discount_type: c.discount_type,
                        discount_value: formatInput(c.discount_value.toString()),
                        min_purchase: formatInput(c.min_purchase.toString()),
                        expiry_date: c.expiry_date ? c.expiry_date.split('T')[0] : ""
                      });
                      setShowForm(true);
                      setBroadcast(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }} className="bg-blue/10 text-blue py-1.5 px-4 rounded text-xs font-bold hover:bg-blue hover:text-white transition-all">Edit</button>
                    <button onClick={() => handleDelete(c.id)} className="bg-red/10 text-red py-1.5 px-4 rounded text-xs font-bold hover:bg-red hover:text-white transition-all">Hapus</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {coupons.length === 0 && !loading && (
        <div className="p-10 text-center text-dark-4 italic">Belum ada kupon yang dibuat.</div>
      )}
    </div>
  );
};

export default AdminCoupons;
