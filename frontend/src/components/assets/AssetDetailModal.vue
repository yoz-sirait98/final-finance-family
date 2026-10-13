<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-xl modal-dialog-scrollable">
      <div class="modal-content custom-modal">
        <!-- Header -->
        <div class="modal-header border-bottom py-3">
          <div class="d-flex align-items-center gap-3">
            <span class="badge rounded-pill p-2" :class="categoryThemeClass">
              <i :class="categoryIcon" class="fs-5"></i>
            </span>
            <div>
              <h5 class="modal-title fw-bold mb-0 text-truncate">{{ asset.name }}</h5>
              <div class="text-muted small">
                <span>{{ categoryLabel }}</span>
                <span v-if="asset.brand"> • {{ asset.brand }}</span>
                <span v-if="asset.model"> {{ asset.model }}</span>
                <span v-if="asset.license_plate"> • <strong class="text-body">{{ asset.license_plate }}</strong></span>
              </div>
            </div>
          </div>
          <div class="d-flex align-items-center gap-2">
            <button
              type="button"
              class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
              @click="$emit('edit', asset)"
            >
              <i class="bi bi-pencil"></i>
              <span class="d-none d-sm-inline">{{ $t('common.edit') || 'Ubah' }}</span>
            </button>
            <button type="button" class="btn-close" @click="$emit('close')"></button>
          </div>
        </div>

        <!-- Body -->
        <div class="modal-body p-3 p-md-4">
          <!-- Top KPI Banner -->
          <div class="row g-3 mb-4">
            <div class="col-6 col-md-3">
              <div class="kpi-card p-3 rounded border">
                <span class="text-muted small d-block mb-1">{{ $t('assets.estimatedValue') || 'Taksiran Nilai' }}</span>
                <h6 class="fw-bold mb-0 text-success">Rp {{ formattedValuation }}</h6>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="kpi-card p-3 rounded border">
                <span class="text-muted small d-block mb-1">{{ $t('assets.purchasePrice') || 'Harga Beli' }}</span>
                <h6 class="fw-bold mb-0 text-body">Rp {{ formattedPurchasePrice }}</h6>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="kpi-card p-3 rounded border">
                <span class="text-muted small d-block mb-1">{{ $t('assets.totalServiceCost') || 'Total Servis' }}</span>
                <h6 class="fw-bold mb-0 text-danger">Rp {{ totalServiceCost.toLocaleString('id-ID') }}</h6>
              </div>
            </div>
            <div class="col-6 col-md-3">
              <div class="kpi-card p-3 rounded border">
                <span class="text-muted small d-block mb-1">{{ $t('assets.assignedMember') || 'Pemakai / PJ' }}</span>
                <h6 class="fw-bold mb-0 text-primary text-truncate">
                  {{ asset.member?.name || ($t('assets.allFamily') || 'Bersama') }}
                </h6>
              </div>
            </div>
          </div>

          <!-- Navigation Sub-Tabs -->
          <ul class="nav nav-tabs mb-3">
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeSubTab === 'overview' }"
                @click="activeSubTab = 'overview'"
              >
                <i class="bi bi-info-circle me-1"></i>
                <span>{{ $t('assets.overview') || 'Spesifikasi' }}</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeSubTab === 'warranties' }"
                @click="activeSubTab = 'warranties'"
              >
                <i class="bi bi-shield-check me-1"></i>
                <span>{{ $t('assets.warranties') || 'Garansi' }} ({{ warranties.length }})</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeSubTab === 'schedules' }"
                @click="activeSubTab = 'schedules'"
              >
                <i class="bi bi-calendar-check me-1"></i>
                <span>{{ $t('assets.maintenanceSchedules') || 'Jadwal Servis' }} ({{ schedules.length }})</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                class="nav-link"
                :class="{ active: activeSubTab === 'logs' }"
                @click="activeSubTab = 'logs'"
              >
                <i class="bi bi-clock-history me-1"></i>
                <span>{{ $t('assets.serviceHistory') || 'Riwayat Servis' }} ({{ logs.length }})</span>
              </button>
            </li>
          </ul>

          <!-- Sub-Tab 1: Overview & Specs -->
          <div v-if="activeSubTab === 'overview'" class="tab-pane-content">
            <div class="row g-4">
              <div v-if="resolvedImageUrl" class="col-12 col-md-5">
                <div class="asset-preview-container rounded border overflow-hidden">
                  <img :src="resolvedImageUrl" alt="Asset" class="w-100 object-fit-cover" style="max-height: 280px;" />
                </div>
              </div>
              <div :class="resolvedImageUrl ? 'col-12 col-md-7' : 'col-12'">
                <div class="table-responsive">
                  <table class="table table-sm table-borderless mb-0">
                    <tbody>
                      <tr>
                        <td class="text-muted" style="width: 160px;">{{ $t('assets.category') || 'Kategori' }}</td>
                        <td class="fw-medium">{{ categoryLabel }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted">{{ $t('assets.brandModel') || 'Merk & Model' }}</td>
                        <td class="fw-medium">{{ asset.brand || '-' }} {{ asset.model || '' }}</td>
                      </tr>
                      <tr v-if="asset.serial_number">
                        <td class="text-muted">{{ $t('assets.serialNumber') || 'No Seri / Rangka' }}</td>
                        <td class="fw-medium font-monospace">{{ asset.serial_number }}</td>
                      </tr>
                      <tr v-if="asset.license_plate">
                        <td class="text-muted">{{ $t('assets.licensePlate') || 'Plat Nomor' }}</td>
                        <td>
                          <span class="badge bg-dark font-monospace">{{ asset.license_plate }}</span>
                        </td>
                      </tr>
                      <tr v-if="asset.category === 'vehicle'">
                        <td class="text-muted">{{ $t('assets.currentOdometer') || 'Odometer Saat Ini' }}</td>
                        <td class="fw-medium">{{ Number(asset.current_odometer || 0).toLocaleString('id-ID') }} km</td>
                      </tr>
                      <tr>
                        <td class="text-muted">{{ $t('assets.location') || 'Lokasi / Ruangan' }}</td>
                        <td class="fw-medium">{{ asset.location || '-' }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted">{{ $t('assets.purchaseDate') || 'Tanggal Beli' }}</td>
                        <td class="fw-medium">{{ asset.purchase_date || '-' }}</td>
                      </tr>
                      <tr>
                        <td class="text-muted">{{ $t('assets.status') || 'Status' }}</td>
                        <td>
                          <span class="badge rounded-pill" :class="statusBadgeClass">{{ statusLabel }}</span>
                        </td>
                      </tr>
                      <tr v-if="asset.notes">
                        <td class="text-muted">{{ $t('assets.notes') || 'Catatan' }}</td>
                        <td>{{ asset.notes }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- Sub-Tab 2: Warranties -->
          <div v-if="activeSubTab === 'warranties'" class="tab-pane-content">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0">{{ $t('assets.activeWarranties') || 'Perlindungan & Garansi' }}</h6>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                @click="$emit('add-warranty', asset)"
              >
                <i class="bi bi-plus-circle"></i>
                <span>{{ $t('assets.addWarranty') || 'Tambah Garansi' }}</span>
              </button>
            </div>

            <div v-if="warranties.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-shield-slash display-6 d-block mb-2 text-secondary opacity-50"></i>
              <p class="mb-0">{{ $t('assets.noWarrantiesYet') || 'Belum ada data garansi untuk aset ini.' }}</p>
            </div>

            <div v-else class="row g-3">
              <div v-for="w in warranties" :key="w.id" class="col-12 col-md-6">
                <div class="card h-100 border shadow-sm p-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge rounded-pill" :class="warrantyStatusClass(w)">
                      {{ warrantyStatusLabel(w) }}
                    </span>
                    <span class="text-muted small text-capitalize">{{ w.warranty_type }}</span>
                  </div>

                  <h6 class="fw-bold mb-1">{{ w.provider_name || ($t('assets.factoryWarranty') || 'Garansi Resmi') }}</h6>
                  <p v-if="w.policy_number" class="text-muted small font-monospace mb-2">
                    No. Polis/Klaim: {{ w.policy_number }}
                  </p>

                  <div class="small text-muted mb-2">
                    <i class="bi bi-calendar-event me-1"></i>
                    <span>{{ w.start_date }} s/d {{ w.end_date || 'Seumur Hidup (Lifetime)' }}</span>
                  </div>

                  <div v-if="w.provider_contact" class="small text-muted mb-2">
                    <i class="bi bi-telephone me-1"></i>
                    <span>Kontak: {{ w.provider_contact }}</span>
                  </div>

                  <div v-if="w.claim_instructions" class="small p-2 bg-light rounded mb-2 text-dark">
                    <strong>Cara Klaim:</strong> {{ w.claim_instructions }}
                  </div>

                  <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
                    <button
                      v-if="w.document_url"
                      type="button"
                      class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                      @click="viewDocument(w.document_url)"
                    >
                      <i class="bi bi-file-earmark-image"></i>
                      <span>{{ $t('assets.viewCard') || 'Lihat Kartu Garansi' }}</span>
                    </button>
                    <span v-else class="text-muted small fst-italic">Tanpa lampiran</span>

                    <button
                      type="button"
                      class="btn btn-sm text-danger p-0 border-0"
                      @click="$emit('delete-warranty', w.id)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sub-Tab 3: Maintenance Schedules -->
          <div v-if="activeSubTab === 'schedules'" class="tab-pane-content">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0">{{ $t('assets.maintenanceSchedules') || 'Jadwal Servis Berkala' }}</h6>
              <button
                type="button"
                class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                @click="$emit('add-schedule', asset)"
              >
                <i class="bi bi-plus-circle"></i>
                <span>{{ $t('assets.addSchedule') || 'Atur Jadwal Baru' }}</span>
              </button>
            </div>

            <div v-if="schedules.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-calendar-x display-6 d-block mb-2 text-secondary opacity-50"></i>
              <p class="mb-0">{{ $t('assets.noSchedulesYet') || 'Belum ada jadwal servis rutin untuk aset ini.' }}</p>
            </div>

            <div v-else class="row g-3">
              <div v-for="s in schedules" :key="s.id" class="col-12 col-md-6">
                <div class="card h-100 border shadow-sm p-3">
                  <div class="d-flex justify-content-between align-items-start mb-2">
                    <span class="badge rounded-pill" :class="scheduleUrgencyClass(s)">
                      {{ scheduleUrgencyLabel(s) }}
                    </span>
                    <span v-if="s.estimated_cost" class="text-muted small">
                      Est. Rp {{ Number(s.estimated_cost).toLocaleString('id-ID') }}
                    </span>
                  </div>

                  <h6 class="fw-bold mb-1">{{ s.title }}</h6>
                  <p class="text-muted small mb-2">
                    Frekuensi: Tiap {{ s.interval_value }} {{ s.frequency_type }}
                  </p>

                  <div class="small text-muted mb-2">
                    <div v-if="s.next_due_date">
                      <i class="bi bi-calendar-event me-1"></i>
                      <span>Jatuh Tempo: <strong>{{ s.next_due_date }}</strong></span>
                    </div>
                    <div v-if="s.next_due_odometer">
                      <i class="bi bi-speedometer2 me-1"></i>
                      <span>Odometer Target: <strong>{{ Number(s.next_due_odometer).toLocaleString('id-ID') }} km</strong></span>
                    </div>
                  </div>

                  <div class="d-flex justify-content-between align-items-center mt-auto pt-2 border-top gap-2">
                    <button
                      type="button"
                      class="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                      @click="$emit('log-service', { ...asset, schedule_id: s.id, schedule_title: s.title })"
                    >
                      <i class="bi bi-check2-circle"></i>
                      <span>{{ $t('assets.logServiceNow') || 'Servis Selesai' }}</span>
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm btn-outline-info d-flex align-items-center gap-1"
                      @click="$emit('sync-scheduler', s)"
                      title="Sinkronkan ke Jadwal Tugas Keluarga"
                    >
                      <i class="bi bi-calendar-plus"></i>
                      <span class="d-none d-sm-inline">Ke Kalender</span>
                    </button>

                    <button
                      type="button"
                      class="btn btn-sm text-danger p-0 border-0 ms-auto"
                      @click="$emit('delete-schedule', s.id)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Sub-Tab 4: Service History Logs -->
          <div v-if="activeSubTab === 'logs'" class="tab-pane-content">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="fw-bold mb-0">{{ $t('assets.serviceHistory') || 'Riwayat Servis & Perawatan' }}</h6>
              <button
                type="button"
                class="btn btn-sm btn-outline-success d-flex align-items-center gap-1"
                @click="$emit('log-service', asset)"
              >
                <i class="bi bi-plus-circle"></i>
                <span>{{ $t('assets.logService') || 'Catat Servis' }}</span>
              </button>
            </div>

            <div v-if="logs.length === 0" class="text-center py-4 text-muted">
              <i class="bi bi-clock-history display-6 d-block mb-2 text-secondary opacity-50"></i>
              <p class="mb-0">{{ $t('assets.noLogsYet') || 'Belum ada catatan servis untuk aset ini.' }}</p>
            </div>

            <div v-else class="table-responsive">
              <table class="table table-hover align-middle">
                <thead class="table-light">
                  <tr>
                    <th>{{ $t('common.date') || 'Tanggal' }}</th>
                    <th>{{ $t('assets.serviceTitle') || 'Aktivitas Servis' }}</th>
                    <th>{{ $t('assets.performedBy') || 'Bengkel / Teknisi' }}</th>
                    <th class="text-end">{{ $t('common.cost') || 'Biaya' }}</th>
                    <th>{{ $t('assets.linkedExpense') || 'Keuangan' }}</th>
                    <th class="text-center">{{ $t('common.actions') || 'Aksi' }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="l in logs" :key="l.id">
                    <td>
                      <span class="fw-medium">{{ l.performed_date }}</span>
                      <div v-if="l.odometer" class="small text-muted font-monospace">
                        {{ Number(l.odometer).toLocaleString('id-ID') }} km
                      </div>
                    </td>
                    <td>
                      <strong>{{ l.title }}</strong>
                      <div v-if="l.description" class="small text-muted text-truncate" style="max-width: 250px;">
                        {{ l.description }}
                      </div>
                    </td>
                    <td>
                      <span>{{ l.performed_by || '-' }}</span>
                      <div v-if="l.member" class="small text-muted">
                        Oleh: {{ l.member.name }}
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
                          @click="viewDocument(l.invoice_url)"
                        >
                          <i class="bi bi-receipt"></i>
                        </button>
                        <button
                          type="button"
                          class="btn btn-sm text-danger p-1 border-0"
                          @click="$emit('delete-log', l.id)"
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
        </div>

        <!-- Footer -->
        <div class="modal-footer border-top py-2">
          <button type="button" class="btn btn-secondary btn-sm" @click="$emit('close')">
            {{ $t('common.close') || 'Tutup' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useLocaleStore } from '../../stores/locale';
import { getReceiptSignedUrl } from '../../services/storageService';

const localeStore = useLocaleStore();
const t = (k) => localeStore.t(k);

const props = defineProps({
  asset: {
    type: Object,
    required: true,
  },
});

defineEmits([
  'close',
  'edit',
  'add-warranty',
  'delete-warranty',
  'add-schedule',
  'delete-schedule',
  'log-service',
  'delete-log',
  'sync-scheduler',
]);

const activeSubTab = ref('overview');
const resolvedImageUrl = ref(null);

const warranties = computed(() => props.asset.warranties || []);
const schedules = computed(() => props.asset.maintenance_schedules || []);
const logs = computed(() => props.asset.maintenance_logs || []);

const totalServiceCost = computed(() => {
  return logs.value.reduce((sum, l) => sum + (Number(l.cost) || 0), 0);
});

const formattedValuation = computed(() => {
  const val = Number(
    props.asset.current_value !== null && props.asset.current_value !== undefined
      ? props.asset.current_value
      : props.asset.purchase_price || 0
  );
  return val.toLocaleString('id-ID');
});

const formattedPurchasePrice = computed(() => {
  return Number(props.asset.purchase_price || 0).toLocaleString('id-ID');
});

async function resolveImage() {
  if (!props.asset.image_url) {
    resolvedImageUrl.value = null;
    return;
  }
  if (props.asset.image_url.startsWith('http://') || props.asset.image_url.startsWith('https://')) {
    resolvedImageUrl.value = props.asset.image_url;
  } else {
    try {
      resolvedImageUrl.value = await getReceiptSignedUrl(props.asset.image_url);
    } catch {
      resolvedImageUrl.value = null;
    }
  }
}

watch(() => props.asset.image_url, resolveImage);
onMounted(resolveImage);

async function viewDocument(docUrl) {
  if (!docUrl) return;
  if (docUrl.startsWith('http://') || docUrl.startsWith('https://')) {
    window.open(docUrl, '_blank');
  } else {
    try {
      const signed = await getReceiptSignedUrl(docUrl);
      if (signed) window.open(signed, '_blank');
    } catch (e) {
      alert('Gagal membuka berkas.');
    }
  }
}

const categoryThemeClass = computed(() => {
  switch (props.asset.category) {
    case 'vehicle':
      return 'bg-primary text-white';
    case 'appliance':
      return 'bg-info text-white';
    case 'electronics':
      return 'bg-success text-white';
    case 'property':
      return 'bg-warning text-dark';
    case 'furniture':
      return 'bg-secondary text-white';
    default:
      return 'bg-dark text-white';
  }
});

const categoryIcon = computed(() => {
  switch (props.asset.category) {
    case 'vehicle':
      return 'bi bi-car-front-fill';
    case 'appliance':
      return 'bi bi-plug-fill';
    case 'electronics':
      return 'bi bi-laptop';
    case 'property':
      return 'bi bi-house-gear-fill';
    case 'furniture':
      return 'bi bi-lamp-fill';
    default:
      return 'bi bi-box-seam-fill';
  }
});

const categoryLabel = computed(() => {
  return t(`assets.categories.${props.asset.category}`) || props.asset.category;
});

const statusBadgeClass = computed(() => {
  switch (props.asset.status) {
    case 'active':
      return 'bg-success text-white';
    case 'under_repair':
      return 'bg-warning text-dark';
    case 'disposed':
      return 'bg-secondary text-white';
    case 'sold':
      return 'bg-info text-dark';
    default:
      return 'bg-light text-dark';
  }
});

const statusLabel = computed(() => {
  switch (props.asset.status) {
    case 'active':
      return t('assets.statusActive') || 'Aktif Digunakan';
    case 'under_repair':
      return t('assets.statusUnderRepair') || 'Dalam Perbaikan';
    case 'disposed':
      return t('assets.statusDisposed') || 'Rusak/Dibuang';
    case 'sold':
      return t('assets.statusSold') || 'Terjual';
    default:
      return props.asset.status;
  }
});

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
  if (w.end_date && w.end_date < today) return 'Garansi Habis';
  if (w.end_date && w.end_date <= nextMonth) return 'Segera Habis (<30 Hari)';
  return 'Garansi Aktif';
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
  if (s.next_due_date && s.next_due_date < today) return 'Terlambat (Overdue)';
  if (s.next_due_date && s.next_due_date <= nextWeek) return 'Segera Jatuh Tempo';
  return 'Mendatang';
}
</script>

<style scoped>
.custom-modal {
  border-radius: 16px;
  background: var(--modal-bg, #ffffff);
  border: var(--card-border, 1px solid rgba(226, 232, 240, 0.8));
}

.kpi-card {
  background: rgba(0, 0, 0, 0.02);
}

[data-theme="dark"] .kpi-card {
  background: rgba(255, 255, 255, 0.02);
}

.nav-tabs .nav-link {
  color: var(--text-muted, #64748b);
  border: none;
  border-bottom: 2px solid transparent;
  padding: 0.5rem 1rem;
  font-weight: 500;
}

.nav-tabs .nav-link.active {
  color: var(--primary-color, #667eea);
  border-bottom: 2px solid var(--primary-color, #667eea);
  background: transparent;
}
</style>
