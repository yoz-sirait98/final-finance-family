# Sistem Manajemen Keuangan & Kehidupan Keluarga (Final Finance Family)

[![Vue 3](https://img.shields.io/badge/Vue-3.5-4FC08D?logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-FFE566?logo=vuedotjs&logoColor=black)](https://pinia.vuejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015+-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Final Finance Family (FamFin)** adalah aplikasi web dan *Progressive Web App (PWA)* modern, aman, dan siap produksi (*production-ready*) untuk mengelola seluruh aspek finansial dan operasional rumah tangga keluarga dalam satu dashboard terpadu.

Sistem ini dirancang untuk digunakan oleh satu keluarga (menggunakan satu akun utama sebagai pusat) dengan banyak anggota keluarga yang dapat berkolaborasi mencatat arus kas, memantau anggaran, menabung bersama, merencanakan belanja, menyinkronkan jadwal aktivitas dan tugas rumah (*chores*), serta menyusun menu makan mingguan dengan asisten AI kulkas pintar.

---

## 🌟 Fitur Utama

### 💰 1. Finansial & Kas Keluarga
1. **Manajemen Akun (Rekening, Tunai & Dompet Digital)**:
   - Pantau saldo kas tunai, rekening bank, dan dompet digital (e-wallet) secara real-time.
   - Saldo terhitung otomatis melalui *Database Triggers* dan transaksi penyesuaian (*balance adjustment*).
2. **Pencatatan Transaksi Dual-Entry**:
   - Catat pemasukan, pengeluaran, transfer antar rekening, dan lampiran foto struk.
   - Pembagian transaksi per anggota keluarga (*assigned member*) dan kategori kustom.
3. **Anggaran Pintar (*Budget Guardrail*)**:
   - Tetapkan limit anggaran bulanan per kategori.
   - Peringatan dini interaktif ketika pengeluaran mencapai 80%, serta *guardrail confirmation* saat transaksi berisiko melampaui sisa bujet.
4. **Kantong Proyek (*Project Pockets*)**:
   - Alokasi dana terpisah untuk acara besar (liburan, renovasi, hari raya, kurban) tanpa mengganggu batas anggaran operasional bulanan reguler.
5. **Target Tabungan (*Saving Goals*)**:
   - Visualisasi progres tabungan impian keluarga.
   - Opsi *Linked Sinking Fund* yang mengunci dana riil di rekening bank, serta kemampuan otomatis mengubah target tercapai menjadi Kantong Proyek aktif.
6. **Transaksi Berulang Otomatis (*Recurring Engine*)**:
   - Otomatisasi pembayaran tagihan rutin (listrik, internet, asuransi, SPP) secara harian, mingguan, bulanan, hingga tahunan menggunakan *pg_cron* dan *database triggers*.
7. **Scan Struk Pintar Offline (*OCR Tesseract.js*)**:
   - Ekstraksi foto struk belanja secara instan di sisi browser (100% offline di perangkat Anda).
   - Mendeteksi nama merchant/toko, tanggal, dan nominal total secara otomatis, serta auto-fill kategori pengeluaran.
8. **Asisten Finansial AI (*Aurora AI Advisor*)**:
   - Asisten cerdas bertenaga Google Gemini yang menganalisis saldo, sisa bujet, riwayat pengeluaran, dan target tabungan keluarga untuk memberikan saran finansial yang dipersonalisasi.
   - API Key tersinkronisasi otomatis di seluruh perangkat anggota keluarga melalui database terenkripsi RLS.
9. **Dashboard Analitik & Kalender Keuangan**:
   - Visualisasi tren arus kas, proporsi pengeluaran, dan kalender jatuh tempo finansial ditenagai oleh Chart.js dengan *Dynamic Golden Ratio Palette*.
10. **Eksport Laporan Client-Side (PDF & CSV)**:
    - Cetak dan unduh laporan transaksi bulanan dalam format PDF dan CSV langsung dari browser menggunakan *Native File System Access API* (kebal gangguan ekstensi download manager/IDM).

---

### 📅 2. Jadwal & Tugas Keluarga (*Family Scheduler & Chores*)
11. **Kalender Aktivitas Multi-Tampilan**:
    - Mode **Day Timeline (24 Jam)** dengan garis penunjuk waktu riil ("NOW"), **Week Strip**, **Month Grid** dengan titik warna kategori, **Agenda View**, dan **Filtered List**.
12. **Pembagian Tugas Rumah Tangga (*Chores*)**:
    - Penugasan tugas ke anggota keluarga dengan status selesai/belum, checklist cepat, dan tingkat prioritas (*Urgent, High, Medium, Low*).
13. **Sinkronisasi Dua Arah Google Calendar**:
    - Integrasikan jadwal keluarga dengan Google Calendar via OAuth 2.0 PKCE resmi.
14. **Pengingat & Alarm Multi-Kanal**:
    - Notifikasi Web Push (*browser background push*) dan alarm suara interaktif (*in-app audio chime*) sebelum jadwal dimulai.
15. **Offline-First Resilience (Dexie.js / IndexedDB)**:
    - Tetap dapat melihat dan menambahkan jadwal/tugas meskipun tanpa koneksi internet. Data disimpan di database lokal browser dan otomatis disinkronkan ke Supabase saat online.

---

### 🍳 3. Dapur & Menu Makanan (*Smart Meal Planner & Pantry Hub*)
16. **Perencana Menu Mingguan 7 Hari**:
    - Matriks jadwal menu harian untuk 4 waktu makan: **Sarapan**, **Makan Siang**, **Makan Malam**, dan **Camilan**.
    - Penugasan koki keluarga (*cook assignment*) per waktu makan.
17. **Inventaris Dapur Cerdas Multi-Zona**:
    - Pantau stok bahan makanan terpisah di 3 zona: **Kulkas (*Fridge*)**, **Pembeku (*Freezer*)**, dan **Lemari Kering (*Pantry*)**.
    - Tombol stepper cepat kuantitas dan pita peringatan dini (*Expiring Soon Alert Ribbon*) untuk bahan yang mendekati batas kedaluwarsa (< 4 hari).
18. **Chef AI (*Zero-Waste Recipe Generator*)**:
    - Racik kreasi resep masakan lezat otomatis dari bahan-bahan yang tersedia di kulkas untuk mencegah makanan terbuang sia-sia (*zero food waste*).
    - Preferensi koki: Masakan Cepat (<20 menit), Menu Sehat, Ramah Anak, atau Hemat Bujet.
19. **Buku Resep Keluarga (*Recipe Box*)**:
    - Simpan koleksi resep favorit keluarga lengkap dengan takaran porsi, waktu persiapan, kalori, bahan, langkah memasak interaktif, dan tips koki.
20. **Sinergi 1-Tap Lintas Modul**:
    - **Ekspor Bahan Masakan ke Rencana Belanja**: 1 ketukan mengekspor bahan masakan yang belum ada di dapur langsung ke modul *Shopping Plan*.
    - **1-Tap Restock Belanja ke Kulkas**: Saat sesi belanja selesai di-*checkout*, bahan belanjaan dapat langsung dipindahkan masuk menjadi stok dapur baru.

---

### 📱 4. Progressive Web App (PWA) & Mobile UX
21. **Instalasi Homescreen Mandiri**:
    - Aplikasi dapat diinstal langsung di Android, iOS, Windows, dan macOS seperti aplikasi native.
22. **Adaptif Layar & Notch (*Safe-Area Inset*)**:
    - Mendukung `viewport-fit=cover`, navigasi jempol bawah (*thumb-friendly* FAB), bilah pemilih hari geser (*horizontal day selector strip*), dan pencegahan zoom otomatis pada iOS Safari.
23. **Keamanan Data Keluarga (*Row-Level Security*)**:
    - Setiap keluarga memiliki partisi data unik yang diisolasi ketat di level PostgreSQL. Anggota keluarga lain di luar keluarga tidak dapat mengakses data Anda.

---

## 🗺️ Peta Halaman & Navigasi Aplikasi

| Route | Modul | Deskripsi Fungsi |
| :--- | :--- | :--- |
| `/` | **Dashboard** | Rangkuman saldo, tren bulanan, menu makan hari ini, bahan kulkas kedaluwarsa, & jadwal tugas hari ini |
| `/transactions` | **Transaksi** | Pencatatan pemasukan, pengeluaran, transfer, dan fitur Scan Struk OCR |
| `/accounts` | **Rekening & Dompet** | Manajemen akun kas, bank, dan dompet digital dengan riwayat saldo |
| `/budgets` | **Anggaran Bulanan** | Pengaturan limit anggaran kategori dan monitoring persentase realisasi |
| `/goals` | **Target Tabungan** | Pelacakan progres tabungan masa depan dan konversi ke kantong proyek |
| `/project-pockets` | **Kantong Proyek** | Isolasi dana proyek/acara khusus tanpa mengganggu anggaran reguler |
| `/shopping` | **Daftar Belanja** | Rencana belanja kolaboratif, checklist toko, dan auto-checkout |
| `/scheduler` | **Jadwal & Tugas** | Kalender keluarga, pembagian tugas harian, Google Calendar sync, & alarm |
| `/meals` | **Dapur & Resep** | Menu makan 7 hari, stok kulkas/freezer/pantry, Chef AI, & buku resep |
| `/ai` | **Aurora AI Advisor** | Konsultasi finansial interaktif bertenaga Google Gemini |
| `/calendar` | **Kalender Finansial** | Tampilan kalender transaksi dan jadwal jatuh tempo keuangan |
| `/reports` | **Laporan Keuangan** | Analisis mendalam dan cetak laporan PDF/CSV client-side |
| `/categories` | **Kategori** | Manajemen kategori pemasukan dan pengeluaran keluarga |
| `/members` | **Anggota Keluarga** | Pengaturan profil anggota keluarga dan avatar |
| `/settings` | **Pengaturan** | Sinkronisasi Gemini API Key, tema gelap/terang, dan preferensi notifikasi |

---

## 🏗️ Arsitektur Monorepo & Teknologi

```
final-finance-family/
├── frontend/               # Single Page Application (Vue 3 + Vite + PWA)
│   ├── src/
│   │   ├── components/     # Komponen UI modular (scheduler, meals, toast, modals)
│   │   ├── db/             # IndexedDB schema (Dexie.js untuk scheduler offline)
│   │   ├── locales/        # Kamus multibahasa (Bahasa Indonesia & English)
│   │   ├── pages/          # 15 halaman utama aplikasi
│   │   ├── services/       # Layer integrasi API Supabase, AI, OCR, Dexie, & Push
│   │   ├── stores/         # Pinia state stores (auth, pantry, mealPlan, scheduler, dll)
│   │   └── utils/          # Helper kalkulasi tanggal, formatting mata uang IDR
│   └── public/             # Manifest PWA, service worker, audio assets, icons
└── supabase/               # Backend & Database
    └── migrations/         # 38+ file migrasi PostgreSQL (Tabel, RLS, Triggers, RPC, pg_cron)
```

### Tech Stack
- **Frontend Core**: [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`), [Vite 8](https://vitejs.dev/)
- **State Management**: [Pinia 3](https://pinia.vuejs.org/)
- **Offline Storage**: [Dexie.js 4](https://dexie.com/) (IndexedDB wrapper)
- **PWA & Caching**: [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) (Service Worker `InjectManifest`, Precache)
- **Styling**: Bootstrap 5 (CSS Custom Utility System, Responsive Safe Areas, Glassmorphism)
- **Grafik & Visualisasi**: Chart.js 4 & vue-chartjs
- **OCR Engine**: Tesseract.js (Client-Side Receipt Scanning)
- **AI Models**: Google Gemini (`gemini-2.5-flash` / `gemini-1.5-flash` via Google AI Studio)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL 15+, Auth, RPC Stored Procedures, Realtime, Row Level Security)

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat Sistem
- **Node.js** (v18 atau lebih baru)
- **npm** atau **pnpm** / **yarn**
- **Git**
- Akun [Supabase](https://supabase.com/) atau instance Docker lokal

### 2. Kloning Repositori
```bash
git clone https://github.com/yoz-sirait98/final-finance-family.git
cd final-finance-family
```

### 3. Setup Backend Supabase
1. Buat proyek baru di [Supabase Dashboard](https://supabase.com/dashboard) atau jalankan lokal via Supabase CLI (`supabase start`).
2. Terapkan seluruh migrasi database di folder `supabase/migrations`:
   ```bash
   # Jika menggunakan Supabase CLI:
   supabase db push
   ```
   *(Atau salin isi file SQL di `supabase/migrations/` ke SQL Editor di dashboard Supabase Anda).*

### 4. Setup Environment Frontend
1. Masuk ke folder `frontend`:
   ```bash
   cd frontend
   ```
2. Buat file `.env` dari template `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Konfigurasikan kredensial Supabase Anda di dalam `.env`:
   ```ini
   VITE_SUPABASE_URL=https://<your-project-ref>.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
   ```
4. *(Opsional)* Jika ingin mengaktifkan Google Calendar Sync, daftarkan Client ID OAuth di [Google Cloud Console](https://console.cloud.google.com/) dan masukkan ke `.env`:
   ```ini
   VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
   ```

### 5. Jalankan Aplikasi
```bash
# Instal dependensi
npm install

# Jalankan server pengembangan lokal
npm run dev
```
Buka browser di `http://localhost:5173`.

### 6. Build Produksi & Pengujian PWA
```bash
# Kompilasi bundle produksi & service worker
npm run build

# Pratinjau lokal build produksi
npm run preview
```

---

## 🧪 Pengujian Otomatis (*Background Test Suite*)
Aplikasi dilengkapi skrip uji logika mandiri tanpa membutuhkan browser berat:
```bash
# Jalankan test suite logika Meals, Pantry, Expiry, & Shopping Restock
node frontend/scripts/test_meals_pure.js
```

---

## 📘 Konfigurasi AI Engine (Graphify)
Repositori ini telah dipetakan ke dalam bentuk *knowledge graph* menggunakan [Graphify](https://github.com/safishamsi/graphify).
- **Knowledge Graph**: Terletak di folder `graphify-out/` dan diperbarui otomatis setiap kali kode dimodifikasi.
- Untuk memperbarui graph secara manual:
  ```bash
  graphify update .
  ```

---

## 📄 Lisensi
Didistribusikan di bawah Lisensi MIT. Bebas digunakan, dimodifikasi, dan dikembangkan untuk keperluan keluarga maupun edukasi.
