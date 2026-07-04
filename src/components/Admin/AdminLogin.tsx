"use client";
import React, { useState } from "react";
import toast from "react-hot-toast";

const AdminLogin = ({ onLogin }: { onLogin: (status: boolean) => void }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Hardcoded simple security - Anda bisa mengganti password ini
    if (username === "oji" && password === "@ji123") {
      toast.success("Login Berhasil!");
      setTimeout(() => {
        onLogin(true);
        localStorage.setItem("isAdminLoggedIn", "true");
      }, 500);
    } else {
      toast.error("Username atau Password salah!");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[600px] flex items-center justify-center bg-gray-2 px-4">
      <div className="max-w-[400px] w-full bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-gray-3">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-blue/10 text-blue rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-dark">Login Admin</h2>
          <p className="text-dark-4 text-sm mt-2">Masukkan kredensial untuk akses dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-dark-4">Username</label>
            <input
              required
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-3.5 border border-gray-3 rounded-lg outline-none focus:border-blue bg-gray-1 transition-all"
              placeholder="Masukkan username"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-dark-4">Password</label>
            <div className="relative">
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 pr-12 border border-gray-3 rounded-lg outline-none focus:border-blue bg-gray-1 transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 hover:text-blue transition-colors"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-blue text-white py-4 rounded-lg font-bold hover:bg-blue-dark shadow-md shadow-blue/20 transition-all disabled:opacity-50"
          >
            {loading ? "Mengecek..." : "Masuk Ke Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
