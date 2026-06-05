# Aplikasi Web Frontend Family Finance

Direktori ini berisi dashboard **Single Page Application (SPA)** untuk sistem Family Finance, yang dibangun menggunakan **Vue 3 (Composition API)** dan **Vite**.

## Technology Stack

- **Framework**: Vue 3 (Script Setup syntax)
- **Bundler**: Vite
- **Routing**: Vue Router
- **State Management**: Pinia
- **Backend Client**: `@supabase/supabase-js`
- **UI/Styling**: CSS standar yang memanfaatkan grid dan utility classes dari Bootstrap 5
- **Data Visualization**: Chart.js yang dibungkus dengan `vue-chartjs` dengan Dynamic Golden Ratio Colors

## Setup Pengembangan Lokal

1.  **Install dependencies:**
    Pastikan Anda menggunakan versi Node.js terbaru (v18+).

    ```bash
    npm install
    ```

2.  **Pengaturan Environment:**
    Buat file `.env` pada root direktori `frontend/` untuk terhubung ke Supabase.

    ```env
    VITE_SUPABASE_URL=https://your-project-id.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```

3.  **Menjalankan dev server:**

    ```bash
    npm run dev
    ```

    Aplikasi biasanya akan berjalan di `http://localhost:5173`.

## Catatan Arsitektur & Desain

### Penanganan Event Native Vue

Aplikasi ini secara sengaja **tidak menggunakan Bootstrap Javascript** (`bootstrap.bundle.js` atau jQuery).

Karena Virtual DOM milik Vue mengontrol siklus render, penggunaan plugin JavaScript imperatif sering menyebabkan race condition dan event listener yang tertinggal ("zombie"). Semua modal, dropdown, alert, dan toast dalam aplikasi ini dibangun sepenuhnya menggunakan directive native Vue (`v-if`, `v-show`, `@click`, modifier `.self`) serta CSS kustom.

### Notifikasi Toast Real-Time

Umpan balik untuk operasi Create, Update, dan Delete disediakan melalui sistem **Toast Notification global** yang dibuat secara kustom.

Sistem ini dikelola secara terpusat oleh store Pinia `toast.js` dan komponen `AppToast.vue` pada layer root aplikasi.

### Global State (Pinia)

Pola standar yang digunakan di sini adalah:

- **State lokal komponen** untuk data form yang reaktif
- **Global state Pinia** khusus untuk:
  - Authentication (`auth.js`)
  - Notifikasi Toast real-time (`toast.js`)
  - State notifikasi peringatan anggaran/bell (`budget.js`)

Pemanggilan database dilakukan langsung di dalam komponen secara berurutan menggunakan layer service tersentralisasi (`frontend/src/services/*`) yang membungkus SDK `@supabase/supabase-js`. Eksekusi fungsi _RPC (Remote Procedure Call)_ tingkat lanjut digunakan untuk mengeliminasi latensi saat mengambil rangkuman Dashboard secara besar-besaran.

### Eksport Laporan Client-Side

Fungsi unduh laporan analitik bulanan ke **PDF** (menggunakan `jsPDF` + `jspdf-autotable`) maupun **CSV** dilakukan murni eksplisit dengan 100% Javascript di sisi _browser_ untuk mencegah kelebihan muatan di sisi _backend_.

Pendekatannya menggunakan _Native File System Access API_ (`window.showSaveFilePicker`), sehingga dapat membypass total ekstensi _Download Manager_ (seperti IDM) yang kerap merusak dan membajak ekspor web menjadi _file random UUID Blob_. Hal ini menjamin file yang diunduh pasti mendarat secara sempurna sesuai namanya.

### Integritas Sistem & Visual Guardrail

Komponen transaksi dirancang sangat proaktif dalam menjaga ketertiban pencatatan finansial. Fitur andalannya meliputi:

1. **Budget Guardrail** – Memblokir user (melalui _confirmation modal_) jika input pengeluaran melebih sisa anggaran, lalu mengekskalasi _badge bell_ notifikasi secara _real-time_.
2. **Linked Sinking Fund** – Mengikat target tabungan (_goals_) untuk sinkron mengambil sisa rasio _balance_ asli dari sub-akun bank terkait.
3. **Audit Trail** – Seluruh perubahan data (_Create, Update, Delete_) dari modul utama secara otomatis terekam jejaknya (beserta datanya) ke _Activity Log System_ backend, memastikan kontrol akuntabilitas untuk setiap member keluarga yang menggunakannya.
