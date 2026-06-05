<template>
  <div class="members-page fade-in">
    <div class="page-header d-flex justify-content-between align-items-center">
      <div><h4>Members</h4><p>Manage family members</p></div>
      <button class="btn btn-primary-gradient" @click="openCreate"><i class="bi bi-plus-lg me-1"></i>Add Member</button>
    </div>
    <div class="row g-3">
      <div v-for="member in members" :key="member.id" class="col-md-4 col-lg-3">
        <div class="stat-card text-center">
          <div class="mb-2"><i class="bi bi-person-circle" style="font-size:2.5rem;color:#667eea"></i></div>
          <h6 class="fw-bold">{{ member.name }}</h6>
          <span class="badge bg-secondary mb-2">{{ member.role }}</span>
          <div>
            <span class="badge" :class="member.is_active ? 'bg-success' : 'bg-danger'">{{ member.is_active ? 'Active' : 'Inactive' }}</span>
          </div>
          <div class="mt-3 d-flex gap-1 justify-content-center">
            <button class="btn btn-sm btn-outline-primary" @click="openEdit(member)"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-warning" @click="toggleActive(member)"><i class="bi bi-toggle-on"></i></button>
            <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(member)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="vue-modal-backdrop" @mousedown.self="showModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingId ? 'Edit' : 'Add' }} Member</h5>
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
              <label class="form-label">Role</label>
              <select v-model="form.role" class="form-select" required>
                <option value="father">Father</option>
                <option value="mother">Mother</option>
                <option value="child">Child</option>
              </select>
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
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Delete Member</h5>
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
import { ref, onMounted } from 'vue';
import { memberService } from '../services/memberService';
import { useToastStore } from '../stores/toast';

const members = ref([]);
const editingId = ref(null);
const form = ref({ name: '', role: 'child' });
const formError = ref('');

const showModal = ref(false);
const showDeleteModal = ref(false);
const deletingItem = ref(null);
const toast = useToastStore();

async function fetchData() {
  const { data } = await memberService.list();
  members.value = data.data;
}

function openCreate() {
  editingId.value = null;
  form.value = { name: '', role: 'child' };
  formError.value = '';
  showModal.value = true;
}

function openEdit(m) {
  editingId.value = m.id;
  form.value = { name: m.name, role: m.role };
  formError.value = '';
  showModal.value = true;
}

async function save() {
  formError.value = '';
  try {
    if (editingId.value) {
      await memberService.update(editingId.value, form.value);
      toast.success('Member updated successfully');
    } else {
      await memberService.create(form.value);
      toast.success('Member created successfully');
    }
    showModal.value = false;
    fetchData();
  } catch(e) {
    formError.value = e.response?.data?.message || 'Error occurred';
    toast.error(formError.value);
  }
}

async function toggleActive(m) {
  try {
    await memberService.toggleActive(m.id);
    toast.success('Member status updated');
    fetchData();
  } catch (e) {
    toast.error(e.response?.data?.message || 'Error toggling status');
  }
}

function confirmDelete(m) {
  deletingItem.value = m;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (!deletingItem.value) return;
  try {
    await memberService.delete(deletingItem.value.id);
    toast.success('Member deleted successfully');
    showDeleteModal.value = false;
    deletingItem.value = null;
    fetchData();
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to delete');
  }
}

onMounted(fetchData);
</script>
