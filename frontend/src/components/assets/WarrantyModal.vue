<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content custom-modal">
        <!-- Header -->
        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
            <i class="bi bi-shield-check text-warning"></i>
            <span>{{ isEdit ? ($t('assets.editWarranty') || 'Ubah Garansi') : ($t('assets.addWarranty') || 'Tambah Kartu & Data Garansi') }}</span>
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-3 p-md-4">
          <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleSubmit">
            <!-- Row 1: Select Asset -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">
                {{ $t('assets.selectAsset') || 'Pilih Aset' }} <span class="text-danger">*</span>
              </label>
              <select v-model="form.asset_id" class="form-select" required :disabled="isAssetLocked">
                <option :value="''" disabled>-- {{ $t('assets.selectAssetPlaceholder') || 'Pilih aset keluarga' }} --</option>
                <option v-for="a in assets" :key="a.id" :value="a.id">
                  {{ a.name }} ({{ a.category }})
                </option>
              </select>
            </div>

            <!-- Row 2: Warranty Type & Provider -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-5">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.warrantyType') || 'Jenis Garansi' }}
                </label>
                <select v-model="form.warranty_type" class="form-select" @change="onWarrantyTypeChange">
                  <option value="manufacturer">Garansi Resmi Pabrik (Manufacturer)</option>
                  <option value="store">Garansi Toko / Distributor</option>
                  <option value="extended">Garansi Tambahan (Extended Warranty)</option>
                  <option value="lifetime">Garansi Seumur Hidup (Lifetime)</option>
                </select>
              </div>

              <div class="col-12 col-md-7">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.providerName') || 'Nama Penyedia / Pusat Servis' }} <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.provider_name"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Samsung Service Center, Dealer Resmi Toyota..."
                  required
                />
              </div>
            </div>

            <!-- Row 3: Dates -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.startDate') || 'Tanggal Mulai Berlaku' }} <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.start_date"
                  type="date"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.endDate') || 'Tanggal Berakhir Garansi' }}
                </label>
                <input
                  v-model="form.end_date"
                  type="date"
                  class="form-control"
                  :disabled="form.warranty_type === 'lifetime'"
                  :required="form.warranty_type !== 'lifetime'"
                />
                <div v-if="form.warranty_type === 'lifetime'" class="form-text small text-info">
                  Garansi berlaku seumur hidup (tanpa tanggal kedaluwarsa).
                </div>
              </div>
            </div>

            <!-- Row 4: Policy Number & Contact -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label small">{{ $t('assets.policyNumber') || 'Nomor Polis / Nomor Kartu Garansi' }}</label>
                <input
                  v-model="form.policy_number"
                  type="text"
                  class="form-control font-monospace"
                  placeholder="No. Kartu / Barcode Garansi"
                />
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label small">{{ $t('assets.providerContact') || 'Kontak Service Center / Hotline' }}</label>
                <input
                  v-model="form.provider_contact"
                  type="text"
                  class="form-control"
                  placeholder="No. Telp, Alamat, atau Link klaim"
                />
              </div>
            </div>

            <!-- Row 5: Document Upload -->
            <div class="mb-3">
              <label class="form-label small fw-semibold">
                {{ $t('assets.warrantyDocument') || 'Foto Kartu Garansi / Bukti Pembelian' }}
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
              <div v-if="previewUrl || form.document_url" class="mt-2 position-relative d-inline-block">
                <img
                  :src="previewUrl || form.document_url"
                  alt="Warranty Document"
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

            <!-- Row 6: Claim Instructions -->
            <div class="mb-3">
              <label class="form-label small">{{ $t('assets.claimInstructions') || 'Ketentuan & Syarat Klaim' }}</label>
              <textarea
                v-model="form.claim_instructions"
                rows="2"
                class="form-control"
                placeholder="Misal: Wajib bawa nota asli, garansi tidak mencakup kerusakan fisik/cairan..."
              ></textarea>
            </div>

            <!-- Footer Actions -->
            <div class="modal-footer px-0 pb-0 pt-3 border-top">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                {{ $t('common.cancel') || 'Batal' }}
              </button>
              <button
                type="submit"
                class="btn btn-primary d-flex align-items-center gap-2"
                :disabled="saving || uploading"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                <span>{{ isEdit ? ($t('common.saveChanges') || 'Simpan Perubahan') : ($t('assets.saveWarranty') || 'Simpan Garansi') }}</span>
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
import { uploadReceipt } from '../../services/storageService';

const props = defineProps({
  warranty: {
    type: Object,
    default: null,
  },
  preselectedAssetId: {
    type: String,
    default: '',
  },
  assets: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'save']);

const authStore = useAuthStore();
const isEdit = computed(() => !!props.warranty);
const isAssetLocked = computed(() => !isEdit.value && !!props.preselectedAssetId);

const saving = ref(false);
const uploading = ref(false);
const errorMessage = ref('');
const previewUrl = ref('');

const form = reactive({
  asset_id: '',
  warranty_type: 'manufacturer',
  provider_name: '',
  start_date: new Date().toISOString().split('T')[0],
  end_date: '',
  policy_number: '',
  provider_contact: '',
  document_url: '',
  claim_instructions: '',
  status: 'active',
});

function onWarrantyTypeChange() {
  if (form.warranty_type === 'lifetime') {
    form.end_date = '';
  } else if (!form.end_date && form.start_date) {
    // Default 1 year warranty
    const d = new Date(form.start_date);
    d.setFullYear(d.getFullYear() + 1);
    form.end_date = d.toISOString().split('T')[0];
  }
}

onMounted(() => {
  if (props.warranty) {
    Object.assign(form, {
      asset_id: props.warranty.asset_id || '',
      warranty_type: props.warranty.warranty_type || 'manufacturer',
      provider_name: props.warranty.provider_name || '',
      start_date: props.warranty.start_date || new Date().toISOString().split('T')[0],
      end_date: props.warranty.end_date || '',
      policy_number: props.warranty.policy_number || '',
      provider_contact: props.warranty.provider_contact || '',
      document_url: props.warranty.document_url || '',
      claim_instructions: props.warranty.claim_instructions || '',
      status: props.warranty.status || 'active',
    });
  } else {
    if (props.preselectedAssetId) {
      form.asset_id = props.preselectedAssetId;
      const a = props.assets.find((item) => item.id === props.preselectedAssetId);
      if (a?.purchase_date) {
        form.start_date = a.purchase_date;
        const d = new Date(a.purchase_date);
        d.setFullYear(d.getFullYear() + 1);
        form.end_date = d.toISOString().split('T')[0];
      }
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
    form.document_url = storagePath;
  } catch (err) {
    errorMessage.value = err.message || 'Gagal mengunggah foto kartu garansi.';
    previewUrl.value = '';
  } finally {
    uploading.value = false;
  }
}

function clearImage() {
  form.document_url = '';
  previewUrl.value = '';
}

async function handleSubmit() {
  if (!form.asset_id) {
    errorMessage.value = 'Silakan pilih aset.';
    return;
  }
  if (!form.provider_name.trim()) {
    errorMessage.value = 'Nama penyedia garansi wajib diisi.';
    return;
  }
  if (!form.start_date) {
    errorMessage.value = 'Tanggal mulai garansi wajib diisi.';
    return;
  }
  if (form.warranty_type !== 'lifetime' && !form.end_date) {
    errorMessage.value = 'Tanggal berakhir garansi wajib diisi.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      asset_id: form.asset_id,
      warranty_type: form.warranty_type,
      provider_name: form.provider_name.trim(),
      start_date: form.start_date,
      end_date: form.warranty_type === 'lifetime' ? null : form.end_date,
      policy_number: form.policy_number?.trim() || null,
      provider_contact: form.provider_contact?.trim() || null,
      document_url: form.document_url || null,
      claim_instructions: form.claim_instructions?.trim() || null,
      status: form.status,
    };

    emit('save', payload);
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan garansi.';
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
</style>
