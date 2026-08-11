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

    <!-- ===== DESKTOP VIEW TABLE (d-none d-md-block) ===== -->
    <div id="tour-recurring-list" class="table-card d-none d-md-block">
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

    <!-- ===== MOBILE VIEW CONTAINER (d-md-none) ===== -->
    <div class="mobile-recurring-container d-md-none mb-3">
      <!-- Mobile Glassmorphism KPI Summary Banner -->
      <div class="mobile-recurring-kpi mb-3">
        <div class="row g-2 text-center">
          <div class="col-4 border-end border-secondary border-opacity-25">
            <div class="kpi-label text-muted small text-uppercase font-monospace fw-bold" style="font-size:0.68rem">
              <i class="bi bi-calendar-check me-1 text-primary"></i>Komitmen/bln
            </div>
            <div class="kpi-val fw-bold text-primary" style="font-size:0.92rem">
              {{ formatCurrency(mobileKpi.totalMonthly) }}
            </div>
          </div>
          <div class="col-4 border-end border-secondary border-opacity-25">
            <div class="kpi-label text-muted small text-uppercase font-monospace fw-bold" style="font-size:0.68rem">
              <i class="bi bi-toggle-on me-1 text-success"></i>Aktif
            </div>
            <div class="kpi-val fw-bold text-success" style="font-size:0.92rem">
              {{ mobileKpi.activeCount }} Tagihan
            </div>
          </div>
          <div class="col-4">
            <div class="kpi-label text-muted small text-uppercase font-monospace fw-bold" style="font-size:0.68rem">
              <i class="bi bi-exclamation-circle me-1 text-warning"></i>Jatuh Tempo
            </div>
            <div class="kpi-val fw-bold" :class="mobileKpi.dueSoonCount > 0 ? 'text-warning' : 'text-muted'" style="font-size:0.92rem">
              {{ mobileKpi.dueSoonCount }} Items
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Toolbar: Search & Filter Chips -->
      <div class="mobile-toolbar mb-3">
        <!-- Search bar -->
        <div class="input-group input-group-sm mb-2">
          <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input 
            v-model="mobileSearch" 
            type="text" 
            class="form-control border-start-0" 
            :placeholder="localeStore.currentLocale === 'id' ? 'Cari tagihan, kategori, member...' : 'Search bills, categories...'" 
          />
          <button v-if="mobileSearch" class="btn btn-outline-secondary border-start-0" @click="mobileSearch = ''"><i class="bi bi-x"></i></button>
        </div>

        <!-- Frequency Filter Chips -->
        <div class="d-flex align-items-center gap-1 overflow-auto py-1 mb-1">
          <span class="small text-muted me-1 fw-semibold ms-1" style="font-size:0.72rem">Interval:</span>
          <button 
            class="btn btn-xs filter-chip-btn" 
            :class="mobileFreqFilter === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="mobileFreqFilter = 'all'"
          >
            Semua
          </button>
          <button 
            class="btn btn-xs filter-chip-btn" 
            :class="mobileFreqFilter === 'monthly' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="mobileFreqFilter = 'monthly'"
          >
            Bulanan
          </button>
          <button 
            class="btn btn-xs filter-chip-btn" 
            :class="mobileFreqFilter === 'weekly' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="mobileFreqFilter = 'weekly'"
          >
            Mingguan
          </button>
          <button 
            class="btn btn-xs filter-chip-btn" 
            :class="mobileFreqFilter === 'yearly' ? 'btn-primary' : 'btn-outline-secondary'"
            @click="mobileFreqFilter = 'yearly'"
          >
            Tahunan
          </button>
        </div>

        <!-- Status Filter Chips -->
        <div class="d-flex align-items-center gap-1 overflow-auto py-1">
          <span class="small text-muted me-1 fw-semibold ms-1" style="font-size:0.72rem">Status:</span>
          <button 
            class="btn btn-xs filter-chip-btn" 
            :class="mobileStatusFilter === 'all' ? 'btn-secondary' : 'btn-outline-secondary'"
            @click="mobileStatusFilter = 'all'"
          >
            Semua
          </button>
          <button 
            class="btn btn-xs filter-chip-btn" 
            :class="mobileStatusFilter === 'active' ? 'btn-success' : 'btn-outline-success'"
            @click="mobileStatusFilter = 'active'"
          >
            🟢 Aktif
          </button>
          <button 
            class="btn btn-xs filter-chip-btn" 
            :class="mobileStatusFilter === 'due' ? 'btn-warning' : 'btn-outline-warning'"
            @click="mobileStatusFilter = 'due'"
          >
            ⚠️ Near Due
          </button>
          <button 
            class="btn btn-xs filter-chip-btn" 
            :class="mobileStatusFilter === 'inactive' ? 'btn-danger' : 'btn-outline-danger'"
            @click="mobileStatusFilter = 'inactive'"
          >
            ⚪ Nonaktif
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-4">
        <div class="spinner-border spinner-border-sm text-primary me-2"></div> {{ $t('common.loading') }}
      </div>

      <!-- Empty State -->
      <div v-else-if="!filteredMobileItems.length" class="text-center py-5 text-muted table-card">
        <i class="bi bi-arrow-repeat fs-1 d-block mb-2 text-muted opacity-50"></i>
        <p class="mb-0">{{ localeStore.currentLocale === 'id' ? 'Tidak ada transaksi berulang' : 'No recurring transactions' }}</p>
      </div>

      <!-- Mobile Recurring Cards List -->
      <div v-else class="mobile-card-feed">
        <div 
          v-for="r in filteredMobileItems" 
          :key="r.id" 
          class="mobile-recurring-card" 
          :class="{ 'inactive-item': !r.is_active }"
          @click="toggleCardDrawer(r.id)"
        >
          <div class="d-flex align-items-start gap-3">
            <!-- Icon Avatar -->
            <div class="recurring-icon-avatar" :class="'freq-' + r.frequency">
              <i class="bi bi-arrow-repeat"></i>
            </div>

            <!-- Card Central Info -->
            <div class="flex-grow-1 min-w-0">
              <div class="d-flex justify-content-between align-items-center mb-1">
                <h6 class="fw-bold mb-0 text-truncate text-color" style="font-size:0.92rem">
                  {{ r.description || r.category?.name || '-' }}
                </h6>
                <!-- Inline Active Switch -->
                <div class="form-check form-switch m-0" @click.stop>
                  <input 
                    class="form-check-input ms-0" 
                    type="checkbox" 
                    role="switch"
                    :checked="r.is_active" 
                    @change="toggleActive(r)"
                    :title="r.is_active ? 'Nonaktifkan' : 'Aktifkan'"
                  />
                </div>
              </div>

              <!-- Amount & Urgency Badge -->
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="fw-bold text-primary" style="font-size:1rem">
                  {{ formatCurrency(r.amount) }}
                </span>
                <span class="due-badge" :class="getDueUrgency(r).class">
                  <i :class="'bi ' + getDueUrgency(r).icon"></i>
                  {{ getDueUrgency(r).text }}
                </span>
              </div>

              <!-- Badges Row (Interval, Account, Member) -->
              <div class="d-flex flex-wrap gap-1 align-items-center">
                <span class="badge bg-info-subtle text-info rounded-pill" style="font-size:0.7rem">
                  {{ $t('recurring.intervals.' + r.frequency) }}
                </span>
                <span v-if="r.account_id" class="badge bg-secondary-subtle text-secondary rounded-pill" style="font-size:0.7rem">
                  <i class="bi bi-wallet2 me-1"></i>{{ getAccountName(r.account_id) }}
                </span>
                <span v-if="r.member_id" class="badge bg-secondary-subtle text-secondary rounded-pill" style="font-size:0.7rem">
                  <i class="bi bi-person me-1"></i>{{ getMemberName(r.member_id) }}
                </span>
              </div>

              <!-- Expandable Touch Action Drawer -->
              <div v-if="expandedCardId === r.id" class="card-action-drawer d-flex justify-content-end gap-2 mt-2 pt-2 border-top border-secondary border-opacity-25" @click.stop>
                <button class="btn btn-xs btn-outline-primary" @click="openEdit(r)">
                  <i class="bi bi-pencil me-1"></i>Edit
                </button>
                <button class="btn btn-xs btn-outline-danger" @click="confirmDelete(r)">
                  <i class="bi bi-trash me-1"></i>Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mobile Floating Action Button (FAB) -->
      <button class="mobile-fab-btn d-md-none" @click="openCreate" :title="$t('recurring.addRecurring')">
        <i class="bi bi-plus-lg"></i>
      </button>
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

// Mobile controls
const mobileSearch = ref('');
const mobileFreqFilter = ref('all');
const mobileStatusFilter = ref('all');
const expandedCardId = ref(null);

function toggleCardDrawer(id) {
  expandedCardId.value = expandedCardId.value === id ? null : id;
}

function getAccountName(accountId) {
  if (!accountId) return '-';
  const acc = accounts.value.find(a => a.id === accountId);
  return acc ? acc.name : '-';
}

function getMemberName(memberId) {
  if (!memberId) return '-';
  const mem = members.value.find(m => m.id === memberId);
  return mem ? mem.name : '-';
}

function getDueUrgency(r) {
  const dateStr = r.next_due_date_raw || r.next_due_date;
  if (!dateStr) {
    return { text: r.next_due_date || '-', class: 'due-badge-normal', icon: 'bi-calendar3' };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(dateStr);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: 'Lewat Jatuh Tempo', class: 'due-badge-overdue', icon: 'bi-exclamation-triangle-fill' };
  } else if (diffDays === 0) {
    return { text: 'Jatuh Tempo Hari Ini', class: 'due-badge-today', icon: 'bi-exclamation-circle' };
  } else if (diffDays <= 7) {
    return { text: `H-${diffDays}`, class: 'due-badge-soon', icon: 'bi-clock-history' };
  } else {
    return { text: r.next_due_date || `${diffDays} hr lagi`, class: 'due-badge-normal', icon: 'bi-calendar3' };
  }
}

const mobileKpi = computed(() => {
  let totalMonthly = 0;
  let activeCount = 0;
  let dueSoonCount = 0;

  items.value.forEach(r => {
    if (r.is_active) {
      activeCount++;
      
      const amt = Number(r.amount) || 0;
      if (r.frequency === 'weekly') {
        totalMonthly += amt * 4.33;
      } else if (r.frequency === 'yearly') {
        totalMonthly += amt / 12;
      } else {
        totalMonthly += amt;
      }

      const urgency = getDueUrgency(r);
      if (urgency.class === 'due-badge-overdue' || urgency.class === 'due-badge-today' || urgency.class === 'due-badge-soon') {
        dueSoonCount++;
      }
    }
  });

  return { totalMonthly: Math.round(totalMonthly), activeCount, dueSoonCount };
});

const filteredMobileItems = computed(() => {
  return items.value.filter(r => {
    // Frequency filter
    if (mobileFreqFilter.value !== 'all' && r.frequency !== mobileFreqFilter.value) {
      return false;
    }

    // Status filter
    if (mobileStatusFilter.value === 'active' && !r.is_active) return false;
    if (mobileStatusFilter.value === 'inactive' && r.is_active) return false;
    if (mobileStatusFilter.value === 'due') {
      if (!r.is_active) return false;
      const urgency = getDueUrgency(r);
      if (urgency.class === 'due-badge-normal') return false;
    }

    // Search query filter
    if (mobileSearch.value.trim()) {
      const q = mobileSearch.value.toLowerCase().trim();
      const desc = (r.description || '').toLowerCase();
      const catName = (r.category?.name || '').toLowerCase();
      const accName = getAccountName(r.account_id).toLowerCase();
      const memName = getMemberName(r.member_id).toLowerCase();

      return desc.includes(q) || catName.includes(q) || accName.includes(q) || memName.includes(q);
    }

    return true;
  });
});

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
