<template>
  <div class="recurring-page fade-in">
    <div id="tour-recurring-header" class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h4>{{ $t('recurring.title') }}</h4>
        <p>{{ $t('recurring.subtitle') }}</p>
      </div>
      <button id="tour-recurring-add-btn" class="btn btn-primary-gradient" @click="openCreate">
        <i class="bi bi-plus-lg"></i><span class="d-none d-sm-inline">{{ $t('recurring.addRecurring') }}</span>
      </button>
    </div>
    <div id="tour-recurring-list" class="table-card">
      <div class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th>{{ $t('common.description') }}</th>
              <th>{{ $t('common.amount') }}</th>
              <th>{{ $t('recurring.interval') }}</th>
              <th>{{ $t('recurring.nextDue') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary"></div> {{ $t('common.loading') }}
              </td>
            </tr>
            <tr v-else-if="!items.length">
              <td colspan="6" class="text-center py-4 text-muted">
                {{ localeStore.currentLocale === 'id' ? 'Tidak ada transaksi berulang' : 'No recurring transactions' }}
              </td>
            </tr>
            <template v-else>
              <tr v-for="r in items" :key="r.id">
                <td>{{ r.description || r.category?.name || '-' }}</td>
                <td class="fw-semibold">{{ formatCurrency(r.amount) }}</td>
                <td><span class="badge bg-info">{{ $t('recurring.intervals.' + r.frequency) }}</span></td>
                <td>{{ r.next_due_date }}</td>
                <td>
                  <span class="badge" :class="r.is_active ? 'bg-success' : 'bg-secondary'">
                    {{ r.is_active ? $t('common.active') : $t('common.inactive') }}
                  </span>
                </td>
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
          <h5 class="modal-title">{{ editingId ? $t('recurring.editRecurring') : $t('recurring.addRecurring') }}</h5>
          <button type="button" class="btn-close" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="save">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label" for="recMember">{{ $t('common.member') }}</label>
              <select id="recMember" name="member_id" v-model="form.member_id" class="form-select">
                <option value="" disabled>- {{ $t('common.member') }} -</option>
                <template v-for="m in members" :key="m.id">
                  <option v-if="m.is_active || m.id === form.member_id" :value="m.id">{{ m.name }}{{ !m.is_active ? ' (' + $t('common.inactive') + ')' : '' }}</option>
                </template>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="recAccount">{{ $t('common.account') }}</label>
              <select id="recAccount" name="account_id" v-model="form.account_id" class="form-select">
                <option value="" disabled>- {{ $t('common.account') }} -</option>
                <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>                
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="recCategory">{{ $t('common.category') }}</label>
              <select id="recCategory" name="category_id" v-model="form.category_id" class="form-select">
                <option value="" disabled>- {{ $t('common.category') }} -</option>
                <option v-for="c in groupedCategories.expense" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="recAmount">{{ $t('common.amount') }} (Rp)</label>
              <input id="recAmount" name="amount" v-model.number="form.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="recDesc">{{ $t('common.description') }}</label>
              <input id="recDesc" name="description" v-model="form.description" class="form-control" />
            </div>
            <div class="mb-3">
              <label class="form-label" for="recFreq">{{ $t('recurring.interval') }}</label>
              <select id="recFreq" name="frequency" v-model="form.frequency" class="form-select">
                <option value="" disabled>- {{ $t('recurring.interval') }} -</option>
                <option value="weekly">{{ $t('recurring.intervals.weekly') }}</option>
                <option value="monthly">{{ $t('recurring.intervals.monthly') }}</option>
                <option value="yearly">{{ $t('recurring.intervals.yearly') }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="recNextDate">{{ $t('recurring.nextDue') }}</label>
              <input id="recNextDate" name="next_due_date" v-model="form.next_due_date" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="recEndDate">
                {{ localeStore.currentLocale === 'id' ? 'Tanggal Berakhir (opsional)' : 'End Date (optional)' }}
              </label>
              <input id="recEndDate" name="end_date" v-model="form.end_date" type="date" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient">{{ $t('common.save') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>{{ $t('common.delete') }} {{ $t('recurring.title') }}</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ $t('common.confirmDelete') }}</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-danger" @click="doDelete">{{ $t('common.delete') }}</button>
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
import { useLocaleStore } from '../stores/locale';

const items = ref([]);
const members = ref([]);
const accounts = ref([]);
const categories = ref([]);
const localeStore = useLocaleStore();

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
      toast.success(localeStore.t('common.success'));
    } else {
      await recurringService.create(payload);
      toast.success(localeStore.t('common.success'));
    }
    showModal.value = false;
    fetchData();
  } catch(e) {
    formError.value = e.message || localeStore.t('common.error');
    toast.error(formError.value);
  }
}

async function toggleActive(r) {
  try {
    await recurringService.update(r.id, { is_active: !r.is_active });
    toast.success(localeStore.t('common.success'));
    fetchData();
  } catch (e) {
    toast.error(e.message || localeStore.t('common.error'));
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
    toast.success(localeStore.t('common.success'));
    showDeleteModal.value = false;
    deletingItem.value = null;
    fetchData();
  } catch(e) {
    toast.error(e.message || localeStore.t('common.error'));
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
