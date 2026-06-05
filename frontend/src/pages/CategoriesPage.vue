<template>
  <div class="categories-page fade-in">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div><h4>Categories</h4><p>Manage income and expense categories</p></div>
      <button class="btn btn-primary-gradient" @click="openCreate"><i class="bi bi-plus-lg me-1"></i>Add Category</button>
    </div>
    <div class="row g-4">
      <div class="col-md-6">
        <h6 class="text-success fw-bold mb-3"><i class="bi bi-arrow-down-circle me-2"></i>Income</h6>
        <div class="list-group">
          <div v-for="c in incomeCategories" :key="c.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <span class="rounded-circle d-inline-block" :style="{ background: c.color || '#28a745', width: '12px', height: '12px' }"></span>
              <i v-if="c.icon" :class="c.icon" class="text-muted"></i>
              {{ c.name }}
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" @click="openEdit(c)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-danger" @click="confirmDelete(c)"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <h6 class="text-danger fw-bold mb-3"><i class="bi bi-arrow-up-circle me-2"></i>Expense</h6>
        <div class="list-group">
          <div v-for="c in expenseCategories" :key="c.id" class="list-group-item d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <span class="rounded-circle d-inline-block" :style="{ background: c.color || '#dc3545', width: '12px', height: '12px' }"></span>
              <i v-if="c.icon" :class="c.icon" class="text-muted"></i>
              {{ c.name }}
            </div>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-primary" @click="openEdit(c)"><i class="bi bi-pencil"></i></button>
              <button class="btn btn-outline-danger" @click="confirmDelete(c)"><i class="bi bi-trash"></i></button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="vue-modal-backdrop" @mousedown.self="showModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingId ? 'Edit' : 'Add' }} Category</h5>
          <button type="button" class="btn-close" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="save">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="form.name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Type</label>
              <select v-model="form.type" class="form-select" required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Color</label>
              <input v-model="form.color" type="color" class="form-control form-control-color" />
            </div>
            <div class="mb-3">
              <label class="form-label">Icon (Bootstrap Icon class)</label>
              <input v-model="form.icon" class="form-control" placeholder="bi-basket" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary-gradient">Save</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Delete Category</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Are you sure you want to delete <strong>{{ deletingItem?.name }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" @click="doDelete">Delete</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { categoryService } from '../services/categoryService';
import { useToastStore } from '../stores/toast';

const categories = ref([]);
const editingId = ref(null);
const form = ref({ name: '', type: 'expense', color: '#6c757d', icon: '' });
const formError = ref('');

const showModal = ref(false);
const showDeleteModal = ref(false);
const deletingItem = ref(null);
const toast = useToastStore();

const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'));
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'));

async function fetchData() {
  const { data } = await categoryService.list();
  categories.value = data.data;
}

function openCreate() {
  editingId.value = null;
  form.value = { name: '', type: 'expense', color: '#6c757d', icon: '' };
  formError.value = '';
  showModal.value = true;
}

function openEdit(c) {
  editingId.value = c.id;
  form.value = { name: c.name, type: c.type, color: c.color || '#6c757d', icon: c.icon || '' };
  formError.value = '';
  showModal.value = true;
}

async function save() {
  formError.value = '';
  try {
    if (editingId.value) {
      await categoryService.update(editingId.value, form.value);
      toast.success('Category updated successfully');
    } else {
      await categoryService.create(form.value);
      toast.success('Category created successfully');
    }
    showModal.value = false;
    fetchData();
  } catch(e) {
    formError.value = e.response?.data?.message || 'Error occurred';
    toast.error(formError.value);
  }
}

function confirmDelete(c) {
  deletingItem.value = c;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (!deletingItem.value) return;
  try {
    await categoryService.delete(deletingItem.value.id);
    toast.success('Category deleted successfully');
    showDeleteModal.value = false;
    deletingItem.value = null;
    fetchData();
  } catch(e) {
    toast.error(e.response?.data?.message || 'Failed to delete category');
  }
}

onMounted(fetchData);
</script>
