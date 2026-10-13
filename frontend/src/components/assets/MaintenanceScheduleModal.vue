<template>
  <div class="modal fade show d-block" tabindex="-1" style="background-color: rgba(0,0,0,0.5);">
    <div class="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
      <div class="modal-content custom-modal">
        <!-- Header -->
        <div class="modal-header border-bottom">
          <h5 class="modal-title fw-bold d-flex align-items-center gap-2">
            <i class="bi bi-calendar-check text-primary"></i>
            <span>{{ isEdit ? ($t('assets.editSchedule') || 'Ubah Jadwal Servis') : ($t('assets.addSchedule') || 'Atur Jadwal Servis Baru') }}</span>
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
                  {{ a.name }} ({{ a.category }}<template v-if="a.license_plate"> - {{ a.license_plate }}</template>)
                </option>
              </select>
            </div>

            <!-- Quick Template Chips -->
            <div class="mb-3">
              <span class="text-muted small d-block mb-1">{{ $t('assets.quickSuggestions') || 'Saran Cepat:' }}</span>
              <div class="d-flex flex-wrap gap-1">
                <button
                  v-for="tpl in quickTemplates"
                  :key="tpl.title"
                  type="button"
                  class="btn btn-sm btn-outline-secondary py-0 px-2"
                  style="font-size: 0.78rem;"
                  @click="applyTemplate(tpl)"
                >
                  {{ tpl.title }}
                </button>
              </div>
            </div>

            <!-- Row 2: Routine Title -->
            <div class="mb-3">
              <label class="form-label fw-semibold small">
                {{ $t('assets.serviceRoutineTitle') || 'Nama / Aktivitas Pemeliharaan' }} <span class="text-danger">*</span>
              </label>
              <input
                v-model="form.title"
                type="text"
                class="form-control"
                placeholder="Contoh: Ganti Oli Mesin, Cuci AC, Pajak STNK..."
                required
              />
            </div>

            <!-- Row 3: Frequency & Interval -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.frequencyType') || 'Jenis Interval Pengulangan' }}
                </label>
                <select v-model="form.frequency_type" class="form-select" @change="onFrequencyChange">
                  <option value="months">Berdasarkan Bulan (Setiap X Bulan)</option>
                  <option value="days">Berdasarkan Hari (Setiap X Hari)</option>
                  <option value="odometer">Berdasarkan Jarak Tempuh (Setiap X km)</option>
                  <option value="one_time">Sekali Saja (One-Time)</option>
                </select>
              </div>

              <div v-if="form.frequency_type !== 'one_time'" class="col-12 col-md-6">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.intervalValue') || 'Interval Setiap' }}
                </label>
                <div class="input-group">
                  <input
                    v-model.number="form.interval_value"
                    type="number"
                    min="1"
                    class="form-control"
                    placeholder="3"
                    required
                  />
                  <span class="input-group-text">
                    {{ form.frequency_type === 'months' ? 'Bulan' : (form.frequency_type === 'odometer' ? 'km' : 'Hari') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Row 4: Next Due Targets -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.nextDueDate') || 'Tanggal Jatuh Tempo Berikutnya' }}
                </label>
                <input
                  v-model="form.next_due_date"
                  type="date"
                  class="form-control"
                />
              </div>

              <div v-if="selectedAsset?.category === 'vehicle' || form.frequency_type === 'odometer'" class="col-12 col-md-6">
                <label class="form-label small fw-semibold">
                  {{ $t('assets.nextDueOdometer') || 'Odometer Jatuh Tempo (km)' }}
                </label>
                <div class="input-group">
                  <input
                    v-model.number="form.next_due_odometer"
                    type="number"
                    min="0"
                    class="form-control"
                    placeholder="Contoh: 50000"
                  />
                  <span class="input-group-text">km</span>
                </div>
              </div>
            </div>

            <!-- Row 5: Estimated Cost & Custodian -->
            <div class="row g-3 mb-3">
              <div class="col-12 col-md-6">
                <label class="form-label small">{{ $t('assets.estimatedCost') || 'Estimasi Biaya (Rp)' }}</label>
                <div class="input-group">
                  <span class="input-group-text">Rp</span>
                  <input
                    v-model.number="form.estimated_cost"
                    type="number"
                    min="0"
                    step="1000"
                    class="form-control"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="col-12 col-md-6">
                <label class="form-label small">{{ $t('assets.assignedMember') || 'PJ / Yang Ditugaskan' }}</label>
                <select v-model="form.assigned_member_id" class="form-select">
                  <option :value="null">{{ $t('assets.unassigned') || 'Seluruh Keluarga (Bersama)' }}</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">
                    {{ m.name }} ({{ m.role }})
                  </option>
                </select>
              </div>
            </div>

            <!-- Row 6: Notes -->
            <div class="mb-3">
              <label class="form-label small">{{ $t('assets.notes') || 'Catatan / Instruksi Bengkel' }}</label>
              <textarea
                v-model="form.notes"
                rows="2"
                class="form-control"
                placeholder="Rekomendasi jenis oli, langganan bengkel, suku cadang..."
              ></textarea>
            </div>

            <!-- Row 7: Active Toggle -->
            <div class="form-check form-switch mb-3">
              <input
                v-model="form.is_active"
                class="form-check-input"
                type="checkbox"
                id="scheduleActiveToggle"
              />
              <label class="form-check-label small" for="scheduleActiveToggle">
                {{ $t('assets.scheduleIsActive') || 'Jadwal Aktif (Tampilkan dalam daftar pantauan)' }}
              </label>
            </div>

            <!-- Footer Actions -->
            <div class="modal-footer px-0 pb-0 pt-3 border-top">
              <button type="button" class="btn btn-secondary" @click="$emit('close')">
                {{ $t('common.cancel') || 'Batal' }}
              </button>
              <button
                type="submit"
                class="btn btn-primary d-flex align-items-center gap-2"
                :disabled="saving"
              >
                <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                <span>{{ isEdit ? ($t('common.saveChanges') || 'Simpan Perubahan') : ($t('assets.saveSchedule') || 'Simpan Jadwal') }}</span>
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
import { useMemberStore } from '../../stores/members';

const props = defineProps({
  schedule: {
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

const memberStore = useMemberStore();
const isEdit = computed(() => !!props.schedule);
const isAssetLocked = computed(() => !isEdit.value && !!props.preselectedAssetId);
const members = computed(() => memberStore.members || []);

const saving = ref(false);
const errorMessage = ref('');

const form = reactive({
  asset_id: '',
  title: '',
  frequency_type: 'months',
  interval_value: 3,
  next_due_date: '',
  next_due_odometer: null,
  estimated_cost: null,
  assigned_member_id: null,
  notes: '',
  is_active: true,
});

const selectedAsset = computed(() => {
  return props.assets.find((a) => a.id === form.asset_id);
});

const quickTemplates = computed(() => {
  if (selectedAsset.value?.category === 'vehicle') {
    return [
      { title: 'Ganti Oli Mesin', freq: 'odometer', val: 5000, cost: 350000 },
      { title: 'Servis Rutin / Tune-up', freq: 'months', val: 6, cost: 700000 },
      { title: 'Pajak Tahunan STNK', freq: 'months', val: 12, cost: 2500000 },
      { title: 'Rotasi & Spooring Ban', freq: 'odometer', val: 10000, cost: 250000 },
    ];
  }
  return [
    { title: 'Cuci AC Rutin', freq: 'months', val: 3, cost: 150000 },
    { title: 'Kuras Toren Air', freq: 'months', val: 6, cost: 100000 },
    { title: 'Ganti Filter Air', freq: 'months', val: 6, cost: 200000 },
    { title: 'Cek Kelistrikan & MCB', freq: 'months', val: 12, cost: 0 },
  ];
});

function applyTemplate(tpl) {
  form.title = tpl.title;
  form.frequency_type = tpl.freq;
  form.interval_value = tpl.val;
  if (tpl.cost) form.estimated_cost = tpl.cost;

  if (tpl.freq === 'months') {
    const d = new Date();
    d.setMonth(d.getMonth() + tpl.val);
    form.next_due_date = d.toISOString().split('T')[0];
  } else if (tpl.freq === 'odometer' && selectedAsset.value?.current_odometer) {
    form.next_due_odometer = Number(selectedAsset.value.current_odometer) + tpl.val;
  }
}

function onFrequencyChange() {
  if (form.frequency_type === 'months' && !form.next_due_date) {
    const d = new Date();
    d.setMonth(d.getMonth() + Number(form.interval_value || 1));
    form.next_due_date = d.toISOString().split('T')[0];
  }
}

onMounted(async () => {
  if (memberStore.members.length === 0) {
    await memberStore.fetchMembers();
  }

  if (props.schedule) {
    Object.assign(form, {
      asset_id: props.schedule.asset_id || '',
      title: props.schedule.title || '',
      frequency_type: props.schedule.frequency_type || 'months',
      interval_value: props.schedule.interval_value ?? 3,
      last_performed_date: props.schedule.last_performed_date || '',
      last_performed_odometer: props.schedule.last_performed_odometer ?? null,
      next_due_date: props.schedule.next_due_date || '',
      next_due_odometer: props.schedule.next_due_odometer ?? null,
      estimated_cost: props.schedule.estimated_cost ?? null,
      assigned_member_id: props.schedule.assigned_member_id ?? null,
      notes: props.schedule.notes || '',
      is_active: props.schedule.is_active ?? true,
    });
  } else if (props.preselectedAssetId) {
    form.asset_id = props.preselectedAssetId;
  }
});

async function handleSubmit() {
  if (!form.asset_id) {
    errorMessage.value = 'Silakan pilih aset.';
    return;
  }
  if (!form.title.trim()) {
    errorMessage.value = 'Nama pemeliharaan wajib diisi.';
    return;
  }

  saving.value = true;
  errorMessage.value = '';

  try {
    const payload = {
      asset_id: form.asset_id,
      title: form.title.trim(),
      frequency_type: form.frequency_type,
      interval_value: form.frequency_type !== 'one_time' ? Number(form.interval_value) : null,
      next_due_date: form.next_due_date || null,
      next_due_odometer: form.next_due_odometer ? Number(form.next_due_odometer) : null,
      estimated_cost: form.estimated_cost !== null ? Number(form.estimated_cost) : 0,
      assigned_member_id: form.assigned_member_id || null,
      notes: form.notes?.trim() || null,
      is_active: form.is_active,
    };

    emit('save', payload);
  } catch (err) {
    errorMessage.value = err.message || 'Gagal menyimpan jadwal servis.';
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
