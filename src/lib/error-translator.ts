/**
 * Translates common Supabase/System error messages to Indonesian
 */
export const translateError = (message: string): string => {
  if (!message) return "Terjadi kesalahan yang tidak diketahui.";

  const errors: Record<string, string> = {
    // Authentication Errors
    "Invalid login credentials": "Email, nomor WhatsApp, atau kata sandi salah.",
    "User already registered": "Email atau nomor WhatsApp sudah terdaftar.",
    "New password should be different from the old password": "Kata sandi baru harus berbeda dengan kata sandi lama.",
    "Password should be at least 6 characters": "Kata sandi harus minimal 6 karakter.",
    "Email not confirmed": "Email Anda belum dikonfirmasi. Silakan periksa kotak masuk Anda.",
    "Signup disabled": "Pendaftaran akun baru sedang dinonaktifkan.",
    "Invalid email or password": "Email atau kata sandi tidak valid.",
    "Database error saving new user": "Gagal menyimpan data pengguna ke database.",
    "Rate limit exceeded": "Terlalu banyak percobaan. Silakan coba lagi nanti.",
    "User not found": "Pengguna tidak ditemukan.",
    "Invalid token": "Token tidak valid atau sudah kadaluarsa.",
    "Email link is invalid or has expired": "Tautan email tidak valid atau sudah kadaluarsa.",

    // General Errors
    "Network request failed": "Gagal terhubung ke server. Periksa koneksi internet Anda.",
    "Internal Server Error": "Terjadi kesalahan pada server. Silakan coba lagi nanti.",
    "duplicate key value violates unique constraint": "Data sudah ada (duplikat). Gunakan judul atau slug yang berbeda.",
    "violates foreign key constraint": "Tidak bisa menghapus data ini karena masih digunakan oleh data lain (misal: kategori masih memiliki produk).",
    "violates row-level security policy": "Anda tidak memiliki izin untuk melakukan aksi ini. Pastikan Anda sudah login sebagai Admin di dashboard Supabase.",
  };

  // Check for partial matches or exact matches
  for (const [key, value] of Object.entries(errors)) {
    if (message.includes(key)) {
      return value;
    }
  }

  return message;
};
