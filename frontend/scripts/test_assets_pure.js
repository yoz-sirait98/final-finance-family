import assert from 'node:assert';

console.log('====================================================');
console.log('🚀 HOUSEHOLD ASSETS & MAINTENANCE TEST SUITE');
console.log('====================================================\n');

const pad = (n) => String(n).padStart(2, '0');
const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const now = new Date();
const todayStr = formatYMD(now);

// ---------------------------------------------------------
// TEST 1: Asset Valuation & Category Distribution
// ---------------------------------------------------------
console.log('TEST 1: Asset Valuation & Metric Calculations');
{
  const mockAssets = [
    { id: '1', name: 'Avanza', category: 'vehicle', purchase_price: 200000000, current_value: 180000000, status: 'active' },
    { id: '2', name: 'AC Daikin', category: 'appliance', purchase_price: 5000000, current_value: null, status: 'active' }, // fallback to purchase_price
    { id: '3', name: 'Laptop Asus', category: 'electronics', purchase_price: 15000000, current_value: 10000000, status: 'under_repair' },
    { id: '4', name: 'Meja Makan', category: 'furniture', purchase_price: 3000000, current_value: 2000000, status: 'sold' },
  ];

  function computeTotalValuation(assets) {
    return assets.reduce((sum, a) => {
      const val = Number(a.current_value !== null && a.current_value !== undefined ? a.current_value : a.purchase_price || 0);
      return sum + val;
    }, 0);
  }

  const total = computeTotalValuation(mockAssets);
  // 180,000,000 + 5,000,000 + 10,000,000 + 2,000,000 = 197,000,000
  assert.strictEqual(total, 197000000, 'Total valuation should sum current_value with fallback to purchase_price');

  const activeCount = mockAssets.filter((a) => a.status === 'active').length;
  assert.strictEqual(activeCount, 2, 'Active assets count should be 2');

  const vehicleCount = mockAssets.filter((a) => a.category === 'vehicle').length;
  assert.strictEqual(vehicleCount, 1, 'Vehicle count should be 1');

  console.log('  ✔ Total valuation fallback logic and status filtering PASSED');
}

// ---------------------------------------------------------
// TEST 2: Warranty Status Evaluation
// ---------------------------------------------------------
console.log('\nTEST 2: Warranty Status & Expiration Warnings');
{
  function evaluateWarrantyStatus(warranty) {
    if (warranty.warranty_type === 'lifetime' || !warranty.end_date) {
      return 'active';
    }
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

    if (warranty.end_date < today) return 'expired';
    if (warranty.end_date <= nextMonth) return 'expiring_soon';
    return 'active';
  }

  const pastDate = formatYMD(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 5));
  const tenDaysLater = formatYMD(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10));
  const sixMonthsLater = formatYMD(new Date(now.getFullYear(), now.getMonth() + 6, now.getDate()));

  assert.strictEqual(evaluateWarrantyStatus({ warranty_type: 'lifetime' }), 'active');
  assert.strictEqual(evaluateWarrantyStatus({ end_date: pastDate, warranty_type: 'manufacturer' }), 'expired');
  assert.strictEqual(evaluateWarrantyStatus({ end_date: tenDaysLater, warranty_type: 'store' }), 'expiring_soon');
  assert.strictEqual(evaluateWarrantyStatus({ end_date: sixMonthsLater, warranty_type: 'manufacturer' }), 'active');

  console.log('  ✔ Warranty status evaluation (Lifetime, Expired, Expiring Soon <30d, Active) PASSED');
}

// ---------------------------------------------------------
// TEST 3: Maintenance Schedule Advance Logic (Trigger Replica)
// ---------------------------------------------------------
console.log('\nTEST 3: Maintenance Schedule Advance on Log Insert');
{
  function calculateNextDue(frequencyType, intervalValue, performedDate, currentOdometer) {
    const performed = new Date(performedDate);
    let nextDate = null;
    let nextOdo = null;

    if (frequencyType === 'months' && intervalValue > 0) {
      const d = new Date(performed);
      d.setMonth(d.getMonth() + intervalValue);
      nextDate = formatYMD(d);
    } else if (frequencyType === 'days' && intervalValue > 0) {
      const d = new Date(performed);
      d.setDate(d.getDate() + intervalValue);
      nextDate = formatYMD(d);
    } else if (frequencyType === 'odometer' && intervalValue > 0) {
      nextOdo = (Number(currentOdometer) || 0) + intervalValue;
    }

    return { nextDate, nextOdo };
  }

  // 1. Advance by 3 months
  const monthlyRes = calculateNextDue('months', 3, '2026-05-15', null);
  assert.strictEqual(monthlyRes.nextDate, '2026-08-15');
  assert.strictEqual(monthlyRes.nextOdo, null);

  // 2. Advance by 5000 km
  const odoRes = calculateNextDue('odometer', 5000, '2026-05-15', 45000);
  assert.strictEqual(odoRes.nextDate, null);
  assert.strictEqual(odoRes.nextOdo, 50000);

  // 3. One-time
  const oneTimeRes = calculateNextDue('one_time', null, '2026-05-15', null);
  assert.strictEqual(oneTimeRes.nextDate, null);
  assert.strictEqual(oneTimeRes.nextOdo, null);

  console.log('  ✔ Schedule recurrence calculation for months, odometer, and one-time PASSED');
}

// ---------------------------------------------------------
// TEST 4: Vehicle Odometer Progression Invariant
// ---------------------------------------------------------
console.log('\nTEST 4: Vehicle Odometer Progression Invariant');
{
  function updateVehicleOdometer(existingOdo, logOdo) {
    if (logOdo === null || logOdo === undefined || logOdo <= 0) return existingOdo;
    return Math.max(existingOdo || 0, logOdo);
  }

  // Log with higher odometer -> advance
  assert.strictEqual(updateVehicleOdometer(30000, 35000), 35000);
  // Log with lower odometer (e.g. historical log entry) -> keep higher current odometer
  assert.strictEqual(updateVehicleOdometer(35000, 32000), 35000);
  // Log with null/zero -> preserve
  assert.strictEqual(updateVehicleOdometer(35000, null), 35000);

  console.log('  ✔ Vehicle odometer monotonic progression logic PASSED');
}

// ---------------------------------------------------------
// TEST 5: Financial Expense Cross-Posting Invariants
// ---------------------------------------------------------
console.log('\nTEST 5: Financial Expense Cross-Posting Invariants');
{
  function buildExpensePayload(familyId, log, expenseOptions) {
    if (!expenseOptions?.createExpense || !expenseOptions.accountId || log.cost <= 0) {
      return null;
    }
    assert(log.cost > 0, 'Financial transaction amount must be strictly positive');
    assert(familyId, 'family_id is mandatory for multi-tenant isolation');
    assert(expenseOptions.accountId, 'account_id is required for ledger balance deduction');

    return {
      family_id: familyId,
      amount: log.cost,
      type: 'expense',
      account_id: expenseOptions.accountId,
      category_id: expenseOptions.categoryId || null,
      member_id: log.performed_member_id || null,
      transaction_date: log.performed_date || todayStr,
      description: expenseOptions.description || `Servis: ${log.title}`,
      receipt_url: log.invoice_url || null,
    };
  }

  const logSample = {
    title: 'Ganti Oli Shell Helix',
    cost: 450000,
    performed_date: '2026-06-10',
    invoice_url: 'receipts/test-family/invoice.jpg',
    performed_member_id: 2,
  };

  const payload = buildExpensePayload('test-family-uuid', logSample, {
    createExpense: true,
    accountId: 5,
    categoryId: 12,
    description: 'Servis Mobil Avanza: Ganti Oli Shell Helix',
  });

  assert.strictEqual(payload.type, 'expense');
  assert.strictEqual(payload.amount, 450000);
  assert.strictEqual(payload.account_id, 5);
  assert.strictEqual(payload.receipt_url, 'receipts/test-family/invoice.jpg');
  assert.strictEqual(payload.family_id, 'test-family-uuid');

  // Should return null if cost is 0
  const freeService = buildExpensePayload('test-family-uuid', { ...logSample, cost: 0 }, { createExpense: true, accountId: 5 });
  assert.strictEqual(freeService, null, 'Free service should not create a 0-value transaction');

  console.log('  ✔ Financial ledger expense cross-posting constraints PASSED');
}

// ---------------------------------------------------------
// TEST 6: Family Scheduler Task Generation
// ---------------------------------------------------------
console.log('\nTEST 6: Scheduler Chore / Task Synergy Invariant');
{
  function buildSchedulerTaskPayload(familyId, schedule, targetDate) {
    const taskDate = targetDate || schedule.next_due_date || todayStr;
    const assetName = schedule.asset?.name || 'Aset';

    return {
      family_id: familyId,
      title: `Servis: ${schedule.title} (${assetName})`,
      description: `Perawatan terjadwal untuk ${assetName}. Estimasi biaya: Rp ${Number(schedule.estimated_cost || 0).toLocaleString('id-ID')}`,
      task_date: taskDate,
      is_all_day: true,
      priority: 'high',
      assigned_member_id: schedule.assigned_member_id || null,
    };
  }

  const scheduleMock = {
    title: 'Cuci AC Rutin',
    next_due_date: '2026-07-01',
    estimated_cost: 150000,
    assigned_member_id: 1,
    asset: { name: 'AC Kamar Anak' },
  };

  const choreTask = buildSchedulerTaskPayload('test-family-uuid', scheduleMock);
  assert.strictEqual(choreTask.title, 'Servis: Cuci AC Rutin (AC Kamar Anak)');
  assert.strictEqual(choreTask.task_date, '2026-07-01');
  assert.strictEqual(choreTask.assigned_member_id, 1);
  assert.strictEqual(choreTask.priority, 'high');

  console.log('  ✔ Family Scheduler chore synchronization generation PASSED');
}

console.log('\n====================================================');
console.log('✅ ALL 6 HOUSEHOLD ASSETS TESTS PASSED SUCCESSFULLY!');
console.log('====================================================');
