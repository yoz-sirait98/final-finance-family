<template>
  <div v-if="show" class="vue-modal-backdrop" @mousedown.self="close">
    <div class="vue-modal meal-modal-container">
      <div class="modal-header border-0 pb-2">
        <div class="d-flex align-items-center gap-2">
          <div class="modal-icon-badge" :class="itemForm.location">
            <i class="bi" :class="getLocationIcon(itemForm.location)"></i>
          </div>
          <div>
            <h5 class="modal-title fw-bold mb-0">
              {{ isEditing ? (isId ? 'Edit Bahan Dapur' : 'Edit Pantry Item') : (isId ? 'Tambah Bahan Dapur' : 'Add Pantry Item') }}
            </h5>
            <span class="text-muted small">
              {{ isId ? 'Catat stok kulkas & lemari agar tidak terbuang' : 'Track stock & reduce food waste' }}
            </span>
          </div>
        </div>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="modal-body py-2">
          <!-- Zone Selector Chips -->
          <label class="form-label small fw-bold text-uppercase text-muted mb-2">
            {{ isId ? 'Zona Penyimpanan' : 'Storage Zone' }}
          </label>
          <div class="zone-chips-grid mb-3">
            <button
              type="button"
              class="zone-btn"
              :class="{ active: itemForm.location === 'fridge' }"
              @click="itemForm.location = 'fridge'"
            >
              <i class="bi bi-snow2 text-cyan"></i>
              <span>{{ isId ? 'Kulkas' : 'Fridge' }}</span>
            </button>
            <button
              type="button"
              class="zone-btn"
              :class="{ active: itemForm.location === 'freezer' }"
              @click="itemForm.location = 'freezer'"
            >
              <i class="bi bi-badge-vr-fill text-primary"></i>
              <span>{{ isId ? 'Freezer' : 'Freezer' }}</span>
            </button>
            <button
              type="button"
              class="zone-btn"
              :class="{ active: itemForm.location === 'pantry' }"
              @click="itemForm.location = 'pantry'"
            >
              <i class="bi bi-box-seam-fill text-warning"></i>
              <span>{{ isId ? 'Lemari Kering' : 'Pantry' }}</span>
            </button>
          </div>

          <!-- Item Name & Quick Suggestions -->
          <div class="mb-3">
            <label class="form-label small fw-bold">
              {{ isId ? 'Nama Bahan / Makanan' : 'Item Name' }} <span class="text-danger">*</span>
            </label>
            <input
              v-model="itemForm.name"
              type="text"
              class="form-control form-control-lg"
              :placeholder="isId ? 'Contoh: Telur Ayam, Daging Sapi, Brokoli...' : 'e.g. Eggs, Beef, Broccoli...'"
              required
            />
            <!-- Quick Suggestion Chips -->
            <div class="quick-chips mt-2 d-flex flex-wrap gap-1">
              <button
                v-for="chip in quickChips"
                :key="chip.name"
                type="button"
                class="badge rounded-pill border quick-chip-btn"
                @click="applyQuickChip(chip)"
              >
                {{ chip.emoji }} {{ chip.name }}
              </button>
            </div>
          </div>

          <!-- Category & Quantity Row -->
          <div class="row g-2 mb-3">
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">
                {{ isId ? 'Kategori' : 'Category' }}
              </label>
              <select v-model="itemForm.category" class="form-select">
                <option value="produce">{{ isId ? '🥦 Sayur & Buah' : '🥦 Produce' }}</option>
                <option value="meat">{{ isId ? '🥩 Daging & Ikan' : '🥩 Meat & Fish' }}</option>
                <option value="dairy">{{ isId ? '🥛 Susu & Telur' : '🥛 Dairy & Eggs' }}</option>
                <option value="carbs">{{ isId ? '🍚 Beras & Karbo' : '🍚 Grains & Carbs' }}</option>
                <option value="condiment">{{ isId ? '🧂 Bumbu & Saus' : '🧂 Condiments' }}</option>
                <option value="frozen">{{ isId ? '🧊 Makanan Beku' : '🧊 Frozen Food' }}</option>
                <option value="beverage">{{ isId ? '🧃 Minuman' : '🧃 Beverages' }}</option>
                <option value="snack">{{ isId ? '🍪 Camilan' : '🍪 Snacks' }}</option>
                <option value="other">{{ isId ? '📦 Lainnya' : '📦 Other' }}</option>
              </select>
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">
                {{ isId ? 'Jumlah & Satuan' : 'Quantity & Unit' }}
              </label>
              <div class="input-group">
                <input
                  v-model.number="itemForm.quantity"
                  type="number"
                  step="any"
                  min="0"
                  class="form-control text-center fw-bold"
                  placeholder="1"
                  required
                />
                <select v-model="itemForm.unit" class="form-select" style="max-width: 105px;">
                  <option value="pcs">pcs / butir</option>
                  <option value="kg">kg</option>
                  <option value="gr">gram</option>
                  <option value="liter">liter</option>
                  <option value="ml">ml</option>
                  <option value="pack">pack</option>
                  <option value="ikat">ikat</option>
                  <option value="kaleng">kaleng</option>
                  <option value="botol">botol</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Expiration Date & Presets -->
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label small fw-bold mb-0">
                <i class="bi bi-clock-history me-1 text-warning"></i>
                {{ isId ? 'Tanggal Kedaluwarsa / Kadaluarsa' : 'Expiration Date' }}
              </label>
              <span v-if="itemForm.expiration_date" class="badge" :class="expiryBadgeClass">
                {{ expiryDaysText }}
              </span>
            </div>
            <input
              v-model="itemForm.expiration_date"
              type="date"
              class="form-control"
            />
            <!-- Expiration Quick Buttons -->
            <div class="d-flex gap-1 mt-2">
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary py-1 px-2 small"
                @click="setExpiryDays(3)"
              >
                +3 {{ isId ? 'hari' : 'days' }}
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary py-1 px-2 small"
                @click="setExpiryDays(7)"
              >
                +1 {{ isId ? 'minggu' : 'week' }}
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary py-1 px-2 small"
                @click="setExpiryDays(14)"
              >
                +2 {{ isId ? 'minggu' : 'weeks' }}
              </button>
              <button
                type="button"
                class="btn btn-xs btn-outline-secondary py-1 px-2 small"
                @click="setExpiryDays(30)"
              >
                +1 {{ isId ? 'bulan' : 'month' }}
              </button>
              <button
                v-if="itemForm.expiration_date"
                type="button"
                class="btn btn-xs btn-outline-danger py-1 px-2 small ms-auto"
                @click="itemForm.expiration_date = null"
              >
                <i class="bi bi-x"></i>
              </button>
            </div>
          </div>

          <!-- Notes -->
          <div class="mb-2">
            <label class="form-label small fw-bold">
              {{ isId ? 'Catatan Tambahan (Opsional)' : 'Notes (Optional)' }}
            </label>
            <input
              v-model="itemForm.notes"
              type="text"
              class="form-control"
              :placeholder="isId ? 'Contoh: Disimpan di rak bawah, beli di pasar' : 'e.g. Bottom shelf, bought at fresh market'"
            />
          </div>
        </div>

        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary px-3" @click="close">
            {{ isId ? 'Batal' : 'Cancel' }}
          </button>
          <button type="submit" class="btn btn-primary px-4 d-flex align-items-center gap-2" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-check2-circle"></i>
            <span>{{ isId ? 'Simpan' : 'Save' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useLocaleStore } from '../../stores/locale';
import { useAuthStore } from '../../stores/auth';

const props = defineProps({
  show: { type: Boolean, default: false },
  itemData: { type: Object, default: null }
});

const emit = defineEmits(['close', 'save']);

const localeStore = useLocaleStore();
const authStore = useAuthStore();
const isId = computed(() => localeStore.currentLocale === 'id');

const saving = ref(false);
const isEditing = computed(() => !!props.itemData?.id);

const defaultForm = {
  name: '',
  location: 'fridge',
  category: 'produce',
  quantity: 1,
  unit: 'pcs',
  expiration_date: '',
  notes: '',
  status: 'in_stock'
};

const itemForm = ref({ ...defaultForm });

const quickChips = [
  { name: 'Telur Ayam', category: 'dairy', location: 'fridge', unit: 'butir', emoji: '🥚' },
  { name: 'Daging Ayam', category: 'meat', location: 'freezer', unit: 'gr', emoji: '🍗' },
  { name: 'Susu UHT', category: 'dairy', location: 'fridge', unit: 'liter', emoji: '🥛' },
  { name: 'Brokoli', category: 'produce', location: 'fridge', unit: 'bonggol', emoji: '🥦' },
  { name: 'Wortel', category: 'produce', location: 'fridge', unit: 'buah', emoji: '🥕' },
  { name: 'Bawang Merah', category: 'condiment', location: 'pantry', unit: 'gr', emoji: '🧅' },
  { name: 'Beras', category: 'carbs', location: 'pantry', unit: 'kg', emoji: '🍚' },
  { name: 'Minyak Goreng', category: 'condiment', location: 'pantry', unit: 'liter', emoji: '🍳' }
];

watch(
  () => props.show,
  (val) => {
    if (val) {
      if (props.itemData) {
        itemForm.value = {
          ...props.itemData,
          expiration_date: props.itemData.expiration_date || ''
        };
      } else {
        itemForm.value = { ...defaultForm };
      }
    }
  },
  { immediate: true }
);

function applyQuickChip(chip) {
  itemForm.value.name = chip.name;
  itemForm.value.category = chip.category;
  itemForm.value.location = chip.location;
  itemForm.value.unit = chip.unit;
}

function setExpiryDays(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  itemForm.value.expiration_date = d.toISOString().split('T')[0];
}

const expiryDaysText = computed(() => {
  if (!itemForm.value.expiration_date) return '';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(itemForm.value.expiration_date);
  exp.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return isId.value ? `Lewat ${Math.abs(diffDays)} hari!` : `Expired ${Math.abs(diffDays)}d ago!`;
  if (diffDays === 0) return isId.value ? 'Hari ini!' : 'Today!';
  if (diffDays === 1) return isId.value ? 'Besok' : 'Tomorrow';
  return isId.value ? `${diffDays} hari lagi` : `In ${diffDays} days`;
});

const expiryBadgeClass = computed(() => {
  if (!itemForm.value.expiration_date) return 'bg-secondary';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(itemForm.value.expiration_date);
  exp.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'bg-danger text-white animate-pulse';
  if (diffDays <= 3) return 'bg-warning text-dark';
  return 'bg-success text-white';
});

function getLocationIcon(loc) {
  switch (loc) {
    case 'fridge': return 'bi-snow2';
    case 'freezer': return 'bi-badge-vr-fill';
    case 'pantry': return 'bi-box-seam-fill';
    default: return 'bi-archive';
  }
}

function close() {
  emit('close');
}

async function handleSubmit() {
  saving.value = true;
  try {
    const payload = {
      family_id: authStore.familyId,
      name: itemForm.value.name,
      category: itemForm.value.category,
      location: itemForm.value.location,
      quantity: itemForm.value.quantity,
      unit: itemForm.value.unit,
      expiration_date: itemForm.value.expiration_date || null,
      notes: itemForm.value.notes || null,
      status: itemForm.value.quantity > 0 ? (itemForm.value.status || 'in_stock') : 'consumed'
    };

    emit('save', { id: props.itemData?.id, data: payload });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.meal-modal-container {
  max-width: 520px;
}

.modal-icon-badge {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.modal-icon-badge.fridge {
  background: rgba(13, 202, 240, 0.15);
  color: #0dcaf0;
}

.modal-icon-badge.freezer {
  background: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.modal-icon-badge.pantry {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.zone-chips-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.zone-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 6px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 4px;
}

.zone-btn i {
  font-size: 1.25rem;
}

.zone-btn:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.zone-btn.active {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.12);
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.quick-chip-btn {
  background: var(--input-bg);
  color: var(--text-muted);
  font-size: 0.75rem;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.quick-chip-btn:hover {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color) !important;
}

.animate-pulse {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>
