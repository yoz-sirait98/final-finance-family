<template>
  <div class="transactions-page fade-in">
    <div id="tour-tx-header" class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h4>{{ $t('transactions.title') }}</h4>
        <p>{{ $t('transactions.subtitle') }}</p>
      </div>
      <div class="d-flex gap-2">
        <button class="btn btn-outline-info" @click="triggerScan" :disabled="isScanning">
          <i class="bi bi-camera me-1"></i>{{ $t('common.scanReceipt') || 'Scan Receipt' }}
        </button>
        <input type="file" ref="receiptScannerInput" accept="image/*" capture="environment" class="d-none" @change="onReceiptSelected" />
        <button id="tour-tx-transfer-btn" class="btn btn-outline-primary" @click="openTransfer">
          <i class="bi bi-arrow-left-right me-1"></i>{{ $t('common.transfer') }}
        </button>
        <button id="tour-tx-add-btn" class="btn btn-primary-gradient" @click="openCreate">
          <i class="bi bi-plus-lg me-1"></i>{{ $t('transactions.addTransaction') }}
        </button>
      </div>
    </div>

    <!-- Scanning Overlay -->
    <div v-if="isScanning" class="vue-modal-backdrop" style="z-index: 1060; background: rgba(11, 11, 20, 0.9);">
      <div class="d-flex flex-column justify-content-center align-items-center h-100 text-white position-relative">
        <div class="ocr-scanner-box position-relative mb-4 overflow-hidden border border-primary border-opacity-25 rounded-4" style="width: 280px; height: 380px; background: rgba(255,255,255,0.02)">
          <!-- Camera icon/silhouette placeholder in the background -->
          <div class="position-absolute top-50 start-50 translate-middle text-white-50 opacity-25 text-center">
            <i class="bi bi-receipt fs-1 d-block mb-2"></i>
            <span class="small">{{ localeStore.currentLocale === 'id' ? 'Pratinjau Struk' : 'Receipt Preview' }}</span>
          </div>
          <!-- Laser Scan Line -->
          <div class="ocr-scan-line"></div>
        </div>
        <h5 class="fw-bold"><i class="bi bi-cpu text-info me-2 spinner-border-sm"></i>{{ $t('common.scanning') || 'Analyzing Receipt...' }}</h5>
        <p class="text-muted small mb-0">{{ scanProgress }}% processed</p>
      </div>
    </div>

    <!-- Filters -->
    <div id="tour-tx-filters" class="table-card mb-3">
      <div class="card-header">
        <div class="row g-2 align-items-end">
          <div class="col-md-3">
            <input v-model="filters.search" class="form-control form-control-sm" :placeholder="$t('transactions.searchPlaceholder')" @input="debouncedFetch" />
          </div>
          <div class="col-md-2">
            <select v-model="filters.type" class="form-select form-select-sm" @change="fetchData">
              <option value="">{{ $t('common.all') }} {{ $t('common.type') }}</option>
              <option value="income">{{ $t('common.income') }}</option>
              <option value="expense">{{ $t('common.expense') }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.category_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">{{ $t('transactions.allCategories') }}</option>
              <optgroup :label="$t('common.income')" v-if="incomeCategories.length">
                <option v-for="c in incomeCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </optgroup>
              <optgroup :label="$t('common.expense')" v-if="expenseCategories.length">
                <option v-for="c in expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </optgroup>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.member_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">{{ $t('transactions.allMembers') }}</option>
              <template v-for="m in members" :key="m.id">
                <option v-if="m.is_active || m.id === filters.member_id" :value="m.id">{{ m.name }}</option>
              </template>
            </select>
          </div>
          <div class="col-md-2">
            <select v-model="filters.account_id" class="form-select form-select-sm" @change="fetchData">
              <option value="">{{ $t('transactions.allAccounts') }}</option>
              <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="translateAccountType(type)">
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
              <option value="15">15 {{ localeStore.currentLocale === 'id' ? 'baris' : 'rows' }}</option>
              <option value="25">25 {{ localeStore.currentLocale === 'id' ? 'baris' : 'rows' }}</option>
              <option value="50">50 {{ localeStore.currentLocale === 'id' ? 'baris' : 'rows' }}</option>
              <option value="100">100 {{ localeStore.currentLocale === 'id' ? 'baris' : 'rows' }}</option>
            </select>
          </div>
          <div class="col-auto">
            <button class="btn btn-sm btn-outline-secondary" @click="resetFilters"><i class="bi bi-x-lg"></i> {{ $t('transactions.clearFilters') }}</button>
          </div>
        </div>
      </div>

      <div id="tour-tx-table" class="table-responsive">
        <table class="table table-hover mb-0">
          <thead>
            <tr>
              <th @click="sort('transaction_date')" style="cursor:pointer">{{ $t('common.date') }} <i class="bi bi-arrow-down-up small"></i></th>
              <th>{{ $t('common.member') }}</th>
              <th>{{ $t('common.account') }}</th>
              <th>{{ $t('common.category') }}</th>
              <th>{{ $t('common.type') }}</th>
              <th>{{ localeStore.currentLocale === 'id' ? 'Modul' : 'Module' }}</th>
              <th @click="sort('amount')" style="cursor:pointer">{{ $t('common.amount') }} <i class="bi bi-arrow-down-up small"></i></th>
              <th>{{ $t('common.description') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="9" class="text-center py-4">
                <div class="spinner-border spinner-border-sm text-primary"></div> {{ $t('common.loading') }}
              </td>
            </tr>
            <tr v-else-if="!transactions.length">
              <td colspan="9" class="text-center py-4 text-muted">{{ $t('dashboard.noTransactions') }}</td>
            </tr>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>{{ tx.transaction_date }}</td>
              <td>{{ tx.member?.name || '-' }}</td>
              <td>{{ tx.account?.name || '-' }}</td>
              <td>{{ tx.category?.name || '-' }}</td>
              <td>
                <span class="badge" :class="'badge-' + tx.type">{{ $t('common.' + tx.type) }}</span>
              </td>
              <td>
                <span class="badge bg-secondary bg-opacity-25 text-dark border">{{ getTransactionModule(tx) }}</span>
              </td>
              <td class="fw-semibold" :class="getAmountClass(tx)">
                {{ formatAmountWithSign(tx) }}
              </td>
              <td>{{ tx.description || '-' }}</td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button v-if="tx.shopping_plans && tx.shopping_plans.length" class="btn btn-outline-info" @click="goToShoppingDetail(tx.shopping_plans[0].id)" title="View Shopping Plan"><i class="bi bi-cart"></i></button>
                  <button class="btn btn-outline-success" @click="openDuplicate(tx)" title="Duplicate" :disabled="getTransactionModule(tx) !== 'Manual'"><i class="bi bi-copy"></i></button>
                  <button class="btn btn-outline-primary" @click="openEdit(tx)" :title="$t('common.edit')" :disabled="getTransactionModule(tx) !== 'Manual' && getTransactionModule(tx) !== 'Transfer'"><i class="bi bi-pencil"></i></button>
                  <button class="btn btn-outline-danger" @click="confirmDelete(tx)" :title="$t('common.delete')" :disabled="getTransactionModule(tx) !== 'Manual' && getTransactionModule(tx) !== 'Transfer'"><i class="bi bi-trash"></i></button>
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
          <h5 class="modal-title">{{ editingId ? $t('transactions.editTransaction') : $t('transactions.addTransaction') }}</h5>
          <button type="button" class="btn-close" @click="showTxModal = false"></button>
        </div>
        <form @submit.prevent="saveTransaction">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label" for="txType">{{ $t('common.type') }}</label>
              <select id="txType" name="type" v-model="form.type" class="form-select" required>
                <option value="" disabled>- {{ $t('common.type') }} -</option>
                <option value="income">{{ $t('common.income') }}</option>
                <option value="expense">{{ $t('common.expense') }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="txMember">{{ $t('common.member') }}</label>
              <select id="txMember" name="member_id" v-model="form.member_id" class="form-select" required>
                <option value="" disabled>- {{ $t('common.member') }} -</option>
                <template v-for="m in members" :key="m.id">
                  <option v-if="m.is_active || m.id === form.member_id" :value="m.id">{{ m.name }}{{ !m.is_active ? ' (' + $t('common.inactive') + ')' : '' }}</option>
                </template>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="txAccount">{{ $t('common.account') }}</label>
              <select id="txAccount" name="account_id" v-model="form.account_id" class="form-select" required>
                <option value="" disabled>- {{ $t('common.account') }} -</option>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="translateAccountType(type)">
                  <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }}</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="txCategory">{{ $t('common.category') }}</label>
              <select id="txCategory" name="category_id" v-model="form.category_id" class="form-select">
                <option value="">- {{ $t('common.category') }} -</option>
                <option v-for="c in filteredCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="txAmount">{{ $t('common.amount') }} (Rp)</label>
              <input id="txAmount" name="amount" v-model.number="form.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="txDate">{{ $t('common.date') }}</label>
              <input id="txDate" name="transaction_date" v-model="form.transaction_date" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="txDesc">{{ $t('common.description') }}</label>
              <input id="txDesc" name="description" v-model="form.description" type="text" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showTxModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              {{ $t('common.save') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Vue-Native: Transfer Modal ===== -->
    <div v-if="showTransferModal" class="vue-modal-backdrop" @mousedown.self="showTransferModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ $t('common.transfer') }}</h5>
          <button type="button" class="btn-close" @click="showTransferModal = false"></button>
        </div>
        <form @submit.prevent="saveTransfer">
          <div class="modal-body">
            <div v-if="transferError" class="alert alert-danger small">{{ transferError }}</div>
            <div class="mb-3">
              <label class="form-label" for="tfMember">{{ $t('common.member') }}</label>
              <select id="tfMember" name="member_id" v-model="transferForm.member_id" class="form-select" required>
                <option value="" disabled>- {{ $t('common.member') }} -</option>
                <template v-for="m in members" :key="m.id">
                  <option v-if="m.is_active || m.id === transferForm.member_id" :value="m.id">{{ m.name }}{{ !m.is_active ? ' (' + $t('common.inactive') + ')' : '' }}</option>
                </template>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfFrom">{{ $t('transactions.fromAccount') }}</label>
              <select id="tfFrom" name="from_account_id" v-model="transferForm.from_account_id" class="form-select" required>
                <option value="" disabled>- {{ $t('transactions.fromAccount') }} -</option>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="translateAccountType(type)">
                  <option v-for="a in group" :key="a.id" :value="a.id">{{ a.name }} ({{ formatCurrency(a.balance) }})</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfTo">{{ $t('transactions.toAccount') }}</label>
              <select id="tfTo" name="to_account_id" v-model="transferForm.to_account_id" class="form-select" required>
                <option value="" disabled>- {{ $t('transactions.toAccount') }} -</option>
                <optgroup v-for="(group, type) in groupedAccounts" :key="type" :label="translateAccountType(type)">
                  <option v-for="a in group" :key="a.id" :value="a.id" :disabled="a.id === transferForm.from_account_id">{{ a.name }} ({{ formatCurrency(a.balance) }})</option>
                </optgroup>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfAmount">{{ $t('common.amount') }} (Rp)</label>
              <input id="tfAmount" name="amount" v-model.number="transferForm.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfDate">{{ $t('common.date') }}</label>
              <input id="tfDate" name="transaction_date" v-model="transferForm.transaction_date" type="date" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label" for="tfDesc">{{ $t('common.description') }}</label>
              <input id="tfDesc" name="description" v-model="transferForm.description" type="text" class="form-control" :placeholder="$t('common.transfer')" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showTransferModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">{{ $t('common.transfer') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Vue-Native: Delete Confirm Modal ===== -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>{{ $t('common.delete') }} {{ $t('common.transaction') }}</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ $t('common.confirmDelete') }}</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>

    <!-- ===== Budget Over-Budget Confirmation Modal ===== -->
    <div v-if="showBudgetConfirm" class="vue-modal-backdrop" @mousedown.self="showBudgetConfirm = false">
      <div class="vue-modal" style="max-width:460px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-warning">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>{{ $t('transactions.budgetLimit') }} {{ localeStore.currentLocale === 'id' ? 'Terlampaui' : 'Exceeded' }}
          </h5>
          <button type="button" class="btn-close" @click="showBudgetConfirm = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-3">
            {{ $t('transactions.budgetExceededMsg', { category: budgetConfirmData.category }) }}
          </p>
          <div class="table-sm small mb-0">
            <div class="d-flex justify-content-between border-bottom py-1">
               <span class="text-muted">{{ $t('transactions.budgetLimit') }}</span>
               <span class="fw-semibold">{{ budgetConfirmData.limitFmt }}</span>
            </div>
            <div class="d-flex justify-content-between border-bottom py-1">
               <span class="text-muted">{{ $t('transactions.alreadySpent') }}</span>
               <span class="fw-semibold">{{ budgetConfirmData.spentFmt }}</span>
            </div>
            <div class="d-flex justify-content-between border-bottom py-1">
               <span class="text-muted">{{ $t('transactions.thisTransaction') }}</span>
               <span class="fw-semibold text-danger">{{ budgetConfirmData.addingFmt }}</span>
            </div>
            <div class="d-flex justify-content-between py-1">
               <span class="text-muted">{{ $t('transactions.totalAfterSave') }}</span>
               <span class="fw-bold text-danger">{{ budgetConfirmData.totalFmt }} ({{ budgetConfirmData.pct }}%)</span>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showBudgetConfirm = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-warning" :disabled="saving" @click="doSaveTransaction">
            <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('transactions.yesSaveAnyway') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTour } from '../composables/useTour';
import { transactionsTourSteps } from '../tours/transactionsTour';
import { scanReceipt } from '../utils/receiptScanner';
import { formatCurrency } from '../utils/format';
import { transactionService } from '../services/transactionService';
import { memberService } from '../services/memberService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { budgetService } from '../services/budgetService';
import { todayISO } from '../utils/date';
import { useToastStore } from '../stores/toast';
import { useBudgetStore } from '../stores/budgets';
import { useLocaleStore } from '../stores/locale';

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
const localeStore = useLocaleStore();
const budgetStore = useBudgetStore();

// Modal visibility
const showTxModal = ref(false);
const showTransferModal = ref(false);
const showDeleteModal = ref(false);
const deletingTx = ref(null);
const toast = useToastStore();

// OCR Scanning state
const receiptScannerInput = ref(null);
const isScanning = ref(false);
const scanProgress = ref(0);

// Budget over-budget confirmation
const showBudgetConfirm = ref(false);
const budgetConfirmData = ref({});

const router = useRouter();

function goToShoppingDetail(planId) {
  router.push(`/shopping/${planId}`);
}

function fmt(n) {
  const sign = n < 0 ? '-' : '';
  return sign + 'Rp ' + Math.abs(Number(n)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

function getAmountClass(tx) {
  return tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0) ? 'text-success' : 'text-danger';
}

function formatAmountWithSign(tx) {
  const isIncoming = tx.type === 'income' || (tx.type === 'transfer' && tx.amount > 0);
  const sign = isIncoming ? '+' : '-';
  return `${sign}${formatCurrency(Math.abs(tx.amount))}`;
}

function getTransactionModule(tx) {
  if (tx.shopping_plans && tx.shopping_plans.length > 0) return localeStore.currentLocale === 'id' ? 'Daftar Belanja' : 'Shopping List';
  if (tx.goal_id) return localeStore.currentLocale === 'id' ? 'Kantong Proyek' : 'Project Pockets';
  if (tx.description && tx.description.endsWith('(Auto)')) return localeStore.currentLocale === 'id' ? 'Berulang' : 'Recurring';
  if (tx.type === 'transfer') return 'Transfer';
  return 'Manual';
}

const filters = ref({
  search: '', type: '', category_id: '', member_id: '',
  account_id: '', date_from: '', date_to: '',
  sort_by: 'transaction_date', sort_dir: 'desc', page: 1, per_page: 15,
});

const form = ref({ type: '', member_id: '', account_id: '', category_id: '', amount: '', transaction_date: todayISO(), description: '' });
const transferForm = ref({ member_id: '', from_account_id: '', to_account_id: '', amount: '', transaction_date: todayISO(), description: '' });

// Translate account types for optgroups
function translateAccountType(type) {
  const t = String(type).toLowerCase();
  if (t === 'bank') return localeStore.t('accounts.type.bank');
  if (t === 'cash') return localeStore.t('accounts.type.cash');
  if (t === 'ewallet' || t === 'e-wallet') return localeStore.t('accounts.type.e_wallet');
  return type;
}

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

// Reset filters back to default
function resetFilters() {
  filters.value = { search: '', type: '', category_id: '', member_id: '', account_id: '', date_from: '', date_to: '', sort_by: 'transaction_date', sort_dir: 'desc', page: 1, per_page: 15 };
  fetchData();
}

function openCreate() {
  formError.value = '';
  editingId.value = null;
  form.value = {
    type: 'expense',
    member_id: '',
    account_id: '',
    category_id: '',
    amount: '',
    transaction_date: todayISO(),
    description: ''
  };
  showTxModal.value = true;
}

function triggerScan() {
  receiptScannerInput.value?.click();
}

async function onReceiptSelected(event) {
  const file = event.target.files[0];
  if (!file) return;

  isScanning.value = true;
  scanProgress.value = 0;
  try {
    const data = await scanReceipt(file, members.value, (progress) => {
      scanProgress.value = progress;
    });

    // Reset the input so the same file can be selected again
    event.target.value = '';

    // Auto-fill and open modal
    formError.value = '';
    editingId.value = null;
    form.value = {
      type: 'expense',
      member_id: data.member_id || '',
      account_id: '',
      category_id: '',
      amount: data.totalAmount || '',
      transaction_date: data.date || todayISO(),
      description: data.merchantName || ''
    };
    showTxModal.value = true;
    toast.success('Receipt scanned successfully!');

  } catch (error) {
    toast.error('Failed to parse receipt.');
  } finally {
    isScanning.value = false;
  }
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
  if (saving.value) return;
  formError.value = '';

  // Budget pre-check: only for new expenses with a category
  if (!editingId.value && form.value.type === 'expense' && form.value.category_id) {
    try {
      const now = new Date(form.value.transaction_date);
      const { data } = await budgetService.list({ month: now.getMonth() + 1, year: now.getFullYear() });
      const budgets = data.data || [];
      
      const budget = budgets.find(
        b => String(b.category_id) === String(form.value.category_id) &&
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
      toast.success(localeStore.t('common.success'));
    } else {
      await transactionService.create(form.value);
      toast.success(localeStore.t('common.success'));
    }
    showTxModal.value = false;
    fetchData();
    budgetStore.fetchAlerts(); // keep bell in sync after any transaction change
  } catch (err) {
    showBudgetConfirm.value = false;
    formError.value = err.response?.data?.message || err.message || localeStore.t('common.error');
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
  if (deleting.value) return;
  if (!deletingTx.value) return;
  deleting.value = true;
  try {
    await transactionService.delete(deletingTx.value.id);
    toast.success(localeStore.t('common.success'));
    showDeleteModal.value = false;
    deletingTx.value = null;
    fetchData();
    budgetStore.fetchAlerts(); // keep bell in sync after delete
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || localeStore.t('common.error'));
  } finally {
    deleting.value = false;
  }
}

function openTransfer() {
  transferForm.value = { member_id: '', from_account_id: '', to_account_id: '', amount: '', transaction_date: todayISO(), description: '' };
  transferError.value = '';
  showTransferModal.value = true;
}

async function saveTransfer() {
  saving.value = true;
  transferError.value = '';
  try {
    await transactionService.transfer(transferForm.value);
    toast.success(localeStore.t('common.success'));
    showTransferModal.value = false;
    fetchData();
  } catch (err) {
    transferError.value = err.response?.data?.message || err.message || localeStore.t('common.error');
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
