# Sistem Manajemen Keuangan Keluarga (Final Finance Family)

Aplikasi pencatatan keuangan keluarga yang siap digunakan pada lingkungan produksi (production-ready). Sistem ini dirancang untuk digunakan oleh satu keluarga (menggunakan satu akun utama sebagai pusat) dengan beberapa anggota individu yang dapat mencatat pemasukan, pengeluaran, anggaran, target tabungan, kantong proyek, daftar belanja, struk otomatis, asisten AI, dan transaksi berulang dalam satu dashboard terpadu.

Sistem ini menyediakan pencatatan akuntansi **dual-entry** untuk transfer antar akun serta **notifikasi real-time pada frontend** ketika penggunaan anggaran mendekati batas tertentu.

---

## 🌟 Fitur Utama

1.  **Manajemen Anggota**: Menambahkan anggota keluarga dan mengaitkan transaksi kepada masing-masing anggota.
2.  **Manajemen Akun (Rekening & Dompet)**: Melacak saldo pada kas, rekening bank, dan e-wallet. Saldo terupdate otomatis dengan *Database Triggers*.
3.  **Pencatatan Transaksi**: Mencatat pemasukan, pengeluaran, transfer antar akun, dan penyesuaian saldo.
4.  **Anggaran (Budgeting)**: Menentukan batas pengeluaran bulanan per kategori dengan *Budget Guardrail* interaktif dan notifikasi peringatan jika mencapai 80%.
5.  **Kantong Proyek (Project Pockets)**: Memisahkan dana untuk acara/proyek besar. Pengeluaran proyek tidak mengganggu limit Anggaran Bulanan reguler.
6.  **Daftar Belanja Kolaboratif (Shopping Lists)**: Rencana belanja real-time dengan fitur Checkout yang mengubah belanjaan selesai menjadi transaksi pengeluaran otomatis.
7.  **Scan Struk Pintar (OCR)**: Ekstraksi foto struk secara offline di sisi *client* menggunakan Tesseract.js (otomatis mendeteksi nama toko, tanggal, dan nominal transaksi).
8.  **Target Tabungan (Saving Goals)**: Melacak target dana tabungan secara interaktif, yang dapat dihubungkan menjadi *Kantong Proyek* saat target telah tercapai.
9.  **Transaksi Berulang (Recurring)**: Penjadwalan otomatis di level database (pg_cron) untuk pengeluaran berulang harian, mingguan, bulanan, hingga tahunan.
10. **Dashboard & Analitik Visual**: Menyediakan laporan tren keuangan, grafik pie, hingga kalender keuangan keluarga yang ditenagai oleh Chart.js.
11. **Eksport Laporan (CSV & PDF)**: Unduh laporan transaksi keuangan langsung dari sisi browser tanpa membebani server.
12. **Asisten Keuangan AI (Aurora AI Advisor)**: Asisten cerdas bertenaga Google Gemini yang dapat membaca keseluruhan kondisi keuangan keluarga Anda untuk memberikan saran yang dipersonalisasi. API Key sinkron otomatis lintas perangkat anggota keluarga.
13. **Keamanan Berlapis (RLS)**: Row Level Security menjamin privasi dan mengisolasi data masing-masing keluarga secara ketat.
14. **Modern, Magic UI/UX**: Tampilan elegan dengan elemen-elemen responsif, micro-animations, *glassmorphism*, *dark mode/light mode*, dan dukungan aksesibilitas tinggi untuk berbagai ukuran perangkat.

---

## 🏗️ Arsitektur Proyek

Proyek ini menggunakan struktur **monorepo**:

- **Frontend (`/frontend`)**: Vue 3 (Composition API), Vite, Pinia, Vue Router, Bootstrap 5 (Custom Design System), Chart.js, Tesseract.js.
- **Backend & Database (`/supabase`)**: Supabase (PostgreSQL 15+), Supabase Auth, PostgreSQL Triggers/Functions (RPC), pg_cron, dan Row Level Security (RLS).

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

Berikut adalah langkah-langkah untuk melakukan *cloning*, setup database, dan menjalankan proyek ini di mesin lokal Anda.

### 1. Persyaratan Sistem (Prerequisites)
- **Node.js** (v18 atau lebih baru)
- **npm** atau **yarn**
- **Docker Desktop** (untuk menjalankan Supabase lokal)
- **Supabase CLI** (Instal via npm: `npm install -g supabase`)
- **Git**

### 2. Clone Repositori
```bash
git clone https://github.com/yoz-sirait98/final-finance-family.git
cd final-finance-family
```

### 3. Setup Database Supabase Lokal
Aplikasi ini bergantung pada Supabase untuk backend dan database.

1. Jalankan layanan Supabase secara lokal (pastikan Docker berjalan):
   ```bash
   supabase start
   ```
2. Terapkan semua migrasi database (skema tabel, fungsi, RLS, cron):
   ```bash
   supabase db push
   ```
3. *(Opsional)* Jika Anda butuh data contoh (seeder):
   ```bash
   supabase db reset
   ```
4. Setelah `supabase start` berhasil, CLI akan menampilkan kredensial lokal seperti **API URL** dan **anon key**. Catat kredensial ini.

### 4. Setup API Keys & Environment Frontend
1. Masuk ke direktori frontend:
   ```bash
   cd frontend
   ```
2. Buat file `.env` (atau salin dari `.env.example` jika ada):
   ```bash
   cp .env.example .env
   ```
3. Edit file `.env` dan masukkan kredensial dari Supabase lokal Anda:
   ```ini
   VITE_SUPABASE_URL=http://127.0.0.1:54321
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
   ```
4. Jika Anda ingin menggunakan fitur **AI Advisor**, dapatkan API Key gratis dari [Google AI Studio](https://aistudio.google.com/) dan Anda dapat menyimpannya nanti di menu *Settings* di dalam aplikasi.

### 5. Install Dependencies & Jalankan Frontend
1. Instal semua paket Node.js:
   ```bash
   npm install
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Buka browser dan akses aplikasi di: `http://localhost:5173`

---

## 📘 Konfigurasi AI Engine (Graphify)

Aplikasi ini sudah dipetakan ke dalam bentuk *knowledge graph* menggunakan [Graphify](https://github.com/safishamsi/graphify). Ini membuat asisten AI koding (seperti Claude, Cursor, Antigravity) sangat mudah mengerti alur sistem.

- **Developer Baru**: Anda tidak perlu menjalankan mapping ulang, karena folder `graphify-out/` sudah tersedia.
- **Git Hook**: Agar *graph* tetap update otomatis setiap commit, jalankan:
  ```bash
  pipx install "graphifyy[gemini]"
  graphify hook install
  ```

---

## 🖼️ Tangkapan Layar (Screenshots)

*Tangkapan layar dapat dilihat lebih detail pada direktori `docs/screenshots/`.*
* **Dashboard Utama**
* **Asisten AI (AI Advisor)**
* **Scan Struk Pintar**
* **Kantong Proyek & Target Tabungan**
* **Manajemen Anggaran & Laporan**
