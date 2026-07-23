<template>
  <div class="shopping-detail-page fade-in">
    <!-- Header with Back Button -->
    <div id="tour-sd-header" class="page-header d-flex justify-content-between align-items-center mb-4">
      <div class="d-flex align-items-center gap-3">
        <button class="btn btn-outline-secondary btn-sm" @click="router.push('/shopping')">
          <i class="bi bi-arrow-left"></i>
        </button>
        <div>
          <h4 class="mb-0">{{ plan?.location || 'Loading...' }}</h4>
          <p class="text-muted small mb-0" v-if="plan">
            Created by {{ plan.created_by_member?.name }} on {{ new Date(plan.created_at).toLocaleDateString() }}
          </p>
        </div>
      </div>
      <span v-if="plan" class="badge" :class="plan.status === 'locked' ? 'bg-secondary' : plan.status === 'done' ? 'bg-success' : 'bg-warning text-dark'">
        <i v-if="plan.status === 'locked'" class="bi bi-lock-fill me-1"></i>
        {{ plan.status === 'locked' ? (localeStore.currentLocale === 'id' ? 'Terkunci' : 'Locked') : plan.status === 'done' ? ($t('shopping.done') || 'Done') : ($t('shopping.onProgress') || 'On Progress') }}
      </span>
    </div>

    <!-- Items Section -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white border-light d-flex justify-content-between align-items-center py-3">
        <h6 class="mb-0 fw-bold">Shopping Items</h6>
        <button v-if="plan?.status !== 'locked' && plan?.status !== 'done'" class="btn btn-sm btn-primary-gradient" @click="openAddItem">
          <i class="bi bi-plus-lg"></i><span class="d-none d-sm-inline">Add Item</span>
        </button>
      </div>
      <div class="card-body p-0">
        <div v-if="items.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-basket text-light" style="font-size: 3rem;"></i>
          <p class="mt-3">No items added to this plan yet.</p>
        </div>
        <div v-else class="list-group list-group-flush">
          <div v-for="item in items" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center py-3" :class="{'bg-light': item.is_checked}">
            <div class="d-flex align-items-center gap-3">
              <input type="checkbox" class="form-check-input mt-0 cursor-pointer" style="width: 1.5em; height: 1.5em;" v-model="item.is_checked" @change="toggleCheck(item)" :disabled="plan?.status === 'locked'">
              <div>
                <h6 class="mb-0 fw-bold" :class="{'text-decoration-line-through text-muted': plan?.status === 'locked' || item.is_checked}">{{ item.name }}</h6>
                <small class="text-muted">Added by {{ item.added_by_member?.name || 'Unknown' }}</small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <!-- Price: editable when in progress or done (read-only only when locked) -->
              <template v-if="plan?.status !== 'locked'">
                <div class="input-group input-group-sm" style="width: 140px;">
                  <span class="input-group-text border-light bg-light text-muted">Rp</span>
                  <input type="number" class="form-control border-light" v-model="item.price" @change="updateItemPrice(item)" placeholder="Est. Price" />
                </div>
                <button class="btn btn-sm btn-outline-danger border-0" @click="confirmDeleteItem(item)">
                  <i class="bi bi-trash"></i>
                </button>
              </template>
              <!-- Read-only price when locked -->
              <template v-else>
                <span class="fw-semibold text-muted">Rp {{ Number(item.price || 0).toLocaleString('id-ID') }}</span>
              </template>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer bg-light border-light d-flex justify-content-between align-items-center py-3" v-if="items.length > 0">
        <span class="text-muted">Total ({{ items.length }} items)</span>
        <h5 class="mb-0 fw-bold text-primary">Rp {{ totalAmount.toLocaleString('id-ID') }}</h5>
      </div>
    </div>

    <!-- Actions -->
    <div v-if="plan?.status === 'progress' && items.length > 0" class="d-flex justify-content-end">
      <button class="btn btn-success px-5 rounded-pill shadow-sm" @click="openChoiceModal">
        <i class="bi bi-cart-check me-2"></i>{{ localeStore.currentLocale === 'id' ? 'Selesaikan' : 'Complete Plan' }}
      </button>
    </div>
    <div v-else-if="plan?.status === 'done'" class="d-flex justify-content-end gap-2">
      <button class="btn btn-dark px-4 rounded-pill shadow-sm" :disabled="isLocking" @click="lockPlan">
        <span v-if="isLocking" class="spinner-border spinner-border-sm me-2"></span>
        <i v-else class="bi bi-lock me-2"></i>{{ localeStore.currentLocale === 'id' ? 'Kunci Rencana' : 'Lock Plan' }}
      </button>
    </div>

    <!-- ===== Choice Modal (Mark as Done vs. Checkout) ===== -->
    <div v-if="showChoiceModal" class="vue-modal-backdrop" @mousedown.self="showChoiceModal = false">
      <div class="vue-modal" style="max-width: 480px;">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold"><i class="bi bi-check2-square me-2 text-success"></i>{{ localeStore.currentLocale === 'id' ? 'Selesaikan Belanja' : 'Complete Shopping Plan' }}</h5>
          <button type="button" class="btn-close" @click="showChoiceModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="text-muted mb-4">{{ localeStore.currentLocale === 'id' ? 'Bagaimana Anda ingin menyelesaikan rencana belanja ini?' : 'How would you like to finalize this plan?' }}</p>

          <!-- Option A: Mark as Done only -->
          <div class="choice-card p-3 mb-3 rounded-3 border" :class="{ 'border-primary bg-primary bg-opacity-10': selectedChoice === 'done' }" role="button" @click="selectedChoice = 'done'">
            <div class="d-flex align-items-start gap-3">
              <div class="choice-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 44px; height: 44px; background: linear-gradient(135deg, #10b981, #059669);">
                <i class="bi bi-check-lg text-white fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-1">{{ localeStore.currentLocale === 'id' ? 'Tandai Selesai Saja' : 'Mark as Done' }}</h6>
                <small class="text-muted">{{ localeStore.currentLocale === 'id' ? 'Selesaikan rencana tanpa mencatat ke transaksi. Daftar belanja disimpan sebagai referensi.' : 'Complete the plan without recording a transaction. Items are kept as reference.' }}</small>
              </div>
            </div>
          </div>

          <!-- Option B: Checkout & Record Transaction -->
          <div class="choice-card p-3 mb-1 rounded-3 border" :class="{ 'border-primary bg-primary bg-opacity-10': selectedChoice === 'checkout' }" role="button" @click="selectedChoice = 'checkout'">
            <div class="d-flex align-items-start gap-3">
              <div class="choice-icon rounded-circle d-flex align-items-center justify-content-center flex-shrink-0" style="width: 44px; height: 44px; background: linear-gradient(135deg, #667eea, #764ba2);">
                <i class="bi bi-credit-card text-white fs-5"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-1">{{ localeStore.currentLocale === 'id' ? 'Checkout & Catat Transaksi' : 'Checkout & Record Transaction' }}</h6>
                <small class="text-muted">{{ localeStore.currentLocale === 'id' ? 'Selesaikan dan otomatis buat transaksi pengeluaran sebesar total belanja.' : 'Complete the plan AND create an expense transaction for the total amount.' }}</small>
              </div>
            </div>
          </div>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showChoiceModal = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-primary-gradient" :disabled="!selectedChoice || isMarkingDone" @click="proceedWithChoice">
            <span v-if="isMarkingDone" class="spinner-border spinner-border-sm me-2"></span>
            {{ localeStore.currentLocale === 'id' ? 'Lanjutkan' : 'Continue' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddModal" class="vue-modal-backdrop" @mousedown.self="showAddModal = false">
      <div class="vue-modal">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">Add Item</h5>
          <button type="button" class="btn-close" @click="showAddModal = false"></button>
        </div>
        <form @submit.prevent="saveItem">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Member Requesting</label>
              <select v-model="itemForm.added_by" class="form-select" required>
                <option value="" disabled>- Select Member -</option>
                <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Item Name</label>
              <input v-model="itemForm.name" class="form-control" placeholder="e.g. Milk, Eggs..." required />
            </div>
            <div class="mb-3">
              <label class="form-label">Estimated Price (Optional)</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input type="number" v-model="itemForm.price" class="form-control" />
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">{{ $t('common.done') || 'Done' }}</button>
            <button type="submit" id="tour-shoppingDetail-add-btn" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ $t('common.add') || 'Add Item' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Checkout Modal -->
    <div v-if="showCheckoutModal" class="vue-modal-backdrop" @mousedown.self="showCheckoutModal = false">
      <div class="vue-modal">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">Checkout Shopping Plan</h5>
          <button type="button" class="btn-close" @click="showCheckoutModal = false"></button>
        </div>
        <form @submit.prevent="processCheckout">
          <div class="modal-body">
            <div class="alert alert-info py-2 mb-4 border-0">
              <i class="bi bi-info-circle me-2"></i>Please verify all actual prices are entered correctly. Total: <strong>Rp {{ totalAmount.toLocaleString('id-ID') }}</strong>.
            </div>
            
            <div class="mb-3">
              <label class="form-label">Who paid? (Member)</label>
              <select v-model="checkoutForm.member_id" class="form-select" required>
                <option value="" disabled>- Select Member -</option>
                <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Transaction Date</label>
              <input type="date" v-model="checkoutForm.transaction_date" class="form-control" required />
            </div>
            <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">Payment Account</label>
                  <select v-model="checkoutForm.account_id" class="form-select" required>
                    <option value="" disabled>- Select Account -</option>
                    <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label">Category</label>
                  <select v-model="checkoutForm.category_id" class="form-select" required>
                    <option value="" disabled>- Select Category -</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" @click="showCheckoutModal = false">Cancel</button>
            <button type="submit" class="btn btn-success" :disabled="isCheckingOut">
              <span v-if="isCheckingOut" class="spinner-border spinner-border-sm me-2"></span>
              Confirm Checkout
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ===== Delete Confirm Modal ===== -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>{{ $t('common.delete') }}</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ $t('common.confirmDelete') }}</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" @click="showDeleteModal = false">{{ $t('common.cancel') }}</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDeleteItem">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTour } from '../composables/useTour';
import { shoppingDetailTourSteps } from '../tours/shoppingDetailTour';

const { startAutoTour, startTour } = useTour('shoppingDetail');
const handleTour = () => startTour(shoppingDetailTourSteps);

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { shoppingPlanService } from '../services/shoppingPlanService';
import { memberService } from '../services/memberService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { shoppingService } from '../services/shoppingService';
import { useLocaleStore } from '../stores/locale';
import { useToastStore } from '../stores/toast';
import { useAuthStore } from '../stores/auth';
import { pushDispatcherService } from '../services/pushDispatcherService';
import { supabase } from '../lib/supabase';
import { formatCurrency } from '../utils/format';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();
const localeStore = useLocaleStore();

const planId = route.params.id;
const plan = ref(null);
const items = ref([]);
const members = ref([]);
const accounts = ref([]);
const categories = ref([]);

const showAddModal = ref(false);
const showDeleteModal = ref(false);
const itemToDelete = ref(null);
const deleting = ref(false);
const itemForm = ref({ name: '', price: '', added_by: '' });
const saving = ref(false);

const showCheckoutModal = ref(false);
const checkoutForm = ref({ transaction_date: new Date().toISOString().split('T')[0], account_id: '', category_id: '', member_id: '' });
const isCheckingOut = ref(false);

// Choice modal & lock state
const showChoiceModal = ref(false);
const selectedChoice = ref('');
const isMarkingDone = ref(false);
const isLocking = ref(false);

const totalAmount = computed(() => {
  return items.value.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
});

let subscriptionPlans;
let subscriptionItems;

async function fetchPlan() {
  try {
    const { data } = await shoppingPlanService.list();
    plan.value = data.data.find(p => p.id === planId);
  } catch (e) {}
}

async function fetchItems() {
  try {
    const { data } = await shoppingService.list({ shopping_plan_id: planId });
    items.value = data.data;
  } catch (e) {}
}

async function fetchDropdowns() {
  try {
    const [memRes, accRes, catRes] = await Promise.all([
      memberService.list(),
      accountService.list({ is_active: true }),
      categoryService.list({ type: 'expense' })
    ]);
    members.value = memRes.data.data;
    accounts.value = accRes.data.data;
    categories.value = catRes.data.data;
  } catch (e) {}
}

function openAddItem() {
  itemForm.value = { name: '', price: '', added_by: authStore.user?.id || '' };
  showAddModal.value = true;
}

async function saveItem() {
  saving.value = true;
  try {
    await shoppingService.create({
      shopping_plan_id: planId,
      name: itemForm.value.name,
      price: itemForm.value.price || 0,
      added_by: itemForm.value.added_by
    });
    // showAddModal.value = false;
    itemForm.value.name = '';
    itemForm.value.price = '';
    toast.success('Item added');
    fetchItems();
  } catch (e) {
    toast.error('Failed to add item');
  } finally {
    saving.value = false;
  }
}

async function updateItemPrice(item) {
  try {
    await shoppingService.update(item.id, { price: item.price || 0 });
    // toast.success('Price updated');
    // The trigger will automatically update the transaction if status is done!
  } catch (e) {
    toast.error('Failed to update price');
    fetchItems();
  }
}

async function toggleCheck(item) {
  try {
    await shoppingService.update(item.id, { is_checked: item.is_checked });
  } catch (e) {
    toast.error('Failed to update status');
  }
}

function confirmDeleteItem(item) {
  itemToDelete.value = item;
  showDeleteModal.value = true;
}

async function doDeleteItem() {
  if (!itemToDelete.value) return;
  deleting.value = true;
  try {
    await shoppingService.delete(itemToDelete.value.id);
    fetchItems();
    showDeleteModal.value = false;
  } catch (e) {
    toast.error('Failed to delete item');
  } finally {
    deleting.value = false;
  }
}

// ===== Choice Modal Logic =====

function openChoiceModal() {
  // Validate prices
  const missingPrices = items.value.some(i => !i.price || parseFloat(i.price) <= 0);
  if (missingPrices) {
    toast.warning(localeStore.t('shopping.zeroPriceWarning') || 'All items must have a price. Please fill the price or delete the item.');
    return;
  }
  selectedChoice.value = '';
  showChoiceModal.value = true;
}

async function proceedWithChoice() {
  if (selectedChoice.value === 'done') {
    await markAsDoneOnly();
  } else if (selectedChoice.value === 'checkout') {
    showChoiceModal.value = false;
    openCheckoutModal();
  }
}

async function markAsDoneOnly() {
  isMarkingDone.value = true;
  try {
    await shoppingPlanService.markAsDone(planId);
    await sendCheckoutNotification();
    pushDispatcherService.dispatchPushNotification({
      templateKey: 'SHOPPING_PLAN_DONE',
      params: { location: plan.value?.location || 'Store' },
      url: `/shopping/${planId}`
    }).catch(() => {});
    toast.success(localeStore.currentLocale === 'id' ? 'Rencana belanja ditandai selesai!' : 'Shopping plan marked as done!');
    showChoiceModal.value = false;
    fetchPlan();
  } catch (e) {
    toast.error(localeStore.currentLocale === 'id' ? 'Gagal menandai selesai' : 'Failed to mark as done');
  } finally {
    isMarkingDone.value = false;
  }
}

async function lockPlan() {
  isLocking.value = true;
  try {
    await shoppingPlanService.lock(planId);
    pushDispatcherService.dispatchPushNotification({
      templateKey: 'SHOPPING_PLAN_LOCKED',
      params: { location: plan.value?.location || 'Store', amount: totalAmount.value.toLocaleString('id-ID') },
      url: `/shopping/${planId}`
    }).catch(() => {});
    toast.success(localeStore.currentLocale === 'id' ? 'Rencana belanja dikunci!' : 'Shopping plan locked!');
    fetchPlan();
  } catch (e) {
    console.error('Lock error:', e);
    toast.error(localeStore.currentLocale === 'id' ? 'Gagal mengunci rencana: ' + (e.message || '') : 'Failed to lock plan: ' + (e.message || ''));
  } finally {
    isLocking.value = false;
  }
}

function openCheckoutModal() {
  if (plan.value?.created_by) {
    checkoutForm.value.member_id = plan.value.created_by;
  }
  showCheckoutModal.value = true;
}

async function processCheckout() {
  isCheckingOut.value = true;
  try {
    await shoppingPlanService.checkout(planId, {
      member_id: checkoutForm.value.member_id,
      account_id: checkoutForm.value.account_id,
      category_id: checkoutForm.value.category_id,
      transaction_date: checkoutForm.value.transaction_date
    });
    
    await sendCheckoutNotification();

    toast.success('Checkout successful!');
    showCheckoutModal.value = false;
    fetchPlan();
  } catch (e) {
    console.error('Checkout error:', e);
    toast.error('Checkout failed: ' + (e.message || 'Unknown error'));
  } finally {
    isCheckingOut.value = false;
  }
}

async function sendCheckoutNotification() {
  try {
    const { data: family } = await supabase.from('families').select('whatsapp_group_id').eq('id', authStore.familyId).single();
    if (!family || !family.whatsapp_group_id) return;
    
    const buyer = members.value.find(m => m.id === checkoutForm.value.member_id) || members.value.find(m => m.id === plan.value?.created_by);
    const buyerName = buyer ? buyer.name : 'Unknown';
    const loc = plan.value?.location || 'Unknown';
    const isId = localeStore.currentLocale === 'id';
    const dateStr = new Date().toLocaleDateString(isId ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    let message = '';
    if (isId) {
      message = "*========================*\n🛍️  *BELANJA SELESAI*  🛍️\n*========================*\n\nHore! 👋 Daftar belanja telah selesai dan dicatat.\n\n📍 *Lokasi:* " + loc + "\n👤 *Dibeli oleh:* " + buyerName + "\n\n*Daftar Belanjaan:*\n";
    } else {
      message = "*========================*\n🛍️  *SHOPPING COMPLETED*  🛍️\n*========================*\n\nGreat news! A shopping trip has just been completed and logged.\n\n📍 *Location:* " + loc + "\n👤 *Bought by:* " + buyerName + "\n\n*Items Purchased:*\n";
    }

    items.value.forEach(item => {
      const priceStr = formatCurrency(parseFloat(item.price) || 0);
      message += "✅ " + item.name + " - " + priceStr + "\n";
    });

    const totalStr = formatCurrency(totalAmount.value);
    
    if (isId) {
      message += "\n*------------------------*\n💵 *Total Keseluruhan:* " + totalStr + "\n*------------------------*";
    } else {
      message += "\n*------------------------*\n💵 *Grand Total:* " + totalStr + "\n*------------------------*";
    }

    await fetch('https://finance-family-3ac25ba9b522.herokuapp.com/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': import.meta.env.VITE_WA_API_KEY },
      body: JSON.stringify({ message: message, groupId: family.whatsapp_group_id })
    });
  } catch (err) {
    console.error('Failed to send WA checkout notif', err);
  }
}


function setupRealtime() {
  subscriptionPlans = supabase
    .channel('public:shopping_plans_detail')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_plans', filter: `id=eq.${planId}` }, () => {
      fetchPlan();
    }).subscribe();
    
  subscriptionItems = supabase
    .channel('public:shopping_items_detail')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items', filter: `shopping_plan_id=eq.${planId}` }, () => {
      fetchItems();
    }).subscribe();
}

onMounted(() => {
  startAutoTour(shoppingDetailTourSteps);
  window.addEventListener('start-shoppingDetail-tour', handleTour);

  fetchPlan();
  fetchItems();
  fetchDropdowns();
  setupRealtime();
});

onUnmounted(() => {
  window.removeEventListener('start-shoppingDetail-tour', handleTour);

  if (subscriptionPlans) supabase.removeChannel(subscriptionPlans);
  if (subscriptionItems) supabase.removeChannel(subscriptionItems);
});
</script>

<style scoped>
.choice-card {
  cursor: pointer;
  transition: all 0.2s ease;
}
.choice-card:hover {
  border-color: var(--primary-color) !important;
  background-color: rgba(102, 126, 234, 0.05);
}
</style>
