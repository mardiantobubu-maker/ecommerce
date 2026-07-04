-- Update data produk agar konsisten dengan tampilan detail/quick view.
-- Jalankan file ini di Supabase SQL Editor.

update products
set
  description = 'Setelan seragam SD lengkap (Baju & Celana/Rok) kualitas premium.',
  colors = array['red', 'white'],
  sizes = array['7,8', '9,10', '11,12', '13,14', '15,16', '17,18', '19,20'],
  sleeves = array['Pendek', 'Panjang'],
  fits = array['Reguler']
where title = 'Paket Seragam SD Lengkap';

update products
set
  description = 'Setelan seragam SMP lengkap dengan bahan kain yang nyaman.',
  colors = array['blue', 'white'],
  sizes = array['7,8', '9,10', '11,12', '13,14', '15,16', '17,18', '19,20'],
  sleeves = array['Pendek', 'Panjang'],
  fits = array['Reguler']
where title = 'Seragam SMP Putih Biru Lengkap';

update products
set
  description = 'Setelan seragam SMA kualitas terbaik, tidak mudah kusut.',
  colors = array['purple', 'white'],
  sizes = array['7,8', '9,10', '11,12', '13,14', '15,16', '17,18', '19,20'],
  sleeves = array['Pendek', 'Panjang'],
  fits = array['Reguler']
where title = 'Seragam SMA Putih Abu-abu Lengkap';

update products
set
  description = 'Seragam Pramuka lengkap dengan kualitas jahitan rapi.',
  colors = array['orange'],
  sizes = array['7,8', '9,10', '11,12', '13,14', '15,16', '17,18', '19,20'],
  sleeves = array['Pendek', 'Panjang'],
  fits = array['Reguler']
where title = 'Seragam Pramuka Penggalang Lengkap';

update products
set
  description = 'Seragam batik sekolah dengan motif nasional yang indah. Bahan katun primisima yang halus dan menyerap keringat.',
  colors = array['pink', 'blue'],
  sizes = array['7,8', '9,10', '11,12', '13,14', '15,16', '17,18', '19,20'],
  sleeves = array['Pendek'],
  fits = array['Reguler']
where title = 'Seragam Batik Sekolah Nasional';

