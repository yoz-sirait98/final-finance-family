<template>
  <div v-if="show" class="vue-modal-backdrop" @mousedown.self="close">
    <div class="vue-modal" style="max-width: 480px;">
      <div class="modal-header border-0 pb-2">
        <div class="d-flex align-items-center gap-2">
          <div class="modal-icon-badge bg-warning-subtle text-warning">
            <i class="bi bi-cart-plus-fill"></i>
          </div>
          <div>
            <h5 class="modal-title fw-bold mb-0">
              {{ isId ? 'Kirim Bahan ke Belanja' : 'Export to Shopping List' }}
            </h5>
            <span class="text-muted small">
              {{ isId ? 'Bahan yang belum ada akan dimasukkan ke rencana belanja keluarga' : 'Push missing ingredients into active shopping plan' }}
            </span>
          </div>
        </div>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="modal-body py-2">
          <!-- Shopping Plan Destination Selector -->
          <div class="mb-3">
            <label class="form-label small fw-bold">
              {{ isId ? 'Pilih Rencana Belanja Tujuan' : 'Select Target Shopping Plan' }} <span class="text-danger">*</span>
            </label>
            <select v-model="selectedPlanId" class="form-select mb-2" required>
              <option value="" disabled>{{ isId ? '— Pilih Rencana Belanja —' : '— Choose Plan —' }}</option>
              <option v-for="p in shoppingPlans" :key="p.id" :value="p.id">
                🛒 {{ p.location }} ({{ p.shopping_items?.length || 0 }} {{ isId ? 'barang' : 'items' }})
              </option>
              <option value="new">+ {{ isId ? 'Buat Rencana Belanja Baru...' : 'Create New Shopping Plan...' }}</option>
            </select>

            <!-- New Plan input if selected "new" -->
            <div v-if="selectedPlanId === 'new'" class="mt-2 p-2 rounded bg-body-tertiary border">
              <label class="form-label small fw-bold mb-1">
                {{ isId ? 'Nama Toko / Rencana Belanja' : 'Store / Plan Name' }}
              </label>
              <input
                v-model="newPlanLocation"
                type="text"
                class="form-control form-control-sm"
                :placeholder="isId ? 'Contoh: Superindo / Pasar Minggu' : 'e.g. Supermarket / Fresh Market'"
                required
              />
            </div>
          </div>

          <!-- Items Checklist -->
          <div class="mb-2">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label small fw-bold mb-0">
                {{ isId ? 'Pilih Bahan yang Mau Dibeli' : 'Select Items to Buy' }}
              </label>
              <button
                type="button"
                class="btn btn-link btn-sm p-0 text-decoration-none small"
                @click="toggleSelectAll"
              >
                {{ allSelected ? (isId ? 'Hapus Semua' : 'Unselect All') : (isId ? 'Pilih Semua' : 'Select All') }}
              </button>
            </div>

            <div class="border rounded p-2 d-flex flex-column gap-1 max-items-scroll bg-input-bg">
              <div
                v-for="(item, idx) in selectedItems"
                :key="idx"
                class="form-check d-flex align-items-center gap-2 py-1 px-2 rounded hover-bg"
              >
                <input
                  class="form-check-input mt-0"
                  type="checkbox"
                  :id="'export-item-' + idx"
                  v-model="item._selected"
                />
                <label class="form-check-label flex-grow-1 small cursor-pointer" :for="'export-item-' + idx">
                  <strong>{{ item.name }}</strong>
                  <span class="text-muted ms-1">({{ item.quantity || 1 }} {{ item.unit || 'pcs' }})</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary px-3" @click="close">
            {{ isId ? 'Batal' : 'Cancel' }}
          </button>
          <button
            type="submit"
            class="btn btn-primary px-4 d-flex align-items-center gap-2"
            :disabled="saving || activeSelectedCount === 0"
          >
            <span v-if="saving" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-check2-circle"></i>
            <span>{{ isId ? `Kirim ${activeSelectedCount} Bahan` : `Export ${activeSelectedCount} Items` }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useLocaleStore } from '../../stores/locale';
import { useAuthStore } from '../../stores/auth';
import { shoppingPlanService } from '../../services/shoppingPlanService';
import { mealPlanService } from '../../services/mealPlanService';
import { useToastStore } from '../../stores/toast';

const props = defineProps({
  show: { type: Boolean, default: false },
  ingredients: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'success']);

const localeStore = useLocaleStore();
const authStore = useAuthStore();
const toastStore = useToastStore();
const isId = computed(() => localeStore.currentLocale === 'id');

const saving = ref(false);
const shoppingPlans = ref([]);
const selectedPlanId = ref('');
const newPlanLocation = ref('Supermarket');
const selectedItems = ref([]);

onMounted(async () => {
  await loadShoppingPlans();
});

watch(
  () => props.show,
  async (val) => {
    if (val) {
      await loadShoppingPlans();
      selectedItems.value = props.ingredients.map(i => ({
        name: typeof i === 'string' ? i : i.name,
        quantity: i.quantity || '1',
        unit: i.unit || 'pcs',
        _selected: true
      }));

      if (shoppingPlans.value.length > 0) {
        selectedPlanId.value = shoppingPlans.value[0].id;
      } else {
        selectedPlanId.value = 'new';
      }
    }
  }
);

async function loadShoppingPlans() {
  try {
    const res = await shoppingPlanService.list({ status: 'active' });
    shoppingPlans.value = res.data?.data || [];
  } catch (err) {
    console.warn('Failed to load shopping plans:', err);
  }
}

const activeSelectedCount = computed(() => {
  return selectedItems.value.filter(i => i._selected).length;
});

const allSelected = computed(() => {
  return selectedItems.value.length > 0 && selectedItems.value.every(i => i._selected);
});

function toggleSelectAll() {
  const target = !allSelected.value;
  selectedItems.value.forEach(i => (i._selected = target));
}

function close() {
  emit('close');
}

async function handleSubmit() {
  if (activeSelectedCount.value === 0) return;
  saving.value = true;
  try {
    let targetPlanId = selectedPlanId.value;

    // If new plan requested, create it first
    if (targetPlanId === 'new') {
      const { data: newPlan } = await shoppingPlanService.create({
        family_id: authStore.familyId,
        location: newPlanLocation.value || 'Belanja Dapur',
        status: 'active',
        created_by: authStore.user?.id || null
      });
      targetPlanId = newPlan.id;
    }

    const itemsToExport = selectedItems.value.filter(i => i._selected);
    await mealPlanService.exportMissingIngredientsToShopping(itemsToExport, targetPlanId);

    toastStore.show({
      type: 'success',
      message: isId.value
        ? `Berhasil menambahkan ${itemsToExport.length} bahan ke daftar belanja!`
        : `Successfully added ${itemsToExport.length} items to shopping plan!`
    });

    emit('success');
    close();
  } catch (err) {
    console.error('Failed to export ingredients:', err);
    toastStore.show({
      type: 'error',
      message: isId.value ? 'Gagal mengirim bahan ke belanja' : 'Failed to export items'
    });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.modal-icon-badge {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
}

.max-items-scroll {
  max-height: 180px;
  overflow-y: auto;
}

.hover-bg:hover {
  background: rgba(102, 126, 234, 0.08);
}
</style>
