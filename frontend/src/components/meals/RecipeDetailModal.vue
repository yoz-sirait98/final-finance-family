<template>
  <div v-if="show" class="vue-modal-backdrop" @mousedown.self="close">
    <div class="vue-modal recipe-detail-container">
      <div v-if="recipe" class="p-0">
        <!-- Recipe Hero Banner -->
        <div class="recipe-hero p-4 position-relative">
          <button type="button" class="btn-close position-absolute top-0 end-0 m-3 btn-close-white" @click="close"></button>

          <div class="d-flex align-items-center gap-2 mb-2">
            <span class="badge rounded-pill bg-white text-dark fw-bold">
              {{ getCategoryLabel(recipe.category) }}
            </span>
            <span class="badge rounded-pill bg-black bg-opacity-50 text-white">
              <i class="bi bi-fire text-warning me-1"></i>{{ recipe.difficulty || 'Easy' }}
            </span>
          </div>

          <h3 class="fw-bold text-white mb-2">{{ recipe.name }}</h3>
          <p class="text-white-50 small mb-0">{{ recipe.description }}</p>

          <!-- Quick stats chips -->
          <div class="d-flex flex-wrap gap-2 mt-3">
            <div class="stat-pill text-white">
              <i class="bi bi-clock me-1 text-warning"></i>
              <span>{{ (recipe.prep_time_minutes || 10) + (recipe.cook_time_minutes || 15) }} {{ isId ? 'menit' : 'mins' }}</span>
            </div>
            <div class="stat-pill text-white">
              <i class="bi bi-people me-1 text-info"></i>
              <span>{{ recipe.servings || 4 }} {{ isId ? 'porsi' : 'servings' }}</span>
            </div>
            <div v-if="recipe.calories" class="stat-pill text-white">
              <i class="bi bi-lightning-charge me-1 text-warning"></i>
              <span>{{ recipe.calories }} kcal</span>
            </div>
            <button
              type="button"
              class="btn btn-sm stat-pill btn-favorite ms-auto border-0 text-white"
              @click="toggleFav"
            >
              <i class="bi" :class="recipe.is_favorite ? 'bi-star-fill text-warning' : 'bi-star'"></i>
              <span>{{ recipe.is_favorite ? (isId ? 'Favorit' : 'Favorited') : (isId ? 'Jadikan Favorit' : 'Favorite') }}</span>
            </button>
          </div>
        </div>

        <!-- Recipe Content Body -->
        <div class="modal-body p-4">
          <!-- Ingredients Section -->
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0">
                <i class="bi bi-card-checklist text-primary me-2"></i>
                {{ isId ? 'Bahan-Bahan Diperlukan' : 'Ingredients Needed' }}
              </h6>
              <button
                v-if="recipe.ingredients && recipe.ingredients.length > 0"
                type="button"
                class="btn btn-xs btn-outline-warning py-1 px-2 small"
                @click="emitExportShopping"
              >
                <i class="bi bi-cart-plus me-1"></i>
                {{ isId ? 'Beli Bahan ke Belanja' : 'Export to Shopping' }}
              </button>
            </div>

            <div class="ingredients-box rounded-3 p-3 border">
              <div v-if="!recipe.ingredients || recipe.ingredients.length === 0" class="text-muted small">
                {{ isId ? 'Tidak ada catatan bahan' : 'No ingredients listed' }}
              </div>
              <ul v-else class="list-unstyled mb-0 d-flex flex-column gap-2">
                <li
                  v-for="(ing, idx) in formattedIngredients"
                  :key="idx"
                  class="d-flex align-items-center justify-content-between py-1 border-bottom border-light-subtle"
                >
                  <div class="form-check mb-0">
                    <input
                      class="form-check-input"
                      type="checkbox"
                      :id="'ing-' + idx"
                      v-model="ing._checked"
                    />
                    <label
                      class="form-check-label small"
                      :class="{ 'text-decoration-line-through text-muted': ing._checked }"
                      :for="'ing-' + idx"
                    >
                      <strong>{{ ing.name }}</strong>
                    </label>
                  </div>
                  <span class="badge bg-secondary-subtle text-body fw-normal small">
                    {{ ing.quantity }} {{ ing.unit }}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <!-- Cooking Steps Checklist -->
          <div class="mb-4">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <h6 class="fw-bold mb-0">
                <i class="bi bi-fire text-danger me-2"></i>
                {{ isId ? 'Langkah Memasak (Cook Mode)' : 'Cooking Instructions' }}
              </h6>
              <span class="small text-muted">
                {{ completedStepsCount }}/{{ formattedInstructions.length }} {{ isId ? 'selesai' : 'done' }}
              </span>
            </div>

            <div class="instructions-box rounded-3 p-3 border">
              <div v-if="!recipe.instructions || recipe.instructions.length === 0" class="text-muted small">
                {{ isId ? 'Tidak ada catatan cara memasak' : 'No instructions listed' }}
              </div>
              <div v-else class="d-flex flex-column gap-3">
                <div
                  v-for="(step, sIdx) in formattedInstructions"
                  :key="sIdx"
                  class="step-item d-flex gap-3 align-items-start cursor-pointer"
                  @click="step._checked = !step._checked"
                >
                  <div class="step-badge" :class="{ 'step-completed': step._checked }">
                    <i v-if="step._checked" class="bi bi-check-lg"></i>
                    <span v-else>{{ sIdx + 1 }}</span>
                  </div>
                  <div class="step-text small flex-grow-1" :class="{ 'text-muted text-decoration-line-through': step._checked }">
                    {{ step.text }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer Actions -->
        <div class="modal-footer border-0 p-3 bg-body-tertiary d-flex justify-content-between">
          <button type="button" class="btn btn-secondary" @click="close">
            {{ isId ? 'Tutup' : 'Close' }}
          </button>

          <div class="d-flex gap-2">
            <button
              type="button"
              class="btn btn-primary d-flex align-items-center gap-1"
              @click="emitSchedule"
            >
              <i class="bi bi-calendar-plus"></i>
              <span>{{ isId ? 'Jadwalkan Menu Ini' : 'Add to Meal Plan' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useLocaleStore } from '../../stores/locale';

const props = defineProps({
  show: { type: Boolean, default: false },
  recipe: { type: Object, default: null }
});

const emit = defineEmits(['close', 'toggle-fav', 'schedule', 'export-shopping']);

const localeStore = useLocaleStore();
const isId = computed(() => localeStore.currentLocale === 'id');

const formattedIngredients = ref([]);
const formattedInstructions = ref([]);

watch(
  () => props.recipe,
  (r) => {
    if (!r) return;
    // Format ingredients
    if (Array.isArray(r.ingredients)) {
      formattedIngredients.value = r.ingredients.map(ing => {
        if (typeof ing === 'string') {
          return { name: ing, quantity: '', unit: '', _checked: false };
        }
        return { ...ing, _checked: false };
      });
    } else {
      formattedIngredients.value = [];
    }

    // Format instructions
    if (Array.isArray(r.instructions)) {
      formattedInstructions.value = r.instructions.map(step => {
        if (typeof step === 'string') {
          return { text: step, _checked: false };
        }
        return { text: step.text || JSON.stringify(step), _checked: false };
      });
    } else {
      formattedInstructions.value = [];
    }
  },
  { immediate: true }
);

const completedStepsCount = computed(() => {
  return formattedInstructions.value.filter(s => s._checked).length;
});

function getCategoryLabel(cat) {
  if (isId.value) {
    switch (cat) {
      case 'breakfast': return 'Sarapan';
      case 'lunch': return 'Makan Siang';
      case 'dinner': return 'Makan Malam';
      case 'snack': return 'Camilan';
      default: return 'Hidangan Rumah';
    }
  }
  return cat ? cat.toUpperCase() : 'HOMESTYLE';
}

function toggleFav() {
  if (props.recipe) {
    props.recipe.is_favorite = !props.recipe.is_favorite;
    emit('toggle-fav', { id: props.recipe.id, isFavorite: props.recipe.is_favorite });
  }
}

function emitSchedule() {
  emit('schedule', props.recipe);
}

function emitExportShopping() {
  emit('export-shopping', props.recipe.ingredients || []);
}

function close() {
  emit('close');
}
</script>

<style scoped>
.recipe-detail-container {
  max-width: 650px;
  overflow: hidden;
}

.recipe-hero {
  background: linear-gradient(135deg, #1e1e2f 0%, #3a3b5c 50%, #4a4b7c 100%);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.stat-pill {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(8px);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.btn-favorite {
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-favorite:hover {
  background: rgba(255, 255, 255, 0.35);
}

.ingredients-box,
.instructions-box {
  background: var(--input-bg);
  border-color: var(--card-border) !important;
}

.step-item {
  transition: opacity 0.2s ease;
}

.step-badge {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-color);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.step-badge.step-completed {
  background: #198754;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
