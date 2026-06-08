<template>
  <div class="shopping-page fade-in">
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4>{{ $t('shopping.title') }}</h4>
        <p class="text-muted mb-0">{{ $t('shopping.subtitle') }}</p>
      </div>
      <button class="btn btn-primary-gradient" @click="openAdd">
        <i class="bi bi-cart-plus me-1"></i>{{ $t('shopping.addItem') }}
      </button>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-pills mb-4">
      <li class="nav-item">
        <a class="nav-link" :class="{active: activeTab === 'needed'}" href="#" @click.prevent="activeTab = 'needed'">
          <i class="bi bi-card-checklist me-1"></i>{{ $t('shopping.toBuy') }}
          <span v-if="neededItems.length" class="badge bg-danger ms-1">{{ neededItems.length }}</span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{active: activeTab === 'bought'}" href="#" @click.prevent="activeTab = 'bought'">
          <i class="bi bi-check2-circle me-1"></i>{{ $t('shopping.bought') }}
        </a>
      </li>
    </ul>

    <!-- Needed Items Tab -->
    <div v-if="activeTab === 'needed'">
      <div v-if="neededItems.length === 0" class="text-center text-muted py-5">
        <i class="bi bi-basket text-light" style="font-size: 3rem;"></i>
        <p class="mt-3">{{ $t('shopping.noItems') }}</p>
      </div>
      <div v-else>
        <div class="list-group mb-4 shadow-sm border-0">
          <label v-for="item in neededItems" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center border-light py-3">
            <div class="d-flex align-items-center gap-3">
              <input type="checkbox" class="form-check-input mt-0" style="width: 1.5em; height: 1.5em;" :value="item.id" v-model="selectedItems" />
              <div>
                <h6 class="mb-0 fw-bold">{{ item.name }}</h6>
                <small class="text-muted">
                  {{ $t('shopping.addedBy') }} {{ item.added_by_profile?.full_name || '?' }}
                </small>
              </div>
            </div>
            <div class="d-flex align-items-center gap-3">
              <!-- Inline Price Edit -->
              <div class="input-group input-group-sm" style="width: 130px;">
                <span class="input-group-text border-0 bg-light text-muted">Rp</span>
                <input type="number" class="form-control border-light" v-model="item.price" @change="updatePrice(item)" :placeholder="$t('shopping.pricePlaceholder')" />
              </div>
              <button class="btn btn-sm btn-outline-danger border-0" @click.stop="confirmDelete(item)"><i class="bi bi-trash"></i></button>
            </div>
          </label>
        </div>
        
        <!-- Checkout Actions -->
        <div class="card bg-white border-0 shadow-sm" v-if="selectedItems.length > 0">
          <div class="card-body d-flex justify-content-between align-items-center">
            <div>
              <span class="text-muted d-block" style="font-size: 0.85rem;">{{ selectedItems.length }} items selected</span>
              <h5 class="mb-0 fw-bold text-primary">Rp {{ selectedTotal.toLocaleString('id-ID') }}</h5>
            </div>
            <button class="btn btn-success px-4 rounded-pill shadow-sm" @click="openCheckoutModal">
              <i class="bi bi-cart-check me-2"></i>{{ $t('shopping.checkout') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Bought Items Tab -->
    <div v-if="activeTab === 'bought'">
      <div v-if="boughtItems.length === 0" class="text-center text-muted py-5">
        <i class="bi bi-receipt text-light" style="font-size: 3rem;"></i>
        <p class="mt-3">{{ $t('shopping.noItems') }}</p>
      </div>
      <div v-else class="list-group shadow-sm border-0">
        <div v-for="item in boughtItems" :key="item.id" class="list-group-item d-flex justify-content-between align-items-center bg-light border-white py-3">
          <div>
            <h6 class="mb-0 text-muted text-decoration-line-through">{{ item.name }}</h6>
            <small class="text-muted">
              Txn: {{ item.transaction?.description || 'Unknown' }}
            </small>
          </div>
          <div class="d-flex align-items-center gap-3">
            <div class="input-group input-group-sm" style="width: 130px;">
              <span class="input-group-text border-0 bg-white">Rp</span>
              <input type="number" class="form-control border-0 bg-white fw-bold" v-model="item.price" @change="updatePrice(item)" title="Updating this updates the transaction automatically" />
            </div>
            <button class="btn btn-sm btn-outline-danger border-0" @click.stop="confirmDelete(item)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Item Modal -->
    <div v-if="showAddModal" class="vue-modal-backdrop" @mousedown.self="showAddModal = false">
      <div class="vue-modal">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">{{ $t('shopping.addItem') }}</h5>
          <button type="button" class="btn-close" @click="showAddModal = false"></button>
        </div>
        <form @submit.prevent="saveItem">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">{{ $t('common.name') }}</label>
              <input v-model="itemForm.name" class="form-control" :placeholder="$t('shopping.itemPlaceholder')" required autofocus />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('shopping.price') }} (Opsional)</label>
              <div class="input-group">
                <span class="input-group-text">Rp</span>
                <input type="number" v-model="itemForm.price" class="form-control" />
              </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient">{{ $t('common.save') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Checkout Modal -->
    <div v-if="showCheckoutModal" class="vue-modal-backdrop" @mousedown.self="showCheckoutModal = false">
      <div class="vue-modal">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">{{ $t('shopping.checkoutConfirm') }}</h5>
          <button type="button" class="btn-close" @click="showCheckoutModal = false"></button>
        </div>
        <form @submit.prevent="processCheckout">
          <div class="modal-body">
            <div class="alert alert-success d-flex align-items-center py-2 mb-4 border-0">
              <i class="bi bi-info-circle-fill me-2 fs-5"></i>
              <div>
                Memproses <strong>{{ selectedItems.length }}</strong> barang dengan total <strong>Rp {{ selectedTotal.toLocaleString('id-ID') }}</strong>.
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">{{ $t('common.description') }}</label>
              <input v-model="checkoutForm.description" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.date') }}</label>
              <input type="date" v-model="checkoutForm.transaction_date" class="form-control" required />
            </div>
            <div class="row g-2 mb-3">
                <div class="col-6">
                  <label class="form-label">{{ $t('common.account') }}</label>
                  <select v-model="checkoutForm.account_id" class="form-select" required>
                    <option value="" disabled>- {{ $t('transactions.selectAccount') }} -</option>
                    <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }} (Rp {{ parseFloat(a.balance).toLocaleString('id-ID') }})</option>
                  </select>
                </div>
                <div class="col-6">
                  <label class="form-label">{{ $t('common.category') }}</label>
                  <select v-model="checkoutForm.category_id" class="form-select" required>
                    <option value="" disabled>- {{ $t('transactions.selectCategory') }} -</option>
                    <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                  </select>
                </div>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" @click="showCheckoutModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-success" :disabled="isCheckingOut">
              <span v-if="isCheckingOut" class="spinner-border spinner-border-sm me-2"></span>
              {{ $t('shopping.checkout') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { shoppingService } from '../services/shoppingService';
import { accountService } from '../services/accountService';
import { categoryService } from '../services/categoryService';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useLocaleStore } from '../stores/locale';
import { supabase } from '../lib/supabase';

const items = ref([]);
const accounts = ref([]);
const categories = ref([]);
const activeTab = ref('needed');
const selectedItems = ref([]);

const showAddModal = ref(false);
const itemForm = ref({ name: '', price: '' });

const showCheckoutModal = ref(false);
const checkoutForm = ref({ description: 'Groceries', transaction_date: new Date().toISOString().split('T')[0], account_id: '', category_id: '' });
const isCheckingOut = ref(false);

const authStore = useAuthStore();
const toast = useToastStore();
const localeStore = useLocaleStore();

const neededItems = computed(() => items.value.filter(i => i.status === 'needed'));
const boughtItems = computed(() => items.value.filter(i => i.status === 'bought'));

const selectedTotal = computed(() => {
  return items.value
    .filter(i => selectedItems.value.includes(i.id))
    .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
});

let subscription;

async function fetchData() {
  try {
    const { data } = await shoppingService.list();
    items.value = data.data;
  } catch (e) {
    toast.error('Failed to load shopping list');
  }
}

async function fetchDropdowns() {
  const [accRes, catRes] = await Promise.all([
    accountService.list({ is_active: true }),
    categoryService.list({ type: 'expense' })
  ]);
  accounts.value = accRes.data.data;
  categories.value = catRes.data.data;
}

function openAdd() {
  itemForm.value = { name: '', price: '' };
  showAddModal.value = true;
}

async function saveItem() {
  try {
    await shoppingService.create({
      name: itemForm.value.name,
      price: itemForm.value.price || 0,
      added_by: authStore.user.id
    });
    showAddModal.value = false;
    toast.success(localeStore.t('common.success'));
    fetchData(); 
  } catch (e) {
    toast.error(e.response?.data?.message || e.message);
  }
}

async function updatePrice(item) {
  try {
    await shoppingService.update(item.id, { price: item.price });
    toast.success('Harga diperbarui');
  } catch (e) {
    toast.error('Gagal memperbarui harga');
    fetchData(); // revert
  }
}

async function confirmDelete(item) {
  if (confirm(localeStore.t('common.confirmDelete'))) {
    try {
      await shoppingService.delete(item.id);
      selectedItems.value = selectedItems.value.filter(id => id !== item.id);
      fetchData();
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  }
}

function openCheckoutModal() {
  checkoutForm.value.description = `Belanja: ${items.value.filter(i => selectedItems.value.includes(i.id)).map(i => i.name).join(', ')}`;
  if (checkoutForm.value.description.length > 255) {
    checkoutForm.value.description = checkoutForm.value.description.substring(0, 252) + '...';
  }
  showCheckoutModal.value = true;
}

async function processCheckout() {
  isCheckingOut.value = true;
  try {
    const payload = {
      ...checkoutForm.value,
      amount: selectedTotal.value,
      member_id: null 
    };
    
    await shoppingService.checkout(selectedItems.value, payload);
    toast.success(localeStore.t('shopping.checkoutSuccess'));
    showCheckoutModal.value = false;
    selectedItems.value = [];
    activeTab.value = 'bought';
    fetchData();
  } catch (e) {
    toast.error('Checkout gagal');
  } finally {
    isCheckingOut.value = false;
  }
}

function setupRealtime() {
  subscription = supabase
    .channel('public:shopping_items')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_items', filter: `family_id=eq.${authStore.familyId}` }, () => {
      fetchData();
    })
    .subscribe();
}

onMounted(() => {
  fetchData();
  fetchDropdowns();
  setupRealtime();
});

onUnmounted(() => {
  if (subscription) {
    supabase.removeChannel(subscription);
  }
});
</script>

<style scoped>
.shopping-page .list-group-item {
    transition: all 0.2s;
}
.shopping-page .list-group-item:hover {
    background-color: #f8f9fa !important;
}
</style>
