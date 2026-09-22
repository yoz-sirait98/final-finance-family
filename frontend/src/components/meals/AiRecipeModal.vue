<template>
  <div v-if="show" class="vue-modal-backdrop" @mousedown.self="close">
    <div class="vue-modal ai-modal-container">
      <!-- Modal Header -->
      <div class="modal-header border-0 pb-2 ai-header">
        <div class="d-flex align-items-center gap-3">
          <div class="ai-sparkle-avatar">
            <i class="bi bi-stars"></i>
          </div>
          <div>
            <h5 class="modal-title fw-bold mb-0 text-gradient">
              {{ isId ? 'Masak Apa Dari Kulkas?' : 'Smart AI Chef & Recipe Lab' }}
            </h5>
            <span class="text-muted small">
              {{ isId ? 'Kreasikan menu lezat dari stok yang ada agar tidak mubazir' : 'Zero-waste recipe generator using your kitchen stock' }}
            </span>
          </div>
        </div>
        <button type="button" class="btn-close" @click="close"></button>
      </div>

      <div class="modal-body py-2">
        <!-- Stock Snapshot Card -->
        <div class="pantry-summary-card p-3 rounded-3 mb-3">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="fw-bold small text-muted text-uppercase">
              <i class="bi bi-box-seam me-1"></i>
              {{ isId ? 'Bahan Tersedia Saat Ini' : 'Available Ingredients' }}
            </span>
            <span class="badge bg-primary-subtle text-primary">
              {{ pantryItems.length }} {{ isId ? 'bahan terdeteksi' : 'items detected' }}
            </span>
          </div>

          <div v-if="expiringSoonCount > 0" class="alert alert-warning py-1 px-2 mb-2 d-flex align-items-center gap-2 small">
            <i class="bi bi-exclamation-triangle-fill text-warning"></i>
            <span>
              <strong>{{ expiringSoonCount }}</strong> {{ isId ? 'bahan mendekati batas kadaluarsa (< 4 hari)!' : 'items expiring soon (< 4 days)!' }}
            </span>
          </div>

          <div class="d-flex flex-wrap gap-1 max-chips-scroll">
            <span
              v-for="item in previewItems"
              :key="item.id"
              class="badge rounded-pill border pantry-pill"
              :class="{ 'border-warning text-warning-emphasis bg-warning-subtle': isExpiringSoon(item) }"
            >
              {{ item.name }} ({{ item.quantity }} {{ item.unit }})
            </span>
            <span v-if="pantryItems.length > 8" class="badge rounded-pill bg-secondary-subtle text-muted">
              +{{ pantryItems.length - 8 }} {{ isId ? 'lainnya' : 'more' }}
            </span>
          </div>
        </div>

        <!-- Preferences & Prompts -->
        <div class="mb-3">
          <label class="form-label small fw-bold">
            {{ isId ? 'Pilihan Kreasi Koki' : 'Chef Preferences' }}
          </label>
          <div class="d-flex flex-wrap gap-2 mb-2">
            <button
              v-for="opt in preferenceOptions"
              :key="opt.id"
              type="button"
              class="btn btn-sm pref-chip-btn"
              :class="{ 'btn-primary text-white': selectedPref === opt.id, 'btn-outline-secondary': selectedPref !== opt.id }"
              @click="selectedPref = opt.id"
            >
              {{ opt.icon }} {{ isId ? opt.labelId : opt.labelEn }}
            </button>
          </div>

          <!-- Expiring Soon Priority Checkbox -->
          <div class="form-check form-switch mb-2">
            <input
              v-model="prioritizeExpiring"
              class="form-check-input"
              type="checkbox"
              id="prioritizeExpiringCheck"
            />
            <label class="form-check-label small fw-medium" for="prioritizeExpiringCheck">
              <i class="bi bi-alarm text-warning me-1"></i>
              {{ isId ? 'Fokus habiskan bahan yang segera kedaluwarsa lebih dulu' : 'Prioritize ingredients nearing expiration date' }}
            </label>
          </div>

          <!-- Custom note -->
          <input
            v-model="customNotes"
            type="text"
            class="form-control form-control-sm"
            :placeholder="isId ? 'Catatan khusus (misal: kurangi santan, manis gurih, untuk 4 porsi)...' : 'Special requests (e.g. kid-friendly, under 20 mins, high protein)...'"
          />
        </div>

        <!-- Action Button -->
        <div class="d-grid mb-3">
          <button
            type="button"
            class="btn btn-primary btn-generate py-2 fw-bold d-flex align-items-center justify-content-center gap-2"
            :disabled="generating"
            @click="generateRecipes"
          >
            <span v-if="generating" class="spinner-border spinner-border-sm"></span>
            <i v-else class="bi bi-magic"></i>
            <span>{{ generating ? (isId ? 'Koki AI Sedang Meracik...' : 'Chef AI is Cooking...') : (isId ? 'Kreasikan 3 Ide Resep Ajaib' : 'Generate 3 Magic Recipes') }}</span>
          </button>
        </div>

        <!-- Generated Recipes Output -->
        <div v-if="generatedRecipes.length > 0" class="recipes-result-container d-flex flex-column gap-3 mb-2">
          <div class="d-flex justify-content-between align-items-center">
            <h6 class="fw-bold mb-0 text-success">
              <i class="bi bi-check-circle-fill me-1"></i>
              {{ isId ? 'Rekomendasi Menu Spesial Kulkasmu' : 'Tailored Recipes from Your Pantry' }}
            </h6>
            <span class="badge bg-success-subtle text-success">{{ generatedRecipes.length }} {{ isId ? 'Pilihan' : 'Options' }}</span>
          </div>

          <div
            v-for="(recipe, rIdx) in generatedRecipes"
            :key="rIdx"
            class="recipe-card p-3 rounded-3 border"
          >
            <!-- Card Header -->
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <div>
                <div class="d-flex align-items-center gap-2 mb-1">
                  <span class="badge rounded-pill" :class="getCategoryBadgeClass(recipe.category)">
                    {{ getCategoryLabel(recipe.category) }}
                  </span>
                  <span class="badge bg-secondary-subtle text-muted">
                    {{ recipe.difficulty || 'easy' }}
                  </span>
                </div>
                <h5 class="fw-bold mb-1 recipe-title">{{ recipe.name }}</h5>
                <p class="text-muted small mb-0">{{ recipe.description }}</p>
              </div>
              <div class="text-end text-nowrap time-badge p-2 rounded text-center">
                <div class="fw-bold small">
                  <i class="bi bi-stopwatch text-warning me-1"></i>{{ (recipe.prep_time_minutes || 10) + (recipe.cook_time_minutes || 15) }}m
                </div>
                <div class="text-muted" style="font-size: 0.7rem;">
                  {{ recipe.servings || 4 }} {{ isId ? 'porsi' : 'servings' }}
                </div>
              </div>
            </div>

            <!-- Ingredients breakdown -->
            <div class="mb-2">
              <span class="fw-bold small text-muted d-block mb-1">
                {{ isId ? 'Bahan-Bahan:' : 'Ingredients:' }}
              </span>
              <div class="d-flex flex-wrap gap-1">
                <span
                  v-for="(ing, iIdx) in recipe.ingredients"
                  :key="iIdx"
                  class="badge recipe-ing-pill"
                  :class="ing.in_pantry !== false ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning-emphasis border border-warning-subtle'"
                >
                  <i class="bi" :class="ing.in_pantry !== false ? 'bi-check2' : 'bi-cart-plus'"></i>
                  {{ ing.name }} <span class="opacity-75">({{ ing.quantity }} {{ ing.unit }})</span>
                </span>
              </div>
            </div>

            <!-- Instructions Collapsible -->
            <div class="mb-3">
              <button
                type="button"
                class="btn btn-link btn-sm p-0 text-decoration-none small text-primary fw-medium"
                @click="recipe._showSteps = !recipe._showSteps"
              >
                <i class="bi" :class="recipe._showSteps ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                {{ recipe._showSteps ? (isId ? 'Sembunyikan Cara Masak' : 'Hide Instructions') : (isId ? 'Lihat Langkah Memasak' : 'View Cooking Steps') }}
              </button>

              <div v-if="recipe._showSteps" class="steps-box p-2 mt-2 rounded bg-body-tertiary small">
                <ol class="mb-0 ps-3">
                  <li v-for="(step, sIdx) in recipe.instructions" :key="sIdx" class="mb-1">
                    {{ step }}
                  </li>
                </ol>
                <div v-if="recipe.tips" class="mt-2 p-2 bg-info-subtle text-info-emphasis rounded border border-info-subtle">
                  <i class="bi bi-lightbulb-fill me-1"></i><strong>Tips:</strong> {{ recipe.tips }}
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="d-flex flex-wrap gap-2 pt-2 border-top">
              <button
                type="button"
                class="btn btn-sm btn-outline-primary d-flex align-items-center gap-1"
                @click="scheduleRecipe(recipe)"
              >
                <i class="bi bi-calendar-plus"></i>
                <span>{{ isId ? 'Jadwalkan Menu' : 'Add to Plan' }}</span>
              </button>

              <button
                type="button"
                class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
                @click="saveToRecipeBox(recipe)"
                :disabled="recipe._saved"
              >
                <i class="bi" :class="recipe._saved ? 'bi-bookmark-check-fill text-success' : 'bi-bookmark-plus'"></i>
                <span>{{ recipe._saved ? (isId ? 'Tersimpan' : 'Saved') : (isId ? 'Simpan Resep' : 'Save Recipe') }}</span>
              </button>

              <button
                v-if="hasMissingIngredients(recipe)"
                type="button"
                class="btn btn-sm btn-outline-warning d-flex align-items-center gap-1 ms-auto"
                @click="openExportToShopping(recipe)"
              >
                <i class="bi bi-cart-plus"></i>
                <span>{{ isId ? 'Beli Bahan Kurang' : 'Shop Missing' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer border-0 pt-0">
        <button type="button" class="btn btn-secondary px-3" @click="close">
          {{ isId ? 'Tutup' : 'Close' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useLocaleStore } from '../../stores/locale';
import { recipeService } from '../../services/recipeService';
import { useToastStore } from '../../stores/toast';

const props = defineProps({
  show: { type: Boolean, default: false },
  pantryItems: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'schedule', 'save-recipe', 'export-shopping']);

const localeStore = useLocaleStore();
const toastStore = useToastStore();
const isId = computed(() => localeStore.currentLocale === 'id');

const generating = ref(false);
const prioritizeExpiring = ref(true);
const customNotes = ref('');
const selectedPref = ref('all');
const generatedRecipes = ref([]);

const preferenceOptions = [
  { id: 'all', labelId: 'Semua Selera', labelEn: 'All-Round', icon: '🍽️' },
  { id: 'quick', labelId: 'Cepat & Praktis', labelEn: 'Under 20m', icon: '⚡' },
  { id: 'healthy', labelId: 'Sehat & Segar', labelEn: 'Healthy Veg', icon: '🥗' },
  { id: 'kids', labelId: 'Favorit Anak', labelEn: 'Kids Friendly', icon: '👶' },
  { id: 'budget', labelId: 'Hemat Pengeluaran', labelEn: 'Budget Saver', icon: '💰' }
];

const previewItems = computed(() => props.pantryItems.slice(0, 8));

const expiringSoonCount = computed(() => {
  const today = new Date();
  return props.pantryItems.filter((i) => {
    if (!i.expiration_date) return false;
    const exp = new Date(i.expiration_date);
    const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
    return diff <= 4;
  }).length;
});

function isExpiringSoon(item) {
  if (!item.expiration_date) return false;
  const today = new Date();
  const exp = new Date(item.expiration_date);
  const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  return diff <= 4;
}

watch(
  () => props.show,
  (val) => {
    if (val && generatedRecipes.value.length === 0) {
      // Auto generate on first open if empty
      generateRecipes();
    }
  }
);

async function generateRecipes() {
  generating.value = true;
  try {
    const prefLabel = preferenceOptions.find(p => p.id === selectedPref.value)?.labelId || '';
    const fullNotes = [prefLabel, customNotes.value].filter(Boolean).join(', ');

    const recipes = await recipeService.generateAiRecipes(props.pantryItems, {
      locale: localeStore.currentLocale,
      expiringSoonOnly: prioritizeExpiring.value,
      notes: fullNotes
    });

    generatedRecipes.value = recipes.map(r => ({
      ...r,
      _showSteps: false,
      _saved: false
    }));

    toastStore.show({
      type: 'success',
      message: isId.value ? 'Resep berhasil diracik oleh Chef AI!' : 'Recipes successfully crafted by Chef AI!'
    });
  } catch (err) {
    console.error('Failed to generate recipes:', err);
    toastStore.show({
      type: 'error',
      message: isId.value ? 'Gagal meracik resep: ' + (err.message || 'Error') : 'Failed to generate recipes'
    });
  } finally {
    generating.value = false;
  }
}

function getCategoryBadgeClass(cat) {
  switch (cat) {
    case 'breakfast': return 'bg-warning-subtle text-warning-emphasis';
    case 'lunch': return 'bg-success-subtle text-success';
    case 'dinner': return 'bg-primary-subtle text-primary';
    default: return 'bg-info-subtle text-info-emphasis';
  }
}

function getCategoryLabel(cat) {
  if (isId.value) {
    switch (cat) {
      case 'breakfast': return 'Sarapan';
      case 'lunch': return 'Makan Siang';
      case 'dinner': return 'Makan Malam';
      default: return 'Camilan';
    }
  }
  return cat ? cat.toUpperCase() : 'MEAL';
}

function hasMissingIngredients(recipe) {
  return recipe.ingredients && recipe.ingredients.some(i => i.in_pantry === false);
}

function scheduleRecipe(recipe) {
  emit('schedule', recipe);
}

function saveToRecipeBox(recipe) {
  recipe._saved = true;
  emit('save-recipe', recipe);
}

function openExportToShopping(recipe) {
  const missing = recipe.ingredients.filter(i => i.in_pantry === false);
  emit('export-shopping', missing.length > 0 ? missing : recipe.ingredients);
}

function close() {
  emit('close');
}
</script>

<style scoped>
.ai-modal-container {
  max-width: 620px;
}

.ai-header {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}

.ai-sparkle-avatar {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.4rem;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.35);
}

.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.pantry-summary-card {
  background: var(--input-bg);
  border: 1px solid var(--card-border);
}

.pantry-pill {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 4px 8px;
}

.btn-generate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.45);
}

.recipe-card {
  background: var(--card-bg);
  backdrop-filter: blur(10px);
  border-color: var(--card-border) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.recipe-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--card-shadow-hover);
}

.recipe-title {
  color: var(--text-color);
}

.time-badge {
  background: var(--input-bg);
  border: 1px solid var(--card-border);
}

.recipe-ing-pill {
  font-size: 0.75rem;
  padding: 3px 6px;
  font-weight: 500;
}

.steps-box {
  border: 1px solid var(--card-border);
  line-height: 1.5;
}
</style>
