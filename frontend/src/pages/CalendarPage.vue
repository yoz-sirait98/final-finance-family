<template>
  <div class="calendar-page fade-in">
    <!-- Header -->
    <div id="tour-calendar-header" class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h4>{{ localeStore.currentLocale === 'id' ? 'Kalender Keuangan' : 'Financial Calendar' }}</h4>
        <p>{{ localeStore.currentLocale === 'id' ? 'Visualisasi arus kas harian keluarga Anda' : 'Visualize your family\'s daily cash flow at a glance' }}</p>
      </div>
      <!-- Month navigator -->
      <div class="d-flex align-items-center gap-2">
        <button class="btn btn-outline-secondary btn-sm" @click="prevMonth">
          <i class="bi bi-chevron-left"></i>
        </button>
        <span class="fw-semibold px-2 fs-6">{{ currentMonthLabel }}</span>
        <button class="btn btn-outline-secondary btn-sm" @click="nextMonth">
          <i class="bi bi-chevron-right"></i>
        </button>
        <button class="btn btn-sm btn-outline-primary ms-2" @click="goToToday">
          {{ localeStore.currentLocale === 'id' ? 'Hari Ini' : 'Today' }}
        </button>
      </div>
    </div>

    <!-- Summary Strip -->
    <div class="row g-3 mb-3">
      <div class="col-6 col-md-3">
        <div class="stat-card text-center py-3">
          <div class="text-muted small mb-1">{{ localeStore.currentLocale === 'id' ? 'Pemasukan Bulan Ini' : 'Month Income' }}</div>
          <div class="fw-bold text-success fs-6">+{{ formatCurrency(monthStats.income) }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card text-center py-3">
          <div class="text-muted small mb-1">{{ localeStore.currentLocale === 'id' ? 'Pengeluaran Bulan Ini' : 'Month Expense' }}</div>
          <div class="fw-bold text-danger fs-6">-{{ formatCurrency(monthStats.expense) }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card text-center py-3">
          <div class="text-muted small mb-1">{{ localeStore.currentLocale === 'id' ? 'Transaksi Aktif' : 'Transactions' }}</div>
          <div class="fw-bold fs-6">{{ monthStats.count }}</div>
        </div>
      </div>
      <div class="col-6 col-md-3">
        <div class="stat-card text-center py-3">
          <div class="text-muted small mb-1">{{ localeStore.currentLocale === 'id' ? 'Tagihan Jatuh Tempo' : 'Bills Due' }}</div>
          <div class="fw-bold text-warning fs-6">{{ monthStats.recurringCount }}</div>
        </div>
      </div>
    </div>

    <!-- Legend -->
    <div class="d-flex flex-wrap gap-3 mb-3 align-items-center">
      <span class="badge-legend"><span class="dot dot-income"></span> {{ localeStore.currentLocale === 'id' ? 'Pemasukan' : 'Income' }}</span>
      <span class="badge-legend"><span class="dot dot-expense"></span> {{ localeStore.currentLocale === 'id' ? 'Pengeluaran' : 'Expense' }}</span>
      <span class="badge-legend"><span class="dot dot-recurring"></span> {{ localeStore.currentLocale === 'id' ? 'Tagihan Berulang' : 'Recurring Bill' }}</span>
      <span class="badge-legend"><span class="dot dot-goal"></span> {{ localeStore.currentLocale === 'id' ? 'Deadline Target' : 'Goal Deadline' }}</span>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="table-card text-center py-5">
      <div class="spinner-border text-primary"></div>
      <p class="mt-3 text-muted">{{ $t('common.loading') }}</p>
    </div>

    <!-- Desktop Calendar Grid -->
    <div v-else class="d-none d-md-block">
      <div class="calendar-grid">
        <!-- Day-of-week headers -->
        <div v-for="dayName in dayHeaders" :key="dayName" class="calendar-dow-header">
          {{ dayName }}
        </div>

        <!-- Blank cells for first-week offset -->
        <div v-for="n in firstDayOffset" :key="'blank-' + n" class="calendar-cell calendar-cell--empty"></div>

        <!-- Actual day cells -->
        <div
          v-for="day in daysInMonth"
          :key="day"
          class="calendar-cell"
          :class="{
            'calendar-cell--today': isToday(day),
            'calendar-cell--selected': selectedDay === day,
            'calendar-cell--has-events': hasDayEvents(day),
          }"
          @click="selectDay(day)"
        >
          <span class="calendar-day-number" :class="{ 'calendar-day-number--today': isToday(day) }">{{ day }}</span>

          <!-- Dots for event types -->
          <div class="calendar-dots">
            <span v-if="getDayIncome(day) > 0" class="dot dot-income" :title="'+' + formatCurrency(getDayIncome(day))"></span>
            <span v-if="getDayExpense(day) > 0" class="dot dot-expense" :title="'-' + formatCurrency(getDayExpense(day))"></span>
            <span v-if="getDayRecurring(day).length > 0" class="dot dot-recurring" :title="getDayRecurring(day).map(r => r.description).join(', ')"></span>
            <span v-if="getDayGoals(day).length > 0" class="dot dot-goal" :title="getDayGoals(day).map(g => g.name).join(', ')"></span>
          </div>

          <!-- Net amount chip -->
          <div v-if="getDayNet(day) !== 0" class="calendar-net" :class="getDayNet(day) > 0 ? 'calendar-net--positive' : 'calendar-net--negative'">
            {{ getDayNet(day) > 0 ? '+' : '' }}{{ formatCompact(getDayNet(day)) }}
          </div>
        </div>
      </div>

      <!-- Day Detail Panel (slides in below calendar) -->
      <transition name="slide-up">
        <div v-if="selectedDay" class="table-card mt-3 day-detail-panel">
          <div class="card-header d-flex justify-content-between align-items-center">
            <h6 class="mb-0">
              <i class="bi bi-calendar-day me-2"></i>
              {{ selectedDayLabel }}
            </h6>
            <button class="btn btn-sm btn-outline-secondary" @click="selectedDay = null">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>
          <div class="p-3">
            <!-- Recurring bills -->
            <div v-if="getDayRecurring(selectedDay).length > 0" class="mb-3">
              <div class="small fw-semibold text-muted mb-2">
                <i class="bi bi-arrow-repeat me-1 text-info"></i>{{ localeStore.currentLocale === 'id' ? 'Tagihan Jatuh Tempo' : 'Bills Due' }}
              </div>
              <div v-for="r in getDayRecurring(selectedDay)" :key="'r-' + r.id" class="d-flex justify-content-between align-items-center py-1 border-bottom">
                <span class="small">{{ r.description }}</span>
                <span class="badge badge-recurring small">{{ formatCurrency(r.amount) }}</span>
              </div>
            </div>

            <!-- Goal deadlines -->
            <div v-if="getDayGoals(selectedDay).length > 0" class="mb-3">
              <div class="small fw-semibold text-muted mb-2">
                <i class="bi bi-trophy me-1 text-warning"></i>{{ localeStore.currentLocale === 'id' ? 'Deadline Target Tabungan' : 'Saving Goal Deadlines' }}
              </div>
              <div v-for="g in getDayGoals(selectedDay)" :key="'g-' + g.id" class="d-flex justify-content-between align-items-center py-1 border-bottom">
                <span class="small">{{ g.name }}</span>
                <span class="badge badge-goal small">{{ formatCurrency(g.target_amount) }}</span>
              </div>
            </div>

            <!-- Actual transactions -->
            <div v-if="getDayTransactions(selectedDay).length > 0">
              <div class="small fw-semibold text-muted mb-2">
                <i class="bi bi-arrow-left-right me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Transaksi' : 'Transactions' }}
              </div>
              <div v-for="tx in getDayTransactions(selectedDay)" :key="tx.id" class="d-flex justify-content-between align-items-center py-1 border-bottom">
                <div>
                  <span class="badge me-1" :class="'badge-' + tx.type">{{ $t('common.' + tx.type) }}</span>
                  <span class="small">{{ tx.description || (tx.category?.name ?? '-') }}</span>
                </div>
                <span class="small fw-semibold" :class="tx.type === 'income' ? 'text-success' : 'text-danger'">
                  {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(Math.abs(tx.amount)) }}
                </span>
              </div>
            </div>

            <div v-if="!getDayTransactions(selectedDay).length && !getDayRecurring(selectedDay).length && !getDayGoals(selectedDay).length" class="text-muted small text-center py-3">
              {{ localeStore.currentLocale === 'id' ? 'Tidak ada aktivitas pada hari ini.' : 'No activity on this day.' }}
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- Mobile List View -->
    <div class="d-md-none">
      <div v-for="day in daysWithEvents" :key="'m-' + day" class="table-card mb-2">
        <div class="card-header py-2 d-flex justify-content-between align-items-center" @click="toggleMobileDay(day)" style="cursor:pointer">
          <span class="fw-semibold">{{ formatMobileDay(day) }}</span>
          <div class="d-flex align-items-center gap-2">
            <span v-if="getDayIncome(day) > 0" class="badge bg-success bg-opacity-15 text-success small">+{{ formatCompact(getDayIncome(day)) }}</span>
            <span v-if="getDayExpense(day) > 0" class="badge bg-danger bg-opacity-15 text-danger small">-{{ formatCompact(getDayExpense(day)) }}</span>
            <i class="bi small" :class="mobileDayOpen === day ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </div>
        </div>
        <div v-if="mobileDayOpen === day" class="p-3">
          <!-- Recurring bills -->
          <div v-if="getDayRecurring(day).length > 0" class="mb-3">
            <div class="small fw-semibold text-muted mb-2">
              <i class="bi bi-arrow-repeat me-1 text-info"></i>{{ localeStore.currentLocale === 'id' ? 'Tagihan Jatuh Tempo' : 'Bills Due' }}
            </div>
            <div v-for="r in getDayRecurring(day)" :key="'r-' + r.id" class="d-flex justify-content-between align-items-center py-1 border-bottom">
              <span class="small">{{ r.description }}</span>
              <span class="badge badge-recurring small">{{ formatCurrency(r.amount) }}</span>
            </div>
          </div>

          <!-- Goal deadlines -->
          <div v-if="getDayGoals(day).length > 0" class="mb-3">
            <div class="small fw-semibold text-muted mb-2">
              <i class="bi bi-trophy me-1 text-warning"></i>{{ localeStore.currentLocale === 'id' ? 'Deadline Target Tabungan' : 'Saving Goal Deadlines' }}
            </div>
            <div v-for="g in getDayGoals(day)" :key="'g-' + g.id" class="d-flex justify-content-between align-items-center py-1 border-bottom">
              <span class="small">{{ g.name }}</span>
              <span class="badge badge-goal small">{{ formatCurrency(g.target_amount) }}</span>
            </div>
          </div>

          <!-- Actual transactions -->
          <div v-if="getDayTransactions(day).length > 0">
            <div class="small fw-semibold text-muted mb-2">
              <i class="bi bi-arrow-left-right me-1"></i>{{ localeStore.currentLocale === 'id' ? 'Transaksi' : 'Transactions' }}
            </div>
            <div v-for="tx in getDayTransactions(day)" :key="tx.id" class="d-flex justify-content-between align-items-center py-1 border-bottom">
              <div>
                <span class="badge me-1" :class="'badge-' + tx.type">{{ $t('common.' + tx.type) }}</span>
                <span class="small">{{ tx.description || (tx.category?.name ?? '-') }}</span>
              </div>
              <span class="small fw-semibold" :class="tx.type === 'income' ? 'text-success' : 'text-danger'">
                {{ tx.type === 'income' ? '+' : '-' }}{{ formatCurrency(Math.abs(tx.amount)) }}
              </span>
            </div>
          </div>

          <div v-if="!getDayTransactions(day).length && !getDayRecurring(day).length && !getDayGoals(day).length" class="text-muted small text-center py-3">
            {{ localeStore.currentLocale === 'id' ? 'Tidak ada aktivitas pada hari ini.' : 'No activity on this day.' }}
          </div>
        </div>
      </div>
      <div v-if="!daysWithEvents.length" class="table-card text-center py-5 text-muted">
        {{ localeStore.currentLocale === 'id' ? 'Belum ada transaksi bulan ini.' : 'No transactions this month.' }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTour } from '../composables/useTour';
import { calendarTourSteps } from '../tours/calendarTour';

import { ref, computed, onMounted, watch } from 'vue';
import { formatCurrency } from '../utils/format';
import { transactionService } from '../services/transactionService';
import { recurringService } from '../services/recurringService';
import { goalService } from '../services/goalService';
import { useLocaleStore } from '../stores/locale';

const { startAutoTour, startTour } = useTour('calendar');
const handleTour = () => startTour(calendarTourSteps);

const localeStore = useLocaleStore();

// ── State ──────────────────────────────────────────────────────────────────
const loading = ref(false);
const today = new Date();
const viewYear = ref(today.getFullYear());
const viewMonth = ref(today.getMonth() + 1); // 1-indexed

const transactions = ref([]);  // All transactions in the current month
const recurringItems = ref([]); // All active recurring expenses
const goals = ref([]);          // All active saving goals

const selectedDay = ref(null);
const mobileDayOpen = ref(null);

// ── Month navigation ───────────────────────────────────────────────────────
const dayHeaders = computed(() => {
  if (localeStore.currentLocale === 'id') {
    return ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
  }
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
});

const currentMonthLabel = computed(() => {
  const monthNames = localeStore.currentLocale === 'id'
    ? ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
    : ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${monthNames[viewMonth.value - 1]} ${viewYear.value}`;
});

// Days in current month
const daysInMonth = computed(() => {
  return new Date(viewYear.value, viewMonth.value, 0).getDate();
});

// First day of month (0=Sun), adjusted for Mon-start grid (0=Mon)
const firstDayOffset = computed(() => {
  const jsDay = new Date(viewYear.value, viewMonth.value - 1, 1).getDay(); // 0=Sun
  return jsDay === 0 ? 6 : jsDay - 1; // convert to Mon-start
});

function prevMonth() {
  if (viewMonth.value === 1) { viewMonth.value = 12; viewYear.value--; }
  else viewMonth.value--;
  selectedDay.value = null;
}
function nextMonth() {
  if (viewMonth.value === 12) { viewMonth.value = 1; viewYear.value++; }
  else viewMonth.value++;
  selectedDay.value = null;
}
function goToToday() {
  viewYear.value = today.getFullYear();
  viewMonth.value = today.getMonth() + 1;
  selectedDay.value = today.getDate();
}

// ── Data fetching ──────────────────────────────────────────────────────────
async function fetchData() {
  loading.value = true;
  selectedDay.value = null;
  mobileDayOpen.value = null;
  try {
    const dateFrom = `${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}-01`;
    const dateTo   = `${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}-${String(daysInMonth.value).padStart(2, '0')}`;

    const [txRes, recRes, goalRes] = await Promise.all([
      transactionService.list({ date_from: dateFrom, date_to: dateTo, per_page: 500, page: 1 }),
      recurringService.list(),
      goalService.list(),
    ]);

    transactions.value = txRes.data.data || [];
    recurringItems.value = (recRes.data.data || []).filter(r => r.is_active);
    goals.value = (goalRes.data.data || []).filter(g => g.status === 'active' && g.deadline);
  } finally {
    loading.value = false;
  }
}

// Watch month/year changes and refetch
watch([viewMonth, viewYear], fetchData);
onMounted(fetchData);

// ── Day helpers ────────────────────────────────────────────────────────────
function dateStr(day) {
  return `${viewYear.value}-${String(viewMonth.value).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function isToday(day) {
  return day === today.getDate()
    && viewMonth.value === today.getMonth() + 1
    && viewYear.value  === today.getFullYear();
}

function getDayTransactions(day) {
  const d = dateStr(day);
  return transactions.value.filter(tx => tx.transaction_date === d || tx.transaction_date?.startsWith(d));
}

function getDayIncome(day) {
  return getDayTransactions(day)
    .filter(tx => tx.type === 'income')
    .reduce((s, tx) => s + Number(tx.amount), 0);
}

function getDayExpense(day) {
  return getDayTransactions(day)
    .filter(tx => tx.type === 'expense' || (tx.type === 'transfer' && tx.amount < 0))
    .reduce((s, tx) => s + Math.abs(Number(tx.amount)), 0);
}

function getDayNet(day) {
  return getDayTransactions(day).reduce((s, tx) => {
    if (tx.type === 'income') return s + Number(tx.amount);
    if (tx.type === 'expense') return s - Math.abs(Number(tx.amount));
    return s;
  }, 0);
}

function getDayRecurring(day) {
  const d = dateStr(day);
  return recurringItems.value.filter(r => {
    const rawDate = r.next_due_date_raw || r.next_due_date;
    return rawDate && rawDate.startsWith(d.slice(0, 10));
  });
}

function getDayGoals(day) {
  const d = dateStr(day);
  return goals.value.filter(g => g.deadline && g.deadline.startsWith(d.slice(0, 10)));
}

function hasDayEvents(day) {
  return getDayTransactions(day).length > 0
    || getDayRecurring(day).length > 0
    || getDayGoals(day).length > 0;
}

// Days that have any event (for mobile list)
const daysWithEvents = computed(() => {
  const days = [];
  for (let d = 1; d <= daysInMonth.value; d++) {
    if (hasDayEvents(d)) days.push(d);
  }
  return days;
});

// ── Month stats ────────────────────────────────────────────────────────────
const monthStats = computed(() => {
  const income  = transactions.value.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const expense = transactions.value.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0);
  const count   = transactions.value.length;
  const recurringCount = recurringItems.value.filter(r => {
    const rawDate = r.next_due_date_raw || r.next_due_date;
    if (!rawDate) return false;
    const d = new Date(rawDate);
    return d.getFullYear() === viewYear.value && d.getMonth() + 1 === viewMonth.value;
  }).length;
  return { income, expense, count, recurringCount };
});

// ── Day selection & labels ─────────────────────────────────────────────────
function selectDay(day) {
  selectedDay.value = selectedDay.value === day ? null : day;
}

function toggleMobileDay(day) {
  mobileDayOpen.value = mobileDayOpen.value === day ? null : day;
}

const selectedDayLabel = computed(() => {
  if (!selectedDay.value) return '';
  const d = new Date(viewYear.value, viewMonth.value - 1, selectedDay.value);
  return d.toLocaleDateString(localeStore.currentLocale === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });
});

function formatMobileDay(day) {
  const d = new Date(viewYear.value, viewMonth.value - 1, day);
  return d.toLocaleDateString(localeStore.currentLocale === 'id' ? 'id-ID' : 'en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });
}

// Compact amount formatter e.g. 1.5jt or 500rb
function formatCompact(val) {
  const n = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  if (n >= 1_000_000) return sign + (n / 1_000_000).toFixed(1).replace('.0','') + 'jt';
  if (n >= 1_000)     return sign + (n / 1_000).toFixed(0) + 'rb';
  return sign + 'Rp' + n;
}

onMounted(() => {
  startAutoTour(calendarTourSteps);
  window.addEventListener('start-calendar-tour', handleTour);
});

onUnmounted(() => {
  window.removeEventListener('start-calendar-tour', handleTour);
});
</script>

<style scoped>
/* ── Calendar Grid ───────────────────────────────────────── */
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.calendar-dow-header {
  text-align: center;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted, #6c757d);
  padding: 6px 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.calendar-cell {
  min-height: 90px;
  border-radius: 10px;
  border: 1px solid var(--input-border, rgba(0,0,0,0.08));
  background: var(--card-bg, rgba(255,255,255,0.03));
  padding: 6px 8px;
  cursor: pointer;
  position: relative;
  transition: border-color 0.18s, background 0.18s, transform 0.12s;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.calendar-cell:hover {
  border-color: var(--primary-color, #6c63ff);
  background: var(--card-bg-hover, rgba(108,99,255,0.07));
  transform: translateY(-1px);
}

.calendar-cell--empty {
  border: none;
  background: transparent;
  cursor: default;
  pointer-events: none;
}

.calendar-cell--today {
  border-color: var(--primary-color, #6c63ff) !important;
  background: rgba(108, 99, 255, 0.08) !important;
}

.calendar-cell--selected {
  border-color: #7c3aed !important;
  background: rgba(124, 58, 237, 0.12) !important;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.25);
}

.calendar-day-number {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-muted, #888);
  line-height: 1;
  align-self: flex-start;
}

.calendar-day-number--today {
  background: var(--primary-color, #6c63ff);
  color: #fff;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
}

/* ── Dots ────────────────────────────────────────────────── */
.calendar-dots {
  display: flex;
  gap: 3px;
  flex-wrap: wrap;
  margin-top: 2px;
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.dot-income    { background: #22c55e; }
.dot-expense   { background: #ef4444; }
.dot-recurring { background: #3b82f6; }
.dot-goal      { background: #f59e0b; }

/* ── Net chip ────────────────────────────────────────────── */
.calendar-net {
  font-size: 0.62rem;
  font-weight: 700;
  border-radius: 4px;
  padding: 1px 5px;
  margin-top: auto;
  align-self: flex-start;
  white-space: nowrap;
}

.calendar-net--positive { background: rgba(34,197,94,0.12); color: #22c55e; }
.calendar-net--negative { background: rgba(239,68,68,0.12);  color: #ef4444; }

/* ── Legend ──────────────────────────────────────────────── */
.badge-legend {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.78rem;
  color: var(--text-muted, #888);
}

/* ── Day detail slide-up ─────────────────────────────────── */
.day-detail-panel {
  animation: slideUp 0.22s cubic-bezier(.22,1,.36,1) both;
}

.slide-up-enter-active { animation: slideUp 0.22s cubic-bezier(.22,1,.36,1) both; }
.slide-up-leave-active { animation: slideDown 0.18s ease-in both; }

@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes slideDown {
  from { opacity: 1; transform: translateY(0); }
  to   { opacity: 0; transform: translateY(10px); }
}

/* ── Responsive small cells ──────────────────────────────── */
@media (max-width: 900px) {
  .calendar-cell { min-height: 68px; padding: 4px 5px; }
  .calendar-net  { display: none; }
}
@media (max-width: 600px) {
  .calendar-cell { min-height: 52px; }
}
</style>
