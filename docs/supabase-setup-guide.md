# Panduan Konfigurasi & Integrasi Supabase

Panduan langkah demi langkah ini akan membantu Anda mengatur (setup) project Family Finance secara lokal dan menghubungkannya dengan database Supabase Anda.

## Prasyarat
Sebelum memulai, pastikan Anda telah menginstal:
- **Node.js** (v18 atau yang lebih baru)
- **Git**
- Akun [Supabase](https://supabase.com/)

---

## Langkah 1: Persiapan Project Supabase

1. Login ke dashboard [Supabase](https://supabase.com/dashboard) dan buat project baru.
2. Beri nama project Anda (misal: `family-finance-db`) dan buat password database yang kuat.
3. Tunggu beberapa menit hingga proses provision database selesai.
4. Buka menu **Project Settings > API**. Anda akan membutuhkan:
   - **Project URL**
   - **Project API Keys (anon / public)**

---

## Langkah 2: Setup Database & Migrasi

Aplikasi ini menggunakan arsitektur database Supabase yang mencakup Tabel, Row Level Security (RLS), Triggers, dan RPC Functions. Semua struktur ini sudah didefinisikan di dalam folder `supabase/migrations`.

Terdapat dua cara untuk memasukkan struktur database ini ke Supabase Anda:

### Opsi A: Menggunakan Supabase CLI (Direkomendasikan)
1. Install Supabase CLI di terminal Anda jika belum:
   ```bash
   npm install -g supabase
   ```
2. Login ke CLI menggunakan akses token dari Supabase:
   ```bash
   supabase login
   ```
3. Hubungkan repositori lokal Anda ke project Supabase:
   ```bash
   supabase link --project-ref <YOUR_PROJECT_REFERENCE_ID>
   ```
   *(Project Ref ID adalah kode unik di URL dashboard Anda: `https://supabase.com/dashboard/project/<PROJECT_REF>`)*
4. Dorong semua struktur tabel dan fungsi ke database online Anda:
   ```bash
   supabase db push
   ```

### Opsi B: Eksekusi Manual via Dashboard
Jika Anda tidak ingin menggunakan CLI, Anda dapat:
1. Buka dashboard Supabase, arahkan ke menu **SQL Editor**.
2. Buka folder `supabase/migrations` di dalam repositori ini.
3. Salin isi file migrasi secara berurutan berdasarkan stempel waktu (timestamp) dan jalankan di SQL Editor.

---

## Langkah 3: Konfigurasi Frontend (Environment Variables)

Aplikasi frontend (Vue.js) membutuhkan URL dan kunci API untuk dapat berkomunikasi dengan backend Supabase secara real-time.

1. Buka folder `frontend` di terminal Anda.
2. Salin template environment file:
   ```bash
   cp .env.example .env
   ```
3. Buka file `.env` yang baru saja dibuat di code editor Anda.
4. Ganti nilai-nilai berikut dengan informasi dari **Langkah 1**:
   ```env
   VITE_SUPABASE_URL=https://<YOUR_PROJECT_REFERENCE_ID>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGci...<YOUR_ANON_KEY>
   ```
   *(Biarkan variabel lain apa adanya atau sesuaikan jika perlu)*

---

## Langkah 4: Menjalankan Aplikasi

Sekarang sistem siap untuk digunakan secara lokal!

1. Instal semua dependensi frontend (pastikan Anda berada di direktori `/frontend`):
   ```bash
   npm install
   ```
2. Jalankan server pengembangan lokal (Dev Server):
   ```bash
   npm run dev
   ```
3. Buka browser Anda dan akses `http://localhost:5173`.

---

> [!TIP]
> **Catatan Keamanan (Row Level Security)**
> Aplikasi ini menggunakan Supabase Auth dan Row Level Security (RLS) bawaan. Semua data diisolasi per ID pengguna (`user_id`). Saat pertama kali aplikasi berjalan, Anda perlu melakukan registrasi akun baru melalui UI aplikasi agar profil keluarga terbentuk di database dan dapat mulai menambahkan transaksi.
