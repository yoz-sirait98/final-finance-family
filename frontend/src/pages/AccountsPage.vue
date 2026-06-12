<template>
  <div class="accounts-page fade-in">
    <div id="tour-accounts-header" class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h4>{{ $t('accounts.title') }}</h4>
        <p>{{ $t('accounts.subtitle') }}</p>
      </div>
      <button id="tour-accounts-add-btn" class="btn btn-primary-gradient" @click="openCreate">
        <i class="bi bi-plus-lg"></i><span class="d-none d-sm-inline">{{ $t('accounts.addAccount') }}</span>
      </button>
    </div>
    <div id="tour-accounts-list" class="row g-3">
      <div v-for="acc in accounts" :key="acc.id" class="col-md-6 col-lg-4">
        <div class="stat-card">
          <div class="d-flex align-items-center gap-2 mb-2">
            <div class="stat-icon" style="background:linear-gradient(135deg,#667eea,#764ba2);width:40px;height:40px;font-size:1rem">
              <i :class="acc.icon || 'bi bi-bank'"></i>
            </div>
            <div>
              <h6 class="mb-0 fw-bold">{{ acc.name }}</h6>
              <small class="text-muted text-uppercase">
                {{ $t('accounts.type.' + (acc.type === 'ewallet' ? 'e_wallet' : acc.type)) }}
              </small>
            </div>
          </div>
          <div class="stat-value mb-2" :title="formatCurrency(acc.balance)">{{ formatCurrency(acc.balance) }}</div>
          <div v-if="acc.initial_balance" class="small text-muted mb-2">
            {{ $t('accounts.balancePlaceholder') }}: {{ formatCurrency(acc.initial_balance) }}
          </div>
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
          <h5 class="modal-title">{{ editingId ? $t('accounts.editAccount') : $t('accounts.addAccount') }}</h5>
          <button type="button" class="btn-close" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="save">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.name') }}</label>
              <input v-model="form.name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.type') }}</label>
              <select v-model="form.type" class="form-select" required>
                <option value="" disabled>- {{ $t('common.type') }} -</option>
                <option value="bank">{{ $t('accounts.type.bank') }}</option>
                <option value="cash">{{ $t('accounts.type.cash') }}</option>
                <option value="ewallet">{{ $t('accounts.type.e_wallet') }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('accounts.balancePlaceholder') }} (Rp)</label>
              <input v-model.number="form.initial_balance" type="number" class="form-control" min="0" />
              <div v-if="editingId" class="form-text">
                {{ localeStore.currentLocale === 'id' ? 'Mengubah ini akan menghitung ulang saldo saat ini.' : 'Changing this will recalculate the current balance.' }}
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Icon (Bootstrap Icon class)</label>
              <input v-model="form.icon" class="form-control" placeholder="bi-bank" />
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
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>{{ $t('common.delete') }} {{ $t('common.account') }}</h5>
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
import { ref, onMounted, onUnmounted } from 'vue';
import { useTour } from '../composables/useTour';
import { accountsTourSteps } from '../tours/accountsTour';
import { formatCurrency } from '../utils/format';
import { accountService } from '../services/accountService';
import { useToastStore } from '../stores/toast';
import { useLocaleStore } from '../stores/locale';

const accounts = ref([]);
const editingId = ref(null);
const form = ref({ name: '', type: '', initial_balance: 0, icon: 'bi-bank' });
const formError = ref('');
let originalInitialBalance = 0;
let originalBalance = 0;
const localeStore = useLocaleStore();

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
  form.value = { name: '', type: '', initial_balance: 0, icon: 'bi-bank' };
  formError.value = '';
  showModal.value = true;
}

function openEdit(a) {
  editingId.value = a.id;
  form.value = { name: a.name, type: a.type, icon: a.icon || '', initial_balance: a.initial_balance ?? 0 };
  originalInitialBalance = a.initial_balance ?? 0;
  originalBalance = a.balance ?? 0;
  formError.value = '';
  showModal.value = true;
}

async function save() {
  formError.value = '';
  try {
    const payload = { ...form.value };
    payload.initial_balance = payload.initial_balance || 0;
    
    if (editingId.value) {
      if (payload.initial_balance !== originalInitialBalance) {
        payload.balance = originalBalance + (payload.initial_balance - originalInitialBalance);
      }
      await accountService.update(editingId.value, payload);
      toast.success(localeStore.t('common.success'));
    } else {
      payload.balance = payload.initial_balance;
      await accountService.create(payload);
      toast.success(localeStore.t('common.success'));
    }
    showModal.value = false;
    fetchData();
  } catch(e) {
    formError.value = e.response?.data?.message || localeStore.t('common.error');
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
    toast.success(localeStore.t('common.success'));
    showDeleteModal.value = false;
    deletingItem.value = null;
    fetchData();
  } catch(e) {
    toast.error(e.response?.data?.message || localeStore.t('common.error'));
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
