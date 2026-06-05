# Backend API Sistem Manajemen Keuangan Keluarga

Direktori ini berisi REST API untuk Sistem Manajemen Keuangan Keluarga yang dibangun menggunakan **Laravel 11** dan **PHP 8.3**.

## Requirements
*   PHP 8.3 atau lebih tinggi
*   Composer
*   MySQL 8.0+

## Setup Lokal

1.  **Install dependencies:**
    ```bash
    composer install
    ```

2.  **Setup Environment:**
    Salin file `.env.example` menjadi `.env`.

    Konfigurasikan kredensial database Anda:

    ```env
    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=finance_family
    DB_USERNAME=root
    DB_PASSWORD=
    ```

3.  **Generate app key:**
    ```bash
    php artisan key:generate
    ```

4.  **Jalankan Migration dan Seeder:**

    Aplikasi ini membutuhkan kategori dasar agar dapat berfungsi dengan baik. Seeder juga menyediakan contoh data keluarga (demo family).

    ```bash
    php artisan migrate
    php artisan db:seed
    ```

5.  **Jalankan server lokal:**

    ```bash
    php artisan serve --port=8000
    ```

## Detail Arsitektur

*   **Authentication**: Menggunakan Laravel Sanctum yang menghasilkan Bearer Token dalam bentuk plain-text. Semua route di bawah `/api/*` membutuhkan token ini kecuali `/api/auth/login` dan `/api/auth/register`.

*   **Services Pattern**: Controller dibuat tetap ringan. Logika bisnis ditempatkan pada service layer secara terpusat, seperti:
    - Perhitungan ulang saldo akun (`AccountBalanceService`) dengan mitigasi *Transfer Balance Wipe Bug*.
    - Transfer dual-entry dan manipulasi mutasi database secara atomic (`TransactionService`).
    - Pengecekan jatuh tempo transaksi berulang (`RecurringTransactionService`).
    - Agregasi analitik data masif yang telah dioptimasi dari *N+1 Query Issue* menjadi kueri agregat efisien ber-index (`DashboardService`).
    - Validasi pencegahan pembengkakan anggaran atau *Budget Guardrail* pada level sistem (`BudgetService`).
    - *Audit Trail* tersentralisasi untuk merekam secara persisten seluruh riwayat pembuatan, pengubahan, maupun penghapusan entitas beserta datanya (`ActivityLogService`).

    Seluruh service berada di folder `app/Services`.

*   **Localization**: Aplikasi menggunakan timezone default `Asia/Jakarta` dan mengasumsikan format mata uang **IDR** untuk nilai finansial.

## Scheduled Tasks

Aplikasi memiliki background job yang secara otomatis memasukkan transaksi berulang ketika sudah jatuh tempo.

Untuk production, pastikan Laravel scheduler ditambahkan pada **cron tab** server Anda:

```bash
* * * * * cd /path-to-your-project/backend && php artisan schedule:run >> /dev/null 2>&1
```

## Grup Endpoint API yang Tersedia

*   `POST /auth/*`: Login, Register, Logout, perubahan password
*   `CRUD /members`: Profil anggota keluarga
*   `CRUD /accounts`: Saldo bank/kas
*   `CRUD /categories`: Label pemasukan/pengeluaran
*   `CRUD /transactions`: Buku transaksi utama (termasuk `POST /transactions/transfer`)
*   `CRUD /budgets`: Batas anggaran bulanan dan notifikasi
*   `CRUD /goals`: Target tabungan dan kontribusi
*   `CRUD /recurring-transactions`: Aturan otomatisasi transaksi
*   `GET /dashboard/*`: Endpoint agregasi metrik untuk tampilan dashboard