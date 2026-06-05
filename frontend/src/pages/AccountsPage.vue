<template>
  <div class="accounts-page fade-in">
    <div id="tour-accounts-header" class="page-header d-flex justify-content-between align-items-center">
      <div><h4>Accounts</h4><p>Manage bank, cash, and e-wallet accounts</p></div>
      <button id="tour-accounts-add-btn" class="btn btn-primary-gradient" @click="openCreate"><i class="bi bi-plus-lg me-1"></i>Add Account</button>
    </div>
    <div id="tour-accounts-list" class="row g-3">
      <div v-for="acc in accounts" :key="acc.id" class="col-md-4 col-lg-3">
        <div class="stat-card">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="stat-icon" style="background:linear-gradient(135deg,#667eea,#764ba2);width:40px;height:40px;font-size:1rem">
              <i :class="acc.icon || 'bi bi-bank'"></i>
            </div>
            <div>
              <h6 class="mb-0 fw-bold">{{ acc.name }}</h6>
              <small class="text-muted text-uppercase">{{ acc.type }}</small>
            </div>
          </div>
          <div class="stat-value mb-2">{{ acc.balance_formatted }}</div>
          <div v-if="acc.initial_balance_formatted" class="small text-muted mb-2">Opening: {{ acc.initial_balance_formatted }}</div>
          <div class="d-flex gap-1">
            <button class="btn btn-sm btn-outline-primary" @click="openEdit(acc)"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(acc)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="vue-modal-backdrop" @mousedown.self="showModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingId ? 'Edit' : 'Add' }} Account</h5>
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
                <option value="bank">Bank</option>
                <option value="cash">Cash</option>
                <option value="ewallet">E-Wallet</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Initial Balance (Rp)</label>
              <input v-model.number="form.initial_balance" type="number" class="form-control" min="0" />
              <div v-if="editingId" class="form-text">Changing this will recalculate the current balance.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Icon (Bootstrap Icon class)</label>
              <input v-model="form.icon" class="form-control" placeholder="bi-bank" />
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
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Delete Account</h5>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useTour } from '../composables/useTour';
import { accountsTourSteps } from '../tours/accountsTour';
import { accountService } from '../services/accountService';
import { useToastStore } from '../stores/toast';

const accounts = ref([]);
const editingId = ref(null);
const form = ref({ name: '', type: 'bank', initial_balance: 0, icon: 'bi-bank' });
const formError = ref('');

const showModal = ref(false);
const showDeleteModal = ref(false);
const deletingItem = ref(null);
const toast = useToastStore();

async function fetchData() {
  const { data } = await accountService.list();
  accounts.value = data.data;
}

function openCreate() {
  editingId.value = null;
  form.value = { name: '', type: 'bank', initial_balance: 0, icon: 'bi-bank' };
  formError.value = '';
  showModal.value = true;
}

function openEdit(a) {
  editingId.value = a.id;
  form.value = { name: a.name, type: a.type, icon: a.icon || '', initial_balance: a.initial_balance ?? 0 };
  formError.value = '';
  showModal.value = true;
}

async function save() {
  formError.value = '';
  try {
    if (editingId.value) {
      await accountService.update(editingId.value, form.value);
      toast.success('Account updated successfully');
    } else {
      await accountService.create(form.value);
      toast.success('Account created successfully');
    }
    showModal.value = false;
    fetchData();
  } catch(e) {
    formError.value = e.response?.data?.message || 'Error occurred';
    toast.error(formError.value);
  }
}

function confirmDelete(a) {
  deletingItem.value = a;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (!deletingItem.value) return;
  try {
    await accountService.delete(deletingItem.value.id);
    toast.success('Account deleted successfully');
    showDeleteModal.value = false;
    deletingItem.value = null;
    fetchData();
  } catch(e) {
    toast.error(e.response?.data?.message || 'Failed to delete account');
  }
}

const { startTour, startAutoTour } = useTour('accounts');

onMounted(async () => {
  await fetchData();
  startAutoTour(accountsTourSteps);
  window.addEventListener('start-accounts-tour', () => startTour(accountsTourSteps));
});

onUnmounted(() => {
  window.removeEventListener('start-accounts-tour', () => startTour(accountsTourSteps));
});
</script>
