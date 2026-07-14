const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, 'frontend/src/locales/en.json');
const idPath = path.join(__dirname, 'frontend/src/locales/id.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const id = JSON.parse(fs.readFileSync(idPath, 'utf8'));

// New Tour Translations
const newTours = {
  // Calendar
  calendar: {
    header: { title: "Calendar View", description: "View all your upcoming transactions, recurring bills, and shopping plans by day." },
    grid: { title: "Monthly Grid", description: "Click on any day to see the specific financial events happening on that date." },
    add: { title: "Add Event", description: "Quickly schedule a new transaction or recurring bill directly from the calendar." }
  },
  // Shopping
  shopping: {
    header: { title: "Shopping Plans", description: "Organize your groceries, wishlists, and project materials here." },
    add: { title: "Create Plan", description: "Start a new blank shopping list." },
    ai: { title: "AI Generator", description: "Let AI instantly generate a meal plan or shopping list based on your prompt!" }
  },
  // Shopping Detail
  shoppingDetail: {
    header: { title: "List Details", description: "Manage the specific items, check them off as you shop, and track the total cost." },
    add: { title: "Add Item", description: "Manually add a new item to this list." },
    split: { title: "Split Bill", description: "Finished shopping? Convert this list into a transaction and instantly split the bill with family members!" },
    buy: { title: "Checkout", description: "Mark this list as completed and log the total expense into your accounts." }
  },
  // Categories
  categories: {
    header: { title: "Categories", description: "Organize how you track your spending and income." },
    add: { title: "New Category", description: "Create a new custom category with a color and icon." },
    list: { title: "Category Breakdown", description: "See all your active categories and how much of your budget they consume." }
  },
  // Projects
  projects: {
    header: { title: "Project Pockets", description: "Save up for big goals like vacations, home renovations, or emergency funds." },
    add: { title: "Create Project", description: "Start a new savings pocket and set a target amount." },
    fund: { title: "Add Funds", description: "Transfer money from your main accounts into this pocket to watch your progress grow!" }
  },
  // Members
  members: {
    header: { title: "Family Members", description: "Manage everyone who has access to this financial workspace." },
    add: { title: "Invite Member", description: "Generate a secure invite code to add your spouse, kids, or accountant." },
    permissions: { title: "Permissions", description: "Control who can view or edit specific accounts and budgets." }
  },
  // Settings
  settings: {
    header: { title: "Preferences", description: "Customize how the application looks and behaves." },
    currency: { title: "Currency & Region", description: "Change your default currency display and number formatting." },
    danger: { title: "Danger Zone", description: "Manage your data, export backups, or permanently delete your account." }
  },
  // AI
  ai: {
    header: { title: "Financial AI", description: "Your personal AI assistant is ready to analyze your spending or give financial advice." },
    prompt: { title: "Ask Anything", description: "Type a prompt like 'How can I save more money on groceries this month?'" },
    clear: { title: "Clear History", description: "Wipe the current conversation to start fresh." }
  }
};

const newToursId = {
  calendar: {
    header: { title: "Tampilan Kalender", description: "Lihat semua transaksi mendatang, tagihan rutin, dan rencana belanja per hari." },
    grid: { title: "Grid Bulanan", description: "Klik pada hari apa saja untuk melihat detail keuangan yang terjadi pada tanggal tersebut." },
    add: { title: "Tambah Jadwal", description: "Jadwalkan transaksi baru atau tagihan rutin langsung dari kalender." }
  },
  shopping: {
    header: { title: "Rencana Belanja", description: "Atur daftar belanja, wishlist, dan kebutuhan proyek Anda di sini." },
    add: { title: "Buat Daftar", description: "Mulai daftar belanja baru." },
    ai: { title: "Generator AI", description: "Biarkan AI otomatis membuatkan daftar belanja atau menu makanan dari prompt Anda!" }
  },
  shoppingDetail: {
    header: { title: "Detail Daftar", description: "Kelola barang-barang spesifik, centang saat dibeli, dan pantau total biayanya." },
    add: { title: "Tambah Barang", description: "Tambahkan barang baru ke daftar ini secara manual." },
    split: { title: "Bagi Tagihan", description: "Selesai belanja? Ubah daftar ini menjadi transaksi dan bagi tagihan dengan anggota keluarga!" },
    buy: { title: "Selesaikan (Checkout)", description: "Tandai daftar ini sebagai selesai dan catat total pengeluarannya." }
  },
  categories: {
    header: { title: "Kategori", description: "Atur bagaimana Anda melacak pemasukan dan pengeluaran." },
    add: { title: "Kategori Baru", description: "Buat kategori kustom baru dengan ikon dan warna pilihan." },
    list: { title: "Daftar Kategori", description: "Lihat semua kategori aktif Anda beserta alokasinya." }
  },
  projects: {
    header: { title: "Kantong Proyek (Pockets)", description: "Menabung untuk tujuan besar seperti liburan, renovasi rumah, atau dana darurat." },
    add: { title: "Buat Proyek", description: "Mulai kantong tabungan baru dan tetapkan target." },
    fund: { title: "Tambah Dana", description: "Pindahkan uang dari rekening utama Anda ke kantong ini dan pantau progresnya!" }
  },
  members: {
    header: { title: "Anggota Keluarga", description: "Kelola semua orang yang memiliki akses ke ruang kerja keuangan ini." },
    add: { title: "Undang Anggota", description: "Buat kode undangan aman untuk menambahkan pasangan, anak, atau akuntan." },
    permissions: { title: "Hak Akses", description: "Atur siapa saja yang bisa melihat atau mengedit rekening dan anggaran tertentu." }
  },
  settings: {
    header: { title: "Pengaturan", description: "Sesuaikan tampilan dan cara kerja aplikasi." },
    currency: { title: "Mata Uang & Regional", description: "Ubah tampilan mata uang utama dan format angka Anda." },
    danger: { title: "Zona Bahaya", description: "Kelola data Anda, ekspor cadangan, atau hapus akun secara permanen." }
  },
  ai: {
    header: { title: "AI Keuangan", description: "Asisten AI pribadi Anda siap menganalisis pengeluaran atau memberikan saran." },
    prompt: { title: "Tanya Apa Saja", description: "Ketik prompt seperti 'Bagaimana cara menghemat pengeluaran belanja bulan ini?'" },
    clear: { title: "Hapus Riwayat", description: "Hapus percakapan saat ini untuk memulai obrolan baru." }
  }
};

// Add updates for existing tours
en.tours.transactions.scan = { title: "Scan Receipt", description: "Use our AI Vision to instantly extract items and prices from a photo of your receipt!" };
id.tours.transactions.scan = { title: "Pindai Struk", description: "Gunakan AI Vision kami untuk otomatis mengekstrak barang dan harga dari foto struk belanja Anda!" };

en.tours.transactions.swipe = { title: "Swipe Actions", description: "On mobile, swipe any transaction left to Delete, or swipe right to Edit." };
id.tours.transactions.swipe = { title: "Geser (Swipe)", description: "Di HP, geser transaksi ke kiri untuk Menghapus, atau ke kanan untuk Mengedit." };

en.tours.dashboard.insights = { title: "AI Insights", description: "Tap here to reveal personalized financial advice generated by AI based on your recent spending." };
id.tours.dashboard.insights = { title: "Saran AI", description: "Ketuk di sini untuk melihat saran keuangan personal yang dibuat oleh AI berdasarkan pengeluaran Anda." };

en.tours.reports.csv = { title: "Export CSV", description: "Download a spreadsheet of your financial data for Excel or Google Sheets." };
id.tours.reports.csv = { title: "Ekspor CSV", description: "Unduh spreadsheet data keuangan Anda untuk dibuka di Excel atau Google Sheets." };

en.tours.reports.pdf = { title: "Export PDF", description: "Generate a beautifully formatted PDF report for your records or accountant." };
id.tours.reports.pdf = { title: "Ekspor PDF", description: "Buat laporan PDF dengan format rapi untuk arsip Anda atau akuntan." };

// Merge new tours
Object.assign(en.tours, newTours);
Object.assign(id.tours, newToursId);

fs.writeFileSync(enPath, JSON.stringify(en, null, 2));
fs.writeFileSync(idPath, JSON.stringify(id, null, 2));

console.log('Locales updated successfully!');
