<template>
  <div class="project-pockets-page fade-in">
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4>{{ localeStore.currentLocale === 'id' ? 'Kantong Proyek' : 'Project Pockets' }}</h4>
        <p class="text-muted">{{ localeStore.currentLocale === 'id' ? 'Kelola pengeluaran khusus acara besar tanpa mengganggu anggaran bulanan' : 'Manage spending for large events without ruining your monthly budget' }}</p>
      </div>
    </div>

    <!-- Pockets Grid -->
    <div class="row g-4 mb-5">
      <div v-for="pocket in pockets" :key="pocket.id" class="col-md-6 col-lg-4">
        <div class="stat-card h-100 position-relative" :class="{ 'active-pocket-card': pocket.isActive }">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h5 class="fw-bold mb-1">
                <i v-if="pocket.isActive" class="bi bi-briefcase-fill text-primary me-2"></i>
                <i v-else class="bi bi-briefcase text-muted me-2"></i>
                {{ pocket.name }}
              </h5>
              <div v-if="pocket.account_name" class="badge bg-info bg-opacity-10 text-info mt-1 mb-1">
                <i class="bi bi-link-45deg"></i> {{ pocket.account_name }}
              </div>
            </div>
            <span class="badge" :class="pocket.isActive ? 'bg-success' : 'bg-warning text-dark'">
              {{ pocket.isActive ? (localeStore.currentLocale === 'id' ? 'Aktif' : 'Active') : (localeStore.currentLocale === 'id' ? 'Pendanaan' : 'Funding Phase') }}
            </span>
          </div>

          <div class="mb-3">
            <div class="d-flex justify-content-between small text-muted mb-1">
              <span>{{ localeStore.currentLocale === 'id' ? 'Tersedia' : 'Available' }}: <strong>{{ formatCurrency(pocket.current_amount) }}</strong></span>
              <span>{{ localeStore.currentLocale === 'id' ? 'Target' : 'Target' }}: {{ formatCurrency(pocket.target_amount) }}</span>
            </div>
            <div class="progress" style="height:8px">
              <div class="progress-bar" 
                   :class="pocket.isActive ? 'bg-success' : 'bg-primary'" 
                   :style="{ width: pocket.progress_percentage + '%' }">
              </div>
            </div>
          </div>

          <div class="mt-auto d-flex gap-2">
            <button 
              class="btn w-50" 
              :class="pocket.isActive ? 'btn-primary-gradient' : 'btn-outline-secondary'"
              :disabled="!pocket.isActive"
              @click="openLogExpense(pocket)"
            >
              <i class="bi bi-receipt me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Catat' : 'Log' }}
            </button>
            <button 
              class="btn btn-outline-info w-50" 
              @click="openViewExpenses(pocket)"
            >
              <i class="bi bi-list-ul me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Pengeluaran' : 'Expenses' }}
            </button>
          </div>
        </div>
      </div>
      
      <div v-if="pockets.length === 0" class="col-12 text-center py-5 text-muted">
        <i class="bi bi-inboxes fs-1 mb-3 d-block text-secondary"></i>
        <h5>{{ localeStore.currentLocale === 'id' ? 'Tidak ada Kantong Proyek' : 'No Project Pockets yet' }}</h5>
        <p>{{ localeStore.currentLocale === 'id' ? 'Kantong Proyek diambil dari Target Menabung. Buat target menabung terlebih dahulu.' : 'Project Pockets are powered by Saving Goals. Create a goal first.' }}</p>
        <button class="btn btn-outline-primary mt-2" @click="router.push('/goals')">
          {{ localeStore.currentLocale === 'id' ? 'Ke Halaman Target' : 'Go to Goals Page' }}
        </button>
      </div>
    </div>

    <!-- Log Expense Modal -->
    <div v-if="showModal" class="vue-modal-backdrop" @mousedown.self="showModal = false">
      <div class="vue-modal">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title">
            <i class="bi bi-receipt me-2 text-primary"></i>
            {{ localeStore.currentLocale === 'id' ? 'Catat Pengeluaran' : 'Log Expense' }} - {{ activePocket?.name }}
          </h5>
          <button type="button" class="btn-close" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="saveExpense">
          <div class="modal-body">
            <div class="alert alert-info py-2 small mb-4">
              <i class="bi bi-info-circle me-1"></i>
              {{ localeStore.currentLocale === 'id' 
                  ? 'Pengeluaran ini akan memotong saldo kantong proyek dan tidak akan masuk ke anggaran bulanan Anda.' 
                  : 'This expense will be deducted from the pocket balance and will not affect your monthly budget.' }}
            </div>

            <div v-if="formError" class="alert alert-danger py-2 small">{{ formError }}</div>

            <div class="mb-3">
              <label class="form-label">{{ $t('common.amount') }} (Rp)</label>
              <input v-model.number="form.amount" type="number" class="form-control form-control-lg fw-bold text-danger" min="1" required />
              <div class="form-text small text-muted">
                {{ localeStore.currentLocale === 'id' ? 'Sisa Saldo' : 'Remaining Balance' }}: {{ formatCurrency(activePocket?.remaining) }}
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ localeStore.currentLocale === 'id' ? 'Bayar dari Rekening mana?' : 'Paid from which account?' }}</label>
              <select v-model="form.account_id" class="form-select" required :disabled="activePocket?.account_id">
                <option value="" disabled>-- {{ $t('transactions.selectAccount') }} --</option>
                <optgroup v-for="(accs, t) in groupedAccounts" :key="t" :label="t">
                  <option v-for="a in accs" :key="a.id" :value="a.id">{{ a.name }} ({{ formatCurrency(a.balance) }})</option>
                </optgroup>
              </select>
              <div v-if="activePocket?.account_id" class="form-text text-success small">
                {{ localeStore.currentLocale === 'id' ? 'Rekening dikunci karena proyek ini terhubung langsung ke rekening tertentu.' : 'Account locked because this project is directly linked to a specific account.' }}
              </div>
            </div>

            <div class="row">
              <div class="col-6 mb-3">
                <label class="form-label">{{ $t('common.category') }}</label>
                <select v-model="form.category_id" class="form-select" required>
                  <option value="" disabled>-- {{ $t('transactions.selectCategory') }} --</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>
              <div class="col-6 mb-3">
                <label class="form-label">{{ $t('common.member') }}</label>
                <select v-model="form.member_id" class="form-select" required>
                  <option value="" disabled>-- {{ $t('transactions.selectMember') }} --</option>
                  <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
                </select>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label">{{ $t('common.date') }}</label>
              <input v-model="form.transaction_date" type="date" class="form-control" required />
            </div>

            <div class="mb-3">
              <label class="form-label">{{ $t('common.description') }}</label>
              <input v-model="form.description" type="text" class="form-control" placeholder="e.g., Flight tickets to Bali" required />
            </div>
          </div>
          <div class="modal-footer border-top-0 pt-0">
            <button type="button" class="btn btn-light" @click="showModal = false" :disabled="saving">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Expenses Modal -->
    <div v-if="showExpensesModal" class="vue-modal-backdrop" @mousedown.self="showExpensesModal = false">
      <div class="vue-modal" style="max-width: 600px;">
        <div class="modal-header border-bottom-0 pb-0">
          <h5 class="modal-title">
            <i class="bi bi-list-ul me-2 text-info"></i>
            {{ localeStore.currentLocale === 'id' ? 'Daftar Pengeluaran' : 'Expense List' }} - {{ activePocket?.name }}
          </h5>
          <button type="button" class="btn-close" @click="showExpensesModal = false"></button>
        </div>
        <div class="modal-body">
          <div v-if="activePocketTransactions.length === 0" class="text-center py-4 text-muted">
            <i class="bi bi-inboxes fs-2 mb-2 d-block"></i>
            {{ localeStore.currentLocale === 'id' ? 'Belum ada pengeluaran dicatat.' : 'No expenses logged yet.' }}
          </div>
          <div v-else class="list-group list-group-flush">
            <div v-for="tx in activePocketTransactions" :key="tx.id" class="list-group-item d-flex justify-content-between align-items-center py-3 px-0 border-light">
              <div>
                <h6 class="mb-0 fw-bold">{{ tx.description }}</h6>
                <small class="text-muted">{{ tx.transaction_date }} &bull; {{ tx.account?.name }} &bull; {{ tx.member?.name }}</small>
              </div>
              <div class="d-flex align-items-center gap-3">
                <span class="fw-bold text-danger">-{{ formatCurrency(tx.amount) }}</span>
                <button class="btn btn-sm btn-outline-danger border-0" @click="deleteExpense(tx)" :disabled="deletingTx">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-top-0 pt-0">
          <button type="button" class="btn btn-light" @click="showExpensesModal = false">{{ $t('common.close') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../stores/locale';
import { useToastStore } from '../stores/toast';
import { goalService } from '../services/goalService';
import { accountService } from '../services/accountService';
import { memberService } from '../services/memberService';
import { categoryService } from '../services/categoryService';
import { transactionService } from '../services/transactionService';
import { formatCurrency } from '../utils/format';

const router = useRouter();
const localeStore = useLocaleStore();
const toast = useToastStore();

const pockets = ref([]);
const accounts = ref([]);
const members = ref([]);
const categories = ref([]);

const showModal = ref(false);
const showExpensesModal = ref(false);
const saving = ref(false);
const deletingTx = ref(false);
const activePocket = ref(null);
const activePocketTransactions = ref([]);
const allTransactions = ref([]);
const formError = ref('');

const form = ref({
  amount: '',
  account_id: '',
  category_id: '',
  member_id: '',
  transaction_date: '',
  description: ''
});

const groupedAccounts = computed(() => {
  const groups = {};
  accounts.value.forEach(a => {
    const t = a.type || 'other';
    let typeLabel = t;
    if (t === 'ewallet') typeLabel = 'e-Wallet';
    else typeLabel = t.charAt(0).toUpperCase() + t.slice(1);
    if (!groups[typeLabel]) groups[typeLabel] = [];
    groups[typeLabel].push(a);
  });
  return groups;
});

async function loadData() {
  const [goalsRes, accRes, memRes, catRes] = await Promise.all([
    goalService.list(),
    accountService.list(),
    memberService.list(),
    categoryService.list()
  ]);

  // Load transactions manually or write a new custom query to get all project transactions
  const { data: txRes } = await supabase.from('transactions').select('*, account:accounts(name), member:members(name)').not('goal_id', 'is', null);
  allTransactions.value = txRes || [];

  pockets.value = (goalsRes.data?.data || []).map(g => {
    const spent = allTransactions.value.filter(tx => tx.goal_id === g.id).reduce((sum, tx) => sum + Number(tx.amount), 0);
    const remaining = Number(g.current_amount || 0) - spent;
    return {
      ...g,
      spent,
      remaining,
      isActive: g.progress_percentage >= 100 || g.status === 'completed'
    };
  });

  accounts.value = accRes.data?.data || [];
  members.value = memRes.data?.data || [];
  categories.value = (catRes.data?.data || []).filter(c => c.type === 'expense');
}

function openLogExpense(pocket) {
  activePocket.value = pocket;
  formError.value = '';
  form.value = {
    amount: '',
    account_id: pocket.account_id || '', // Pre-select if linked
    category_id: '',
    member_id: '',
    transaction_date: new Date().toISOString().split('T')[0],
    description: ''
  };
  showModal.value = true;
}

async function saveExpense() {
  if (form.value.amount > activePocket.value.remaining) {
    formError.value = localeStore.currentLocale === 'id' 
      ? 'Jumlah pengeluaran tidak boleh melebihi sisa saldo kantong.' 
      : 'Expense amount cannot exceed the remaining pocket balance.';
    return;
  }

  formError.value = '';
  saving.value = true;

  try {
    const payload = {
      type: 'expense',
      amount: form.value.amount,
      account_id: form.value.account_id,
      category_id: form.value.category_id,
      member_id: form.value.member_id,
      transaction_date: form.value.transaction_date,
      description: form.value.description,
      goal_id: activePocket.value.id // TAG TO POCKET!
    };

    await transactionService.create(payload);
    
    toast.success(localeStore.t('common.success'));
    showModal.value = false;
    await loadData(); // Reload balances
  } catch (err) {
    formError.value = err.message || localeStore.t('common.error');
  } finally {
    saving.value = false;
  }
}

function openViewExpenses(pocket) {
  activePocket.value = pocket;
  activePocketTransactions.value = allTransactions.value.filter(tx => tx.goal_id === pocket.id).sort((a,b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  showExpensesModal.value = true;
}

async function deleteExpense(tx) {
  if (!confirm(localeStore.t('common.confirmDelete'))) return;
  deletingTx.value = true;
  try {
    await transactionService.delete(tx.id);
    toast.success(localeStore.t('common.success'));
    await loadData();
    // Refresh modal list
    activePocketTransactions.value = allTransactions.value.filter(t => t.goal_id === activePocket.value.id).sort((a,b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  } catch (err) {
    toast.error(err.message || localeStore.t('common.error'));
  } finally {
    deletingTx.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.active-pocket-card {
  border: 1px solid var(--primary-color);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.1);
  transform: translateY(-2px);
  transition: all 0.3s ease;
}

.active-pocket-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 4px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
}
</style>
