<template>
  <div class="project-pockets-page fade-in">
    <!-- Desktop View (d-none d-md-block) -->
    <div class="d-none d-md-block">
      <div id="tour-projects-header" class="page-header d-flex justify-content-between align-items-center mb-4">
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
                <span>{{ localeStore.currentLocale === 'id' ? 'Tersedia' : 'Available' }}: <strong>{{ formatCurrency(pocket.remaining) }}</strong></span>
                <span>{{ localeStore.currentLocale === 'id' ? 'Target' : 'Target' }}: {{ formatCurrency(pocket.target_amount) }}</span>
              </div>
              <div class="progress" style="height:8px">
                <div class="progress-bar" 
                     :class="pocket.isActive ? 'bg-success' : 'bg-primary'" 
                     :style="{ width: pocket.progress_percentage + '%' }">
                </div>
              </div>
            </div>

            <div class="mt-auto d-flex flex-column gap-2">
              <div class="d-flex gap-2" v-if="pocket.status === 'completed'">
                <button 
                  class="btn w-50" 
                  :class="pocket.isActive ? 'btn-primary-gradient' : 'btn-outline-secondary'"
                  :disabled="!pocket.isActive"
                  @click="openLogExpense(pocket)"
                >
                  <i class="bi bi-receipt me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Catat' : 'Log' }}
                </button>
                <button 
                  class="btn btn-outline-success w-50" 
                  @click="markPocketAsDone(pocket)"
                  :disabled="saving"
                >
                  <i class="bi bi-check-circle me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Selesai' : 'Done' }}
                </button>
              </div>
              <button 
                class="btn btn-outline-info w-100" 
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
    </div>

    <!-- Mobile View (d-md-none) -->
    <div class="mobile-pocket-container d-md-none">
      <!-- Mobile Header -->
      <div id="tour-projects-header" class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h5 class="fw-bold mb-0 text-primary d-flex align-items-center gap-2">
            <i class="bi bi-briefcase-fill"></i>
            {{ localeStore.currentLocale === 'id' ? 'Kantong Proyek' : 'Project Pockets' }}
          </h5>
          <small class="text-muted">
            {{ localeStore.currentLocale === 'id' ? 'Pengeluaran acara & proyek khusus' : 'Special project & event expenses' }}
          </small>
        </div>
        <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="router.push('/goals')">
          <i class="bi bi-plus-lg me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Target' : 'Goals' }}
        </button>
      </div>

      <!-- Mobile KPI Banner -->
      <div class="mobile-pocket-kpi mb-3">
        <div class="row g-2 text-center">
          <div class="col-6 border-end border-light border-opacity-10">
            <div class="text-uppercase small text-muted fw-bold" style="font-size: 0.68rem; letter-spacing: 0.5px;">
              {{ localeStore.currentLocale === 'id' ? 'Saldo Tersedia' : 'Available Balance' }}
            </div>
            <div class="fs-6 fw-bold text-success mt-1">
              {{ formatCurrency(mobileKpi.availableTotal) }}
            </div>
          </div>
          <div class="col-6">
            <div class="text-uppercase small text-muted fw-bold" style="font-size: 0.68rem; letter-spacing: 0.5px;">
              {{ localeStore.currentLocale === 'id' ? 'Total Terpakai' : 'Total Spent' }}
            </div>
            <div class="fs-6 fw-bold text-danger mt-1">
              {{ formatCurrency(mobileKpi.totalSpent) }}
            </div>
          </div>
        </div>
        <hr class="my-2 border-secondary opacity-10" />
        <div class="d-flex justify-content-around text-center pt-1" style="font-size: 0.75rem;">
          <div>
            <span class="text-muted me-1">{{ localeStore.currentLocale === 'id' ? 'Siap Pakai:' : 'Ready:' }}</span>
            <span class="badge bg-success-subtle text-success rounded-pill px-2 fw-bold">{{ mobileKpi.activeCount }}</span>
          </div>
          <div>
            <span class="text-muted me-1">{{ localeStore.currentLocale === 'id' ? 'Pendanaan:' : 'Funding:' }}</span>
            <span class="badge bg-warning-subtle text-warning rounded-pill px-2 fw-bold">{{ mobileKpi.fundingCount }}</span>
          </div>
        </div>
      </div>

      <!-- Mobile Search & Filter Chips -->
      <div class="mb-3">
        <div class="input-group input-group-sm mb-2">
          <span class="input-group-text bg-transparent border-end-0 text-muted">
            <i class="bi bi-search"></i>
          </span>
          <input 
            v-model="mobileSearchQuery" 
            type="text" 
            class="form-control border-start-0 ps-0" 
            :placeholder="localeStore.currentLocale === 'id' ? 'Cari proyek atau rekening...' : 'Search project or account...'" 
          />
          <button v-if="mobileSearchQuery" class="btn btn-sm btn-link text-muted" @click="mobileSearchQuery = ''">
            <i class="bi bi-x-circle-fill"></i>
          </button>
        </div>

        <div class="d-flex gap-1 overflow-x-auto pb-1 no-scrollbar">
          <button 
            class="btn filter-chip-btn" 
            :class="mobileStatusFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="mobileStatusFilter = 'all'"
          >
            {{ localeStore.currentLocale === 'id' ? 'Semua' : 'All' }}
          </button>
          <button 
            class="btn filter-chip-btn" 
            :class="mobileStatusFilter === 'active' ? 'btn-success' : 'btn-outline-secondary'"
            @click="mobileStatusFilter = 'active'"
          >
            <i class="bi bi-check-circle-fill me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Siap Pakai' : 'Ready' }}
          </button>
          <button 
            class="btn filter-chip-btn" 
            :class="mobileStatusFilter === 'funding' ? 'btn-warning' : 'btn-outline-secondary'"
            @click="mobileStatusFilter = 'funding'"
          >
            <i class="bi bi-piggy-bank-fill me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Pendanaan' : 'Funding' }}
          </button>
          <button 
            class="btn filter-chip-btn" 
            :class="mobileStatusFilter === 'done' ? 'btn-secondary' : 'btn-outline-secondary'"
            @click="mobileStatusFilter = 'done'"
          >
            <i class="bi bi-check-all me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Selesai' : 'Done' }}
          </button>
        </div>
      </div>

      <!-- Mobile Pocket Cards List -->
      <div v-if="filteredPockets.length > 0">
        <div 
          v-for="pocket in filteredPockets" 
          :key="pocket.id" 
          class="mobile-pocket-card"
          :class="{
            'active-pocket': pocket.status === 'completed',
            'funding-pocket': pocket.status === 'active',
            'done-pocket': pocket.status === 'done'
          }"
        >
          <div class="d-flex align-items-center gap-3 mb-2">
            <div 
              class="pocket-icon-avatar"
              :class="{
                'status-funding': pocket.status === 'active',
                'status-done': pocket.status === 'done'
              }"
            >
              <i v-if="pocket.status === 'completed'" class="bi bi-briefcase-fill"></i>
              <i v-else-if="pocket.status === 'active'" class="bi bi-piggy-bank-fill"></i>
              <i v-else class="bi bi-check2-circle"></i>
            </div>
            <div class="flex-grow-1 overflow-hidden">
              <div class="d-flex align-items-center justify-content-between">
                <h6 class="fw-bold mb-0 text-truncate me-2">{{ pocket.name }}</h6>
                <span 
                  class="pocket-status-badge"
                  :class="{
                    'badge-active': pocket.status === 'completed',
                    'badge-funding': pocket.status === 'active',
                    'badge-done': pocket.status === 'done'
                  }"
                >
                  <i v-if="pocket.status === 'completed'" class="bi bi-lightning-charge-fill"></i>
                  <i v-else-if="pocket.status === 'active'" class="bi bi-hourglass-split"></i>
                  <i v-else class="bi bi-check-circle"></i>
                  {{ pocket.status === 'completed' 
                      ? (localeStore.currentLocale === 'id' ? 'Siap Pakai' : 'Ready') 
                      : (pocket.status === 'active' 
                          ? (localeStore.currentLocale === 'id' ? 'Pendanaan' : 'Funding') 
                          : (localeStore.currentLocale === 'id' ? 'Selesai' : 'Done')) }}
                </span>
              </div>
              <div v-if="pocket.account_name" class="small text-muted text-truncate mt-1">
                <i class="bi bi-link-45deg me-1"></i>{{ pocket.account_name }}
              </div>
            </div>
          </div>

          <!-- Progress Bar & Amounts -->
          <div class="bg-black bg-opacity-10 rounded-3 p-2 mb-2">
            <div class="d-flex justify-content-between align-items-center mb-1" style="font-size: 0.78rem;">
              <span class="text-muted">{{ localeStore.currentLocale === 'id' ? 'Tersedia' : 'Available' }}:</span>
              <span class="fw-bold text-success fs-6">{{ formatCurrency(pocket.remaining) }}</span>
            </div>
            <div class="progress mb-1" style="height: 6px;">
              <div 
                class="progress-bar" 
                :class="pocket.status === 'completed' ? 'bg-success' : 'bg-warning'" 
                :style="{ width: pocket.progress_percentage + '%' }"
              ></div>
            </div>
            <div class="d-flex justify-content-between text-muted" style="font-size: 0.7rem;">
              <span>{{ localeStore.currentLocale === 'id' ? 'Target' : 'Target' }}: {{ formatCurrency(pocket.target_amount) }}</span>
              <span>{{ localeStore.currentLocale === 'id' ? 'Terpakai' : 'Spent' }}: {{ formatCurrency(pocket.spent) }}</span>
            </div>
          </div>

          <!-- Touch Action Buttons -->
          <div class="d-flex gap-2 pt-1 border-top border-light border-opacity-10">
            <button 
              v-if="pocket.status === 'completed'"
              class="btn btn-sm btn-primary-gradient flex-grow-1 rounded-pill"
              @click="openLogExpense(pocket)"
            >
              <i class="bi bi-receipt me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Catat' : 'Log' }}
            </button>
            <button 
              class="btn btn-sm btn-outline-info flex-grow-1 rounded-pill"
              @click="openViewExpenses(pocket)"
            >
              <i class="bi bi-list-ul me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Pengeluaran' : 'Expenses' }}
            </button>
            <button 
              v-if="pocket.status === 'completed'"
              class="btn btn-sm btn-outline-success rounded-circle"
              style="width: 32px; height: 32px; padding: 0;"
              :title="localeStore.currentLocale === 'id' ? 'Tandai Selesai' : 'Mark as Done'"
              @click="markPocketAsDone(pocket)"
              :disabled="saving"
            >
              <i class="bi bi-check-lg"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="text-center py-5 text-muted bg-black bg-opacity-10 rounded-4 px-3">
        <i class="bi bi-inboxes fs-1 mb-2 d-block text-secondary"></i>
        <h6 class="fw-bold">{{ localeStore.currentLocale === 'id' ? 'Tidak ada kantong proyek ditemukan' : 'No project pockets found' }}</h6>
        <p class="small mb-3">
          {{ localeStore.currentLocale === 'id' 
              ? 'Cobalah ubah kata kunci pencarian atau filter status.' 
              : 'Try changing your search keyword or status filter.' }}
        </p>
        <button class="btn btn-sm btn-outline-primary rounded-pill px-3" @click="router.push('/goals')">
          <i class="bi bi-plus-circle me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Ke Halaman Target' : 'Go to Goals Page' }}
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
            <button type="submit" id="tour-projects-add-btn" class="btn btn-primary-gradient" :disabled="saving">
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
import { useTour } from '../composables/useTour';
import { projectsTourSteps } from '../tours/projectsTour';

const { startAutoTour, startTour } = useTour('projects');
const handleTour = () => startTour(projectsTourSteps);

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../stores/locale';
import { useToastStore } from '../stores/toast';
import { goalService } from '../services/goalService';
import { accountService } from '../services/accountService';
import { memberService } from '../services/memberService';
import { categoryService } from '../services/categoryService';
import { transactionService } from '../services/transactionService';
import { formatCurrency } from '../utils/format';
import { supabase } from '../lib/supabase';

const router = useRouter();
const localeStore = useLocaleStore();
const toast = useToastStore();

const pockets = ref([]);
const accounts = ref([]);
const members = ref([]);
const categories = ref([]);

const mobileSearchQuery = ref('');
const mobileStatusFilter = ref('all');

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

const mobileKpi = computed(() => {
  let availableTotal = 0;
  let activeCount = 0;
  let fundingCount = 0;
  let totalSpent = 0;

  pockets.value.forEach(p => {
    if (p.status === 'completed') {
      activeCount++;
      availableTotal += (p.remaining || 0);
      totalSpent += (p.spent || 0);
    } else if (p.status === 'active') {
      fundingCount++;
    }
  });

  return { availableTotal, activeCount, fundingCount, totalSpent };
});

const filteredPockets = computed(() => {
  let result = pockets.value;

  if (mobileSearchQuery.value.trim()) {
    const q = mobileSearchQuery.value.toLowerCase().trim();
    result = result.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.account_name && p.account_name.toLowerCase().includes(q))
    );
  }

  if (mobileStatusFilter.value !== 'all') {
    if (mobileStatusFilter.value === 'active') {
      result = result.filter(p => p.status === 'completed');
    } else if (mobileStatusFilter.value === 'funding') {
      result = result.filter(p => p.status === 'active');
    } else if (mobileStatusFilter.value === 'done') {
      result = result.filter(p => p.status === 'done');
    }
  }

  return result;
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
  const { data: txRes, error: txErr } = await supabase.from('transactions').select('*, account:accounts(name), member:members(name)').not('goal_id', 'is', null);
  if (txErr) console.error("Error fetching transactions:", txErr);
  allTransactions.value = txRes || [];

  pockets.value = (goalsRes.data?.data || [])
    .filter(g => g.status !== 'inactive')
    .map(g => {
    const pocketTxs = allTransactions.value.filter(tx => Number(tx.goal_id) === Number(g.id));
    const spent = pocketTxs.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const remaining = Number(g.current_amount || 0) - spent;
    return {
      ...g,
      spent,
      remaining,
      isActive: g.status === 'completed'
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
    
    // Rollback to completed if pocket was 'done'
    if (activePocket.value.status === 'done') {
      await goalService.update(activePocket.value.id, { status: 'completed' });
    }
    
    await loadData();
    // Refresh modal list
    activePocketTransactions.value = allTransactions.value.filter(t => t.goal_id === activePocket.value.id).sort((a,b) => new Date(b.transaction_date) - new Date(a.transaction_date));
  } catch (err) {
    toast.error(err.message || localeStore.t('common.error'));
  } finally {
    deletingTx.value = false;
  }
}

async function markPocketAsDone(pocket) {
  if (pocket.spent <= 0) {
    toast.error(localeStore.currentLocale === 'id' 
      ? 'Tidak dapat menyelesaikan kantong proyek ini karena belum ada pengeluaran yang dicatat.' 
      : 'Cannot mark this project pocket as done because no expenses have been logged yet.');
    return;
  }

  const msgId = 'Tandai kantong proyek ini sebagai selesai? Pastikan semua pengeluaran sudah dicatat karena kantong proyek yang sudah selesai (DONE) tidak dapat diedit atau dihapus lagi.';
  const msgEn = 'Mark this project pocket as done? Make sure all expenses are logged because a completed project pocket (DONE) cannot be edited or deleted anymore.';
  
  if (!confirm(localeStore.currentLocale === 'id' ? msgId : msgEn)) return;
  
  saving.value = true;
  try {
    await goalService.update(pocket.id, { status: 'done' });
    toast.success(localeStore.t('common.success'));
    await loadData();
  } catch (err) {
    toast.error(err.message || localeStore.t('common.error'));
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  startAutoTour(projectsTourSteps);
  window.addEventListener('start-projects-tour', handleTour);

  loadData();
});

onUnmounted(() => {
  window.removeEventListener('start-projects-tour', handleTour);
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

