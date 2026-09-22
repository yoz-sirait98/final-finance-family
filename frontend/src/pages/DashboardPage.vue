<template>
  <div class="dashboard-page fade-in">

    <!-- Filter Bar -->
    <div id="tour-period-filter" class="d-flex align-items-center gap-2 mb-4 flex-wrap">
      <label class="fw-semibold text-muted small me-1">{{ $t('dashboard.period') }}</label>
      <select v-model.number="selectedMonth" class="form-select form-select-sm" style="width:auto" @change="loadAll">
        <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
      <select v-model.number="selectedYear" class="form-select form-select-sm" style="width:auto" @change="loadAll">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <span class="text-muted small ms-1">{{ $t('dashboard.periodSub') }}</span>
    </div>

    <!-- AI Financial Insights -->
    <div v-if="insights.length" id="tour-insights" class="mb-4">
      <div class="d-flex align-items-center mb-2" style="cursor: pointer; user-select: none; width: fit-content;" @click="showInsights = !showInsights">
        <h6 class="fw-bold mb-0"><i class="bi bi-stars text-warning me-2"></i>{{ $t('dashboard.insights') }}</h6>
        <i class="bi ms-2 text-muted" :class="showInsights ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        <span v-if="!showInsights" class="badge bg-primary-subtle text-primary ms-2 rounded-pill">{{ $t('dashboard.insightsNew', { count: insights.length }) }}</span>
      </div>
      
      <div v-show="showInsights" class="row g-2" style="animation: fadeIn 0.3s ease-in-out">
        <div v-for="(insight, index) in insights" :key="index" class="col-md-4">
          <div class="card border-0 shadow-sm h-100" style="background: var(--card-bg); border: var(--card-border); border-left: 3px solid #667eea !important; backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);">
            <div class="card-body p-2 d-flex align-items-center">
              <p class="mb-0 ms-2 fw-medium" style="font-size: 0.85rem; line-height: 1.3; color: var(--text-color);">{{ insight }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-xl-3 col-md-6">
        <div id="tour-stat-balance" class="stat-card">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="stat-label">{{ $t('dashboard.totalBalance') }}</div>
              <SkeletonLoader v-if="isLoading" height="32px" class="mt-1" style="width: 150px" />
              <div v-else class="stat-value" :title="formatRupiah(summary.total_balance)">{{ formatRupiah(displayTotalBalance) }}</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
              <i class="bi bi-wallet2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6">
        <div id="tour-stat-income" class="stat-card" style="animation: slideUp 0.4s ease-out">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="stat-label">{{ $t('dashboard.monthlyIncome', { period: currentMonthLabel }) }}</div>
              <SkeletonLoader v-if="isLoading" height="32px" class="mt-1" style="width: 120px" />
              <div v-else class="stat-value text-success" :title="formatRupiah(summary.monthly_income)">{{ formatRupiah(displayMonthlyIncome) }}</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #28a745, #20c997);">
              <i class="bi bi-arrow-down-circle"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6">
        <div id="tour-stat-expense" class="stat-card" style="animation: slideUp 0.5s ease-out">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="stat-label">{{ $t('dashboard.monthlyExpense', { period: currentMonthLabel }) }}</div>
              <SkeletonLoader v-if="isLoading" height="32px" class="mt-1" style="width: 120px" />
              <div v-else class="stat-value text-danger" :title="formatRupiah(summary.monthly_expense)">{{ formatRupiah(displayMonthlyExpense) }}</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #dc3545, #f86fa1);">
              <i class="bi bi-arrow-up-circle"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6">
        <div id="tour-stat-net" class="stat-card" style="animation: slideUp 0.6s ease-out">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="stat-label">{{ $t('dashboard.netIncome') }}</div>
              <SkeletonLoader v-if="isLoading" height="32px" class="mt-1" style="width: 120px" />
              <div v-else class="stat-value" :class="summary.monthly_net >= 0 ? 'text-success' : 'text-danger'" :title="formatRupiah(summary.monthly_net)">{{ formatRupiah(displayMonthlyNet) }}</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #fd7e14, #ffc107);">
              <i class="bi bi-graph-up"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Today's Family Tasks & Meal Planner Dual Widgets -->
    <div class="row g-3 mb-4">
      <!-- Col 1: Today's Schedule & Chores -->
      <div class="col-12 col-lg-6">
        <div class="stat-card p-3 h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-calendar-check text-primary fs-5"></i>
                <h6 class="fw-bold mb-0">{{ localeStore.currentLocale === 'id' ? 'Jadwal & Tugas Hari Ini' : "Today's Schedule & Chores" }}</h6>
                <span class="badge bg-primary-subtle text-primary rounded-pill">
                  {{ todayTasks.length }}
                </span>
              </div>
              <router-link to="/scheduler" class="btn btn-sm btn-outline-primary">
                {{ localeStore.currentLocale === 'id' ? 'Buka Jadwal' : 'Open Scheduler' }} <i class="bi bi-arrow-right ms-1"></i>
              </router-link>
            </div>

            <div v-if="todayTasks.length === 0" class="text-muted small py-2">
              <i class="bi bi-check2-circle text-success me-1"></i>
              {{ localeStore.currentLocale === 'id' ? 'Tidak ada tugas terjadwal hari ini! Nikmati harimu.' : 'No tasks scheduled for today! Enjoy your day.' }}
            </div>

            <div v-else class="d-flex flex-column gap-2 mt-2">
              <div
                v-for="task in todayTasks.slice(0, 3)"
                :key="task.id"
                class="d-flex align-items-center justify-content-between p-2 rounded-2 border"
                style="background: var(--card-bg);"
              >
                <div class="d-flex align-items-center gap-2 text-truncate">
                  <input
                    type="checkbox"
                    class="form-check-input mt-0"
                    :checked="task.status === 'completed'"
                    @change="toggleTodayTask(task)"
                  />
                  <span
                    class="small fw-semibold text-truncate"
                    :class="{ 'text-decoration-line-through text-muted': task.status === 'completed' }"
                  >
                    {{ task.title }}
                  </span>
                </div>
                <div class="d-flex align-items-center gap-1 flex-shrink-0">
                  <span v-if="task.start_time" class="badge bg-secondary-subtle text-secondary small">
                    {{ task.start_time }}
                  </span>
                  <span
                    v-if="task.category"
                    class="badge small"
                    :style="{ backgroundColor: task.category.color }"
                  >
                    {{ task.category.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Col 2: Today's Menu & Expiring Groceries -->
      <div class="col-12 col-lg-6">
        <div class="stat-card p-3 h-100 d-flex flex-column justify-content-between">
          <div>
            <div class="d-flex align-items-center justify-content-between mb-2 flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <i class="bi bi-egg-fried text-warning fs-5"></i>
                <h6 class="fw-bold mb-0">{{ localeStore.currentLocale === 'id' ? 'Menu Hari Ini & Dapur' : "Today's Menu & Pantry" }}</h6>
                <span class="badge bg-warning-subtle text-warning-emphasis rounded-pill">
                  {{ mealPlanStore.todayMeals.length }} {{ localeStore.currentLocale === 'id' ? 'menu' : 'meals' }}
                </span>
              </div>
              <router-link to="/meals" class="btn btn-sm btn-outline-warning">
                {{ localeStore.currentLocale === 'id' ? 'Dapur & Menu' : 'Open Meals' }} <i class="bi bi-arrow-right ms-1"></i>
              </router-link>
            </div>

            <!-- Expiring Alert Bar -->
            <div v-if="pantryStore.expiringCount > 0" class="alert alert-warning py-1 px-2 mb-2 d-flex align-items-center justify-content-between gap-2 small">
              <span class="text-truncate">
                <i class="bi bi-alarm-fill text-warning me-1"></i>
                <strong>{{ pantryStore.expiringCount }}</strong> {{ localeStore.currentLocale === 'id' ? 'bahan perlu segera dimasak!' : 'items expiring soon!' }}
              </span>
              <router-link to="/meals" class="btn btn-xs btn-dark py-0 px-2 small rounded-pill flex-shrink-0">
                {{ localeStore.currentLocale === 'id' ? 'Cek Stok' : 'Check' }}
              </router-link>
            </div>

            <!-- Today's Planned Meals List -->
            <div v-if="mealPlanStore.todayMeals.length === 0" class="text-muted small py-2">
              <i class="bi bi-cup-hot text-muted me-1"></i>
              {{ localeStore.currentLocale === 'id' ? 'Belum ada menu makan yang dijadwalkan hari ini.' : 'No meals planned for today.' }}
              <router-link to="/meals" class="text-primary text-decoration-none ms-1">
                + {{ localeStore.currentLocale === 'id' ? 'Jadwalkan Menu' : 'Plan Meal' }}
              </router-link>
            </div>

            <div v-else class="d-flex flex-column gap-2 mt-2">
              <div
                v-for="meal in mealPlanStore.todayMeals.slice(0, 3)"
                :key="meal.id"
                class="d-flex align-items-center justify-content-between p-2 rounded-2 border"
                style="background: var(--card-bg);"
              >
                <div class="d-flex align-items-center gap-2 text-truncate">
                  <input
                    type="checkbox"
                    class="form-check-input mt-0"
                    :checked="meal.is_completed"
                    @change="toggleTodayMeal(meal)"
                  />
                  <span
                    class="small fw-semibold text-truncate"
                    :class="{ 'text-decoration-line-through text-muted': meal.is_completed }"
                  >
                    {{ meal.recipe_title }}
                  </span>
                </div>
                <div class="d-flex align-items-center gap-1 flex-shrink-0">
                  <span class="badge rounded-pill bg-body-secondary text-body-secondary small text-capitalize">
                    {{ meal.meal_type }}
                  </span>
                  <span v-if="meal.assigned_member" class="badge bg-danger-subtle text-danger small">
                    {{ meal.assigned_member.name }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div id="tour-charts" class="row g-3 mb-4">
      <div class="col-lg-4">
        <div class="chart-card h-100">
          <h6><i class="bi bi-pie-chart me-2"></i>{{ $t('dashboard.expenseByCategory') }}</h6>
          <div v-if="hasPieData" style="position: relative; height: 300px;">
            <canvas ref="pieChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            {{ $t('dashboard.noTransactions') }}
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="chart-card h-100">
          <h6><i class="bi bi-bar-chart me-2"></i>{{ $t('dashboard.incomeVsExpense', { year: selectedYear }) }}</h6>
          <div v-if="hasBarData" style="position: relative; height: 300px;">
            <canvas ref="barChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            {{ $t('dashboard.noTransactions') }}
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="chart-card">
          <h6><i class="bi bi-graph-up me-2"></i>{{ $t('dashboard.expenseTrend') }}</h6>
          <div v-if="hasLineData" style="position: relative; height: 300px;">
            <canvas ref="lineChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            {{ $t('dashboard.noTransactions') }}
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="chart-card">
          <h6><i class="bi bi-cash-stack me-2"></i>{{ $t('dashboard.netWorthGrowth') }}</h6>
          <div v-if="hasNetWorthData" style="position: relative; height: 300px;">
            <canvas ref="netWorthChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            {{ $t('dashboard.noNetWorth') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import Chart from 'chart.js/auto';
import { useDashboard } from '../composables/useDashboard';
import { formatRupiah } from '../utils/currency';
import SkeletonLoader from '../components/SkeletonLoader.vue';
import { useCountUp } from '../composables/useCountUp';
import { useTour } from '../composables/useTour';
import { dashboardTourSteps } from '../tours/dashboardTour';
import { useLocaleStore } from '../stores/locale';
import { useSchedulerTaskStore } from '../stores/schedulerTask';
import { useAuthStore } from '../stores/auth';
import { useMealPlanStore } from '../stores/mealPlan';
import { usePantryStore } from '../stores/pantry';
import { getTodayDateString } from '../utils/schedulerDate';

const now = new Date();
const showInsights = ref(false);
const localeStore = useLocaleStore();
const schedulerTaskStore = useSchedulerTaskStore();
const mealPlanStore = useMealPlanStore();
const pantryStore = usePantryStore();
const authStore = useAuthStore();

const todayTasks = computed(() => {
  const today = getTodayDateString();
  return (schedulerTaskStore.tasks || []).filter((t) => t.task_date === today && !t.is_deleted);
});

async function toggleTodayTask(task) {
  await schedulerTaskStore.toggleStatus(task.id);
}

async function toggleTodayMeal(meal) {
  await mealPlanStore.toggleCompleted(meal.id, !meal.is_completed);
}

// Filter state
const selectedMonth = ref(now.getMonth() + 1);
const selectedYear  = ref(now.getFullYear());

const { data: dashboardData, isLoading, isError } = useDashboard(selectedMonth, selectedYear);

const months = computed(() => [
  { value: 1, label: localeStore.t('dashboard.months.1') },
  { value: 2, label: localeStore.t('dashboard.months.2') },
  { value: 3, label: localeStore.t('dashboard.months.3') },
  { value: 4, label: localeStore.t('dashboard.months.4') },
  { value: 5, label: localeStore.t('dashboard.months.5') },
  { value: 6, label: localeStore.t('dashboard.months.6') },
  { value: 7, label: localeStore.t('dashboard.months.7') },
  { value: 8, label: localeStore.t('dashboard.months.8') },
  { value: 9, label: localeStore.t('dashboard.months.9') },
  { value: 10, label: localeStore.t('dashboard.months.10') },
  { value: 11, label: localeStore.t('dashboard.months.11') },
  { value: 12, label: localeStore.t('dashboard.months.12') },
]);
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

const currentMonthLabel = computed(() => {
  const m = months.value.find(m => m.value === selectedMonth.value);
  return `${m?.label ?? ''} ${selectedYear.value}`;
});

// Chart & summary state
const summary  = ref({ total_balance: 0, monthly_income: 0, monthly_expense: 0, monthly_net: 0 });

const displayTotalBalance = useCountUp(computed(() => summary.value.total_balance));
const displayMonthlyIncome = useCountUp(computed(() => summary.value.monthly_income));
const displayMonthlyExpense = useCountUp(computed(() => summary.value.monthly_expense));
const displayMonthlyNet = useCountUp(computed(() => summary.value.monthly_net));

const insights = ref([]);
const pieChart  = ref(null);
const barChart  = ref(null);
const lineChart = ref(null);
const netWorthChart = ref(null);

const hasPieData  = ref(false);
const hasBarData  = ref(false);
const hasLineData = ref(false);
const hasNetWorthData = ref(false);

let pieInstance, barInstance, lineInstance, netWorthInstance;

function getChartColors() {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  return {
    textColor: isDark ? '#94a3b8' : '#64748b',
    gridColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.05)',
    accentColor: isDark ? '#8a2be2' : '#667eea',
    incomeColor: isDark ? '#10b981' : '#28a745',
    expenseColor: isDark ? '#f43f5e' : '#dc3545',
    cardBg: isDark ? '#161626' : '#ffffff',
  };
}

async function updateCharts(d) {
  if (!d) return;

  if (pieInstance)  { pieInstance.destroy();  pieInstance  = null; }
  if (barInstance)  { barInstance.destroy();  barInstance  = null; }
  if (lineInstance) { lineInstance.destroy(); lineInstance = null; }
  if (netWorthInstance) { netWorthInstance.destroy(); netWorthInstance = null; }

  // Map Supabase RPC format to Dashboard format
  summary.value = {
    total_balance: d.total_balance || 0,
    monthly_income: d.monthly_income || 0,
    monthly_expense: d.monthly_expense || 0,
    monthly_net: d.monthly_net || 0
  };

  insights.value = d.insights || [];

  const monthNames = [
    localeStore.t('dashboard.monthsAbbr.1'),
    localeStore.t('dashboard.monthsAbbr.2'),
    localeStore.t('dashboard.monthsAbbr.3'),
    localeStore.t('dashboard.monthsAbbr.4'),
    localeStore.t('dashboard.monthsAbbr.5'),
    localeStore.t('dashboard.monthsAbbr.6'),
    localeStore.t('dashboard.monthsAbbr.7'),
    localeStore.t('dashboard.monthsAbbr.8'),
    localeStore.t('dashboard.monthsAbbr.9'),
    localeStore.t('dashboard.monthsAbbr.10'),
    localeStore.t('dashboard.monthsAbbr.11'),
    localeStore.t('dashboard.monthsAbbr.12')
  ];

  const pieData = (d.category_breakdown || []).map((x, i) => ({
    category: x.category_name,
    total: x.total,
    color: x.color || `hsl(${(i * 137.5) % 360}, 70%, 55%)`
  }));

  const barData = (d.six_month_trend || []).map(x => ({
    month: `${monthNames[x.month - 1]} ${x.year}`,
    income: x.income,
    expense: x.expense
  }));
  const lineData = barData; // Expense trend uses the same data

  // Calculate Net Worth Growth backwards from current total balance
  let currentBalance = summary.value.total_balance;
  const netWorthData = [];
  
  for (let i = barData.length - 1; i >= 0; i--) {
    const monthData = barData[i];
    netWorthData.unshift({
      month: monthData.month,
      balance: currentBalance
    });
    const netIncome = monthData.income - monthData.expense;
    currentBalance = currentBalance - netIncome;
  }

  hasPieData.value      = pieData.length > 0;
  hasBarData.value      = barData.some(x => x.income > 0 || x.expense > 0);
  hasLineData.value     = lineData.some(x => x.expense > 0);
  hasNetWorthData.value = netWorthData.length > 0;

  await nextTick();
  
  const colors = getChartColors();

  requestAnimationFrame(() => {
    if (hasPieData.value && pieChart.value) {
      pieInstance = new Chart(pieChart.value, {
        type: 'pie',
        data: {
          labels: pieData.map(d => d.category),
          datasets: [{ 
            data: pieData.map(d => d.total), 
            backgroundColor: pieData.map(d => d.color), 
            borderColor: pieData.map(d => d.color), 
            borderWidth: 1 
          }],
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          },
          animations: {
            numbers: {
              type: 'number',
              properties: ['circumference', 'endAngle'],
              from: 0
            }
          },
          plugins: { 
            legend: { 
              position: 'bottom', 
              labels: { 
                padding: 16,
                color: colors.textColor
              } 
            } 
          } 
        },
      });
    }

    if (hasBarData.value && barChart.value) {
      barInstance = new Chart(barChart.value, {
        type: 'bar',
        data: {
          labels: barData.map(d => d.month),
          datasets: [
            { label: localeStore.t('common.income'),  data: barData.map(d => d.income),  backgroundColor: colors.incomeColor, borderColor: colors.incomeColor, borderWidth: 1, borderRadius: 4 },
            { label: localeStore.t('common.expense'), data: barData.map(d => d.expense), backgroundColor: colors.expenseColor, borderColor: colors.expenseColor, borderWidth: 1, borderRadius: 4 },
          ],
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          },
          animations: {
            y: {
              duration: 1200,
              easing: 'easeOutQuart',
              from: 0
            }
          },
          plugins: { 
            legend: { 
              position: 'top',
              labels: { color: colors.textColor }
            } 
          }, 
          scales: { 
            x: {
              ticks: { color: colors.textColor },
              grid: { color: colors.gridColor }
            },
            y: { 
              beginAtZero: true,
              ticks: { color: colors.textColor },
              grid: { color: colors.gridColor }
            } 
          } 
        },
      });
    }

    if (hasLineData.value && lineChart.value) {
      const ctx = lineChart.value.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, colors.expenseColor === '#f43f5e' ? 'rgba(244, 63, 94, 0.35)' : 'rgba(220, 53, 69, 0.35)');
      gradient.addColorStop(1, 'rgba(244, 63, 94, 0.0)');

      lineInstance = new Chart(lineChart.value, {
        type: 'line',
        data: {
          labels: lineData.map(d => d.month),
          datasets: [{ 
            label: localeStore.t('common.expense'), 
            data: lineData.map(d => d.expense), 
            borderColor: colors.expenseColor, 
            backgroundColor: gradient, 
            fill: true, 
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: colors.expenseColor,
            pointBorderColor: colors.expenseColor,
            pointBorderWidth: 1
          }],
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          },
          animations: {
            y: {
              duration: 1200,
              easing: 'easeOutQuart',
              from: 0
            }
          },
          plugins: { 
            legend: { display: false } 
          }, 
          scales: { 
            x: {
              ticks: { color: colors.textColor },
              grid: { color: colors.gridColor }
            },
            y: { 
              beginAtZero: true,
              ticks: { color: colors.textColor },
              grid: { color: colors.gridColor }
            } 
          } 
        },
      });
    }

    if (hasNetWorthData.value && netWorthChart.value) {
      const ctx = netWorthChart.value.getContext('2d');
      const gradient = ctx.createLinearGradient(0, 0, 0, 300);
      gradient.addColorStop(0, colors.accentColor === '#8a2be2' ? 'rgba(138, 43, 226, 0.35)' : 'rgba(102, 126, 234, 0.35)');
      gradient.addColorStop(1, 'rgba(102, 126, 234, 0.0)');

      netWorthInstance = new Chart(netWorthChart.value, {
        type: 'line',
        data: {
          labels: netWorthData.map(d => d.month),
          datasets: [{ 
            label: localeStore.t('dashboard.netWorthGrowth'), 
            data: netWorthData.map(d => d.balance), 
            borderColor: colors.accentColor, 
            backgroundColor: gradient, 
            fill: true, 
            tension: 0.4, 
            pointRadius: 4, 
            pointBackgroundColor: colors.accentColor,
            pointBorderColor: colors.accentColor,
            pointBorderWidth: 1
          }],
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false, 
          animation: {
            duration: 1200,
            easing: 'easeOutQuart'
          },
          animations: {
            y: {
              duration: 1200,
              easing: 'easeOutQuart',
              from: 0
            }
          },
          plugins: { 
            legend: { display: false } 
          }, 
          scales: { 
            x: {
              ticks: { color: colors.textColor },
              grid: { color: colors.gridColor }
            },
            y: { 
              beginAtZero: false,
              ticks: { color: colors.textColor },
              grid: { color: colors.gridColor }
            } 
          } 
        },
      });
    }
  });
}

const { startTour, startAutoTour } = useTour('dashboard');

watch(dashboardData, (newData) => {
  if (newData) {
    updateCharts(newData);
  }
});

// Re-render charts when language switches
watch(() => localeStore.currentLocale, () => {
  if (dashboardData.value) {
    updateCharts(dashboardData.value);
  }
});

function handleThemeChanged() {
  if (dashboardData.value) {
    updateCharts(dashboardData.value);
  }
}

onMounted(() => {
  if (dashboardData.value) {
    updateCharts(dashboardData.value);
  }
  startAutoTour(dashboardTourSteps);
  window.addEventListener('start-dashboard-tour', () => startTour(dashboardTourSteps));
  window.addEventListener('theme-changed', handleThemeChanged);

  // Load scheduler tasks for family
  schedulerTaskStore.fetchTasks(authStore.familyId);

  // Load today's meals & pantry stock
  mealPlanStore.fetchCurrentWeek();
  pantryStore.fetchItems();
});

onUnmounted(() => {
  window.removeEventListener('start-dashboard-tour', () => startTour(dashboardTourSteps));
  window.removeEventListener('theme-changed', handleThemeChanged);
});
</script>