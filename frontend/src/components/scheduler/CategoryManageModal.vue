<template>
  <div v-if="isOpen" class="modal-backdrop-custom" @click.self="$emit('close')">
    <div class="modal-dialog-custom">
      <div class="modal-content-custom">
        <!-- Header -->
        <div class="modal-header-custom d-flex justify-content-between align-items-center">
          <h5 class="mb-0 fw-bold">
            <i class="bi bi-tags-fill me-2 text-primary"></i>Manage Chore & Task Categories
          </h5>
          <button class="btn-close-custom" @click="$emit('close')">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body-custom">
          <!-- Add Category Form -->
          <form @submit.prevent="handleAddCategory" class="p-3 mb-4 add-category-card rounded-3">
            <h6 class="fw-bold mb-2 small text-uppercase text-muted">Add New Category</h6>
            <div class="row g-2">
              <div class="col-7">
                <input
                  v-model="newCategoryName"
                  type="text"
                  class="form-control form-control-sm"
                  placeholder="Category name (e.g. Garden, Homework)"
                  required
                />
              </div>
              <div class="col-3">
                <input
                  v-model="newCategoryColor"
                  type="color"
                  class="form-control form-control-sm form-control-color w-100"
                  title="Choose category color"
                />
              </div>
              <div class="col-2">
                <button type="submit" class="btn btn-primary btn-sm w-100" :disabled="!newCategoryName.trim()">
                  <i class="bi bi-plus-lg"></i>
                </button>
              </div>
            </div>
          </form>

          <!-- Existing Categories List -->
          <h6 class="fw-bold mb-2 small text-uppercase text-muted">Current Categories</h6>
          <div class="list-group list-group-flush rounded-3 border">
            <div
              v-for="cat in categories"
              :key="cat.id"
              class="list-group-item d-flex align-items-center justify-content-between py-2.5"
            >
              <div class="d-flex align-items-center gap-2">
                <span class="cat-dot" :style="{ backgroundColor: cat.color }"></span>
                <span class="fw-semibold small">{{ cat.name }}</span>
                <span v-if="cat.is_default" class="badge bg-secondary-subtle text-muted extra-small">Default</span>
              </div>

              <div class="d-flex align-items-center gap-1">
                <button
                  v-if="!cat.is_default"
                  class="btn btn-sm btn-link text-danger p-0 px-1"
                  @click="handleDelete(cat)"
                  title="Delete category"
                >
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer-custom d-flex justify-content-end p-3 border-top">
          <button class="btn btn-secondary" @click="$emit('close')">
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false,
  },
  categories: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['close', 'create', 'delete']);

const newCategoryName = ref('');
const newCategoryColor = ref('#6366f1');

function handleAddCategory() {
  if (!newCategoryName.value.trim()) return;

  emit('create', {
    name: newCategoryName.value.trim(),
    color: newCategoryColor.value,
    icon: 'Folder',
  });

  newCategoryName.value = '';
}

function handleDelete(cat) {
  if (confirm(`Delete category "${cat.name}"?`)) {
    emit('delete', cat.id);
  }
}
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  inset: 0;
  z-index: 1050;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-dialog-custom {
  width: 100%;
  max-width: 480px;
}

.modal-content-custom {
  background: var(--card-bg, #ffffff);
  border: 1px solid var(--border-color, #e2e8f0);
  border-radius: 1.25rem;
  overflow: hidden;
  box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.3);
}

.modal-header-custom {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

.btn-close-custom {
  background: transparent;
  border: none;
  font-size: 1.1rem;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  padding: 0.25rem;
}

.modal-body-custom {
  padding: 1.5rem;
}

.add-category-card {
  background: rgba(148, 163, 184, 0.08);
  border: 1px solid var(--border-color, #e2e8f0);
}

.cat-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.extra-small {
  font-size: 0.65rem;
}
</style>
