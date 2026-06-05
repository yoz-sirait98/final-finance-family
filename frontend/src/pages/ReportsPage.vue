<template>
  <div class="reports-page fade-in">
    <div id="tour-reports-header" class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h4>Reports</h4>
        <p>Financial reports and analytics</p>
      </div>
      <!-- Export Buttons -->
      <div id="tour-reports-export" class="d-flex gap-2">
        <button class="btn btn-outline-success btn-sm" @click="exportCSV" :disabled="exporting">
          <i class="bi bi-filetype-csv me-1"></i>Export CSV
        </button>
        <button class="btn btn-outline-danger btn-sm" @click="exportPDF" :disabled="exporting">
          <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-filetype-pdf me-1"></i>Export PDF
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div id="tour-reports-filters" class="d-flex align-items-center gap-2 mb-4 flex-wrap">
      <label class="fw-semibold text-muted small me-1">Filter:</label>

      <select v-model.number="selectedYear" class="form-select form-select-sm" style="width:auto" @change="loadCharts">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>

      <select v-model.number="selectedMonth" class="form-select form-select-sm" style="width:auto" @change="loadCharts">
        <option :value="0">All Months</option>
        <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>

      <select v-model.number="selectedMember" class="form-select form-select-sm" style="width:auto" @change="loadCharts">
        <option :value="0">All Members</option>
        <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
      </select>

      <span class="text-muted small ms-1">— Month &amp; Member filters apply to pie charts only</span>
    </div>

    <!-- Pie Charts Row -->
    <div id="tour-reports-charts" class="row g-3 mb-4">
      <div class="col-lg-6">
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
      <div class="col-lg-6">
        <div class="chart-card h-100">
          <h6><i class="bi bi-people me-2"></i>Expense by Member</h6>
          <div v-if="hasMemberData" style="position: relative; height: 300px;">
            <canvas ref="memberChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            No transactions yet
          </div>
        </div>
      </div>
    </div>

    <!-- Annual Charts Row -->
    <div class="row g-3">
      <div class="col-lg-6">
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
      <div class="col-lg-6">
        <div class="chart-card h-100">
          <h6><i class="bi bi-graph-up me-2"></i>6-Month Expense Trend</h6>
          <div v-if="hasLineData" style="position: relative; height: 300px;">
            <canvas ref="lineChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            No transactions yet
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue';
import { useTour } from '../composables/useTour';
import { reportsTourSteps } from '../tours/reportsTour';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dashboardService } from '../services/dashboardService';
import { memberService } from '../services/memberService';

// ─── Canvas Refs ──────────────────────────────────────────────────────────────
const pieChart    = ref(null);
const memberChart = ref(null);
const barChart    = ref(null);
const lineChart   = ref(null);

// ─── Data Flags ───────────────────────────────────────────────────────────────
const hasPieData    = ref(false);
const hasMemberData = ref(false);
const hasBarData    = ref(false);
const hasLineData   = ref(false);

// ─── State ────────────────────────────────────────────────────────────────────
const exporting = ref(false);
const chartData = ref({ pie: [], member: [], bar: [], line: [] });
const members   = ref([]);

const now = new Date();
const selectedYear   = ref(now.getFullYear());
const selectedMonth  = ref(now.getMonth() + 1);
const selectedMember = ref(0);

const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
const months = [
  { value: 1,  label: 'January' },  { value: 2,  label: 'February' },
  { value: 3,  label: 'March' },    { value: 4,  label: 'April' },
  { value: 5,  label: 'May' },      { value: 6,  label: 'June' },
  { value: 7,  label: 'July' },     { value: 8,  label: 'August' },
  { value: 9,  label: 'September' },{ value: 10, label: 'October' },
  { value: 11, label: 'November' }, { value: 12, label: 'December' },
];

// ─── Chart Instances ──────────────────────────────────────────────────────────
let pieInstance, memberInstance, barInstance, lineInstance;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  return 'Rp ' + Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function filterLabel() {
  const monthName = selectedMonth.value
    ? months.find(m => m.value === selectedMonth.value)?.label
    : 'All Months';
  const memberName = selectedMember.value
    ? members.value.find(m => m.id === selectedMember.value)?.name ?? 'Unknown'
    : 'All Members';
  return `Year: ${selectedYear.value} | Month: ${monthName} | Member: ${memberName}`;
}
function filename(ext) {
  const m = selectedMonth.value ? `-${months.find(m => m.value === selectedMonth.value)?.label}` : '';
  return `family-finance-report-${selectedYear.value}${m}.${ext}`;
}

// ─── Load Charts ──────────────────────────────────────────────────────────────
async function loadCharts() {
  // 1. Destroy existing instances upfront (same pattern as Dashboard)
  if (pieInstance)    { pieInstance.destroy();    pieInstance    = null; }
  if (memberInstance) { memberInstance.destroy(); memberInstance = null; }
  if (barInstance)    { barInstance.destroy();    barInstance    = null; }
  if (lineInstance)   { lineInstance.destroy();   lineInstance   = null; }

  // 2. Fetch data
  const params = {
    year:      selectedYear.value,
    month:     selectedMonth.value  || undefined,
    member_id: selectedMember.value || undefined,
  };

  try {
    const res = await dashboardService.reports(params);
    const { expense_by_category: pieData, expense_by_member: memberData, income_vs_expense: barData, expense_trend: lineData } = res.data.data;

    chartData.value = {
      pie:    pieData    ?? [],
      member: memberData ?? [],
      bar:    barData    ?? [],
      line:   lineData   ?? [],
    };

    hasPieData.value    = chartData.value.pie.length > 0;
    hasMemberData.value = chartData.value.member.length > 0;
    hasBarData.value    = chartData.value.bar.some(d => d.income > 0 || d.expense > 0);
    hasLineData.value   = chartData.value.line.some(d => d.expense > 0);
  } catch (err) {
    console.error('Failed to load reports:', err);
    chartData.value = { pie: [], member: [], bar: [], line: [] };
    hasPieData.value = hasMemberData.value = hasBarData.value = hasLineData.value = false;
  }

  // 3. Wait for v-if to render canvas elements into the DOM
  await nextTick();

  // 4. Create chart instances (no explicit animation block = Chart.js default animations play)
  if (hasPieData.value && pieChart.value) {
    pieInstance = new Chart(pieChart.value, {
      type: 'pie',
      data: {
        labels: chartData.value.pie.map(d => d.category),
        datasets: [{ data: chartData.value.pie.map(d => d.total), backgroundColor: chartData.value.pie.map(d => d.color), borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 16 } } },
      },
    });
  }

  if (hasMemberData.value && memberChart.value) {
    memberInstance = new Chart(memberChart.value, {
      type: 'doughnut',
      data: {
        labels: chartData.value.member.map(d => d.member),
        datasets: [{ data: chartData.value.member.map(d => d.total), backgroundColor: chartData.value.member.map(d => d.color), borderWidth: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { padding: 16 } } },
      },
    });
  }

  if (hasBarData.value && barChart.value) {
    barInstance = new Chart(barChart.value, {
      type: 'bar',
      data: {
        labels: chartData.value.bar.map(d => d.month),
        datasets: [
          { label: 'Income',  data: chartData.value.bar.map(d => d.income),  backgroundColor: '#28a745', borderRadius: 4 },
          { label: 'Expense', data: chartData.value.bar.map(d => d.expense), backgroundColor: '#dc3545', borderRadius: 4 },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'top' } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }

  if (hasLineData.value && lineChart.value) {
    lineInstance = new Chart(lineChart.value, {
      type: 'line',
      data: {
        labels: chartData.value.line.map(d => d.month),
        datasets: [{ label: 'Expense', data: chartData.value.line.map(d => d.expense), borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.1)', fill: true, tension: 0.4 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });
  }
}

// ─── CSV Export ───────────────────────────────────────────────────────────────
async function exportCSV() {
  const lines = [];
  const sep = ',';

  lines.push('Family Finance Report');
  lines.push(filterLabel());
  lines.push('');

  lines.push('=== Expense by Category ===');
  lines.push(['Category', 'Amount'].join(sep));
  chartData.value.pie.forEach(r => lines.push([`"${r.category}"`, r.total].join(sep)));
  if (!chartData.value.pie.length) lines.push('No data');
  lines.push('');

  lines.push('=== Expense by Member ===');
  lines.push(['Member', 'Amount'].join(sep));
  chartData.value.member.forEach(r => lines.push([`"${r.member}"`, r.total].join(sep)));
  if (!chartData.value.member.length) lines.push('No data');
  lines.push('');

  lines.push(`=== Income vs Expense (${selectedYear.value}) ===`);
  lines.push(['Month', 'Income', 'Expense', 'Net'].join(sep));
  chartData.value.bar.forEach(r => lines.push([r.month, r.income, r.expense, r.income - r.expense].join(sep)));
  if (!chartData.value.bar.length) lines.push('No data');
  lines.push('');

  lines.push('=== Expense Trend (Last 6 Months) ===');
  lines.push(['Month', 'Expense'].join(sep));
  chartData.value.line.forEach(r => lines.push([`"${r.month}"`, r.expense].join(sep)));
  if (!chartData.value.line.length) lines.push('No data');

  const content = lines.join('\n');
  const name = filename('csv');

  try {
    if (window.showSaveFilePicker) {
      const handle = await window.showSaveFilePicker({
        suggestedName: name,
        types: [{ description: 'CSV File', accept: { 'text/csv': ['.csv'] } }],
      });
      const writable = await handle.createWritable();
      await writable.write(content);
      await writable.close();
      return;
    }
  } catch (err) {
    if (err.name === 'AbortError') return;
    console.error('File Picker API failed, falling back...', err);
  }

  const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(content);
  const a = document.createElement('a');
  a.setAttribute('href', encodedUri);
  a.setAttribute('download', name);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// ─── PDF Export ───────────────────────────────────────────────────────────────
async function exportPDF() {
  exporting.value = true;
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text('Family Finance Report', pageW / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(filterLabel(), pageW / 2, y, { align: 'center' });
    y += 4;
    doc.text('Generated: ' + new Date().toLocaleString('id-ID'), pageW / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(12); doc.setTextColor(40);
    doc.text('Expense by Category', 14, y); y += 2;
    autoTable(doc, {
      startY: y,
      head: [['Category', 'Amount']],
      body: chartData.value.pie.length ? chartData.value.pie.map(r => [r.category, fmt(r.total)]) : [['No data', '']],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 53, 69] },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;

    doc.setFontSize(12); doc.setTextColor(40);
    doc.text('Expense by Member', 14, y); y += 2;
    autoTable(doc, {
      startY: y,
      head: [['Member', 'Amount']],
      body: chartData.value.member.length ? chartData.value.member.map(r => [r.member, fmt(r.total)]) : [['No data', '']],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [13, 110, 253] },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;

    doc.addPage(); y = 15;

    doc.setFontSize(12); doc.setTextColor(40);
    doc.text('Income vs Expense - ' + selectedYear.value, 14, y); y += 2;
    const barRows = chartData.value.bar.map(r => [r.month, fmt(r.income), fmt(r.expense), fmt(r.income - r.expense)]);
    autoTable(doc, {
      startY: y,
      head: [['Month', 'Income', 'Expense', 'Net']],
      body: barRows.length ? barRows : [['No data', '', '', '']],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [73, 80, 87] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      margin: { left: 14, right: 14 },
      foot: barRows.length ? [['Total', fmt(chartData.value.bar.reduce((s, r) => s + r.income, 0)), fmt(chartData.value.bar.reduce((s, r) => s + r.expense, 0)), fmt(chartData.value.bar.reduce((s, r) => s + r.income - r.expense, 0))]] : [],
      footStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;

    doc.setFontSize(12); doc.setTextColor(40);
    doc.text('Expense Trend (Last 6 Months)', 14, y); y += 2;
    autoTable(doc, {
      startY: y,
      head: [['Month', 'Expense']],
      body: chartData.value.line.length ? chartData.value.line.map(r => [r.month, fmt(r.expense)]) : [['No data', '']],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 53, 69] },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });

    const name = filename('pdf');
    try {
      if (window.showSaveFilePicker) {
        const handle = await window.showSaveFilePicker({
          suggestedName: name,
          types: [{ description: 'PDF File', accept: { 'application/pdf': ['.pdf'] } }],
        });
        const writable = await handle.createWritable();
        await writable.write(doc.output('blob'));
        await writable.close();
        return;
      }
    } catch (err) {
      if (err.name === 'AbortError') return;
      console.error('File Picker API failed, falling back...', err);
    }

    const encodedUri = doc.output('datauristring');
    const a = document.createElement('a');
    a.setAttribute('href', encodedUri);
    a.setAttribute('download', name);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    console.error('PDF export error:', err);
    alert('PDF export failed: ' + err.message);
  } finally {
    exporting.value = false;
  }
}

// ─── Lifecycle ────────────────────────────────────────────────────────────────
const { startTour, startAutoTour } = useTour('reports');

onMounted(async () => {
  const { data } = await memberService.list().catch(() => ({ data: { data: [] } }));
  members.value = data.data;
  await loadCharts();
  startAutoTour(reportsTourSteps);
  window.addEventListener('start-reports-tour', () => startTour(reportsTourSteps));
});

onUnmounted(() => {
  // Destroy all chart instances to prevent memory leaks
  if (pieInstance)    pieInstance.destroy();
  if (memberInstance) memberInstance.destroy();
  if (barInstance)    barInstance.destroy();
  if (lineInstance)   lineInstance.destroy();
  window.removeEventListener('start-reports-tour', () => startTour(reportsTourSteps));
});
</script>
