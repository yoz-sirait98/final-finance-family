<template>
  <div class="dashboard-page fade-in">

    <!-- Filter Bar -->
    <div id="tour-period-filter" class="d-flex align-items-center gap-2 mb-4 flex-wrap">
      <label class="fw-semibold text-muted small me-1">Period:</label>
      <select v-model.number="selectedMonth" class="form-select form-select-sm" style="width:auto" @change="loadAll">
        <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>
      <select v-model.number="selectedYear" class="form-select form-select-sm" style="width:auto" @change="loadAll">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>
      <span class="text-muted small ms-1">— Income vs Expense chart always shows full year</span>
    </div>

    <!-- AI Financial Insights -->
    <div v-if="insights.length" id="tour-insights" class="mb-4">
      <div class="d-flex align-items-center mb-2" style="cursor: pointer; user-select: none; width: fit-content;" @click="showInsights = !showInsights">
        <h6 class="fw-bold mb-0"><i class="bi bi-stars text-warning me-2"></i>Financial Insight</h6>
        <i class="bi ms-2 text-muted" :class="showInsights ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
        <span v-if="!showInsights" class="badge bg-primary-subtle text-primary ms-2 rounded-pill">{{ insights.length }} new</span>
      </div>
      
      <div v-show="showInsights" class="row g-2" style="animation: fadeIn 0.3s ease-in-out">
        <div v-for="(insight, index) in insights" :key="index" class="col-md-4">
          <div class="card border-0 shadow-sm h-100" style="background: linear-gradient(135deg, rgba(102, 126, 234, 0.05), rgba(118, 75, 162, 0.05)); border-left: 3px solid #667eea !important;">
            <div class="card-body p-2 d-flex align-items-center">
              <!-- No duplicate lightbulb since the text already has emojis, but we keep the container clean -->
              <p class="mb-0 ms-2 fw-medium text-dark" style="font-size: 0.85rem; line-height: 1.3;">{{ insight }}</p>
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
              <div class="stat-label">Total Balance</div>
              <div class="stat-value">{{ formatRupiah(summary.total_balance) }}</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea, #764ba2);">
              <i class="bi bi-wallet2"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6">
        <div id="tour-stat-income" class="stat-card">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="stat-label">Income — {{ currentMonthLabel }}</div>
              <div class="stat-value text-success">{{ formatRupiah(summary.monthly_income) }}</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #28a745, #20c997);">
              <i class="bi bi-arrow-down-circle"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6">
        <div id="tour-stat-expense" class="stat-card">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="stat-label">Expense — {{ currentMonthLabel }}</div>
              <div class="stat-value text-danger">{{ formatRupiah(summary.monthly_expense) }}</div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #dc3545, #e83e8c);">
              <i class="bi bi-arrow-up-circle"></i>
            </div>
          </div>
        </div>
      </div>
      <div class="col-xl-3 col-md-6">
        <div id="tour-stat-net" class="stat-card">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="stat-label">Net — {{ currentMonthLabel }}</div>
              <div class="stat-value" :class="summary.monthly_net >= 0 ? 'text-success' : 'text-danger'">
                {{ formatRupiah(summary.monthly_net) }}
              </div>
            </div>
            <div class="stat-icon" style="background: linear-gradient(135deg, #fd7e14, #ffc107);">
              <i class="bi bi-graph-up"></i>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Row -->
    <div id="tour-charts" class="row g-3 mb-4">
      <div class="col-lg-4">
        <div class="chart-card h-100">
          <h6><i class="bi bi-pie-chart me-2"></i>Expense by Category</h6>
          <div v-if="hasPieData" style="position: relative; height: 300px;">
            <canvas ref="pieChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            No transactions yet
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="chart-card h-100">
          <h6><i class="bi bi-bar-chart me-2"></i>Income vs Expense — {{ selectedYear }}</h6>
          <div v-if="hasBarData" style="position: relative; height: 300px;">
            <canvas ref="barChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            No transactions yet
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3">
      <div class="col-lg-6">
        <div class="chart-card">
          <h6><i class="bi bi-graph-up me-2"></i>Expense Trend (Last 6 Months)</h6>
          <div v-if="hasLineData" style="position: relative; height: 300px;">
            <canvas ref="lineChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            No transactions yet
          </div>
        </div>
      </div>
      <div class="col-lg-6">
        <div class="chart-card">
          <h6><i class="bi bi-cash-stack me-2"></i>Net Worth Growth</h6>
          <div v-if="hasNetWorthData" style="position: relative; height: 300px;">
            <canvas ref="netWorthChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            No historical net worth snapshots
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
import { useTour } from '../composables/useTour';
import { dashboardTourSteps } from '../tours/dashboardTour';

const now = new Date();
const showInsights = ref(false);

// Filter state
const selectedMonth = ref(now.getMonth() + 1);
const selectedYear  = ref(now.getFullYear());

const { data: dashboardData, isLoading, isError } = useDashboard(selectedMonth, selectedYear);

const months = [
  { value: 1, label: 'January' }, { value: 2, label: 'February' },
  { value: 3, label: 'March' },   { value: 4, label: 'April' },
  { value: 5, label: 'May' },     { value: 6, label: 'June' },
  { value: 7, label: 'July' },    { value: 8, label: 'August' },
  { value: 9, label: 'September' },{ value: 10, label: 'October' },
  { value: 11, label: 'November' },{ value: 12, label: 'December' },
];
const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);

const currentMonthLabel = computed(() => {
  const m = months.find(m => m.value === selectedMonth.value);
  return `${m?.label ?? ''} ${selectedYear.value}`;
});

// Chart & summary state
const summary  = ref({ total_balance: 0, monthly_income: 0, monthly_expense: 0, monthly_net: 0 });
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

async function updateCharts(d) {
  if (!d) return;

  if (pieInstance)  { pieInstance.destroy();  pieInstance  = null; }
  if (barInstance)  { barInstance.destroy();  barInstance  = null; }
  if (lineInstance) { lineInstance.destroy(); lineInstance = null; }
  if (netWorthInstance) { netWorthInstance.destroy(); netWorthInstance = null; }

  // Summary
  summary.value = d.summary ?? summary.value;

  // Override total_balance from live net worth calculation
  if (d.net_worth_current !== undefined) summary.value.total_balance = d.net_worth_current;

  // Insights
  insights.value = d.insights ?? [];

  const pieData      = d.expense_by_category ?? [];
  const barData      = d.income_vs_expense   ?? [];
  const lineData     = d.expense_trend       ?? [];
  const netWorthData = d.net_worth_history   ?? [];

  hasPieData.value      = pieData.length > 0;
  hasBarData.value      = barData.some(x => x.income > 0 || x.expense > 0);
  hasLineData.value     = lineData.some(x => x.expense > 0);
  hasNetWorthData.value = netWorthData.length > 0;

  await nextTick();

  if (hasPieData.value && pieChart.value) {
    pieInstance = new Chart(pieChart.value, {
      type: 'pie',
      data: {
        labels: pieData.map(d => d.category),
        datasets: [{ data: pieData.map(d => d.total), backgroundColor: pieData.map(d => d.color), borderWidth: 0 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 16 } } } },
    });
  }

  if (hasBarData.value && barChart.value) {
    barInstance = new Chart(barChart.value, {
      type: 'bar',
      data: {
        labels: barData.map(d => d.month),
        datasets: [
          { label: 'Income',  data: barData.map(d => d.income),  backgroundColor: '#28a745', borderRadius: 4 },
          { label: 'Expense', data: barData.map(d => d.expense), backgroundColor: '#dc3545', borderRadius: 4 },
        ],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true } } },
    });
  }

  if (hasLineData.value && lineChart.value) {
    lineInstance = new Chart(lineChart.value, {
      type: 'line',
      data: {
        labels: lineData.map(d => d.month),
        datasets: [{ label: 'Expense', data: lineData.map(d => d.expense), borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.1)', fill: true, tension: 0.4 }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } },
    });
  }

  if (hasNetWorthData.value && netWorthChart.value) {
    netWorthInstance = new Chart(netWorthChart.value, {
      type: 'line',
      data: {
        labels: netWorthData.map(d => new Date(d.recorded_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })),
        datasets: [{ label: 'Net Worth', data: netWorthData.map(d => d.total_balance), borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#667eea' }],
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: false } } },
    });
  }
}

const { startTour, startAutoTour } = useTour('dashboard');

watch(dashboardData, (newData) => {
  if (newData) {
    updateCharts(newData);
  }
});

onMounted(() => {
  if (dashboardData.value) {
    updateCharts(dashboardData.value);
  }
  startAutoTour(dashboardTourSteps);
  window.addEventListener('start-dashboard-tour', () => startTour(dashboardTourSteps));
});

onUnmounted(() => {
  window.removeEventListener('start-dashboard-tour', () => startTour(dashboardTourSteps));
});
</script>