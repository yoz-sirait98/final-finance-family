<template>
  <div class="recurring-page fade-in">
    <div id="tour-recurring-header" class="page-header d-flex justify-content-between align-items-center">
      <div><h4>Recurring Transactions</h4><p>Manage automatic repeating transactions</p></div>
      <button id="tour-recurring-add-btn" class="btn btn-primary-gradient" @click="openCreate"><i class="bi bi-plus-lg me-1"></i>Add Recurring</button>
    </div>
    <div id="tour-recurring-list" class="table-card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead><tr><th>Description</th><th>Amount</th><th>Frequency</th><th>Next Due</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary"></div> Loading...
              </td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="7" class="text-center py-4 text-muted">No recurring transactions</td>
            </tr>
            <template v-else>
              <tr v-for="r in items" :key="r.id">
                <td>{{ r.description || r.category?.name || '-' }}</td>
                <td class="fw-semibold">{{ formatCurrency(r.amount) }}</td>
                <td><span class="badge bg-info">{{ r.frequency }}</span></td>
                <td>{{ r.next_due_date }}</td>
                <td><span class="badge" :class="r.is_active ? 'bg-success' : 'bg-secondary'">{{ r.is_active ? 'Active' : 'Inactive' }}</span></td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" @click="openEdit(r)"><i class="bi bi-pencil"></i></button>
                    <button class="btn btn-outline-warning" @click="toggleActive(r)"><i class="bi bi-toggle-on"></i></button>
                    <button class="btn btn-outline-danger" @click="confirmDelete(r)"><i class="bi bi-trash"></i></button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="vue-modal-backdrop" @mousedown.self="showModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingId ? 'Edit' : 'Add' }} Recurring</h5>
          <button type="button" class="btn-close" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="save">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label" for="recMember">Member</label>
              <select id="recMember" name="member_id" v-model="form.member_id" class="form-select">
                <option value="" disabled>- Member -</option>
                <template v-for="m in members" :key="m.id">
                  <option v-if="m.is_active || m.id === form.member_id" :value="m.id">{{ m.name }}{{ !m.is_active ? ' (Inactive)' : '' }}</option>
                </template>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="recAccount">Account</label>
              <select id="recAccount" name="account_id" v-model="form.account_id" class="form-select">
                <option value="" disabled>- Account -</option>
                <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>                
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="recCategory">Category</label>
              <select id="recCategory" name="category_id" v-model="form.category_id" class="form-select">
                <option value="" disabled>- Category -</option>
                <option v-for="c in groupedCategories.expense" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="recAmount">Amount (Rp)</label>
              <input id="recAmount" name="amount" v-model.number="form.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="recDesc">Description</label>
              <input id="recDesc" name="description" v-model="form.description" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label" for="recFreq">Frequency</label>
              <select id="recFreq" name="frequency" v-model="form.frequency" class="form-select">
                <option value="" disabled>- Frequency -</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="recNextDate">Next Due Date</label>
              <input id="recNextDate" name="next_due_date" v-model="form.next_due_date" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="recEndDate">End Date (optional)</label>
              <input id="recEndDate" name="end_date" v-model="form.end_date" type="date" class="form-control" />
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
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Delete Recurring Transaction</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Are you sure you want to delete this recurring transaction? This cannot be undone.</p>
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTour } from '../composables/useTour';
import { recurringTourSteps } from '../tours/recurringTour';
import { formatCurrency } from '../utils/format';
import { recurringService } from '../services/recurringService';
import { memberService } from '../services/memberService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { useToastStore } from '../stores/toast';

const items = ref([]);
const members = ref([]);
const accounts = ref([]);
const categories = ref([]);
const groupedCategories = computed(() => {
  const groups = { income: [], expense: [] };
  categories.value.forEach(c => {
    if (groups[c.type]) groups[c.type].push(c);
  });
  return groups;
});
const loading = ref(true);
const editingId = ref(null);
const form = ref({ type: '', member_id: '', account_id: '', category_id: '', amount: '', description: '', frequency: '', next_due_date: '', end_date: '' });
const formError = ref('');

const showModal = ref(false);
const showDeleteModal = ref(false);
const deletingItem = ref(null);
const toast = useToastStore();

async function fetchData() {
  loading.value = true;
  try {
    const { data } = await recurringService.list();
    items.value = data.data;
  } finally {
    loading.value = false;
  }
}

function openCreate() {
  editingId.value = null;
  form.value = { type: 'expense', member_id: '', account_id: '', category_id: '', amount: '', description: '', frequency: '', next_due_date: '', end_date: '' };
  formError.value = '';
  showModal.value = true;
}

function openEdit(r) {
  editingId.value = r.id;
  form.value = { type: 'expense', member_id: r.member_id || '', account_id: r.account_id || '', category_id: r.category_id || '', amount: r.amount, description: r.description || '', frequency: r.frequency, next_due_date: r.next_due_date_raw, end_date: r.end_date || '' };
  formError.value = '';
  showModal.value = true;
}

async function save() {
  formError.value = '';
  try {
    const payload = { ...form.value };
    if (!payload.end_date) {
      payload.end_date = null;
    }
    
    if (editingId.value) {
      await recurringService.update(editingId.value, payload);
      toast.success('Recurring transaction updated');
    } else {
      await recurringService.create(payload);
      toast.success('Recurring transaction created');
    }
    showModal.value = false;
    fetchData();
  } catch(e) {
    formError.value = e.message || 'Error occurred';
    toast.error(formError.value);
  }
}

async function toggleActive(r) {
  try {
    await recurringService.update(r.id, { is_active: !r.is_active });
    toast.success('Recurring status updated');
    fetchData();
  } catch (e) {
    toast.error(e.message || 'Error toggling status');
  }
}

function confirmDelete(r) {
  deletingItem.value = r;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (!deletingItem.value) return;
  try {
    await recurringService.delete(deletingItem.value.id);
    toast.success('Recurring transaction deleted');
    showDeleteModal.value = false;
    deletingItem.value = null;
    fetchData();
  } catch(e) {
    toast.error(e.message || 'Failed to delete recurring transaction');
  }
}

const { startTour, startAutoTour } = useTour('recurring');

onMounted(async () => {
  const fetchPromise = fetchData();

  const [memRes, accRes, catRes] = await Promise.all([
    memberService.list(),
    accountService.list(),
    categoryService.list()
  ]);

  members.value = memRes.data.data;
  accounts.value = accRes.data.data;
  categories.value = catRes.data.data;

  await fetchPromise;
  startAutoTour(recurringTourSteps);
  window.addEventListener('start-recurring-tour', () => startTour(recurringTourSteps));
});

onUnmounted(() => {
  window.removeEventListener('start-recurring-tour', () => startTour(recurringTourSteps));
});
</script>
