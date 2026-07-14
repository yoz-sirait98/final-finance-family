<template>
  <div class="reports-page fade-in">
    <div id="tour-reports-header" class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h4>{{ $t('reports.title') }}</h4>
        <p>{{ $t('reports.subtitle') }}</p>
      </div>
      <!-- Export Buttons -->
      <div class="d-flex gap-2">
        <button id="tour-reports-csv-btn" class="btn btn-outline-success btn-sm" @click="exportCSV" :disabled="exporting">
          <i class="bi bi-filetype-csv me-1"></i>{{ exporting ? $t('reports.generating') : $t('reports.exportCsv') }}
        </button>
        <button id="tour-reports-pdf-btn" class="btn btn-outline-danger btn-sm" @click="exportPDF" :disabled="exporting">
          <span v-if="exporting" class="spinner-border spinner-border-sm me-1"></span>
          <i v-else class="bi bi-filetype-pdf me-1"></i>{{ exporting ? $t('reports.generating') : $t('reports.exportPdf') }}
        </button>
      </div>
    </div>

    <!-- Filter Bar -->
    <div id="tour-reports-filters" class="d-flex align-items-center gap-2 mb-4 flex-wrap">
      <label class="fw-semibold text-muted small me-1">{{ localeStore.currentLocale === 'id' ? 'Saring:' : 'Filter:' }}</label>

      <select v-model.number="selectedYear" class="form-select form-select-sm" style="width:auto" @change="loadCharts">
        <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
      </select>

      <select v-model.number="selectedMonth" class="form-select form-select-sm" style="width:auto" @change="loadCharts">
        <option :value="0">{{ localeStore.currentLocale === 'id' ? 'Semua Bulan' : 'All Months' }}</option>
        <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
      </select>

      <select v-model.number="selectedMember" class="form-select form-select-sm" style="width:auto" @change="loadCharts">
        <option :value="0">{{ $t('transactions.allMembers') }}</option>
        <template v-for="m in members" :key="m.id">
          <option v-if="m.is_active || m.id === selectedMember" :value="m.id">{{ m.name }}</option>
        </template>
      </select>

      <span class="text-muted small ms-1">
        {{ localeStore.currentLocale === 'id' ? '— Filter Bulan & Anggota hanya berlaku untuk grafik lingkaran saja' : '— Month & Member filters apply to pie charts only' }}
      </span>
    </div>

    <!-- Pie Charts Row -->
    <div id="tour-reports-charts" class="row g-3 mb-4">
      <div class="col-lg-6">
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
      <div class="col-lg-6">
        <div class="chart-card h-100">
          <h6><i class="bi bi-people me-2"></i>{{ localeStore.currentLocale === 'id' ? 'Pengeluaran per Anggota' : 'Expense by Member' }}</h6>
          <div v-if="hasMemberData" style="position: relative; height: 300px;">
            <canvas ref="memberChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            {{ $t('dashboard.noTransactions') }}
          </div>
        </div>
      </div>
    </div>

    <!-- Annual Charts Row -->
    <div class="row g-3">
      <div class="col-lg-6">
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
      <div class="col-lg-6">
        <div class="chart-card h-100">
          <h6><i class="bi bi-graph-up me-2"></i>{{ $t('dashboard.expenseTrend') }}</h6>
          <div v-if="hasLineData" style="position: relative; height: 300px;">
            <canvas ref="lineChart"></canvas>
          </div>
          <div v-else class="d-flex align-items-center justify-content-center text-muted" style="height: 300px;">
            {{ $t('dashboard.noTransactions') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onUnmounted, watch } from 'vue';
import { useTour } from '../composables/useTour';
import { reportsTourSteps } from '../tours/reportsTour';
import Chart from 'chart.js/auto';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { dashboardService } from '../services/dashboardService';
import { memberService } from '../services/memberService';
import { useLocaleStore } from '../stores/locale';

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
const localeStore = useLocaleStore();

const now = new Date();
const selectedYear   = ref(now.getFullYear());
const selectedMonth  = ref(now.getMonth() + 1);
const selectedMember = ref(0);

const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i);
const months = computed(() => [
  { value: 1,  label: localeStore.t('dashboard.months.1') },
  { value: 2,  label: localeStore.t('dashboard.months.2') },
  { value: 3,  label: localeStore.t('dashboard.months.3') },
  { value: 4,  label: localeStore.t('dashboard.months.4') },
  { value: 5,  label: localeStore.t('dashboard.months.5') },
  { value: 6,  label: localeStore.t('dashboard.months.6') },
  { value: 7,  label: localeStore.t('dashboard.months.7') },
  { value: 8,  label: localeStore.t('dashboard.months.8') },
  { value: 9,  label: localeStore.t('dashboard.months.9') },
  { value: 10, label: localeStore.t('dashboard.months.10') },
  { value: 11, label: localeStore.t('dashboard.months.11') },
  { value: 12, label: localeStore.t('dashboard.months.12') },
]);

// ─── Chart Instances ──────────────────────────────────────────────────────────
let pieInstance, memberInstance, barInstance, lineInstance;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n) {
  return 'Rp ' + Number(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
function filterLabel() {
  const monthName = selectedMonth.value
    ? months.value.find(m => m.value === selectedMonth.value)?.label
    : (localeStore.currentLocale === 'id' ? 'Semua Bulan' : 'All Months');
  const memberName = selectedMember.value
    ? members.value.find(m => m.id === selectedMember.value)?.name ?? 'Unknown'
    : (localeStore.currentLocale === 'id' ? 'Semua Anggota' : 'All Members');
  return `${localeStore.currentLocale === 'id' ? 'Tahun' : 'Year'}: ${selectedYear.value} | ${localeStore.currentLocale === 'id' ? 'Bulan' : 'Month'}: ${monthName} | ${localeStore.currentLocale === 'id' ? 'Anggota' : 'Member'}: ${memberName}`;
}
function filename(ext) {
  const m = selectedMonth.value ? `-${months.value.find(m => m.value === selectedMonth.value)?.label}` : '';
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
    month:     selectedMonth.value,
    member_id: selectedMember.value,
  };

  try {
    const res = await dashboardService.reports(params);
    const d = res.data.data;

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

    const memberData = (d.member_breakdown || []).map((x, i) => ({
      member: x.member_name,
      total: x.total,
      color: x.color || `hsl(${((i + 3) * 137.5) % 360}, 75%, 45%)`
    }));

    const barData = (d.six_month_trend || []).map(x => ({
      month: `${monthNames[x.month - 1]} ${x.year}`,
      income: x.income,
      expense: x.expense
    }));

    chartData.value = {
      pie:    pieData,
      member: memberData,
      bar:    barData,
      line:   barData, // Line chart uses the same trend data
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
        datasets: [{ data: chartData.value.pie.map(d => d.total), backgroundColor: chartData.value.pie.map(d => d.color), borderColor: chartData.value.pie.map(d => d.color), borderWidth: 1 }],
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
        datasets: [{ data: chartData.value.member.map(d => d.total), backgroundColor: chartData.value.member.map(d => d.color), borderColor: chartData.value.member.map(d => d.color), borderWidth: 1 }],
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
          { label: localeStore.t('common.income'),  data: chartData.value.bar.map(d => d.income),  backgroundColor: '#28a745', borderColor: '#28a745', borderWidth: 1, borderRadius: 4 },
          { label: localeStore.t('common.expense'), data: chartData.value.bar.map(d => d.expense), backgroundColor: '#dc3545', borderColor: '#dc3545', borderWidth: 1, borderRadius: 4 },
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
        datasets: [{ label: localeStore.t('common.expense'), data: chartData.value.line.map(d => d.expense), borderColor: '#dc3545', backgroundColor: 'rgba(220,53,69,0.1)', pointBackgroundColor: '#dc3545', pointBorderColor: '#dc3545', pointBorderWidth: 1, fill: true, tension: 0.4 }],
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
  const isId = localeStore.currentLocale === 'id';

  lines.push(isId ? 'Laporan Keuangan Keluarga' : 'Family Finance Report');
  lines.push(filterLabel());
  lines.push('');

  lines.push(isId ? '=== Pengeluaran per Kategori ===' : '=== Expense by Category ===');
  lines.push([isId ? 'Kategori' : 'Category', isId ? 'Jumlah' : 'Amount'].join(sep));
  chartData.value.pie.forEach(r => lines.push([`"${r.category}"`, r.total].join(sep)));
  if (!chartData.value.pie.length) lines.push(isId ? 'Tidak ada data' : 'No data');
  lines.push('');

  lines.push(isId ? '=== Pengeluaran per Anggota ===' : '=== Expense by Member ===');
  lines.push([isId ? 'Anggota' : 'Member', isId ? 'Jumlah' : 'Amount'].join(sep));
  chartData.value.member.forEach(r => lines.push([`"${r.member}"`, r.total].join(sep)));
  if (!chartData.value.member.length) lines.push(isId ? 'Tidak ada data' : 'No data');
  lines.push('');

  lines.push(`=== ${isId ? 'Pemasukan vs Pengeluaran' : 'Income vs Expense'} (${selectedYear.value}) ===`);
  lines.push([isId ? 'Bulan' : 'Month', isId ? 'Pemasukan' : 'Income', isId ? 'Pengeluaran' : 'Expense', isId ? 'Bersih' : 'Net'].join(sep));
  chartData.value.bar.forEach(r => lines.push([r.month, r.income, r.expense, r.income - r.expense].join(sep)));
  if (!chartData.value.bar.length) lines.push(isId ? 'Tidak ada data' : 'No data');
  lines.push('');

  lines.push(isId ? '=== Tren Pengeluaran (6 Bulan Terakhir) ===' : '=== Expense Trend (Last 6 Months) ===');
  lines.push([isId ? 'Bulan' : 'Month', isId ? 'Pengeluaran' : 'Expense'].join(sep));
  chartData.value.line.forEach(r => lines.push([`"${r.month}"`, r.expense].join(sep)));
  if (!chartData.value.line.length) lines.push(isId ? 'Tidak ada data' : 'No data');

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
  const isId = localeStore.currentLocale === 'id';
  try {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    let y = 15;

    doc.setFontSize(18);
    doc.setTextColor(40, 40, 40);
    doc.text(isId ? 'Laporan Keuangan Keluarga' : 'Family Finance Report', pageW / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(filterLabel(), pageW / 2, y, { align: 'center' });
    y += 4;
    doc.text((isId ? 'Dibuat: ' : 'Generated: ') + new Date().toLocaleString(isId ? 'id-ID' : 'en-US'), pageW / 2, y, { align: 'center' });
    y += 8;

    doc.setFontSize(12); doc.setTextColor(40);
    doc.text(localeStore.t('dashboard.expenseByCategory'), 14, y); y += 2;
    autoTable(doc, {
      startY: y,
      head: [[isId ? 'Kategori' : 'Category', isId ? 'Jumlah' : 'Amount']],
      body: chartData.value.pie.length ? chartData.value.pie.map(r => [r.category, fmt(r.total)]) : [[isId ? 'Tidak ada data' : 'No data', '']],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [220, 53, 69] },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;

    doc.setFontSize(12); doc.setTextColor(40);
    doc.text(isId ? 'Pengeluaran per Anggota' : 'Expense by Member', 14, y); y += 2;
    autoTable(doc, {
      startY: y,
      head: [[isId ? 'Anggota' : 'Member', isId ? 'Jumlah' : 'Amount']],
      body: chartData.value.member.length ? chartData.value.member.map(r => [r.member, fmt(r.total)]) : [[isId ? 'Tidak ada data' : 'No data', '']],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [13, 110, 253] },
      columnStyles: { 1: { halign: 'right' } },
      margin: { left: 14, right: 14 },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;

    doc.addPage(); y = 15;

    doc.setFontSize(12); doc.setTextColor(40);
    doc.text((isId ? 'Pemasukan vs Pengeluaran - ' : 'Income vs Expense - ') + selectedYear.value, 14, y); y += 2;
    const barRows = chartData.value.bar.map(r => [r.month, fmt(r.income), fmt(r.expense), fmt(r.income - r.expense)]);
    autoTable(doc, {
      startY: y,
      head: [[isId ? 'Bulan' : 'Month', isId ? 'Pemasukan' : 'Income', isId ? 'Pengeluaran' : 'Expense', isId ? 'Bersih' : 'Net']],
      body: barRows.length ? barRows : [[isId ? 'Tidak ada data' : 'No data', '', '', '']],
      styles: { fontSize: 10 },
      headStyles: { fillColor: [73, 80, 87] },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
      margin: { left: 14, right: 14 },
      foot: barRows.length ? [['Total', fmt(chartData.value.bar.reduce((s, r) => s + r.income, 0)), fmt(chartData.value.bar.reduce((s, r) => s + r.expense, 0)), fmt(chartData.value.bar.reduce((s, r) => s + r.income - r.expense, 0))]] : [],
      footStyles: { fillColor: [240, 240, 240], textColor: [40, 40, 40], fontStyle: 'bold' },
    });
    y = (doc.lastAutoTable?.finalY ?? y) + 8;

    doc.setFontSize(12); doc.setTextColor(40);
    doc.text(localeStore.t('dashboard.expenseTrend'), 14, y); y += 2;
    autoTable(doc, {
      startY: y,
      head: [[isId ? 'Bulan' : 'Month', isId ? 'Pengeluaran' : 'Expense']],
      body: chartData.value.line.length ? chartData.value.line.map(r => [r.month, fmt(r.expense)]) : [[isId ? 'Tidak ada data' : 'No data', '']],
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

// Re-render charts when language switches
watch(() => localeStore.currentLocale, () => {
  loadCharts();
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
