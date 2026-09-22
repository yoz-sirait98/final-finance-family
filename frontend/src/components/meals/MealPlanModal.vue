<template>
  <div v-if="show" class="vue-modal-backdrop" @mousedown.self="close">
    <div class="vue-modal meal-modal-container">
      <div class="modal-header border-0 pb-2">
        <div class="d-flex align-items-center gap-2">
          <div class="modal-icon-badge" :class="planForm.meal_type">
            <i class="bi" :class="getSlotIcon(planForm.meal_type)"></i>
          </div>
          <div>
            <h5 class="modal-title fw-bold mb-0">
              {{ isEditing ? (isId ? 'Edit Menu Makan' : 'Edit Meal Plan') : (isId ? 'Rencanakan Menu Makan' : 'Plan a Meal') }}
            </h5>
            <span class="text-muted small">
              {{ isId ? 'Jadwalkan masakan & tentukan siapa koki hari ini' : 'Schedule dishes and assign the family cook' }}
            </span>
          </div>
        </div>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="modal-body py-2">
          <!-- Meal Slot Picker -->
          <label class="form-label small fw-bold text-uppercase text-muted mb-2">
            {{ isId ? 'Waktu Makan' : 'Meal Slot' }}
          </label>
          <div class="slot-chips-grid mb-3">
            <button
              type="button"
              class="slot-btn"
              :class="{ active: planForm.meal_type === 'breakfast' }"
              @click="planForm.meal_type = 'breakfast'"
            >
              <i class="bi bi-cup-hot text-warning"></i>
              <span>{{ isId ? 'Sarapan' : 'Breakfast' }}</span>
            </button>
            <button
              type="button"
              class="slot-btn"
              :class="{ active: planForm.meal_type === 'lunch' }"
              @click="planForm.meal_type = 'lunch'"
            >
              <i class="bi bi-sun text-success"></i>
              <span>{{ isId ? 'Siang' : 'Lunch' }}</span>
            </button>
            <button
              type="button"
              class="slot-btn"
              :class="{ active: planForm.meal_type === 'dinner' }"
              @click="planForm.meal_type = 'dinner'"
            >
              <i class="bi bi-moon-stars text-primary"></i>
              <span>{{ isId ? 'Malam' : 'Dinner' }}</span>
            </button>
            <button
              type="button"
              class="slot-btn"
              :class="{ active: planForm.meal_type === 'snack' }"
              @click="planForm.meal_type = 'snack'"
            >
              <i class="bi bi-egg-fried text-info"></i>
              <span>{{ isId ? 'Camilan' : 'Snack' }}</span>
            </button>
          </div>

          <!-- Date & Assigned Cook -->
          <div class="row g-2 mb-3">
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">
                {{ isId ? 'Tanggal Masak' : 'Plan Date' }} <span class="text-danger">*</span>
              </label>
              <input
                v-model="planForm.plan_date"
                type="date"
                class="form-control"
                required
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label small fw-bold">
                <i class="bi bi-person-heart text-danger me-1"></i>
                {{ isId ? 'Koki / Penanggung Jawab' : 'Assigned Cook' }}
              </label>
              <select v-model="planForm.assigned_member_id" class="form-select">
                <option :value="null">{{ isId ? '— Bersama / Bebas —' : '— Anyone / Shared —' }}</option>
                <option v-for="m in memberStore.members" :key="m.id" :value="m.id">
                  {{ m.name }} ({{ m.role || 'Member' }})
                </option>
              </select>
            </div>
          </div>

          <!-- Recipe Title -->
          <div class="mb-3">
            <label class="form-label small fw-bold">
              {{ isId ? 'Menu Masakan / Hidangan' : 'Meal / Dish Title' }} <span class="text-danger">*</span>
            </label>
            <input
              v-model="planForm.recipe_title"
              type="text"
              class="form-control form-control-lg"
              :placeholder="isId ? 'Contoh: Soto Ayam Lamongan, Spaghetti Carbonara...' : 'e.g. Chicken Noodle Soup, Salmon Salad...'"
              required
            />
          </div>

          <!-- Description / Cooking Instructions -->
          <div class="mb-3">
            <label class="form-label small fw-bold">
              {{ isId ? 'Catatan / Deskripsi' : 'Notes / Description' }}
            </label>
            <textarea
              v-model="planForm.description"
              class="form-control"
              rows="2"
              :placeholder="isId ? 'Porsi untuk 4 orang, kurangi pedas untuk si kecil...' : 'Serves 4, mild spicy for the kids...'"
            ></textarea>
          </div>

          <!-- Ingredients Checklist / Shopping Plan integration -->
          <div class="mb-3">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <label class="form-label small fw-bold mb-0">
                <i class="bi bi-basket3 me-1 text-primary"></i>
                {{ isId ? 'Daftar Bahan / Belanja' : 'Ingredients Needed' }}
              </label>
              <button
                type="button"
                class="btn btn-xs btn-outline-primary py-0 px-2 small"
                @click="addIngredientRow"
              >
                <i class="bi bi-plus"></i> {{ isId ? 'Tambah Bahan' : 'Add Item' }}
              </button>
            </div>

            <div v-if="planForm.ingredients.length === 0" class="text-center py-2 border rounded border-dashed text-muted small">
              {{ isId ? 'Belum ada bahan dicatat. Klik "Tambah Bahan" di atas.' : 'No ingredients added yet. Click "+ Add Item".' }}
            </div>

            <div v-else class="ingredients-list-container d-flex flex-column gap-2 mt-2">
              <div
                v-for="(ing, idx) in planForm.ingredients"
                :key="idx"
                class="d-flex align-items-center gap-2 ingredient-row p-1 rounded"
              >
                <input
                  v-model="ing.name"
                  type="text"
                  class="form-control form-control-sm"
                  :placeholder="isId ? 'Nama bahan' : 'Ingredient'"
                />
                <input
                  v-model="ing.quantity"
                  type="text"
                  class="form-control form-control-sm"
                  style="max-width: 70px;"
                  placeholder="Qty"
                />
                <input
                  v-model="ing.unit"
                  type="text"
                  class="form-control form-control-sm"
                  style="max-width: 70px;"
                  placeholder="Satuan"
                />
                <button
                  type="button"
                  class="btn btn-sm btn-outline-danger p-1 line-btn"
                  @click="removeIngredientRow(idx)"
                  title="Remove"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <!-- Completed Status Toggle if editing -->
          <div v-if="isEditing" class="form-check form-switch mb-2 p-2 bg-light-subtle rounded border">
            <input
              v-model="planForm.is_completed"
              class="form-check-input ms-0 me-2"
              type="checkbox"
              id="mealCompletedSwitch"
            />
            <label class="form-check-label small fw-bold" for="mealCompletedSwitch">
              {{ isId ? 'Sudah dimasak / selesai dinikmati' : 'Mark as cooked / completed' }}
            </label>
          </div>
        </div>

        <div class="modal-footer border-0 pt-0">
          <button type="button" class="btn btn-secondary px-3" @click="close">
            {{ isId ? 'Batal' : 'Cancel' }}
          </button>
          <button type="submit" class="btn btn-primary px-4 d-flex align-items-center gap-2" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-check2-circle"></i>
            <span>{{ isId ? 'Simpan Menu' : 'Save Meal' }}</span>
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
import { useMemberStore } from '../../stores/members';

const props = defineProps({
  show: { type: Boolean, default: false },
  planData: { type: Object, default: null },
  defaultDate: { type: String, default: '' },
  defaultSlot: { type: String, default: 'dinner' }
});

const emit = defineEmits(['close', 'save']);

const localeStore = useLocaleStore();
const authStore = useAuthStore();
const memberStore = useMemberStore();
const isId = computed(() => localeStore.currentLocale === 'id');

const saving = ref(false);
const isEditing = computed(() => !!props.planData?.id);

const defaultForm = {
  plan_date: '',
  meal_type: 'dinner',
  recipe_title: '',
  description: '',
  assigned_member_id: null,
  ingredients: [],
  is_completed: false
};

const planForm = ref({ ...defaultForm });

onMounted(async () => {
  if (memberStore.members.length === 0) {
    await memberStore.fetchMembers();
  }
});

watch(
  () => props.show,
  (val) => {
    if (val) {
      if (props.planData) {
        planForm.value = {
          ...props.planData,
          ingredients: Array.isArray(props.planData.ingredients)
            ? JSON.parse(JSON.stringify(props.planData.ingredients))
            : []
        };
      } else {
        const todayStr = new Date().toISOString().split('T')[0];
        planForm.value = {
          ...defaultForm,
          plan_date: props.defaultDate || todayStr,
          meal_type: props.defaultSlot || 'dinner',
          ingredients: []
        };
      }
    }
  },
  { immediate: true }
);

function addIngredientRow() {
  planForm.value.ingredients.push({
    name: '',
    quantity: '1',
    unit: 'pcs',
    in_pantry: false
  });
}

function removeIngredientRow(idx) {
  planForm.value.ingredients.splice(idx, 1);
}

function getSlotIcon(type) {
  switch (type) {
    case 'breakfast': return 'bi-cup-hot';
    case 'lunch': return 'bi-sun';
    case 'dinner': return 'bi-moon-stars';
    case 'snack': return 'bi-egg-fried';
    default: return 'bi-calendar-check';
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
      plan_date: planForm.value.plan_date,
      meal_type: planForm.value.meal_type,
      recipe_title: planForm.value.recipe_title,
      description: planForm.value.description || null,
      assigned_member_id: planForm.value.assigned_member_id || null,
      ingredients: planForm.value.ingredients.filter(i => i.name && i.name.trim()),
      is_completed: planForm.value.is_completed || false,
    };

    emit('save', { id: props.planData?.id, data: payload });
  } finally {
    saving.value = false;
  }
}
</script>

<style scoped>
.meal-modal-container {
  max-width: 540px;
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

.modal-icon-badge.breakfast {
  background: rgba(255, 193, 7, 0.15);
  color: #ffc107;
}

.modal-icon-badge.lunch {
  background: rgba(25, 135, 84, 0.15);
  color: #198754;
}

.modal-icon-badge.dinner {
  background: rgba(13, 110, 253, 0.15);
  color: #0d6efd;
}

.modal-icon-badge.snack {
  background: rgba(13, 202, 240, 0.15);
  color: #0dcaf0;
}

.slot-chips-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.slot-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 4px;
  border-radius: 12px;
  border: 1px solid var(--card-border);
  background: var(--input-bg);
  color: var(--text-color);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 4px;
}

.slot-btn:hover {
  border-color: var(--primary-color);
  transform: translateY(-2px);
}

.slot-btn.active {
  border-color: var(--primary-color);
  background: rgba(102, 126, 234, 0.15);
  color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.ingredient-row {
  background: var(--input-bg);
  border: 1px solid var(--card-border);
}

.border-dashed {
  border-style: dashed !important;
}

.line-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
