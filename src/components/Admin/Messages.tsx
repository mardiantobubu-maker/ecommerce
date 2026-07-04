"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import toast from "react-hot-toast";
import { translateError } from "@/lib/error-translator";

const AdminMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/messages');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal mengambil pesan");
      }
      const data = await response.json();
      setMessages(data || []);
    } catch (err: any) {
      toast.error(translateError(err.message));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchMessagesSafe = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/admin/messages');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Gagal mengambil pesan");
        }
        const data = await response.json();
        if (isMounted) setMessages(data || []);
      } catch (err: any) {
        if (isMounted) toast.error(translateError(err.message));
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMessagesSafe();
    return () => { isMounted = false; };
  }, []);

  const handleDelete = async (id: any) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesan ini?")) return;
    
    try {
      const response = await fetch(`/api/admin/messages?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Gagal menghapus pesan");
      }
      
      toast.success("Pesan berhasil dihapus");
      fetchMessages();
    } catch (err: any) {
      toast.error(translateError(err.message));
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <h2 className="text-2xl font-bold text-dark">Pesan Masuk</h2>
        <button
          onClick={fetchMessages}
          className="w-full sm:w-auto bg-gray-1 text-dark border border-gray-3 py-3 px-6 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-gray-3 transition-all shadow-sm"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {messages.map((msg) => (
          <div key={msg.id} className="bg-white border border-gray-3 rounded-xl p-6 shadow-sm hover:shadow-md transition-all relative group">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-dark text-lg">{msg.first_name} {msg.last_name}</h3>
                <p className="text-blue text-sm font-medium">{msg.subject || "Tanpa Subjek"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-dark-5">{new Date(msg.created_at).toLocaleString('id-ID')}</p>
                <p className="text-sm text-dark-4 mt-1 font-medium">{msg.phone}</p>
              </div>
            </div>
            <div className="bg-gray-1 p-4 rounded-lg text-dark-4 leading-relaxed whitespace-pre-wrap">
              {msg.message}
            </div>
            <button
              onClick={() => handleDelete(msg.id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 bg-red/10 text-red py-1 px-3 rounded text-xs font-bold hover:bg-red hover:text-white transition-all"
            >
              Hapus
            </button>
          </div>
        ))}

        {messages.length === 0 && !loading && (
          <div className="py-20 text-center bg-gray-1 rounded-xl border border-dashed border-gray-4">
            <p className="text-dark-5 italic text-lg">Belum ada pesan masuk dari pelanggan.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
