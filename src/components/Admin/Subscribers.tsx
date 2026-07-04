"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminSubscribers = () => {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscribers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setSubscribers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDelete = async (id: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus email ini dari daftar?")) return;
    
    try {
      const { error } = await supabase
        .from('subscribers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success("Email berhasil dihapus");
      fetchSubscribers();
    } catch (err: any) {
      toast.error(translateError(err.message));
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-bold text-dark">Daftar Berlangganan (Newsletter)</h2>
        <div className="flex gap-4">
          <button
            onClick={() => {
              const emails = subscribers.map(s => s.email).join(', ');
              navigator.clipboard.writeText(emails);
              toast.success("Semua email berhasil disalin!");
            }}
            className="bg-blue/10 text-blue py-2 px-4 rounded-md text-sm font-bold hover:bg-blue hover:text-white transition-all"
          >
            Salin Semua Email
          </button>
          <button
            onClick={fetchSubscribers}
            className="bg-gray-2 text-dark py-2 px-4 rounded-md text-sm hover:bg-gray-3 transition-all"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-3 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-1 border-b border-gray-3">
              <th className="py-4 px-6 font-bold text-dark">Email Pelanggan</th>
              <th className="py-4 px-6 font-bold text-dark">Tanggal Daftar</th>
              <th className="py-4 px-6 font-bold text-dark text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((s) => (
              <tr key={s.id} className="border-b border-gray-2 hover:bg-gray-1 transition-colors">
                <td className="py-4 px-6 font-medium text-dark">{s.email}</td>
                <td className="py-4 px-6 text-sm text-dark-4">
                  {new Date(s.created_at).toLocaleString('id-ID')}
                </td>
                <td className="py-4 px-6 text-right">
                  <button
                    onClick={() => handleDelete(s.id)}
                    className="bg-red/10 text-red py-1 px-4 rounded text-xs font-bold hover:bg-red hover:text-white transition-all"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && !loading && (
          <div className="p-10 text-center text-dark-4 italic">Belum ada pelanggan yang berlangganan.</div>
        )}
      </div>
    </div>
  );
};

export default AdminSubscribers;
