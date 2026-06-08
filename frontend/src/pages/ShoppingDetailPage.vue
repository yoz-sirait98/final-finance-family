<template>
  <div class="shopping-detail-page fade-in">
    <!-- Header with Back Button -->
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
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
      <span v-if="plan" class="badge" :class="plan.status === 'done' ? 'bg-success' : 'bg-warning text-dark'">
        {{ plan.status === 'done' ? ($t('shopping.done') || 'Done') : ($t('shopping.onProgress') || 'On Progress') }}
      </span>
    </div>

    <!-- Items Section -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-header bg-white border-light d-flex justify-content-between align-items-center py-3">
        <h6 class="mb-0 fw-bold">Shopping Items</h6>
        <button v-if="plan?.status === 'progress'" class="btn btn-sm btn-primary-gradient" @click="openAddItem">
          <i class="bi bi-plus-lg me-1"></i>Add Item
        </button>
      </div>
      <div class="card-body p-0">
        <div v-if="items.length === 0" class="text-center text-muted py-5">
          <i class="bi bi-basket text-light" style="font-size: 3rem;"></i>
          <p class="mt-3">No items added to this plan yet.</p>
        </div>
        <div v-else class="list-group list-group-flush">
          <div v-for="item in items" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center py-3">
            <div>
              <h6 class="mb-0 fw-bold" :class="{'text-decoration-line-through': plan?.status === 'done'}">{{ item.name }}</h6>
              <small class="text-muted">Added by {{ item.added_by_member?.name || 'Unknown' }}</small>
            </div>
            <div class="d-flex align-items-center gap-3">
              <div class="input-group input-group-sm" style="width: 140px;">
                <span class="input-group-text border-light bg-light text-muted">Rp</span>
                <input type="number" class="form-control border-light" v-model="item.price" @change="updateItemPrice(item)" placeholder="Est. Price" />
              </div>
              <button class="btn btn-sm btn-outline-danger border-0" @click="confirmDeleteItem(item)">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="card-footer bg-light border-light d-flex justify-content-between align-items-center py-3" v-if="items.length > 0">
        <span class="text-muted">Total ({{ items.length }} items)</span>
        <h5 class="mb-0 fw-bold text-primary">Rp {{ totalAmount.toLocaleString('id-ID') }}</h5>
      </div>
    </div>

    <!-- Checkout Action -->
    <div v-if="plan?.status === 'progress' && items.length > 0" class="d-flex justify-content-end">
      <button class="btn btn-success px-5 rounded-pill shadow-sm" @click="openCheckoutModal">
        <i class="bi bi-cart-check me-2"></i>Checkout Plan
      </button>
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
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { shoppingPlanService } from '../services/shoppingPlanService';
import { shoppingService } from '../services/shoppingService';
import { memberService } from '../services/memberService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useLocaleStore } from '../stores/locale';
import { supabase } from '../lib/supabase';

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
const itemForm = ref({ name: '', price: '', added_by: '' });
const saving = ref(false);

const showCheckoutModal = ref(false);
const checkoutForm = ref({ transaction_date: new Date().toISOString().split('T')[0], account_id: '', category_id: '', member_id: '' });
const isCheckingOut = ref(false);

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

async function confirmDeleteItem(item) {
  if (confirm('Delete this item?')) {
    try {
      await shoppingService.delete(item.id);
      fetchItems();
    } catch (e) {
      toast.error('Failed to delete item');
    }
  }
}

function openCheckoutModal() {
  // Validate prices
  const missingPrices = items.value.some(i => !i.price || parseFloat(i.price) <= 0);
  if (missingPrices) {
    toast.warning(localeStore.t('shopping.zeroPriceWarning') || 'All items must have a price. Please fill the price or delete the item.');
    return;
  }
  
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
    toast.success('Checkout successful!');
    showCheckoutModal.value = false;
    fetchPlan();
  } catch (e) {
    toast.error('Checkout failed');
  } finally {
    isCheckingOut.value = false;
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
  fetchPlan();
  fetchItems();
  fetchDropdowns();
  setupRealtime();
});

onUnmounted(() => {
  if (subscriptionPlans) supabase.removeChannel(subscriptionPlans);
  if (subscriptionItems) supabase.removeChannel(subscriptionItems);
});
</script>
