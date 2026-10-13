<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content custom-modal">
        <!-- Header -->
        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
            <i class="bi bi-tools text-success"></i>
            <span>{{ isEdit ? ($t('assets.editLog') || 'Ubah Riwayat Servis') : ($t('assets.logServiceTitle') || 'Catat Servis / Perawatan Selesai') }}</span>
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-3 p-md-4">
          <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleSubmit">
            <!-- Row 1: Select Asset & Linked Schedule -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label fw-semibold small">
                  {{ $t('assets.selectAsset') || 'Pilih Aset' }} <span class="text-danger">*</span>
                </label>
                <select
                  v-model="form.asset_id"
                  class="form-select"
                  required
                  :disabled="isAssetLocked"
                  @change="onAssetChange"
                >
                  <option :value="''" disabled>-- {{ $t('assets.selectAssetPlaceholder') || 'Pilih aset keluarga' }} --</option>
                  <option v-for="a in assets" :key="a.id" :value="a.id">
                    {{ a.name }} ({{ a.category }}<template v-if="a.license_plate"> - {{ a.license_plate }}</template>)
                  </option>
                </select>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label small">
                  {{ $t('assets.linkedSchedule') || 'Terkait Jadwal Servis (Opsional)' }}
                </label>
                <select
                  v-model="form.schedule_id"
                  class="form-select"
                  @change="onScheduleChange"
                >
                  <option :value="null">-- Tidak Terkait Jadwal (Servis Insidental) --</option>
                  <option v-for="s in availableSchedules" :key="s.id" :value="s.id">
                    {{ s.title }} (Setiap {{ s.interval_value }} {{ s.frequency_type }})
                  </option>
                </select>
                <div v-if="form.schedule_id" class="form-text small text-success">
                  <i class="bi bi-arrow-repeat me-1"></i>Jadwal ini akan otomatis diperbarui ke tanggal jatuh tempo berikutnya.
                </div>
              </div>
            </div>

            <!-- Row 2: Title & Performed Date -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-7">
                <label class="form-label fw-semibold small">
                  {{ $t('assets.serviceTitle') || 'Aktivitas Servis / Perawatan' }} <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.title"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Ganti Oli Mesin & Filter, Cuci AC 2 Unit..."
                  required
                />
              </div>

              <div class="col-12 col-md-5">
                <label class="form-label fw-semibold small">
                  {{ $t('assets.performedDate') || 'Tanggal Pengerjaan' }} <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.performed_date"
                  type="date"
                  class="form-control"
                  required
                />
              </div>
            </div>

            <!-- Row 3: Performed By & Odometer -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label small">
                  {{ $t('assets.performedBy') || 'Bengkel / Teknisi / Pelaksana' }}
                </label>
                <input
                  v-model="form.performed_by"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Bengkel Auto2000, Teknisi Mandiri, Budi AC"
                />
              </div>

              <div v-if="selectedAsset?.category === 'vehicle'" class="col-12 col-md-6">
                <label class="form-label small">
                  {{ $t('assets.odometerAtService') || 'Odometer Saat Servis (km)' }}
                </label>
                <div class="input-group">
                  <input
                    v-model.number="form.odometer"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="Contoh: 45000"
                  />
                  <span class="input-group-text">km</span>
                </div>
                <div class="form-text small text-muted">
                  Odometer aset akan otomatis diperbarui jika nilai ini lebih tinggi.
                </div>
              </div>

              <div :class="selectedAsset?.category === 'vehicle' ? 'col-12 col-md-6' : 'col-12 col-md-6'">
                <label class="form-label small">{{ $t('assets.performedMember') || 'Anggota Keluarga yang Mengurus' }}</label>
                <select v-model="form.performed_member_id" class="form-select">
                  <option :value="null">{{ $t('assets.unassigned') || 'Pilih Anggota Keluarga' }}</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">
                    {{ m.name }} ({{ m.role }})
                  </option>
                </select>
              </div>

              <div :class="selectedAsset?.category === 'vehicle' ? 'col-12 col-md-6' : 'col-12 col-md-6'">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.serviceCost') || 'Biaya Servis & Suku Cadang (Rp)' }} <span class="text-danger">*</span>
                </label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    v-model.number="form.cost"
                    type="number"
                    min="0"
                    step="1000"
                    class="form-control"
                    placeholder="0"
                    required
                  />
                </div>
              </div>
            </div>

            <!-- Financial Cross-Posting Section -->
            <div v-if="!isEdit" class="financial-expense-box p-3 rounded mb-3 border">
              <div class="form-check form-switch mb-2">
                <input
                  v-model="expenseSync.createExpense"
                  class="form-check-input"
                  type="checkbox"
                  id="recordExpenseToggle"
                />
                <label class="form-check-label fw-semibold small text-primary" for="recordExpenseToggle">
                  <i class="bi bi-wallet2 me-1"></i>
                  {{ $t('assets.recordAsExpense') || 'Catat Otomatis sebagai Pengeluaran Keuangan' }}
                </label>
              </div>

              <div v-if="expenseSync.createExpense" class="row g-2 pt-2 border-top">
                <div class="col-12 col-md-6">
                  <label class="form-label small">{{ $t('accounts.account') || 'Sumber Akun / Dompet' }} <span class="text-danger">*</span></label>
                  <select v-model="expenseSync.accountId" class="form-select form-select-sm" required>
                    <option :value="''" disabled>-- Pilih Rekening / Dompet --</option>
                    <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                      {{ acc.name }} (Saldo: Rp {{ Number(acc.balance || 0).toLocaleString('id-ID') }})
                    </option>
                  </select>
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label small">{{ $t('categories.category') || 'Kategori Pengeluaran' }}</label>
                  <select v-model="expenseSync.categoryId" class="form-select form-select-sm">
                    <option :value="null">-- Pilih Kategori --</option>
                    <option v-for="cat in expenseCategories" :key="cat.id" :value="cat.id">
                      {{ cat.name }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Row 4: Invoice Upload -->
            <div class="mb-3">
              <label class="form-label small fw-semibold">
                {{ $t('assets.invoiceReceipt') || 'Unggah Foto Nota / Kwitansi Servis' }}
              </label>
              <div class="d-flex align-items-center gap-3">
                <input
                  type="file"
                  accept="image/*"
                  class="form-control"
                  @change="handleFileUpload"
                />
                <span v-if="uploading" class="spinner-border spinner-border-sm text-primary"></span>
              </div>
              <div v-if="previewUrl || form.invoice_url" class="mt-2 position-relative d-inline-block">
                <img
                  :src="previewUrl || form.invoice_url"
                  alt="Invoice"
                  class="rounded border object-fit-cover shadow-sm"
                  style="width: 80px; height: 80px;"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-danger position-absolute top-0 end-0 rounded-circle p-0"
                  style="width: 20px; height: 20px; transform: translate(30%, -30%); line-height: 1;"
                  @click="clearImage"
                >
                  &times;
                </button>
              </div>
            </div>

            <!-- Row 5: Description & Spareparts -->
            <div class="mb-3">
              <label class="form-label small">{{ $t('assets.description') || 'Rincian Pengerjaan / Suku Cadang' }}</label>
              <textarea
                v-model="form.description"
                rows="2"
                class="form-control"
                placeholder="Rincian part yang diganti, garansi pengerjaan bengkel (misal: 1 bulan)..."
              ></textarea>
            </div>

            <!-- Footer Actions -->
            <div class="modal-footer px-0 pb-0 pt-3 border-top">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                {{ $t('common.cancel') || 'Batal' }}
              </button>
              <button
                type="submit"
                class="btn btn-success d-flex align-items-center gap-2"
                :disabled="saving || uploading"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                <i v-else class="bi bi-check-circle"></i>
                <span>{{ isEdit ? ($t('common.saveChanges') || 'Simpan Perubahan') : ($t('assets.saveLog') || 'Simpan Riwayat Servis') }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '../../stores/auth';
import { useMemberStore } from '../../stores/members';
import { useAccountStore } from '../../stores/accounts';
import { useCategoryStore } from '../../stores/categories';
import { uploadReceipt } from '../../services/storageService';

const props = defineProps({
  log: {
    type: Object,
    default: null,
  },
  preselectedAssetId: {
    type: String,
    default: '',
  },
  preselectedScheduleId: {
    type: String,
    default: '',
  },
  assets: {
    type: Array,
    default: () => [],
  },
  schedules: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'save']);

const authStore = useAuthStore();
const memberStore = useMemberStore();
const accountStore = useAccountStore();
const categoryStore = useCategoryStore();

const isEdit = computed(() => !!props.log);
const isAssetLocked = computed(() => !isEdit.value && !!props.preselectedAssetId);
const members = computed(() => memberStore.members || []);
const accounts = computed(() => accountStore.accounts || []);
const expenseCategories = computed(() => categoryStore.expenseCategories || []);

const saving = ref(false);
const uploading = ref(false);
const errorMessage = ref('');
const previewUrl = ref('');

const form = reactive({
  asset_id: '',
  schedule_id: null,
  title: '',
  performed_date: new Date().toISOString().split('T')[0],
  performed_by: '',
  cost: 0,
  odometer: null,
  invoice_url: '',
  description: '',
  performed_member_id: null,
});

const expenseSync = reactive({
  createExpense: true,
  accountId: '',
  categoryId: null,
});

const selectedAsset = computed(() => {
  return props.assets.find((a) => a.id === form.asset_id);
});

const availableSchedules = computed(() => {
  if (!form.asset_id) return [];
  return props.schedules.filter((s) => s.asset_id === form.asset_id);
});

function onAssetChange() {
  form.schedule_id = null;
  if (selectedAsset.value?.category === 'vehicle') {
    form.odometer = selectedAsset.value.current_odometer || null;
  }
}

function onScheduleChange() {
  if (form.schedule_id) {
    const s = props.schedules.find((item) => item.id === form.schedule_id);
    if (s) {
      if (!form.title) form.title = s.title;
      if (s.estimated_cost && !form.cost) form.cost = s.estimated_cost;
      if (s.assigned_member_id && !form.performed_member_id) form.performed_member_id = s.assigned_member_id;
    }
  }
}

onMounted(async () => {
  await Promise.all([
    memberStore.members.length === 0 ? memberStore.fetchMembers() : null,
    accountStore.accounts.length === 0 ? accountStore.fetchAccounts() : null,
    categoryStore.categories.length === 0 ? categoryStore.fetchCategories('expense') : null,
  ]);

  // Set default account if available
  if (accounts.value.length > 0) {
    expenseSync.accountId = accounts.value[0].id;
  }
  // Try to find default "Kendaraan" or "Perawatan Rumah" category
  const matchingCat = expenseCategories.value.find((c) =>
    c.name.toLowerCase().includes('kendaraan') || c.name.toLowerCase().includes('perawatan')
  );
  if (matchingCat) {
    expenseSync.categoryId = matchingCat.id;
  }

  if (props.log) {
    Object.assign(form, {
      asset_id: props.log.asset_id || '',
      schedule_id: props.log.schedule_id || null,
      title: props.log.title || '',
      performed_date: props.log.performed_date || new Date().toISOString().split('T')[0],
      performed_by: props.log.performed_by || '',
      cost: props.log.cost ?? 0,
      odometer: props.log.odometer ?? null,
      invoice_url: props.log.invoice_url || '',
      description: props.log.description || '',
      performed_member_id: props.log.performed_member_id || null,
    });
    expenseSync.createExpense = false; // Don't re-create expense on edit
  } else {
    if (props.preselectedAssetId) {
      form.asset_id = props.preselectedAssetId;
    }
    if (props.preselectedScheduleId) {
      form.schedule_id = props.preselectedScheduleId;
      onScheduleChange();
    }
  }
});

async function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  uploading.value = true;
  errorMessage.value = '';

  try {
    previewUrl.value = URL.createObjectURL(file);
    const familyId = authStore.familyId;
    const storagePath = await uploadReceipt(file, familyId);
    form.invoice_url = storagePath;
  } catch (err) {
    errorMessage.value = err.message || 'Gagal mengunggah nota servis.';
    previewUrl.value = '';
  } finally {
    uploading.value = false;
  }
}

function clearImage() {
  form.invoice_url = '';
  previewUrl.value = '';
}

async function handleSubmit() {
  if (!form.asset_id) {
    errorMessage.value = 'Silakan pilih aset.';
    return;
  }
  if (!form.title.trim()) {
    errorMessage.value = 'Aktivitas servis wajib diisi.';
    return;
  }
  if (expenseSync.createExpense && !expenseSync.accountId && Number(form.cost) > 0) {
    errorMessage.value = 'Silakan pilih rekening/dompet untuk pencatatan pengeluaran.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  try {
    const logPayload = {
      asset_id: form.asset_id,
      schedule_id: form.schedule_id || null,
      title: form.title.trim(),
      performed_date: form.performed_date,
      performed_by: form.performed_by?.trim() || null,
      cost: Number(form.cost || 0),
      odometer: form.odometer ? Number(form.odometer) : null,
      invoice_url: form.invoice_url || null,
      description: form.description?.trim() || null,
      performed_member_id: form.performed_member_id || null,
    };

    const expenseOptions = expenseSync.createExpense && Number(form.cost) > 0
      ? {
          createExpense: true,
          accountId: expenseSync.accountId,
          categoryId: expenseSync.categoryId,
          description: `Servis: ${form.title.trim()} (${selectedAsset.value?.name || 'Aset'})`,
        }
      : null;

    emit('save', { logPayload, expenseOptions });
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan catatan servis.';
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.custom-modal {
  border-radius: 16px;
  background: var(--modal-bg, #ffffff);
  border: var(--card-border, 1px solid rgba(226, 232, 240, 0.8));
}

.financial-expense-box {
  background: rgba(16, 185, 129, 0.05);
  border-color: rgba(16, 185, 129, 0.25) !important;
}

[data-theme="dark"] .financial-expense-box {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.3) !important;
}
</style>
