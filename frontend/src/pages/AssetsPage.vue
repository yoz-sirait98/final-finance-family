<template>
  <div class="assets-page-container pb-5">
    <!-- Hero Header -->
    <div class="assets-hero mb-4 p-4 rounded-4 position-relative overflow-hidden shadow-sm">
      <div class="row align-items-center g-3">
        <div class="col-12 col-lg-7">
          <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
            <span class="badge rounded-pill bg-primary bg-opacity-20 text-primary fw-bold px-3 py-2">
              <i class="bi bi-house-gear-fill me-1"></i>
              {{ isId ? 'Aset & Pemeliharaan Rumah' : 'Household Assets & Maintenance' }}
            </span>
            <span v-if="assetStore.overdueSchedulesCount > 0" class="badge rounded-pill bg-danger text-white px-2 py-1 pulse-badge">
              <i class="bi bi-exclamation-triangle-fill me-1"></i>
              {{ assetStore.overdueSchedulesCount }} {{ isId ? 'servis terlambat!' : 'maintenance overdue!' }}
            </span>
            <span v-else-if="assetStore.dueSoonSchedulesCount > 0" class="badge rounded-pill bg-warning text-dark px-2 py-1">
              <i class="bi bi-clock-history me-1"></i>
              {{ assetStore.dueSoonSchedulesCount }} {{ isId ? 'servis jatuh tempo minggu ini' : 'due soon this week' }}
            </span>
            <span v-if="assetStore.expiringWarrantiesCount > 0" class="badge rounded-pill bg-warning-subtle text-warning-emphasis border px-2 py-1">
              <i class="bi bi-shield-exclamation me-1"></i>
              {{ assetStore.expiringWarrantiesCount }} {{ isId ? 'garansi segera habis (<30 hari)' : 'warranties expiring soon' }}
            </span>
          </div>

          <h2 class="fw-bold mb-2 text-gradient">
            {{ isId ? 'Inventaris Aset & Jadwal Servis' : 'Family Assets, Maintenance & Warranty' }}
          </h2>
          <p class="text-muted mb-0">
            {{ isId ? 'Pantau kendaraan, elektronik, dan fasilitas rumah. Jadwalkan servis rutin berkala serta simpan arsip garansi agar perlindungan selalu siap.' : 'Track household vehicles, appliances, and fixtures. Schedule recurring maintenance and safeguard warranties with linked expense tracking.' }}
          </p>
        </div>

        <div class="col-12 col-lg-5 text-lg-end d-flex flex-wrap gap-2 justify-content-lg-end">
          <button
            type="button"
            class="btn btn-success d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
            @click="openLogModal()"
          >
            <i class="bi bi-tools"></i>
            <span>{{ isId ? 'Catat Servis' : 'Log Service' }}</span>
          </button>
          <button
            type="button"
            class="btn btn-outline-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold"
            @click="openScheduleModal()"
          >
            <i class="bi bi-calendar-plus"></i>
            <span>{{ isId ? 'Jadwalkan Servis' : 'Add Schedule' }}</span>
          </button>
          <button
            type="button"
            class="btn btn-primary d-flex align-items-center gap-2 px-3 py-2 fw-semibold shadow-sm"
            @click="openAssetModal()"
          >
            <i class="bi bi-plus-lg"></i>
            <span>{{ isId ? 'Tambah Aset' : 'Add Asset' }}</span>
          </button>
        </div>
      </div>

      <!-- Quick Metrics Counters -->
      <div class="row g-2 mt-3 pt-3 border-top border-light-subtle">
        <div class="col-6 col-md-3 col-xl">
          <div class="metric-card p-2 rounded-3 d-flex align-items-center gap-2" @click="activeTab = 'assets'">
            <div class="metric-icon bg-primary-subtle text-primary"><i class="bi bi-cash-stack"></i></div>
            <div>
              <div class="fw-bold fs-6 mb-0 text-success">Rp {{ formattedValuation }}</div>
              <div class="text-muted xsmall">{{ isId ? 'Total Taksiran Nilai' : 'Total Asset Value' }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3 col-xl">
          <div class="metric-card p-2 rounded-3 d-flex align-items-center gap-2" @click="activeTab = 'assets'">
            <div class="metric-icon bg-info-subtle text-info"><i class="bi bi-box-seam"></i></div>
            <div>
              <div class="fw-bold fs-5 mb-0">{{ assetStore.totalAssetCount }}</div>
              <div class="text-muted xsmall">{{ isId ? 'Total Aset Terdaftar' : 'Registered Assets' }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3 col-xl">
          <div class="metric-card p-2 rounded-3 d-flex align-items-center gap-2" @click="activeTab = 'schedules'; assetStore.filterScheduleStatus = 'overdue'">
            <div class="metric-icon" :class="assetStore.overdueSchedulesCount > 0 ? 'bg-danger-subtle text-danger' : 'bg-secondary-subtle text-secondary'">
              <i class="bi bi-calendar-event"></i>
            </div>
            <div>
              <div class="fw-bold fs-5 mb-0" :class="{ 'text-danger': assetStore.overdueSchedulesCount > 0 }">
                {{ assetStore.overdueSchedulesCount }}
              </div>
              <div class="text-muted xsmall">{{ isId ? 'Servis Terlambat' : 'Overdue Maintenance' }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3 col-xl">
          <div class="metric-card p-2 rounded-3 d-flex align-items-center gap-2" @click="activeTab = 'warranties'; assetStore.filterWarrantyStatus = 'expiring_soon'">
            <div class="metric-icon bg-warning-subtle text-warning"><i class="bi bi-shield-check"></i></div>
            <div>
              <div class="fw-bold fs-5 mb-0 text-warning-emphasis">{{ assetStore.expiringWarrantiesCount }}</div>
              <div class="text-muted xsmall">{{ isId ? 'Garansi Segera Habis' : 'Expiring Warranties' }}</div>
            </div>
          </div>
        </div>

        <div class="col-6 col-md-3 col-xl">
          <div class="metric-card p-2 rounded-3 d-flex align-items-center gap-2" @click="activeTab = 'logs'">
            <div class="metric-icon bg-success-subtle text-success"><i class="bi bi-receipt-cutoff"></i></div>
            <div>
              <div class="fw-bold fs-6 mb-0 text-danger">Rp {{ Number(assetStore.totalMaintenanceSpent || 0).toLocaleString('id-ID') }}</div>
              <div class="text-muted xsmall">{{ isId ? 'Total Biaya Servis' : 'Total Service Spent' }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Navigation Tabs Strip -->
    <div class="main-tabs-wrapper mb-4">
      <ul class="nav nav-pills main-tabs-pills p-1 rounded-3">
        <li class="nav-item">
          <button
            class="nav-link tab-pill-btn d-flex align-items-center gap-2"
            :class="{ active: activeTab === 'assets' }"
            @click="activeTab = 'assets'"
          >
            <i class="bi bi-grid-fill"></i>
            <span>{{ isId ? 'Semua Aset' : 'All Assets' }}</span>
            <span class="badge rounded-pill bg-light text-dark ms-1">{{ assetStore.totalAssetCount }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link tab-pill-btn d-flex align-items-center gap-2"
            :class="{ active: activeTab === 'schedules' }"
            @click="activeTab = 'schedules'"
          >
            <i class="bi bi-calendar-check-fill"></i>
            <span>{{ isId ? 'Jadwal Servis' : 'Schedules' }}</span>
            <span v-if="assetStore.overdueSchedulesCount > 0" class="badge rounded-pill bg-danger text-white ms-1">
              {{ assetStore.overdueSchedulesCount }}
            </span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link tab-pill-btn d-flex align-items-center gap-2"
            :class="{ active: activeTab === 'logs' }"
            @click="activeTab = 'logs'"
          >
            <i class="bi bi-clock-history"></i>
            <span>{{ isId ? 'Riwayat Servis' : 'Service Logs' }}</span>
          </button>
        </li>
        <li class="nav-item">
          <button
            class="nav-link tab-pill-btn d-flex align-items-center gap-2"
            :class="{ active: activeTab === 'warranties' }"
            @click="activeTab = 'warranties'"
          >
            <i class="bi bi-shield-check"></i>
            <span>{{ isId ? 'Garansi & Bukti' : 'Warranties Hub' }}</span>
            <span v-if="assetStore.expiringWarrantiesCount > 0" class="badge rounded-pill bg-warning text-dark ms-1">
              {{ assetStore.expiringWarrantiesCount }}
            </span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Loading State -->
    <div v-if="assetStore.loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="text-muted mt-2 small">{{ isId ? 'Memuat data aset keluarga...' : 'Loading household assets...' }}</p>
    </div>

    <div v-else>
      <!-- TAB 1: ALL ASSETS -->
      <section v-if="activeTab === 'assets'">
        <AssetFilterBar
          v-model:category="assetStore.filterCategory"
          v-model:status="assetStore.filterStatus"
          v-model:searchQuery="assetStore.searchQuery"
          :countsByCategory="categoryCounts"
          @add-asset="openAssetModal()"
        />

        <div v-if="assetStore.filteredAssets.length === 0" class="empty-state-box text-center py-5 p-4 rounded-4 border">
          <i class="bi bi-box-seam display-3 text-muted opacity-50 d-block mb-3"></i>
          <h5 class="fw-bold mb-1">{{ isId ? 'Belum Ada Aset Sesuai Filter' : 'No Assets Found' }}</h5>
          <p class="text-muted small mb-3">
            {{ isId ? 'Mulai daftarkan kendaraan, barang elektronik, atau fasilitas rumah Anda.' : 'Register your family vehicles, appliances, or fixtures to track maintenance and warranties.' }}
          </p>
          <button type="button" class="btn btn-primary btn-sm px-3" @click="openAssetModal()">
            <i class="bi bi-plus-circle me-1"></i> {{ isId ? 'Tambah Aset Sekarang' : 'Add First Asset' }}
          </button>
        </div>

        <div v-else class="row g-3">
          <div
            v-for="a in assetStore.filteredAssets"
            :key="a.id"
            class="col-12 col-sm-6 col-lg-4 col-xl-3"
          >
            <AssetCard
              :asset="a"
              @view="openDetailModal(a)"
              @edit="openAssetModal(a)"
              @delete="confirmDeleteAsset(a)"
              @log-service="openLogModal(a)"
              @add-schedule="openScheduleModal(a)"
              @add-warranty="openWarrantyModal(a)"
            />
          </div>
        </div>
      </section>

      <!-- TAB 2: MAINTENANCE SCHEDULES -->
      <section v-if="activeTab === 'schedules'">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <!-- Status Filters -->
          <div class="btn-group btn-group-sm">
            <button
              class="btn"
              :class="assetStore.filterScheduleStatus === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="assetStore.filterScheduleStatus = 'all'"
            >
              {{ isId ? 'Semua' : 'All' }}
            </button>
            <button
              class="btn"
              :class="assetStore.filterScheduleStatus === 'overdue' ? 'btn-danger' : 'btn-outline-danger'"
              @click="assetStore.filterScheduleStatus = 'overdue'"
            >
              <i class="bi bi-exclamation-circle me-1"></i>
              {{ isId ? 'Terlambat' : 'Overdue' }} ({{ assetStore.overdueSchedulesCount }})
            </button>
            <button
              class="btn"
              :class="assetStore.filterScheduleStatus === 'due_soon' ? 'btn-warning' : 'btn-outline-warning'"
              @click="assetStore.filterScheduleStatus = 'due_soon'"
            >
              <i class="bi bi-clock me-1"></i>
              {{ isId ? 'Segera (<7 Hari)' : 'Due Soon' }} ({{ assetStore.dueSoonSchedulesCount }})
            </button>
            <button
              class="btn"
              :class="assetStore.filterScheduleStatus === 'upcoming' ? 'btn-info' : 'btn-outline-info'"
              @click="assetStore.filterScheduleStatus = 'upcoming'"
            >
              {{ isId ? 'Mendatang' : 'Upcoming' }}
            </button>
          </div>

          <button
            type="button"
            class="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm"
            @click="openScheduleModal()"
          >
            <i class="bi bi-plus-circle"></i>
            <span>{{ isId ? 'Atur Jadwal Servis' : 'Add Schedule' }}</span>
          </button>
        </div>

        <div v-if="assetStore.filteredSchedules.length === 0" class="empty-state-box text-center py-5 p-4 rounded-4 border">
          <i class="bi bi-calendar-check display-3 text-muted opacity-50 d-block mb-3"></i>
          <h5 class="fw-bold mb-1">{{ isId ? 'Tidak Ada Jadwal Servis' : 'No Schedules Found' }}</h5>
          <p class="text-muted small mb-3">
            {{ isId ? 'Atur servis berkala seperti ganti oli mesin, cuci AC, atau pajak STNK.' : 'Set up recurring maintenance schedules like oil changes or AC cleaning.' }}
          </p>
          <button type="button" class="btn btn-primary btn-sm px-3" @click="openScheduleModal()">
            <i class="bi bi-plus-circle me-1"></i> {{ isId ? 'Atur Jadwal Sekarang' : 'Add Schedule' }}
          </button>
        </div>

        <div v-else class="row g-3">
          <div
            v-for="s in assetStore.filteredSchedules"
            :key="s.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <div class="card h-100 border shadow-sm p-3">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge rounded-pill" :class="scheduleUrgencyClass(s)">
                  {{ scheduleUrgencyLabel(s) }}
                </span>
                <span class="text-muted small">
                  {{ s.frequency_type === 'odometer' ? `Tiap ${s.interval_value} km` : `Tiap ${s.interval_value} ${s.frequency_type}` }}
                </span>
              </div>

              <h6 class="fw-bold mb-1">{{ s.title }}</h6>
              <div class="text-primary small mb-2 d-flex align-items-center gap-1">
                <i class="bi bi-box-seam"></i>
                <span class="fw-medium">{{ s.asset?.name || 'Aset' }}</span>
                <span v-if="s.asset?.license_plate" class="badge bg-dark-subtle text-dark-emphasis font-monospace">
                  {{ s.asset.license_plate }}
                </span>
              </div>

              <div class="small text-muted mb-2">
                <div v-if="s.next_due_date">
                  <i class="bi bi-calendar-event me-1"></i>
                  <span>Jatuh Tempo: <strong>{{ s.next_due_date }}</strong></span>
                </div>
                <div v-if="s.next_due_odometer">
                  <i class="bi bi-speedometer2 me-1"></i>
                  <span>Odometer Target: <strong>{{ Number(s.next_due_odometer).toLocaleString('id-ID') }} km</strong></span>
                </div>
                <div v-if="s.estimated_cost">
                  <i class="bi bi-tag me-1"></i>
                  <span>Estimasi Biaya: Rp {{ Number(s.estimated_cost).toLocaleString('id-ID') }}</span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top gap-2">
                <button
                  type="button"
                  class="btn btn-sm btn-success d-flex align-items-center gap-1"
                  @click="openLogModal(s.asset, s.id)"
                >
                  <i class="bi bi-check2-circle"></i>
                  <span>{{ isId ? 'Servis Selesai' : 'Log Done' }}</span>
                </button>

                <button
                  type="button"
                  class="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                  @click="handleSyncScheduler(s)"
                  title="Sinkronkan ke Jadwal Tugas Keluarga"
                >
                  <i class="bi bi-calendar-plus"></i>
                  <span class="d-none d-sm-inline">{{ isId ? 'Ke Tugas' : 'To Tasks' }}</span>
                </button>

                <div class="dropdown ms-auto">
                  <button class="btn btn-sm btn-light border dropdown-toggle no-caret" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="openScheduleModal(null, s)">
                        <i class="bi bi-pencil me-2 text-primary"></i>{{ isId ? 'Ubah' : 'Edit' }}
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDeleteSchedule(s)">
                        <i class="bi bi-trash me-2"></i>{{ isId ? 'Hapus' : 'Delete' }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- TAB 3: SERVICE HISTORY LOGS -->
      <section v-if="activeTab === 'logs'">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <h5 class="fw-bold mb-0">
            <i class="bi bi-clock-history me-1 text-success"></i>
            {{ isId ? 'Semua Catatan Riwayat Servis' : 'Completed Maintenance Logs' }}
          </h5>

          <button
            type="button"
            class="btn btn-success btn-sm d-flex align-items-center gap-1 shadow-sm"
            @click="openLogModal()"
          >
            <i class="bi bi-plus-circle"></i>
            <span>{{ isId ? 'Catat Servis Baru' : 'Log Maintenance' }}</span>
          </button>
        </div>

        <div v-if="assetStore.filteredLogs.length === 0" class="empty-state-box text-center py-5 p-4 rounded-4 border">
          <i class="bi bi-clock-history display-3 text-muted opacity-50 d-block mb-3"></i>
          <h5 class="fw-bold mb-1">{{ isId ? 'Belum Ada Riwayat Servis' : 'No Service Logs' }}</h5>
          <p class="text-muted small mb-3">
            {{ isId ? 'Catat setiap kali kendaraan atau peralatan diservis beserta biayanya.' : 'Log service sessions to keep track of maintenance history and costs.' }}
          </p>
          <button type="button" class="btn btn-success btn-sm px-3" @click="openLogModal()">
            <i class="bi bi-plus-circle me-1"></i> {{ isId ? 'Catat Servis Pertama' : 'Log First Service' }}
          </button>
        </div>

        <div v-else class="card shadow-sm border-0">
          <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
              <thead class="table-light">
                <tr>
                  <th>{{ isId ? 'Tanggal' : 'Date' }}</th>
                  <th>{{ isId ? 'Aset' : 'Asset' }}</th>
                  <th>{{ isId ? 'Aktivitas Servis' : 'Activity' }}</th>
                  <th>{{ isId ? 'Bengkel / Teknisi' : 'Performed By' }}</th>
                  <th class="text-end">{{ isId ? 'Biaya' : 'Cost' }}</th>
                  <th>{{ isId ? 'Keuangan' : 'Ledger' }}</th>
                  <th class="text-center">{{ isId ? 'Aksi' : 'Actions' }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="l in assetStore.filteredLogs" :key="l.id">
                  <td>
                    <span class="fw-medium">{{ l.performed_date }}</span>
                    <div v-if="l.odometer" class="small text-muted font-monospace">
                      {{ Number(l.odometer).toLocaleString('id-ID') }} km
                    </div>
                  </td>
                  <td>
                    <div class="fw-bold text-primary">{{ l.asset?.name || '-' }}</div>
                    <div v-if="l.asset?.license_plate" class="badge bg-dark-subtle text-dark-emphasis font-monospace">
                      {{ l.asset.license_plate }}
                    </div>
                  </td>
                  <td>
                    <div class="fw-semibold">{{ l.title }}</div>
                    <div v-if="l.description" class="small text-muted text-truncate" style="max-width: 250px;">
                      {{ l.description }}
                    </div>
                  </td>
                  <td>
                    <div>{{ l.performed_by || '-' }}</div>
                    <div v-if="l.member" class="small text-muted">
                      PJ: {{ l.member.name }}
                    </div>
                  </td>
                  <td class="text-end fw-bold text-danger">
                    Rp {{ Number(l.cost || 0).toLocaleString('id-ID') }}
                  </td>
                  <td>
                    <span v-if="l.transaction_id" class="badge bg-success-subtle text-success border border-success-subtle">
                      <i class="bi bi-link-45deg me-1"></i>Tercatat
                    </span>
                    <span v-else class="text-muted small">-</span>
                  </td>
                  <td class="text-center">
                    <div class="d-flex justify-content-center gap-2">
                      <button
                        v-if="l.invoice_url"
                        type="button"
                        class="btn btn-sm btn-outline-secondary p-1"
                        title="Lihat Nota"
                        @click="viewInvoice(l.invoice_url)"
                      >
                        <i class="bi bi-receipt"></i>
                      </button>
                      <button
                        type="button"
                        class="btn btn-sm text-danger p-1 border-0"
                        @click="confirmDeleteLog(l)"
                      >
                        <i class="bi bi-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- TAB 4: WARRANTIES HUB -->
      <section v-if="activeTab === 'warranties'">
        <div class="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
          <!-- Status Filters -->
          <div class="btn-group btn-group-sm">
            <button
              class="btn"
              :class="assetStore.filterWarrantyStatus === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
              @click="assetStore.filterWarrantyStatus = 'all'"
            >
              {{ isId ? 'Semua' : 'All' }}
            </button>
            <button
              class="btn"
              :class="assetStore.filterWarrantyStatus === 'expiring_soon' ? 'btn-warning' : 'btn-outline-warning'"
              @click="assetStore.filterWarrantyStatus = 'expiring_soon'"
            >
              <i class="bi bi-shield-exclamation me-1"></i>
              {{ isId ? 'Segera Habis (<30 Hari)' : 'Expiring Soon' }} ({{ assetStore.expiringWarrantiesCount }})
            </button>
            <button
              class="btn"
              :class="assetStore.filterWarrantyStatus === 'active' ? 'btn-success' : 'btn-outline-success'"
              @click="assetStore.filterWarrantyStatus = 'active'"
            >
              <i class="bi bi-shield-check me-1"></i>
              {{ isId ? 'Aktif' : 'Active' }}
            </button>
            <button
              class="btn"
              :class="assetStore.filterWarrantyStatus === 'expired' ? 'btn-danger' : 'btn-outline-danger'"
              @click="assetStore.filterWarrantyStatus = 'expired'"
            >
              {{ isId ? 'Kedaluwarsa' : 'Expired' }} ({{ assetStore.expiredWarrantiesCount }})
            </button>
          </div>

          <button
            type="button"
            class="btn btn-warning text-dark btn-sm d-flex align-items-center gap-1 shadow-sm"
            @click="openWarrantyModal()"
          >
            <i class="bi bi-plus-circle"></i>
            <span>{{ isId ? 'Tambah Garansi' : 'Add Warranty' }}</span>
          </button>
        </div>

        <div v-if="assetStore.filteredWarranties.length === 0" class="empty-state-box text-center py-5 p-4 rounded-4 border">
          <i class="bi bi-shield-slash display-3 text-muted opacity-50 d-block mb-3"></i>
          <h5 class="fw-bold mb-1">{{ isId ? 'Tidak Ada Garansi Terdaftar' : 'No Warranties Found' }}</h5>
          <p class="text-muted small mb-3">
            {{ isId ? 'Simpan kartu garansi, bukti pembelian, dan tanggal berakhirnya garansi barang Anda.' : 'Safeguard your warranty cards and claim deadlines.' }}
          </p>
          <button type="button" class="btn btn-warning text-dark btn-sm px-3" @click="openWarrantyModal()">
            <i class="bi bi-plus-circle me-1"></i> {{ isId ? 'Tambah Garansi Sekarang' : 'Add Warranty' }}
          </button>
        </div>

        <div v-else class="row g-3">
          <div
            v-for="w in assetStore.filteredWarranties"
            :key="w.id"
            class="col-12 col-md-6 col-lg-4"
          >
            <div class="card h-100 border shadow-sm p-3">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge rounded-pill" :class="warrantyStatusClass(w)">
                  {{ warrantyStatusLabel(w) }}
                </span>
                <span class="text-muted small text-capitalize">{{ w.warranty_type }}</span>
              </div>

              <h6 class="fw-bold mb-1">{{ w.provider_name }}</h6>
              <div class="text-primary small mb-2 d-flex align-items-center gap-1">
                <i class="bi bi-box-seam"></i>
                <span class="fw-medium">{{ w.asset?.name || 'Aset' }}</span>
              </div>

              <div class="small text-muted mb-2">
                <div>
                  <i class="bi bi-calendar-range me-1"></i>
                  <span>{{ w.start_date }} s/d <strong>{{ w.end_date || 'Seumur Hidup' }}</strong></span>
                </div>
                <div v-if="w.policy_number" class="font-monospace">
                  <i class="bi bi-file-earmark-text me-1"></i>
                  <span>No. Polis: {{ w.policy_number }}</span>
                </div>
                <div v-if="w.provider_contact">
                  <i class="bi bi-telephone me-1"></i>
                  <span>Kontak: {{ w.provider_contact }}</span>
                </div>
              </div>

              <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top gap-2">
                <button
                  v-if="w.document_url"
                  type="button"
                  class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                  @click="viewInvoice(w.document_url)"
                >
                  <i class="bi bi-file-earmark-image"></i>
                  <span>{{ isId ? 'Lihat Kartu' : 'View Card' }}</span>
                </button>
                <span v-else class="text-muted small fst-italic">Tanpa lampiran</span>

                <div class="dropdown ms-auto">
                  <button class="btn btn-sm btn-light border dropdown-toggle no-caret" type="button" data-bs-toggle="dropdown">
                    <i class="bi bi-three-dots-vertical"></i>
                  </button>
                  <ul class="dropdown-menu dropdown-menu-end shadow-sm">
                    <li>
                      <a class="dropdown-item" href="#" @click.prevent="openWarrantyModal(null, w)">
                        <i class="bi bi-pencil me-2 text-primary"></i>{{ isId ? 'Ubah' : 'Edit' }}
                      </a>
                    </li>
                    <li>
                      <a class="dropdown-item text-danger" href="#" @click.prevent="confirmDeleteWarranty(w)">
                        <i class="bi bi-trash me-2"></i>{{ isId ? 'Hapus' : 'Delete' }}
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Modals -->
    <AssetModal
      v-if="showAssetModal"
      :asset="selectedAssetForEdit"
      @close="showAssetModal = false"
      @save="handleSaveAsset"
    />

    <AssetDetailModal
      v-if="showDetailModal && activeDetailAsset"
      :asset="activeDetailAsset"
      @close="showDetailModal = false"
      @edit="openAssetModalFromDetail"
      @add-warranty="openWarrantyModal"
      @delete-warranty="handleDeleteWarrantyDirect"
      @add-schedule="openScheduleModal"
      @delete-schedule="handleDeleteScheduleDirect"
      @log-service="openLogModal"
      @delete-log="handleDeleteLogDirect"
      @sync-scheduler="handleSyncScheduler"
    />

    <MaintenanceScheduleModal
      v-if="showScheduleModal"
      :schedule="selectedScheduleForEdit"
      :preselectedAssetId="preselectedAssetId"
      :assets="assetStore.assets"
      @close="showScheduleModal = false"
      @save="handleSaveSchedule"
    />

    <MaintenanceLogModal
      v-if="showLogModal"
      :log="selectedLogForEdit"
      :preselectedAssetId="preselectedAssetId"
      :preselectedScheduleId="preselectedScheduleId"
      :assets="assetStore.assets"
      :schedules="assetStore.schedules"
      @close="showLogModal = false"
      @save="handleSaveLog"
    />

    <WarrantyModal
      v-if="showWarrantyModal"
      :warranty="selectedWarrantyForEdit"
      :preselectedAssetId="preselectedAssetId"
      :assets="assetStore.assets"
      @close="showWarrantyModal = false"
      @save="handleSaveWarranty"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useLocaleStore } from '../stores/locale';
import { useAssetStore } from '../stores/assets';
import { useToastStore } from '../stores/toast';
import { getReceiptSignedUrl } from '../services/storageService';

import AssetFilterBar from '../components/assets/AssetFilterBar.vue';
import AssetCard from '../components/assets/AssetCard.vue';
import AssetModal from '../components/assets/AssetModal.vue';
import AssetDetailModal from '../components/assets/AssetDetailModal.vue';
import MaintenanceScheduleModal from '../components/assets/MaintenanceScheduleModal.vue';
import MaintenanceLogModal from '../components/assets/MaintenanceLogModal.vue';
import WarrantyModal from '../components/assets/WarrantyModal.vue';

const localeStore = useLocaleStore();
const isId = computed(() => localeStore.currentLocale === 'id');

const assetStore = useAssetStore();
const toastStore = useToastStore();

const activeTab = computed({
  get: () => assetStore.activeTab,
  set: (val) => {
    assetStore.activeTab = val;
  },
});

// Modal toggles & states
const showAssetModal = ref(false);
const selectedAssetForEdit = ref(null);

const showDetailModal = ref(false);
const activeDetailAsset = ref(null);

const showScheduleModal = ref(false);
const selectedScheduleForEdit = ref(null);
const preselectedAssetId = ref('');
const preselectedScheduleId = ref('');

const showLogModal = ref(false);
const selectedLogForEdit = ref(null);

const showWarrantyModal = ref(false);
const selectedWarrantyForEdit = ref(null);

onMounted(async () => {
  await assetStore.fetchAll();
});

const formattedValuation = computed(() => {
  return Number(assetStore.totalAssetValuation || 0).toLocaleString('id-ID');
});

const categoryCounts = computed(() => {
  const counts = {
    all: assetStore.assets.length,
    vehicle: 0,
    appliance: 0,
    electronics: 0,
    property: 0,
    furniture: 0,
    other: 0,
  };
  assetStore.assets.forEach((a) => {
    if (counts[a.category] !== undefined) {
      counts[a.category]++;
    } else {
      counts.other++;
    }
  });
  return counts;
});

// Modal openers
function openAssetModal(asset = null) {
  selectedAssetForEdit.value = asset;
  showAssetModal.value = true;
}

function openAssetModalFromDetail(asset) {
  showDetailModal.value = false;
  openAssetModal(asset);
}

async function openDetailModal(asset) {
  try {
    const full = await assetStore.getAssetDetails(asset.id);
    activeDetailAsset.value = full;
    showDetailModal.value = true;
  } catch (err) {
    toastStore.showToast(err.message || 'Gagal memuat detail aset', 'danger');
  }
}

function openScheduleModal(asset = null, schedule = null) {
  selectedScheduleForEdit.value = schedule;
  preselectedAssetId.value = asset ? asset.id : (schedule ? schedule.asset_id : '');
  showScheduleModal.value = true;
}

function openLogModal(asset = null, scheduleId = null) {
  selectedLogForEdit.value = null;
  preselectedAssetId.value = asset ? (asset.asset_id || asset.id) : '';
  preselectedScheduleId.value = scheduleId || (asset ? asset.schedule_id : '');
  showLogModal.value = true;
}

function openWarrantyModal(asset = null, warranty = null) {
  selectedWarrantyForEdit.value = warranty;
  preselectedAssetId.value = asset ? asset.id : (warranty ? warranty.asset_id : '');
  showWarrantyModal.value = true;
}

// Handlers for Save actions
async function handleSaveAsset(payload) {
  try {
    if (selectedAssetForEdit.value) {
      await assetStore.updateAsset(selectedAssetForEdit.value.id, payload);
      toastStore.showToast(isId.value ? 'Aset berhasil diperbarui!' : 'Asset updated successfully!', 'success');
    } else {
      await assetStore.addAsset(payload);
      toastStore.showToast(isId.value ? 'Aset baru berhasil ditambahkan!' : 'Asset added successfully!', 'success');
    }
    showAssetModal.value = false;
  } catch (err) {
    toastStore.showToast(err.message || 'Gagal menyimpan aset', 'danger');
  }
}

async function handleSaveSchedule(payload) {
  try {
    if (selectedScheduleForEdit.value) {
      await assetStore.updateSchedule(selectedScheduleForEdit.value.id, payload);
      toastStore.showToast(isId.value ? 'Jadwal servis berhasil diperbarui!' : 'Schedule updated!', 'success');
    } else {
      await assetStore.addSchedule(payload);
      toastStore.showToast(isId.value ? 'Jadwal servis baru berhasil disimpan!' : 'Schedule created!', 'success');
    }
    showScheduleModal.value = false;
    if (activeDetailAsset.value) {
      activeDetailAsset.value = await assetStore.getAssetDetails(activeDetailAsset.value.id);
    }
  } catch (err) {
    toastStore.showToast(err.message || 'Gagal menyimpan jadwal servis', 'danger');
  }
}

async function handleSaveLog({ logPayload, expenseOptions }) {
  try {
    await assetStore.addMaintenanceLog(logPayload, expenseOptions);
    toastStore.showToast(
      isId.value
        ? 'Catatan servis berhasil disimpan' + (expenseOptions ? ' & tercatat di keuangan!' : '!')
        : 'Maintenance log saved' + (expenseOptions ? ' & recorded to transactions!' : '!'),
      'success'
    );
    showLogModal.value = false;
    if (activeDetailAsset.value) {
      activeDetailAsset.value = await assetStore.getAssetDetails(activeDetailAsset.value.id);
    }
  } catch (err) {
    toastStore.showToast(err.message || 'Gagal menyimpan catatan servis', 'danger');
  }
}

async function handleSaveWarranty(payload) {
  try {
    if (selectedWarrantyForEdit.value) {
      await assetStore.updateWarranty(selectedWarrantyForEdit.value.id, payload);
      toastStore.showToast(isId.value ? 'Garansi berhasil diperbarui!' : 'Warranty updated!', 'success');
    } else {
      await assetStore.addWarranty(payload);
      toastStore.showToast(isId.value ? 'Data garansi berhasil disimpan!' : 'Warranty saved!', 'success');
    }
    showWarrantyModal.value = false;
    if (activeDetailAsset.value) {
      activeDetailAsset.value = await assetStore.getAssetDetails(activeDetailAsset.value.id);
    }
  } catch (err) {
    toastStore.showToast(err.message || 'Gagal menyimpan garansi', 'danger');
  }
}

// Handlers for Delete actions
async function confirmDeleteAsset(asset) {
  const msg = isId.value
    ? `Hapus aset "${asset.name}" beserta seluruh riwayat garansi dan servisnya?`
    : `Delete asset "${asset.name}" along with all its warranties and service history?`;
  if (confirm(msg)) {
    try {
      await assetStore.deleteAsset(asset.id);
      toastStore.showToast(isId.value ? 'Aset berhasil dihapus' : 'Asset deleted', 'info');
    } catch (err) {
      toastStore.showToast(err.message || 'Gagal menghapus aset', 'danger');
    }
  }
}

async function confirmDeleteSchedule(schedule) {
  if (confirm(isId.value ? 'Hapus jadwal servis ini?' : 'Delete this schedule?')) {
    try {
      await assetStore.deleteSchedule(schedule.id);
      toastStore.showToast(isId.value ? 'Jadwal dihapus' : 'Schedule deleted', 'info');
    } catch (err) {
      toastStore.showToast(err.message, 'danger');
    }
  }
}

async function handleDeleteScheduleDirect(scheduleId) {
  if (confirm(isId.value ? 'Hapus jadwal servis ini?' : 'Delete this schedule?')) {
    try {
      await assetStore.deleteSchedule(scheduleId);
      if (activeDetailAsset.value) {
        activeDetailAsset.value = await assetStore.getAssetDetails(activeDetailAsset.value.id);
      }
      toastStore.showToast(isId.value ? 'Jadwal dihapus' : 'Schedule deleted', 'info');
    } catch (err) {
      toastStore.showToast(err.message, 'danger');
    }
  }
}

async function confirmDeleteLog(log) {
  if (confirm(isId.value ? 'Hapus catatan riwayat servis ini?' : 'Delete this service log?')) {
    try {
      await assetStore.deleteMaintenanceLog(log.id);
      toastStore.showToast(isId.value ? 'Catatan servis dihapus' : 'Log deleted', 'info');
    } catch (err) {
      toastStore.showToast(err.message, 'danger');
    }
  }
}

async function handleDeleteLogDirect(logId) {
  if (confirm(isId.value ? 'Hapus catatan servis ini?' : 'Delete this log?')) {
    try {
      await assetStore.deleteMaintenanceLog(logId);
      if (activeDetailAsset.value) {
        activeDetailAsset.value = await assetStore.getAssetDetails(activeDetailAsset.value.id);
      }
      toastStore.showToast(isId.value ? 'Catatan servis dihapus' : 'Log deleted', 'info');
    } catch (err) {
      toastStore.showToast(err.message, 'danger');
    }
  }
}

async function confirmDeleteWarranty(warranty) {
  if (confirm(isId.value ? 'Hapus data garansi ini?' : 'Delete this warranty?')) {
    try {
      await assetStore.deleteWarranty(warranty.id);
      toastStore.showToast(isId.value ? 'Garansi dihapus' : 'Warranty deleted', 'info');
    } catch (err) {
      toastStore.showToast(err.message, 'danger');
    }
  }
}

async function handleDeleteWarrantyDirect(warrantyId) {
  if (confirm(isId.value ? 'Hapus data garansi ini?' : 'Delete this warranty?')) {
    try {
      await assetStore.deleteWarranty(warrantyId);
      if (activeDetailAsset.value) {
        activeDetailAsset.value = await assetStore.getAssetDetails(activeDetailAsset.value.id);
      }
      toastStore.showToast(isId.value ? 'Garansi dihapus' : 'Warranty deleted', 'info');
    } catch (err) {
      toastStore.showToast(err.message, 'danger');
    }
  }
}

async function handleSyncScheduler(schedule) {
  try {
    await assetStore.syncScheduleToScheduler(schedule);
    toastStore.showToast(
      isId.value
        ? `Jadwal "${schedule.title}" berhasil ditambahkan ke Jadwal & Tugas Keluarga!`
        : `Schedule "${schedule.title}" added to Family Scheduler!`,
      'success'
    );
  } catch (err) {
    toastStore.showToast(err.message || 'Gagal menyinkronkan ke kalender', 'danger');
  }
}

async function viewInvoice(url) {
  if (!url) return;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    window.open(url, '_blank');
  } else {
    try {
      const signed = await getReceiptSignedUrl(url);
      if (signed) window.open(signed, '_blank');
    } catch {
      alert('Gagal membuka nota.');
    }
  }
}

function scheduleUrgencyClass(s) {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  if (s.next_due_date && s.next_due_date < today) return 'bg-danger text-white';
  if (s.next_due_date && s.next_due_date <= nextWeek) return 'bg-warning text-dark';
  return 'bg-info text-white';
}

function scheduleUrgencyLabel(s) {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
  if (s.next_due_date && s.next_due_date < today) return isId.value ? 'Terlambat (Overdue)' : 'Overdue';
  if (s.next_due_date && s.next_due_date <= nextWeek) return isId.value ? 'Jatuh Tempo Segera' : 'Due Soon';
  return isId.value ? 'Mendatang' : 'Upcoming';
}

function warrantyStatusClass(w) {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  if (w.end_date && w.end_date < today) return 'bg-danger text-white';
  if (w.end_date && w.end_date <= nextMonth) return 'bg-warning text-dark';
  return 'bg-success text-white';
}

function warrantyStatusLabel(w) {
  const today = new Date().toISOString().split('T')[0];
  const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  if (w.end_date && w.end_date < today) return isId.value ? 'Garansi Habis' : 'Expired';
  if (w.end_date && w.end_date <= nextMonth) return isId.value ? 'Segera Habis (<30 Hari)' : 'Expiring Soon';
  return isId.value ? 'Garansi Aktif' : 'Active';
}
</script>

<style scoped>
.assets-hero {
  background: var(--card-bg, rgba(255, 255, 255, 0.7));
  border: var(--card-border, 1px solid rgba(226, 232, 240, 0.8));
  backdrop-filter: blur(12px);
}

.text-gradient {
  background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.metric-card {
  background: rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: all 0.2s ease;
}

.metric-card:hover {
  background: rgba(102, 126, 234, 0.08);
  transform: translateY(-2px);
}

.metric-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
}

.xsmall {
  font-size: 0.72rem;
}

.pulse-badge {
  animation: pulse-glow 2s infinite;
}

@keyframes pulse-glow {
  0% { transform: scale(1); }
  50% { transform: scale(1.04); }
  100% { transform: scale(1); }
}

.main-tabs-wrapper {
  overflow-x: auto;
  white-space: nowrap;
  -webkit-overflow-scrolling: touch;
}

.main-tabs-pills {
  background: var(--card-bg, rgba(255, 255, 255, 0.7));
  border: var(--card-border, 1px solid rgba(226, 232, 240, 0.8));
  display: inline-flex;
}

.tab-pill-btn {
  color: var(--text-color, #1e293b);
  border-radius: 8px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s ease;
}

.tab-pill-btn.active {
  background: var(--primary-gradient, linear-gradient(135deg, #667eea 0%, #764ba2 100%));
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.25);
}

.tab-pill-btn.active .badge {
  background: rgba(255, 255, 255, 0.25) !important;
  color: #ffffff !important;
}

.empty-state-box {
  background: var(--card-bg, rgba(255, 255, 255, 0.5));
}

.no-caret::after {
  display: none;
}
</style>
