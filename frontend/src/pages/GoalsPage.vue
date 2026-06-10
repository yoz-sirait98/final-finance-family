<template>
  <div class="goals-page fade-in">
    <div id="tour-goals-header" class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h4>{{ $t('goals.title') }}</h4>
        <p>{{ $t('goals.subtitle') }}</p>
      </div>
      <button id="tour-goals-add-btn" class="btn btn-primary-gradient" @click="openCreate">
        <i class="bi bi-plus-lg me-1"></i>{{ $t('goals.addGoal') }}
      </button>
    </div>
    <div id="tour-goals-list" class="row g-3">
      <div v-for="g in goals" :key="g.id" class="col-md-6 col-lg-4">
        <div class="stat-card position-relative overflow-hidden" :class="{ 'goal-completed-card': g.progress_percentage >= 100 || g.status === 'completed' }">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="fw-bold mb-0">
                <i v-if="g.progress_percentage >= 100 || g.status === 'completed'" class="bi bi-star-fill text-warning me-1 bounce-animation"></i>
                {{ g.name }}
              </h6>
              <div v-if="g.account_id" class="badge bg-info mt-1 mb-1 me-1"><i class="bi bi-link-45deg"></i> {{ g.account_name }}</div>
              <small class="text-muted d-block">{{ g.deadline || (localeStore.currentLocale === 'id' ? 'Tidak ada tenggat' : 'No deadline') }}</small>
            </div>
            <span class="badge" :class="g.status === 'active' ? 'bg-primary' : g.status === 'completed' ? 'bg-success' : g.status === 'inactive' ? 'bg-warning text-dark' : 'bg-secondary'">
              {{ $t('common.' + g.status) }}
            </span>
          </div>
          <div class="d-flex justify-content-between small text-muted mb-1">
            <span>{{ formatCurrency(g.current_amount) }}</span>
            <span>{{ formatCurrency(g.target_amount) }}</span>
          </div>
          <div class="progress mb-2" style="height:10px">
            <div class="progress-bar bg-primary" :style="{ width: g.progress_percentage + '%' }"></div>
          </div>
          <div class="small text-muted mb-3">
            {{ localeStore.currentLocale === 'id' ? g.progress_percentage + '% selesai' : g.progress_percentage + '% complete' }}
          </div>
          <div class="d-flex gap-1">
            <button v-if="g.status === 'active' && !g.account_id" class="btn btn-sm btn-primary-gradient" @click="openContribute(g)">
              <i class="bi bi-plus-circle me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Tabung' : 'Contribute' }}
            </button>
            <button class="btn btn-sm btn-outline-primary" @click="openEdit(g)"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(g)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="vue-modal-backdrop" @mousedown.self="showModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingId ? $t('goals.editGoal') : $t('goals.addGoal') }}</h5>
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
              <label class="form-label">{{ $t('goals.targetAmount') }} (Rp)</label>
              <input v-model.number="form.target_amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3" v-if="editingId">
              <label class="form-label">{{ $t('goals.currentAmount') }}</label>
              <input type="text" class="form-control bg-light" :value="formatCurrency(editingGoal?.current_amount || 0)" disabled readonly />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('goals.linkedAccount') }}</label>
              <select v-model="form.account_id" class="form-select">
                <option value="">-- {{ localeStore.currentLocale === 'id' ? 'Tanpa Akun Terhubung' : 'No Account Linked' }} --</option>
                <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
              <div class="form-text small">{{ $t('goals.linkedAccountInfo') }}</div>
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('goals.deadline') }}</label>
              <input v-model="form.deadline" type="date" class="form-control" />
            </div>
            <div class="mb-3" v-if="editingId">
              <label class="form-label">{{ $t('common.status') }}</label>
              <select v-model="form.status" class="form-select">
                <option value="active">{{ $t('common.active') }}</option>
                <option value="completed" :disabled="editingGoal && editingGoal.current_amount < form.target_amount">{{ $t('common.completed') }}</option>
                <option value="cancelled">{{ $t('common.cancelled') }}</option>
                <option value="inactive">{{ $t('common.inactive') }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" :disabled="saving" @click="showModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Contribute Modal -->
    <div v-if="showContributeModal" class="vue-modal-backdrop" @mousedown.self="showContributeModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">
            {{ localeStore.currentLocale === 'id' ? 'Tabung untuk' : 'Contribute to' }} {{ contributingGoal?.name }}
          </h5>
          <button type="button" class="btn-close" @click="showContributeModal = false"></button>
        </div>
        <form @submit.prevent="doContribute">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">{{ $t('common.amount') }} (Rp)</label>
              <input v-model.number="contributeForm.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ localeStore.currentLocale === 'id' ? 'Catatan' : 'Note' }}</label>
              <input v-model="contributeForm.note" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" :disabled="saving" @click="showContributeModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ localeStore.currentLocale === 'id' ? 'Tabung' : 'Contribute' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>{{ $t('common.delete') }} {{ $t('goals.title') }}</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ $t('common.confirmDelete') }}</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" :disabled="deleting" @click="showDeleteModal = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Warning Modal for Goals with Transactions -->
    <div v-if="showWarningModal" class="vue-modal-backdrop" @mousedown.self="showWarningModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-warning"><i class="bi bi-exclamation-triangle-fill me-2"></i>{{ localeStore.currentLocale === 'id' ? 'Tidak Dapat Menghapus' : 'Cannot Delete' }}</h5>
          <button type="button" class="btn-close" @click="showWarningModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ localeStore.currentLocale === 'id' ? 'Anda tidak dapat menghapus target menabung ini karena masih memiliki transaksi pengeluaran (Kantong Proyek). Harap hapus semua transaksi yang terkait dengan target ini di halaman Transaksi terlebih dahulu.' : 'You cannot delete this saving goal because it has logged expense transactions (Project Pockets). Please delete all related transactions in the Transactions page first.' }}</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-primary" @click="showWarningModal = false">{{ $t('common.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useTour } from '../composables/useTour';
import { goalsTourSteps } from '../tours/goalsTour';
import { formatCurrency } from '../utils/format';
import { goalService } from '../services/goalService';
import { accountService } from '../services/accountService';
import { useToastStore } from '../stores/toast';
import { useLocaleStore } from '../stores/locale';

const goals = ref([]);
const accounts = ref([]);
const editingId = ref(null);
const editingGoal = ref(null);
const form = ref({ name: '', target_amount: 0, deadline: '', status: 'active' });
const formError = ref('');
const localeStore = useLocaleStore();

const showModal = ref(false);
const showContributeModal = ref(false);
const showDeleteModal = ref(false);
const showWarningModal = ref(false);

const contributingGoal = ref(null);
const contributeForm = ref({ amount: 0, note: '' });
const deletingItem = ref(null);
const toast = useToastStore();

const saving = ref(false);
const deleting = ref(false);

async function fetchData() {
  const { data } = await goalService.list();
  goals.value = data.data;
}

function openCreate() {
  editingId.value = null;
  editingGoal.value = null;
  form.value = { name: '', target_amount: 0, deadline: '', account_id: '', status: 'active' };
  formError.value = '';
  showModal.value = true;
}

function openEdit(g) {
  editingId.value = g.id;
  editingGoal.value = g;
  form.value = { name: g.name, target_amount: g.target_amount, deadline: g.deadline_raw || '', account_id: g.account_id || '', status: g.status || 'active' };
  formError.value = '';
  showModal.value = true;
}

function openContribute(g) {
  contributingGoal.value = g;
  contributeForm.value = { amount: 0, note: '' };
  showContributeModal.value = true;
}

async function save() {
  formError.value = '';
  saving.value = true;
  
  if (form.value.status === 'completed' && editingGoal.value && editingGoal.value.current_amount < form.value.target_amount) {
    formError.value = localeStore.t('goals.completedManuallyError');
    saving.value = false;
    return;
  }

  try {
    const payload = {
      name: form.value.name,
      target_amount: form.value.target_amount,
      deadline: form.value.deadline || null,
      account_id: form.value.account_id || null,
      status: form.value.status,
    };
    if (editingId.value) {
      await goalService.update(editingId.value, payload);
      toast.success(localeStore.t('common.success'));
    } else {
      await goalService.create(payload);
      toast.success(localeStore.t('common.success'));
    }
    showModal.value = false;
    fetchData();
  } catch(e) {
    formError.value = e.message || localeStore.t('common.error');
    toast.error(formError.value);
  } finally {
    saving.value = false;
  }
}

async function doContribute() {
  saving.value = true;
  try {
    await goalService.contribute(contributingGoal.value.id, contributeForm.value);
    toast.success(localeStore.t('common.success'));
    showContributeModal.value = false;
    fetchData();
  } catch(e) {
    toast.error(e.message || localeStore.t('common.error'));
  } finally {
    saving.value = false;
  }
}

async function confirmDelete(g) {
  deletingItem.value = g;
  try {
    const hasTx = await goalService.checkHasTransactions(g.id);
    if (hasTx) {
      showWarningModal.value = true;
      return;
    }
    showDeleteModal.value = true;
  } catch(e) {
    toast.error(e.message || localeStore.t('common.error'));
  }
}

async function doDelete() {
  if (!deletingItem.value) return;
  deleting.value = true;
  try {
    await goalService.delete(deletingItem.value.id);
    toast.success(localeStore.t('common.success'));
    showDeleteModal.value = false;
    deletingItem.value = null;
    fetchData();
  } catch(e) {
    toast.error(e.message || localeStore.t('common.error'));
  } finally {
    deleting.value = false;
  }
}

const { startTour, startAutoTour } = useTour('goals');

onMounted(async () => {
  const [goalsRes, accRes] = await Promise.all([
    goalService.list().catch(() => ({ data: { data: [] } })),
    accountService.list().catch(() => ({ data: { data: [] } }))
  ]);
  goals.value = goalsRes.data.data;
  accounts.value = accRes.data.data;
  startAutoTour(goalsTourSteps);
  window.addEventListener('start-goals-tour', () => startTour(goalsTourSteps));
});

onUnmounted(() => {
  window.removeEventListener('start-goals-tour', () => startTour(goalsTourSteps));
});
</script>

<style scoped>
.goal-completed-card {
  background: linear-gradient(135deg, #fffdf2 0%, #fffbf0 100%);
  border: 1px solid #ffd700;
  box-shadow: 0 8px 25px rgba(255, 215, 0, 0.25);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

/* Add a premium gold animated shine */
.goal-completed-card::after {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255, 255, 255, 0.6) 50%, rgba(255,255,255,0) 100%);
  transform: rotate(30deg);
  animation: shine 4s infinite linear;
  pointer-events: none;
}

@keyframes shine {
  0% { transform: translateX(-100%) rotate(30deg); }
  20% { transform: translateX(100%) rotate(30deg); }
  100% { transform: translateX(100%) rotate(30deg); }
}

.goal-completed-card .progress-bar {
  background: linear-gradient(90deg, #fceabb, #f8b500) !important;
  box-shadow: 0 0 10px rgba(248, 181, 0, 0.5);
}

.goal-completed-card .badge.bg-success, .goal-completed-card .badge.bg-primary {
  background: linear-gradient(90deg, #fceabb, #f8b500) !important;
  color: #6a4f00 !important;
  box-shadow: 0 2px 5px rgba(248, 181, 0, 0.4);
  font-weight: bold;
}

.goal-completed-card .fw-bold {
  color: #b8860b;
}

.bounce-animation {
  display: inline-block;
  animation: floatBounce 2s infinite ease-in-out;
}

@keyframes floatBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px) scale(1.1); }
}
</style>
