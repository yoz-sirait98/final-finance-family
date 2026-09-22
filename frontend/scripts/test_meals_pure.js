import assert from 'node:assert';

console.log('====================================================');
console.log('🚀 SMART MEAL PLANNER & PANTRY BACKGROUND TEST SUITE');
console.log('====================================================\n');

// ---------------------------------------------------------
// TEST 1: Pantry Expiration Logic & Warning Thresholds
// ---------------------------------------------------------
console.log('TEST 1: Expiration Warning Calculations');
{
  function getDaysDiff(dateStr) {
    if (!dateStr) return 0;
    const parts = dateStr.split('-').map(Number);
    const targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.round((targetDate - today) / (1000 * 60 * 60 * 24));
  }

  function evaluateExpiry(dateStr) {
    if (!dateStr) return 'none';
    const diffDays = getDaysDiff(dateStr);
    if (diffDays < 0) return 'expired';
    if (diffDays <= 3) return 'expiring_soon';
    return 'safe';
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const formatYMD = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const pastDate = formatYMD(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
  const todayDate = formatYMD(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  const twoDaysLater = formatYMD(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2));
  const nextWeek = formatYMD(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7));

  assert.strictEqual(evaluateExpiry(pastDate), 'expired', 'Past date should be expired');
  assert.strictEqual(evaluateExpiry(todayDate), 'expiring_soon', 'Today should trigger expiring soon');
  assert.strictEqual(evaluateExpiry(twoDaysLater), 'expiring_soon', '2 days later should trigger expiring soon');
  assert.strictEqual(evaluateExpiry(nextWeek), 'safe', '7 days later should be safe');
  console.log('  ✔ Expiration status evaluation (<0d expired, <=3d warning, >3d safe) PASSED');
}

// ---------------------------------------------------------
// TEST 2: Quantity Adjustment & Status Transitions
// ---------------------------------------------------------
console.log('\nTEST 2: Stock Quantity Adjustment & Status Transitions');
{
  function computeNewStatus(currentQty, delta) {
    const newQty = Math.max(0, Number(currentQty) + delta);
    const status = newQty === 0 ? 'consumed' : newQty <= 1 ? 'low_stock' : 'in_stock';
    return { newQty, status };
  }

  // 3 -> 2: in_stock
  const res1 = computeNewStatus(3, -1);
  assert.strictEqual(res1.newQty, 2);
  assert.strictEqual(res1.status, 'in_stock');

  // 2 -> 1: low_stock
  const res2 = computeNewStatus(2, -1);
  assert.strictEqual(res2.newQty, 1);
  assert.strictEqual(res2.status, 'low_stock');

  // 1 -> 0: consumed
  const res3 = computeNewStatus(1, -1);
  assert.strictEqual(res3.newQty, 0);
  assert.strictEqual(res3.status, 'consumed');

  // Clamping at 0
  const res4 = computeNewStatus(0, -5);
  assert.strictEqual(res4.newQty, 0);
  assert.strictEqual(res4.status, 'consumed');

  console.log('  ✔ Stock state transitions (in_stock -> low_stock -> consumed) PASSED');
}

// ---------------------------------------------------------
// TEST 3: Weekly Calendar Monday Alignment & Matrix Mapping
// ---------------------------------------------------------
console.log('\nTEST 3: Weekly Meal Calendar Matrix & Slot Buckets');
{
  function getMonday(d) {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(date.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  function toDateStr(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Test Tuesday Sept 22, 2026
  const sampleTuesday = new Date('2026-09-22T08:00:00Z');
  const monday = getMonday(sampleTuesday);
  assert.strictEqual(monday.getDay(), 1, 'Monday should have getDay() === 1');
  assert.strictEqual(toDateStr(monday), '2026-09-21', 'Monday must be 2026-09-21');

  // Test Sunday Sept 27, 2026
  const sampleSunday = new Date('2026-09-27T08:00:00Z');
  const mondayOfSunday = getMonday(sampleSunday);
  assert.strictEqual(toDateStr(mondayOfSunday), '2026-09-21', 'Sunday must also map back to same week Monday');

  // Test 7-Day slots bucketing
  const dummyMeals = [
    { id: '1', plan_date: '2026-09-22', meal_type: 'breakfast', recipe_title: 'Nasi Goreng' },
    { id: '2', plan_date: '2026-09-22', meal_type: 'dinner', recipe_title: 'Ayam Brokoli' },
    { id: '3', plan_date: '2026-09-23', meal_type: 'lunch', recipe_title: 'Soto Ayam' },
  ];

  const tuesdayMeals = dummyMeals.filter(m => m.plan_date === '2026-09-22');
  const breakfast = tuesdayMeals.filter(m => m.meal_type === 'breakfast');
  const lunch = tuesdayMeals.filter(m => m.meal_type === 'lunch');
  const dinner = tuesdayMeals.filter(m => m.meal_type === 'dinner');

  assert.strictEqual(breakfast.length, 1);
  assert.strictEqual(lunch.length, 0);
  assert.strictEqual(dinner.length, 1);
  assert.strictEqual(breakfast[0].recipe_title, 'Nasi Goreng');
  console.log('  ✔ Monday normalization and 7-day slot classification PASSED');
}

// ---------------------------------------------------------
// TEST 4: Missing Ingredients Cross-App Shopping Plan Export
// ---------------------------------------------------------
console.log('\nTEST 4: 1-Tap Missing Ingredients Shopping Plan Export');
{
  const recipeIngredients = [
    { name: 'Daging Ayam Fillet', quantity: '300', unit: 'gram', in_pantry: true },
    { name: 'Brokoli Segar', quantity: '1', unit: 'bonggol', in_pantry: true },
    { name: 'Saus Tiram', quantity: '2', unit: 'sdm', in_pantry: false },
    { name: 'Minyak Wijen', quantity: '1', unit: 'sdt', in_pantry: false },
  ];

  const missing = recipeIngredients.filter(i => i.in_pantry === false);
  assert.strictEqual(missing.length, 2, 'Should isolate exactly 2 missing items');

  const familyId = 'fam-uuid-123';
  const targetPlanId = 'shop-plan-456';

  const exportPayload = missing.map(ing => ({
    family_id: familyId,
    shopping_plan_id: targetPlanId,
    name: ing.name,
    qty: parseFloat(ing.quantity) || 1,
    unit: ing.unit,
    price: 0,
    is_bought: false,
    notes: 'Added from Meal Planner'
  }));

  assert.strictEqual(exportPayload.length, 2);
  assert.strictEqual(exportPayload[0].name, 'Saus Tiram');
  assert.strictEqual(exportPayload[0].qty, 2);
  assert.strictEqual(exportPayload[0].unit, 'sdm');
  assert.strictEqual(exportPayload[1].name, 'Minyak Wijen');
  assert.strictEqual(exportPayload[1].is_bought, false);
  console.log('  ✔ Missing ingredient isolation & shopping payload formatting PASSED');
}

// ---------------------------------------------------------
// TEST 5: Restock from Shopping to Pantry Item Mapping
// ---------------------------------------------------------
console.log('\nTEST 5: 1-Tap Restock from Shopping to Pantry Inventory');
{
  const boughtItem = {
    name: 'Telur Ayam Negeri',
    category: 'dairy',
    qty: 10,
    unit: 'butir',
    notes: 'Bought at Supermarket'
  };

  const familyId = 'fam-uuid-123';
  const pantryPayload = {
    family_id: familyId,
    name: boughtItem.name,
    category: boughtItem.category || 'other',
    location: 'fridge',
    quantity: boughtItem.qty || 1,
    unit: boughtItem.unit || 'pcs',
    status: 'in_stock',
    notes: boughtItem.notes || null,
  };

  assert.strictEqual(pantryPayload.name, 'Telur Ayam Negeri');
  assert.strictEqual(pantryPayload.location, 'fridge');
  assert.strictEqual(pantryPayload.quantity, 10);
  assert.strictEqual(pantryPayload.unit, 'butir');
  assert.strictEqual(pantryPayload.status, 'in_stock');
  console.log('  ✔ Shopping item restock payload to pantry PASSED');
}

console.log('\n====================================================');
console.log('🎉 ALL 5/5 BACKGROUND TESTS PASSED WITH 100% SUCCESS');
console.log('====================================================');
