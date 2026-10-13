<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content custom-modal">
        <!-- Header -->
        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
            <i :class="isEdit ? 'bi bi-pencil-square text-primary' : 'bi bi-plus-circle text-primary'"></i>
            <span>{{ isEdit ? ($t('assets.editAsset') || 'Ubah Aset') : ($t('assets.addAsset') || 'Tambah Aset Baru') }}</span>
          </h5>
          <button type="button" class="btn-close" @click="$emit('close')"></button>
        </div>

        <!-- Body -->
        <div class="modal-body p-3 p-md-4">
          <div v-if="errorMessage" class="alert alert-danger py-2 small mb-3">
            {{ errorMessage }}
          </div>

          <form @submit.prevent="handleSubmit">
            <!-- Row 1: Name & Category -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-7">
                <label class="form-label fw-semibold small">
                  {{ $t('assets.name') || 'Nama Aset' }} <span class="text-danger">*</span>
                </label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Toyota Avanza, AC Daikin Ruang Tamu..."
                  required
                />
              </div>

              <div class="col-12 col-md-5">
                <label class="form-label fw-semibold small">
                  {{ $t('assets.category') || 'Kategori' }} <span class="text-danger">*</span>
                </label>
                <select v-model="form.category" class="form-select" required>
                  <option value="vehicle">{{ $t('assets.categories.vehicle') || 'Kendaraan' }}</option>
                  <option value="appliance">{{ $t('assets.categories.appliance') || 'Peralatan Rumah' }}</option>
                  <option value="electronics">{{ $t('assets.categories.electronics') || 'Elektronik & Gadget' }}</option>
                  <option value="property">{{ $t('assets.categories.property') || 'Fasilitas & Properti' }}</option>
                  <option value="furniture">{{ $t('assets.categories.furniture') || 'Furnitur & Interior' }}</option>
                  <option value="other">{{ $t('assets.categories.other') || 'Lainnya' }}</option>
                </select>
              </div>
            </div>

            <!-- Vehicle Conditional Section -->
            <div v-if="form.category === 'vehicle'" class="vehicle-specs-box p-3 rounded mb-3 border">
              <div class="d-flex align-items-center gap-2 mb-2 text-primary fw-semibold small">
                <i class="bi bi-car-front"></i>
                <span>{{ $t('assets.vehicleSpecs') || 'Spesifikasi Kendaraan' }}</span>
              </div>
              <div class="row g-3">
                <div class="col-12 col-md-6">
                  <label class="form-label small">{{ $t('assets.licensePlate') || 'Plat Nomor' }}</label>
                  <input
                    v-model="form.license_plate"
                    type="text"
                    class="form-control text-uppercase"
                    placeholder="Contoh: B 1234 XYZ"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <label class="form-label small">{{ $t('assets.currentOdometer') || 'Odometer Saat Ini (km)' }}</label>
                  <div class="input-group">
                    <input
                      v-model.number="form.current_odometer"
                      type="number"
                      min="0"
                      class="form-control"
                      placeholder="0"
                    />
                    <span class="input-group-text">km</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Row 2: Brand & Model -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.brand') || 'Merk / Pabrikan' }}</label>
                <input
                  v-model="form.brand"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Honda, Daikin, LG"
                />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.model') || 'Model / Tipe' }}</label>
                <input
                  v-model="form.model"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Vario 160, FTKQ25"
                />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.serialNumber') || 'Nomor Seri / No. Rangka' }}</label>
                <input
                  v-model="form.serial_number"
                  type="text"
                  class="form-control"
                  placeholder="Serial No / IMEI"
                />
              </div>
            </div>

            <!-- Row 3: Financial Details -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.purchaseDate') || 'Tanggal Pembelian' }}</label>
                <input
                  v-model="form.purchase_date"
                  type="date"
                  class="form-control"
                />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.purchasePrice') || 'Harga Beli (Rp)' }}</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    v-model.number="form.purchase_price"
                    type="number"
                    min="0"
                    step="1000"
                    class="form-control"
                    placeholder="0"
                  />
                </div>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.currentValue') || 'Estimasi Nilai Sekarang (Rp)' }}</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    v-model.number="form.current_value"
                    type="number"
                    min="0"
                    step="1000"
                    class="form-control"
                    placeholder="Nilai taksiran saat ini"
                  />
                </div>
              </div>
            </div>

            <!-- Row 4: Location, Custodian & Status -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.location') || 'Lokasi / Ruangan' }}</label>
                <input
                  v-model="form.location"
                  type="text"
                  class="form-control"
                  placeholder="Contoh: Garasi, Dapur, Kamar Utama"
                />
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.assignedMember') || 'Penanggung Jawab / Pemakai' }}</label>
                <select v-model="form.assigned_member_id" class="form-select">
                  <option :value="null">{{ $t('assets.unassigned') || 'Seluruh Keluarga (Bersama)' }}</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">
                    {{ m.name }} ({{ m.role }})
                  </option>
                </select>
              </div>
              <div class="col-12 col-md-4">
                <label class="form-label small">{{ $t('assets.status') || 'Status Kondisi' }}</label>
                <select v-model="form.status" class="form-select">
                  <option value="active">{{ $t('assets.statusActive') || 'Aktif Digunakan' }}</option>
                  <option value="under_repair">{{ $t('assets.statusUnderRepair') || 'Dalam Perbaikan' }}</option>
                  <option value="disposed">{{ $t('assets.statusDisposed') || 'Rusak / Dibuang' }}</option>
                  <option value="sold">{{ $t('assets.statusSold') || 'Terjual' }}</option>
                </select>
              </div>
            </div>

            <!-- Row 5: Photo Upload / Image URL -->
            <div class="mb-3">
              <label class="form-label small fw-semibold">
                {{ $t('assets.photo') || 'Foto Aset / Bukti Fisik' }}
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
              <div v-if="previewUrl || form.image_url" class="mt-2 position-relative d-inline-block">
                <img
                  :src="previewUrl || form.image_url"
                  alt="Preview"
                  class="rounded border object-fit-cover shadow-sm"
                  style="width: 90px; height: 90px;"
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

            <!-- Row 6: Notes -->
            <div class="mb-3">
              <label class="form-label small">{{ $t('assets.notes') || 'Catatan Tambahan' }}</label>
              <textarea
                v-model="form.notes"
                rows="2"
                class="form-control"
                placeholder="Catatan servis sebelumnya, riwayat garansi, dealer pembelian..."
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
                <span>{{ isEdit ? ($t('common.saveChanges') || 'Simpan Perubahan') : ($t('assets.createAsset') || 'Simpan Aset') }}</span>
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
import { uploadReceipt } from '../../services/storageService';

const props = defineProps({
  asset: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'save']);

const authStore = useAuthStore();
const memberStore = useMemberStore();

const isEdit = computed(() => !!props.asset);
const members = computed(() => memberStore.members || []);

const saving = ref(false);
const uploading = ref(false);
const errorMessage = ref('');
const previewUrl = ref('');

const form = reactive({
  name: '',
  category: 'appliance',
  brand: '',
  model: '',
  serial_number: '',
  purchase_date: '',
  purchase_price: null,
  current_value: null,
  location: '',
  assigned_member_id: null,
  status: 'active',
  image_url: '',
  notes: '',
  license_plate: '',
  current_odometer: 0,
});

onMounted(async () => {
  if (memberStore.members.length === 0) {
    await memberStore.fetchMembers();
  }

  if (props.asset) {
    Object.assign(form, {
      name: props.asset.name || '',
      category: props.asset.category || 'appliance',
      brand: props.asset.brand || '',
      model: props.asset.model || '',
      serial_number: props.asset.serial_number || '',
      purchase_date: props.asset.purchase_date || '',
      purchase_price: props.asset.purchase_price ?? null,
      current_value: props.asset.current_value ?? null,
      location: props.asset.location || '',
      assigned_member_id: props.asset.assigned_member_id ?? null,
      status: props.asset.status || 'active',
      image_url: props.asset.image_url || '',
      notes: props.asset.notes || '',
      license_plate: props.asset.license_plate || '',
      current_odometer: props.asset.current_odometer ?? 0,
    });
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
    form.image_url = storagePath;
  } catch (err) {
    errorMessage.value = err.message || 'Gagal mengunggah foto aset.';
    previewUrl.value = '';
  } finally {
    uploading.value = false;
  }
}

function clearImage() {
  form.image_url = '';
  previewUrl.value = '';
}

async function handleSubmit() {
  if (!form.name.trim()) {
    errorMessage.value = 'Nama aset wajib diisi.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      name: form.name.trim(),
      category: form.category,
      brand: form.brand?.trim() || null,
      model: form.model?.trim() || null,
      serial_number: form.serial_number?.trim() || null,
      purchase_date: form.purchase_date || null,
      purchase_price: form.purchase_price !== null ? Number(form.purchase_price) : 0,
      current_value: form.current_value !== null ? Number(form.current_value) : null,
      location: form.location?.trim() || null,
      assigned_member_id: form.assigned_member_id || null,
      status: form.status,
      image_url: form.image_url || null,
      notes: form.notes?.trim() || null,
      license_plate: form.category === 'vehicle' ? form.license_plate?.trim().toUpperCase() || null : null,
      current_odometer: form.category === 'vehicle' ? Number(form.current_odometer || 0) : 0,
    };

    emit('save', payload);
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan aset.';
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
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.15);
}

.vehicle-specs-box {
  background: rgba(99, 102, 241, 0.05);
  border-color: rgba(99, 102, 241, 0.2) !important;
}

[data-theme="dark"] .vehicle-specs-box {
  background: rgba(99, 102, 241, 0.1);
  border-color: rgba(99, 102, 241, 0.3) !important;
}
</style>
