# Aplikasi Web Frontend Family Finance (FamFin)

Direktori ini berisi aplikasi web dashboard **Single Page Application (SPA)** dan **Progressive Web App (PWA)** untuk sistem Final Finance Family, yang dibangun menggunakan **Vue 3 (Composition API)**, **Vite**, dan **Pinia**.

---

## 🛠️ Technology Stack

| Kategori | Teknologi | Deskripsi |
| :--- | :--- | :--- |
| **Framework** | [Vue 3](https://vuejs.org/) (v3.5) | Composition API dengan sintaks `<script setup>` murni |
| **Build Tool & Bundler** | [Vite](https://vitejs.dev/) (v8.0) | Hot Module Replacement (HMR) kilat & bundling Rollup modern |
| **Routing** | [Vue Router](https://router.vuejs.org/) (v4.6) | Client-side routing dengan lazy-loaded page components |
| **Global State** | [Pinia](https://pinia.vuejs.org/) (v3.0) | State management modular, type-safe, dan reaktif |
| **Offline Storage** | [Dexie.js](https://dexie.com/) (v4.4) | Abstraksi IndexedDB lokal untuk kapabilitas offline-first |
| **PWA & Caching** | [Vite Plugin PWA](https://vite-pwa-org.netlify.app/) (v1.3) | Service Worker kustom (`InjectManifest`), auto-update, & offline asset precache |
| **Backend Client** | [@supabase/supabase-js](https://supabase.com/) (v2.107) | REST API, Realtime subscriptions, Auth, dan RPC caller |
| **UI Framework & Grid** | Bootstrap 5 (v5.3) & Bootstrap Icons | Utility classes, grid system, dan custom design system tanpa plugin JS eksternal |
| **Data Visualization** | Chart.js 4 & vue-chartjs | Grafik keuangan interaktif dengan *Dynamic Golden Ratio Palette* |
| **Client-Side OCR** | Tesseract.js | Ekstraksi teks struk belanja secara offline di browser |
| **Eksport Dokumen** | jsPDF & jspdf-autotable | Generator PDF dan CSV 100% client-side via Native File System Access API |
| **Date & Calendar** | date-fns (v4.4) | Manipulasi dan formatting tanggal modular |
| **Onboarding Guide** | driver.js (v1.4) | Tur interaktif pengenalan fitur untuk pengguna baru |

---

## 📂 Struktur Direktori Frontend

```
frontend/
├── public/                 # Aset statis, manifest.webmanifest, audio alarms, ikon PWA
├── scripts/                # Background test suite mandiri (test_meals_pure.js)
├── src/
│   ├── assets/             # Gambar, ilustrasi SVG, dan aset styling
│   ├── components/         # Komponen UI modular
│   │   ├── meals/          # Modal Dapur (PantryItem, MealPlan, AiRecipe, RecipeDetail, ExportShopping)
│   │   ├── scheduler/      # Tampilan Kalender (DayView, WeekView, MonthView, AgendaView, TaskCard, TaskModal)
│   │   ├── AppToast.vue    # Notifikasi toast global
│   │   ├── InstallPwa.vue  # Prompt instalasi PWA ke homescreen
│   │   └── PushToggle.vue  # Kontrol aktivasi Web Push Notifications
│   ├── db/
│   │   └── schedulerDatabase.js # Skema IndexedDB (Dexie.js) untuk jadwal & sinkronisasi offline
│   ├── locales/            # Kamus multibahasa (id.json & en.json)
│   ├── pages/              # 15 halaman tampilan utama aplikasi
│   ├── router/             # Konfigurasi rute URL dan navigation guards
│   ├── services/           # Abstraksi pemanggilan API Supabase, Google Cal, Dexie, & AI
│   │   ├── scheduler/      # Services audio, googleCalendar, reminder, dan schedulerSync
│   │   ├── aiService.js    # Kompilasi prompt snapshot finansial & koki resep
│   │   ├── mealPlanService.js
│   │   ├── pantryService.js
│   │   ├── recipeService.js
│   │   └── receiptScanner.js
│   ├── stores/             # Pinia store modules (auth, pantry, mealPlan, schedulerTask, budget, toast)
│   ├── utils/              # Helper tanggal, formatting mata uang IDR, sanitasi input
│   ├── App.vue             # Root component dengan global toast & PWA banner
│   ├── main.js             # Entry point inisialisasi Vue, Pinia, Router, & I18n
│   ├── style.css           # Global design system, glassmorphism, dark/light theme, PWA safe areas
│   └── sw.js               # Service Worker PWA (Push notification & cache handlers)
├── index.html              # HTML shell dengan viewport-fit=cover untuk iOS notch
├── package.json
└── vite.config.js          # Konfigurasi plugin Vue, PWA, Gzip, dan Brotli
```

---

## ⚡ Setup Pengembangan Lokal

1. **Instal Dependensi:**
   ```bash
   npm install
   ```
2. **Konfigurasi Environment (`.env`):**
   Buat file `.env` di folder `frontend/`:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   
   # Opsional: Google Calendar Sync
   VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   ```
3. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Aplikasi akan terbuka di `http://localhost:5173`.
4. **Build Bundle Produksi & Service Worker PWA:**
   ```bash
   npm run build
   ```

---

## 🧠 Catatan Arsitektur & Rekayasa Perangkat Lunak

### 1. Pola Native Vue (Zero Bootstrap JS)
Aplikasi ini secara sengaja **tidak menggunakan Bootstrap Javascript** (`bootstrap.bundle.js` atau jQuery). Semua modal, dropdown, tooltip, dan transisi UI dikendalikan 100% oleh reaktivitas native Vue (`v-if`, `v-show`, transition hooks). Hal ini mengeliminasi masalah *zombie event listeners* dan *DOM desynchronization* yang kerap terjadi pada integrasi jQuery/Bootstrap JS dengan Virtual DOM.

### 2. Global State Management (Pinia Stores)
Penyimpanan state aplikasi dibagi berdasarkan domain tanggung jawab:
- `auth.js`: Data user aktif, status keluarga (`familyId`), peran anggota, dan auto-sync Gemini API Key.
- `toast.js`: Antrean notifikasi toast global real-time (success, error, warning, info).
- `budget.js`: State agregasi limit anggaran dan penanda *warning bell*.
- `schedulerTask.js`: State filter kategori, tanggal aktif, dan daftar tugas jadwal harian/mingguan.
- `pantry.js`: State inventaris kulkas/freezer/pantry, filter zona, pencarian, dan bahan kedaluwarsa.
- `mealPlan.js`: Matriks perencana menu mingguan 7 hari (sarapan, siang, malam, camilan).
- `shoppingPlan.js`: State daftar belanja kolaboratif, checklist toko, dan alur checkout.
- `locale.js`: Bahasa aktif aplikasi (Bahasa Indonesia `id` dan English `en`).

### 3. Arsitektur Offline-First (Dexie.js / IndexedDB)
Untuk modul jadwal dan tugas keluarga (`/scheduler`), sistem menerapkan pola **Offline-First Resilience**:
- Database lokal di browser dikelola oleh class `SchedulerDatabase` (`frontend/src/db/schedulerDatabase.js`) menggunakan **Dexie.js**.
- Koleksi data lokal meliputi: `tasks`, `categories`, `reminders`, `recurrences`, `syncQueue`, dan `settings`.
- Saat perangkat offline, pengguna tetap dapat menambahkan, mengubah, atau menyelesaikan tugas. Mutasi data dicatat ke dalam antrean `syncQueue`.
- Service `schedulerSyncService.js` secara otomatis memantau konektivitas internet (`window.addEventListener('online')`) dan mendorong (*push*) antrean lokal ke Supabase serta menarik (*pull*) data terbaru saat koneksi pulih.

### 4. Progressive Web App (PWA) & Mobile Viewport Ergonomics
- **Service Worker (`vite-plugin-pwa` + `InjectManifest`)**:
  Menyimpan cache 78+ bundle aset statis ke dalam CacheStorage browser untuk kecepatan buka instan (*instant load*) dan fallback offline.
- **Safe-Area Inset Support**:
  Menggunakan `viewport-fit=cover` pada meta viewport dan utilitas CSS `env(safe-area-inset-bottom)` pada container utama dan modal dialog, memastikan tampilan tidak tertutup oleh tombol navigasi sistem atau *home indicator* iPhone.
- **Pencegahan Zoom Otomatis iOS Safari**:
  Menerapkan `font-size: 16px !important` pada elemen input dan select di mobile ($\le 768px$) untuk mencegah Safari melakukan auto-zoom saat form difokuskan.
- **Mobile Day Selector Pill Strip**:
  Pada modul Dapur (`/meals`), tampilan grid 7 hari yang sebelumnya memanjang 3,000px di layar ponsel diringkas menjadi bilah pil hari horizontal yang secara *default* langsung menampilkan menu **Hari Ini**, dengan opsi memilih hari tertentu dalam 1 ketukan.

### 5. Modul Dapur & Menu Makanan Cerdas (*Meals & Pantry*)
- **Matriks 7 Hari & 4 Slot**: Mengelola alokasi menu mingguan terstruktur per slot sarapan, makan siang, makan malam, dan camilan.
- **Multi-Zona Stok**: Memisahkan stok bahan makanan pada **Fridge (Kulkas)**, **Freezer (Pembeku)**, dan **Pantry (Lemari Kering)** dengan pelacak tanggal batas konsumsi.
- **Chef AI Zero-Waste**: Layanan `recipeService.js` mengirimkan daftar bahan yang tersedia (dengan memprioritaskan bahan mendekati kedaluwarsa) ke model Google Gemini untuk meracik ide resep masakan bernutrisi tanpa menghasilkan sampah makanan.
- **Sinergi 1-Tap Belanja & Restock**:
  - Resep yang kekurangan bahan dapat langsung diekspor ke modul Belanja melalui `ExportShoppingModal.vue`.
  - Item belanjaan yang selesai di-checkout di `/shopping` memiliki tombol *1-Tap Restock to Pantry* untuk langsung memasukkan bahan belanjaan ke lemari dapur tanpa input ulang manual.

### 6. Modul Jadwal & Tugas Keluarga (*Family Scheduler*)
- **Multi-View Modes**: Tampilan kalender fleksibel: *Day Timeline (24 Jam)* dengan garis penunjuk waktu nyata (*real-time NOW marker*), *Week Strip*, *Month View* dengan indikator titik warna kategori, *Agenda View*, dan *Filtered List*.
- **Integrasi Google Calendar**: Sinkronisasi dua arah via OAuth 2.0 PKCE resmi melalui `googleCalendarService.js`.
- **Notifikasi Push & Audio**: Mendukung Web Push Notifications di latar belakang serta alarm suara in-app (`audioService.js`) sebelum tugas jatuh tempo.

### 7. Keamanan & Eksport Dokumen Mandiri
- **Eksport Laporan Client-Side**: Laporan PDF (`jsPDF`) dan CSV dibuat secara lokal menggunakan *Native File System Access API* (`window.showSaveFilePicker`). Cara ini mengeliminasi masalah umum di mana ekstensi Download Manager (seperti IDM) merusak unduhan menjadi file Blob acak.
- **Scan Struk Offline**: Pemrosesan gambar struk belanja dilakukan sepenuhnya di dalam memori browser menggunakan `Tesseract.js` tanpa mengunggah foto struk ke server pihak ketiga yang tidak tepercaya.
- **Sinkronisasi Kunci API Terenkripsi**: API Key Google Gemini disimpan di database Supabase yang dilindungi kebijakan *Row-Level Security (RLS)* dan disinkronkan otomatis ke penyimpanan lokal anggota keluarga yang terotorisasi.
