<template>
  <div class="transactions-page fade-in">
    <div id="tour-tx-header" class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h4>Transactions</h4>
        <p>Manage your family transactions</p>
      </div>
      <div class="d-flex gap-2">
        <button id="tour-tx-transfer-btn" class="btn btn-outline-primary" @click="openTransfer">
          <i class="bi bi-arrow-left-right me-1"></i>Transfer
        </button>
        <button id="tour-tx-add-btn" class="btn btn-primary-gradient" @click="openCreate">
          <i class="bi bi-plus-lg me-1"></i>Add Transaction
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div id="tour-tx-filters" class="table-card mb-3">
      <div class="card-header">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <input v-model="filters.search" class="form-control form-control-sm" placeholder="Search..." @input="debouncedFetch" />
          </div>
          <div class="col-md-2">
            <select v-model="filters.type" class="form-select form-select-sm" @change="fetchData">
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.category_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">All Categories</option>
              <optgroup label="Income" v-if="incomeCategories.length">
                <option v-for="c in incomeCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </optgroup>
              <optgroup label="Expense" v-if="expenseCategories.length">
                <option v-for="c in expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </optgroup>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.member_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">All Members</option>
              <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.account_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">All Accounts</option>
              <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="type">
                <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }}</option>
              </optgroup>
            </select>
          </div>
          <div class="col-md-2">
            <input v-model="filters.date_from" type="date" class="form-control form-control-sm" @change="fetchData" />
          </div>
          <div class="col-md-2">
            <input v-model="filters.date_to" type="date" class="form-control form-control-sm" @change="fetchData" />
          </div>
          <div class="col-auto">
            <select v-model="filters.per_page" class="form-select form-select-sm" @change="fetchData">
              <option value="15">15 rows</option>
              <option value="25">25 rows</option>
              <option value="50">50 rows</option>
              <option value="100">100 rows</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-sm btn-outline-secondary" @click="resetFilters"><i class="bi bi-x-lg"></i> Clear</button>
          </div>
        </div>
      </div>

      <div id="tour-tx-table" class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th @click="sort('transaction_date')" style="cursor:pointer">Date <i class="bi bi-arrow-down-up small"></i></th>
              <th>Member</th>
              <th>Account</th>
              <th>Category</th>
              <th>Type</th>
              <th @click="sort('amount')" style="cursor:pointer">Amount <i class="bi bi-arrow-down-up small"></i></th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="8" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary"></div> Loading...
              </td>
            </tr>
            <tr v-else-if="!transactions.length">
              <td colspan="8" class="text-center py-4 text-muted">No transactions found</td>
            </tr>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>{{ tx.transaction_date }}</td>
              <td>{{ tx.member?.name || '-' }}</td>
              <td>{{ tx.account?.name || '-' }}</td>
              <td>{{ tx.category?.name || '-' }}</td>
              <td>
                <span class="badge" :class="'badge-' + tx.type">{{ tx.type }}</span>
              </td>
              <td class="fw-semibold" :class="tx.type === 'income' ? 'text-success' : 'text-danger'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ tx.amount_formatted }}
              </td>
              <td>{{ tx.description || '-' }}</td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-success" @click="openDuplicate(tx)" title="Duplicate"><i class="bi bi-copy"></i></button>
                  <button class="btn btn-outline-primary" @click="openEdit(tx)" title="Edit"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-outline-danger" @click="confirmDelete(tx)" title="Delete"><i class="bi bi-trash"></i></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="meta.last_page > 1" class="card-footer d-flex justify-content-between align-items-center">
        <small class="text-muted">Showing {{ meta.from }}-{{ meta.to }} of {{ meta.total }}</small>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: meta.current_page <= 1 }">
              <a class="page-link" href="#" @click.prevent="goToPage(meta.current_page - 1)">‹</a>
            </li>
            <li v-for="p in meta.last_page" :key="p" class="page-item" :class="{ active: p === meta.current_page }">
              <a class="page-link" href="#" @click.prevent="goToPage(p)">{{ p }}</a>
            </li>
            <li class="page-item" :class="{ disabled: meta.current_page >= meta.last_page }">
              <a class="page-link" href="#" @click.prevent="goToPage(meta.current_page + 1)">›</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- ===== Vue-Native: Create/Edit Modal ===== -->
    <div v-if="showTxModal" class="vue-modal-backdrop" @mousedown.self="showTxModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingId ? 'Edit' : 'Add' }} Transaction</h5>
          <button type="button" class="btn-close" @click="showTxModal = false"></button>
        </div>
        <form @submit.prevent="saveTransaction">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label">Type</label>
              <select v-model="form.type" class="form-select" required>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Member</label>
              <select v-model="form.member_id" class="form-select" required>
                <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Account</label>
              <select v-model="form.account_id" class="form-select" required>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="type">
                  <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }}</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Category</label>
              <select v-model="form.category_id" class="form-select">
                <option value="">None</option>
                <option v-for="c in filteredCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Amount (Rp)</label>
              <input v-model.number="form.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input v-model="form.transaction_date" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <input v-model="form.description" type="text" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showTxModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ editingId ? 'Update' : 'Save' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Vue-Native: Transfer Modal ===== -->
    <div v-if="showTransferModal" class="vue-modal-backdrop" @mousedown.self="showTransferModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">Transfer Between Accounts</h5>
          <button type="button" class="btn-close" @click="showTransferModal = false"></button>
        </div>
        <form @submit.prevent="saveTransfer">
          <div class="modal-body">
            <div v-if="transferError" class="alert alert-danger small">{{ transferError }}</div>
            <div class="mb-3">
              <label class="form-label">Member</label>
              <select v-model="transferForm.member_id" class="form-select" required>
                <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">From Account</label>
              <select v-model="transferForm.from_account_id" class="form-select" required>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="type">
                  <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }} ({{ a.balance_formatted }})</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">To Account</label>
              <select v-model="transferForm.to_account_id" class="form-select" required>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="type">
                  <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }}</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Amount (Rp)</label>
              <input v-model.number="transferForm.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Date</label>
              <input v-model="transferForm.transaction_date" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Description</label>
              <input v-model="transferForm.description" type="text" class="form-control" placeholder="Transfer note" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showTransferModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">Transfer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Vue-Native: Delete Confirm Modal ===== -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Delete Transaction</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Are you sure you want to delete <strong>{{ deletingTx?.description || deletingTx?.amount_formatted }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Budget Over-Budget Confirmation Modal ===== -->
    <div v-if="showBudgetConfirm" class="vue-modal-backdrop" @mousedown.self="showBudgetConfirm = false">
      <div class="vue-modal" style="max-width:460px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-warning">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>Budget Warning
          </h5>
          <button type="button" class="btn-close" @click="showBudgetConfirm = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">
            This expense will <strong>exceed</strong> your
            <strong>{{ budgetConfirmData.category }}</strong> budget for this month.
          </p>
          <div class="table-sm small mb-0">
            <div class="d-flex justify-content-between border-bottom py-1">
              <span class="text-muted">Budget Limit</span>
              <span class="fw-semibold">{{ budgetConfirmData.limitFmt }}</span>
            </div>
            <div class="d-flex justify-content-between border-bottom py-1">
              <span class="text-muted">Already Spent</span>
              <span class="fw-semibold">{{ budgetConfirmData.spentFmt }}</span>
            </div>
            <div class="d-flex justify-content-between border-bottom py-1">
              <span class="text-muted">This Transaction</span>
              <span class="fw-semibold text-danger">{{ budgetConfirmData.addingFmt }}</span>
            </div>
            <div class="d-flex justify-content-between py-1">
              <span class="text-muted">Total After Save</span>
              <span class="fw-bold text-danger">{{ budgetConfirmData.totalFmt }} ({{ budgetConfirmData.pct }}%)</span>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showBudgetConfirm = false">Cancel</button>
          <button class="btn btn-warning" :disabled="saving" @click="doSaveTransaction">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            Yes, save anyway
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useTour } from '../composables/useTour';
import { transactionsTourSteps } from '../tours/transactionsTour';
import { transactionService } from '../services/transactionService';
import { memberService } from '../services/memberService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { budgetService } from '../services/budgetService';
import { todayISO } from '../utils/date';
import { useToastStore } from '../stores/toast';
import { useBudgetStore } from '../stores/budgets';

const transactions = ref([]);
const meta = ref({});
const members = ref([]);
const accounts = ref([]);
const categories = ref([]);
const loading = ref(false);
const saving = ref(false);
const deleting = ref(false);
const formError = ref('');
const transferError = ref('');
const editingId = ref(null);

// Modal visibility
const showTxModal = ref(false);
const showTransferModal = ref(false);
const showDeleteModal = ref(false);
const deletingTx = ref(null);
const toast = useToastStore();
const budgetStore = useBudgetStore();
// Budget over-budget confirmation
const showBudgetConfirm = ref(false);
const budgetConfirmData = ref({});

function fmt(n) {
  const sign = n < 0 ? '-' : '';
  return sign + 'Rp ' + Math.abs(Number(n)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

const filters = ref({
  search: '', type: '', category_id: '', member_id: '',
  account_id: '', date_from: '', date_to: '',
  sort_by: 'transaction_date', sort_dir: 'desc', page: 1, per_page: 15,
});

const form = ref({ type: 'expense', member_id: '', account_id: '', category_id: '', amount: '', transaction_date: todayISO(), description: '' });
const transferForm = ref({ member_id: '', from_account_id: '', to_account_id: '', amount: '', transaction_date: todayISO(), description: '' });

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

const filteredCategories = computed(() => {
  if (!form.value.type) return categories.value;
  return categories.value.filter(c => c.type === form.value.type);
});

const incomeCategories = computed(() => categories.value.filter(c => c.type === 'income'));
const expenseCategories = computed(() => categories.value.filter(c => c.type === 'expense'));

let debounceTimer = null;
function debouncedFetch() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(fetchData, 300);
}

async function fetchData() {
  loading.value = true;
  try {
    const params = {};
    Object.entries(filters.value).forEach(([k, v]) => {
      if (v !== '' && v !== null) params[k] = v;
    });
    const { data } = await transactionService.list(params);
    transactions.value = data.data;
    meta.value = data.meta || {};
  } finally {
    loading.value = false;
  }
}

function sort(field) {
  if (filters.value.sort_by === field) {
    filters.value.sort_dir = filters.value.sort_dir === 'asc' ? 'desc' : 'asc';
  } else {
    filters.value.sort_by = field;
    filters.value.sort_dir = 'desc';
  }
  fetchData();
}

function goToPage(p) {
  filters.value.page = p;
  fetchData();
}

function resetFilters() {
  filters.value = { search: '', type: '', category_id: '', member_id: '', account_id: '', date_from: '', date_to: '', sort_by: 'transaction_date', sort_dir: 'desc', page: 1, per_page: 15 };
  fetchData();
}

function openCreate() {
  editingId.value = null;
  form.value = { type: 'expense', member_id: members.value[0]?.id || '', account_id: accounts.value[0]?.id || '', category_id: '', amount: '', transaction_date: todayISO(), description: '' };
  formError.value = '';
  showTxModal.value = true;
}

function openEdit(tx) {
  editingId.value = tx.id;
  form.value = { type: tx.type, member_id: tx.member?.id, account_id: tx.account?.id, category_id: tx.category?.id || '', amount: tx.amount, transaction_date: tx.transaction_date_raw, description: tx.description || '' };
  formError.value = '';
  showTxModal.value = true;
}

function openDuplicate(tx) {
  editingId.value = null; // Forces creation instead of editing
  form.value = { 
    type: tx.type, 
    member_id: tx.member?.id || '', 
    account_id: tx.account?.id || '', 
    category_id: tx.category?.id || '', 
    amount: tx.amount, 
    transaction_date: todayISO(), 
    description: tx.description || '' 
  };
  formError.value = '';
  showTxModal.value = true;
}

// Called when user clicks Save button — runs budget pre-check for new expenses
async function saveTransaction() {
  formError.value = '';

  // Budget pre-check: only for new expenses with a category
  if (!editingId.value && form.value.type === 'expense' && form.value.category_id) {
    try {
      const { data } = await budgetService.list();
      const budgets = data.data || [];
      const now = new Date();
      const budget = budgets.find(
        b => b.category?.id === form.value.category_id &&
             b.month === now.getMonth() + 1 &&
             b.year  === now.getFullYear()
      );

      if (budget) {
        const totalAfter = budget.spent + Number(form.value.amount);
        if (totalAfter > budget.amount) {
          // Show confirmation dialog instead of saving immediately
          budgetConfirmData.value = {
            category:   budget.category?.name ?? 'this category',
            limitFmt:   fmt(budget.amount),
            spentFmt:   fmt(budget.spent),
            addingFmt:  fmt(form.value.amount),
            totalFmt:   fmt(totalAfter),
            pct:        budget.amount > 0 ? ((totalAfter / budget.amount) * 100).toFixed(1) : '∞',
          };
          showBudgetConfirm.value = true;
          return; // Stop here — wait for user to confirm
        }
      }
    } catch { /* ignore budget fetch errors — allow save */ }
  }

  // No budget issue (or editing) — save directly
  await doSaveTransaction();
}

// Actually performs the API save (called after confirmation or when no budget issue)
async function doSaveTransaction() {
  saving.value = true;
  showBudgetConfirm.value = false;
  formError.value = '';
  try {
    if (editingId.value) {
      await transactionService.update(editingId.value, form.value);
      toast.success('Transaction updated successfully');
    } else {
      await transactionService.create(form.value);
      toast.success('Transaction added successfully');
    }
    showTxModal.value = false;
    fetchData();
    budgetStore.fetchAlerts(); // keep bell in sync after any transaction change
  } catch (err) {
    showBudgetConfirm.value = false;
    formError.value = err.response?.data?.message || 'Failed to save';
    toast.error(formError.value);
  } finally {
    saving.value = false;
  }
}

function confirmDelete(tx) {
  deletingTx.value = tx;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (!deletingTx.value) return;
  deleting.value = true;
  try {
    await transactionService.delete(deletingTx.value.id);
    toast.success('Transaction deleted successfully');
    showDeleteModal.value = false;
    deletingTx.value = null;
    fetchData();
    budgetStore.fetchAlerts(); // keep bell in sync after delete
  } catch (err) {
    toast.error(err.response?.data?.message || 'Failed to delete');
  } finally {
    deleting.value = false;
  }
}

function openTransfer() {
  transferForm.value = { member_id: members.value[0]?.id || '', from_account_id: accounts.value[0]?.id || '', to_account_id: '', amount: '', transaction_date: todayISO(), description: '' };
  transferError.value = '';
  showTransferModal.value = true;
}

async function saveTransfer() {
  saving.value = true;
  transferError.value = '';
  try {
    await transactionService.transfer(transferForm.value);
    toast.success('Transfer complete');
    showTransferModal.value = false;
    fetchData();
  } catch (err) {
    transferError.value = err.response?.data?.message || 'Transfer failed';
    toast.error(transferError.value);
  } finally {
    saving.value = false;
  }
}

const { startTour, startAutoTour } = useTour('transactions');

onMounted(async () => {
  const [, memRes, accRes, catRes] = await Promise.all([
    fetchData(),
    memberService.list(),
    accountService.list(),
    categoryService.list(),
  ]);
  members.value = memRes.data.data;
  accounts.value = accRes.data.data;
  categories.value = catRes.data.data;
  startAutoTour(transactionsTourSteps);
  window.addEventListener('start-transactions-tour', () => startTour(transactionsTourSteps));
});

onUnmounted(() => {
  window.removeEventListener('start-transactions-tour', () => startTour(transactionsTourSteps));
});
</script>
