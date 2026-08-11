<template>
  <div class="shopping-page fade-in">
    <!-- ===== Desktop View ===== -->
    <div class="d-none d-md-block">
      <div id="tour-shopping-header" class="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4>{{ $t('shopping.title') }}</h4>
          <p class="text-muted mb-0">{{ $t('shopping.subtitle') }}</p>
        </div>
        <div class="d-flex gap-2">
          <button id="tour-shopping-add-btn" class="btn btn-primary-gradient" @click="openAddPlan">
            <i class="bi bi-plus-lg"></i><span class="d-none d-sm-inline">{{ $t('shopping.createPlan') || 'Create Plan' }}</span>
          </button>
        </div>
      </div>

      <!-- Tabs for Plans -->
      <ul class="nav nav-pills mb-4">
        <li class="nav-item">
          <a class="nav-link" :class="{active: activeTab === 'progress'}" href="#" @click.prevent="activeTab = 'progress'">
            <i class="bi bi-list-task me-1"></i>{{ $t('shopping.onProgress') || 'On Progress' }}
            <span v-if="progressPlans.length" class="badge bg-danger ms-1">{{ progressPlans.length }}</span>
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" :class="{active: activeTab === 'done'}" href="#" @click.prevent="activeTab = 'done'">
            <i class="bi bi-check2-circle me-1"></i>{{ $t('shopping.done') || 'Done' }}
          </a>
        </li>
      </ul>

      <!-- Plans List -->
      <div class="row g-3">
        <div v-if="filteredPlans.length === 0" class="col-12 text-center text-muted py-5">
          <i class="bi bi-card-checklist text-light" style="font-size: 3rem;"></i>
          <p class="mt-3">{{ $t('shopping.noPlans') || 'No shopping plans found.' }}</p>
        </div>
        <div v-for="plan in filteredPlans" :key="plan.id" class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-0 plan-card" @click="goToDetail(plan.id)">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <h5 class="card-title fw-bold mb-0 text-primary">{{ plan.location }}</h5>
                <span class="badge" :class="plan.status === 'locked' ? 'bg-secondary' : plan.status === 'done' ? 'bg-success' : 'bg-warning text-dark'">
                  <i v-if="plan.status === 'locked'" class="bi bi-lock-fill me-1"></i>
                  {{ plan.status === 'locked' ? (localeStore.currentLocale === 'id' ? 'Terkunci' : 'Locked') : plan.status === 'done' ? ($t('shopping.done') || 'Done') : ($t('shopping.onProgress') || 'On Progress') }}
                </span>
              </div>
              <p class="text-muted small mb-2">
                <i class="bi bi-calendar3 me-1"></i> {{ new Date(plan.created_at).toLocaleDateString() }}
              </p>
              <p class="text-muted small mb-0">
                <i class="bi bi-person me-1"></i> {{ plan.created_by_member?.name || 'Unknown' }}
              </p>
            </div>
            <div class="card-footer bg-white border-light d-flex justify-content-between align-items-center">
              <div class="d-flex align-items-center gap-2">
                <span v-if="plan.status === 'done' || plan.status === 'locked'" class="fw-bold text-danger">
                  Rp {{ (plan.transaction ? parseFloat(plan.transaction.amount || 0) : (plan.shopping_items?.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0) || 0)).toLocaleString('id-ID') }}
                </span>
                <span v-else class="text-muted small">
                  <i class="bi bi-people me-1"></i> {{ plan.assigned_members?.length || 0 }} assigned
                </span>
                <button v-if="plan.receipt_url" class="btn btn-sm btn-outline-info border-0 p-0 px-1" @click.stop="openReceiptModal(plan)" title="View Receipt Photo">
                  <i class="bi bi-receipt me-1"></i><span class="small">Struk</span>
                </button>
              </div>
              <button class="btn btn-sm btn-outline-danger border-0" @click.stop="confirmDeletePlan(plan)" title="Delete Plan">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== Mobile View ===== -->
    <div class="mobile-shopping-container d-md-none">
      <!-- Mobile Header -->
      <div class="page-header d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 class="mb-0 fw-bold">{{ $t('shopping.title') }}</h4>
          <p class="text-muted small mb-0">{{ $t('shopping.subtitle') }}</p>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary tour-help-btn rounded-circle p-2" @click="handleTour" title="Start Tour">
            <i class="bi bi-question-circle"></i>
          </button>
          <button class="btn btn-primary-gradient btn-sm rounded-pill px-3" @click="openAddPlan">
            <i class="bi bi-plus-lg me-1"></i>{{ $t('common.add') || 'Buat' }}
          </button>
        </div>
      </div>

      <!-- Mobile KPI Banner -->
      <div class="mobile-shopping-kpi mb-3">
        <div class="row g-2 text-center">
          <div class="col-6">
            <div class="mobile-kpi-item p-2">
              <span class="kpi-label d-block text-muted mb-1">{{ localeStore.currentLocale === 'id' ? 'Aktif' : 'Active Plans' }}</span>
              <span class="kpi-val text-warning fs-6 d-block">{{ activePlansCount }} <small class="fw-normal text-muted fs-7">({{ localeStore.currentLocale === 'id' ? 'Rencana' : 'plans' }})</small></span>
              <small class="text-muted d-block" style="font-size: 0.7rem;">Est: Rp {{ activePlansEstTotal.toLocaleString('id-ID') }}</small>
            </div>
          </div>
          <div class="col-6 border-start border-secondary border-opacity-25">
            <div class="mobile-kpi-item p-2">
              <span class="kpi-label d-block text-muted mb-1">{{ localeStore.currentLocale === 'id' ? 'Selesai / Kunci' : 'Done / Locked' }}</span>
              <span class="kpi-val text-success fs-6 d-block">{{ donePlansCount }} <small class="fw-normal text-muted fs-7">({{ localeStore.currentLocale === 'id' ? 'Selesai' : 'done' }})</small></span>
              <small class="text-muted d-block" style="font-size: 0.7rem;">Spent: Rp {{ donePlansSpentTotal.toLocaleString('id-ID') }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Bar & Tab Pills -->
      <div class="mb-3">
        <div class="input-group input-group-sm mb-2 shadow-sm">
          <span class="input-group-text bg-transparent border-end-0"><i class="bi bi-search text-muted"></i></span>
          <input type="text" class="form-control border-start-0 ps-0" :placeholder="localeStore.currentLocale === 'id' ? 'Cari toko atau pembuat...' : 'Search store or creator...'" v-model="mobileSearchQuery" />
          <button v-if="mobileSearchQuery" class="btn btn-outline-secondary border-start-0" @click="mobileSearchQuery = ''"><i class="bi bi-x"></i></button>
        </div>

        <div class="d-flex gap-2">
          <button class="btn filter-chip-btn flex-fill" :class="activeTab === 'progress' ? 'btn-primary' : 'btn-outline-secondary'" @click="activeTab = 'progress'">
            <i class="bi bi-list-task me-1"></i>{{ $t('shopping.onProgress') || 'On Progress' }}
            <span v-if="progressPlans.length" class="badge bg-danger ms-1">{{ progressPlans.length }}</span>
          </button>
          <button class="btn filter-chip-btn flex-fill" :class="activeTab === 'done' ? 'btn-primary' : 'btn-outline-secondary'" @click="activeTab = 'done'">
            <i class="bi bi-check2-circle me-1"></i>{{ $t('shopping.done') || 'Done' }}
          </button>
        </div>
      </div>

      <!-- Mobile Plan Cards Feed -->
      <div v-if="filteredMobilePlans.length === 0" class="text-center text-muted py-5">
        <i class="bi bi-basket text-light" style="font-size: 3rem;"></i>
        <p class="mt-2 mb-0">{{ $t('shopping.noPlans') || 'No shopping plans found.' }}</p>
      </div>

      <div v-else>
        <div v-for="plan in filteredMobilePlans" :key="'mob-'+plan.id" class="mobile-plan-card" @click="goToDetail(plan.id)">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <div class="plan-icon-avatar" :class="{'status-done': plan.status === 'done', 'status-locked': plan.status === 'locked'}">
                <i :class="'bi ' + getStoreIcon(plan.location)"></i>
              </div>
              <div>
                <h6 class="fw-bold mb-0 text-capitalize">{{ plan.location }}</h6>
                <small class="text-muted" style="font-size: 0.75rem;">
                  <i class="bi bi-person me-1"></i>{{ plan.created_by_member?.name || 'Unknown' }} • {{ new Date(plan.created_at).toLocaleDateString() }}
                </small>
              </div>
            </div>
            <span class="badge" :class="plan.status === 'locked' ? 'bg-secondary' : plan.status === 'done' ? 'bg-success' : 'bg-warning text-dark'">
              <i v-if="plan.status === 'locked'" class="bi bi-lock-fill me-1"></i>
              {{ plan.status === 'locked' ? (localeStore.currentLocale === 'id' ? 'Terkunci' : 'Locked') : plan.status === 'done' ? ($t('shopping.done') || 'Done') : ($t('shopping.onProgress') || 'On Progress') }}
            </span>
          </div>

          <!-- Items Progress Info -->
          <div class="mt-2 pt-2 border-top border-secondary border-opacity-10">
            <div class="d-flex justify-content-between align-items-center mb-1">
              <small class="text-muted" style="font-size: 0.75rem;">
                <i class="bi bi-check2-square me-1 text-primary"></i>
                <template v-if="plan.shopping_items && plan.shopping_items.length">
                  {{ getPlanProgressInfo(plan).checked }} / {{ getPlanProgressInfo(plan).total }} {{ localeStore.currentLocale === 'id' ? 'barang selesai' : 'items checked' }}
                </template>
                <template v-else>
                  0 {{ localeStore.currentLocale === 'id' ? 'barang' : 'items' }}
                </template>
              </small>
              
              <!-- Total Amount Tag -->
              <span class="fw-bold" :class="plan.status === 'done' || plan.status === 'locked' ? 'text-success' : 'text-primary'" style="font-size: 0.85rem;">
                Rp {{ (plan.transaction ? parseFloat(plan.transaction.amount || 0) : (plan.shopping_items?.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0) || 0)).toLocaleString('id-ID') }}
              </span>
            </div>

            <div v-if="plan.shopping_items && plan.shopping_items.length" class="progress mb-2" style="height: 4px;">
              <div class="progress-bar bg-success" :style="{ width: getPlanProgressInfo(plan).percent + '%' }"></div>
            </div>

            <!-- Card Bottom Quick Actions -->
            <div class="d-flex justify-content-between align-items-center mt-2">
              <div class="d-flex align-items-center gap-2">
                <button v-if="plan.receipt_url" class="btn btn-xs btn-outline-info" @click.stop="openReceiptModal(plan)">
                  <i class="bi bi-receipt me-1"></i>Struk
                </button>
                <span v-if="plan.assigned_members?.length" class="badge bg-secondary bg-opacity-25 text-body px-2" style="font-size: 0.68rem;">
                  <i class="bi bi-people me-1"></i>{{ plan.assigned_members.length }}
                </span>
              </div>
              <div class="d-flex align-items-center gap-1">
                <button class="btn btn-xs btn-outline-danger border-0" @click.stop="confirmDeletePlan(plan)" title="Delete Plan">
                  <i class="bi bi-trash"></i>
                </button>
                <span class="text-muted ms-1"><i class="bi bi-chevron-right fs-6"></i></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Action Button (FAB) -->
      <button class="mobile-fab-btn" @click="openAddPlan" title="Create Plan">
        <i class="bi bi-plus-lg"></i>
      </button>
    </div>


    <!-- Create Plan Modal -->
    <div v-if="showAddModal" class="vue-modal-backdrop" @mousedown.self="showAddModal = false">
      <div class="vue-modal">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold">{{ $t('shopping.createPlan') || 'Create Shopping Plan' }}</h5>
          <button type="button" class="btn-close" @click="showAddModal = false"></button>
        </div>
        <form @submit.prevent="savePlan">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">{{ $t('shopping.location') || 'Shopping Location' }}</label>
              <input v-model="planForm.location" class="form-control" placeholder="e.g. Supermarket, Mall..." required autofocus />
            </div>
            <div class="mb-3">
              <label class="form-label">{{ $t('common.member') }} (Created By)</label>
              <select v-model="planForm.created_by" class="form-select" @change="onCreatorChange" required>
                <option value="" disabled>- {{ $t('transactions.selectMember') }} -</option>
                <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label fw-bold"><i class="bi bi-whatsapp text-success me-1"></i> Notification Target</label>
              
              <div v-if="familyGroupId" class="mb-3 d-flex gap-3">
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="targetGroup" value="group" v-model="planForm.notificationTarget">
                  <label class="form-check-label" for="targetGroup">Family Group</label>
                </div>
                <div class="form-check">
                  <input class="form-check-input" type="radio" id="targetMembers" value="members" v-model="planForm.notificationTarget">
                  <label class="form-check-label" for="targetMembers">Specific Members</label>
                </div>
              </div>
              <div v-else class="alert alert-secondary small py-2 mb-3">
                <i class="bi bi-info-circle me-1"></i>Group notifications are disabled. Add a Group ID in Settings.
              </div>

              <!-- Only show checkboxes if target is 'members' or group is disabled -->
              <div v-if="!familyGroupId || planForm.notificationTarget === 'members'" class="border rounded p-2 bg-light" style="max-height: 150px; overflow-y: auto;">
                <div v-for="m in members" :key="'assign-'+m.id" class="form-check mb-1">
                  <input class="form-check-input" type="checkbox" :value="m.id" :id="'assign-'+m.id" v-model="planForm.assigned_members">
                  <label class="form-check-label d-flex align-items-center" :for="'assign-'+m.id">
                    {{ m.name }}
                    <span v-if="m.whatsapp_number && m.notifications_enabled" class="badge bg-success ms-2" style="font-size:0.65rem">Ready</span>
                    <span v-else class="badge bg-secondary ms-2" style="font-size:0.65rem">No WA</span>
                  </label>
                </div>
              </div>
              
              <small v-if="!familyGroupId || planForm.notificationTarget === 'members'" class="text-muted mt-1 d-block"><i class="bi bi-info-circle me-1"></i>Select at least one member. Only those with "Ready" status will receive a WhatsApp message.</small>
              <small v-else class="text-muted mt-1 d-block"><i class="bi bi-info-circle me-1"></i>Message will be sent exclusively to the Family Group. This Shopping Plan will show 0 assigned members.</small>
            </div>
          </div>
          <div class="modal-footer border-0 pt-0">
            <button type="button" class="btn btn-secondary" @click="showAddModal = false">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ $t('common.save') }}
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
          <button class="btn btn-danger" :disabled="deleting" @click="doDeletePlan">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            {{ $t('common.delete') }}
          </button>
        </div>
      </div>
    </div>


    <!-- ===== Receipt Image Lightbox Modal ===== -->
    <div v-if="showReceiptLightbox" class="vue-modal-backdrop" @mousedown.self="showReceiptLightbox = false">
      <div class="vue-modal text-center" style="max-width: 500px;">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title fw-bold"><i class="bi bi-file-image me-2 text-info"></i>{{ localeStore.currentLocale === 'id' ? 'Foto Struk' : 'Receipt Photo' }}</h5>
          <button type="button" class="btn-close" @click="showReceiptLightbox = false"></button>
        </div>
        <div class="modal-body p-3">
          <img :src="receiptLightboxUrl" class="img-fluid rounded border shadow-sm" style="max-height: 70vh; object-fit: contain;" />
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary btn-sm" @click="showReceiptLightbox = false">{{ $t('common.cancel') || 'Close' }}</button>
        </div>
      </div>
    </div>
    
  </div>
</template>

<script setup>
import { useTour } from '../composables/useTour';
import { shoppingTourSteps } from '../tours/shoppingTour';

const { startAutoTour, startTour } = useTour('shopping');
const handleTour = () => startTour(shoppingTourSteps);

import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { shoppingPlanService } from '../services/shoppingPlanService';
import { memberService } from '../services/memberService';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useLocaleStore } from '../stores/locale';
import { supabase } from '../lib/supabase';
import { pushDispatcherService } from '../services/pushDispatcherService';
import { getReceiptSignedUrl } from '../services/storageService';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToastStore();
const localeStore = useLocaleStore();

const plans = ref([]);
const members = ref([]);
const activeTab = ref('progress');
const saving = ref(false);
const showAddModal = ref(false);
const planForm = ref({ location: '', created_by: '', assigned_members: [], notificationTarget: 'group' });
const familyGroupId = ref(null);
const showDeleteModal = ref(false);
const planToDelete = ref(null);
const deleting = ref(false);

// Receipt Lightbox state
const showReceiptLightbox = ref(false);
const receiptLightboxUrl = ref('');
const loadingReceiptUrl = ref(false);

async function openReceiptModal(plan) {
  if (!plan?.receipt_url) return;
  loadingReceiptUrl.value = true;
  try {
    const url = await getReceiptSignedUrl(plan.receipt_url);
    if (url) {
      receiptLightboxUrl.value = url;
      showReceiptLightbox.value = true;
    } else {
      toast.error('Receipt image not found');
    }
  } catch (err) {
    toast.error('Failed to load receipt image');
  } finally {
    loadingReceiptUrl.value = false;
  }
}

const progressPlans = computed(() => plans.value.filter(p => p.status === 'progress'));
const donePlans = computed(() => plans.value.filter(p => p.status === 'done' || p.status === 'locked'));
const filteredPlans = computed(() => activeTab.value === 'progress' ? progressPlans.value : donePlans.value);

// Mobile View State & Computed Helpers
const mobileSearchQuery = ref('');

function getStoreIcon(location) {
  if (!location) return 'bi-cart-fill';
  const loc = location.toLowerCase();
  if (loc.includes('supermarket') || loc.includes('pasar') || loc.includes('grocer') || loc.includes('market')) return 'bi-cart-fill';
  if (loc.includes('mall') || loc.includes('plaza') || loc.includes('outlet')) return 'bi-bag-fill';
  if (loc.includes('apotek') || loc.includes('pharmacy') || loc.includes('kimia') || loc.includes('k-24')) return 'bi-capsule';
  if (loc.includes('minimarket') || loc.includes('indo') || loc.includes('alfa')) return 'bi-shop';
  if (loc.includes('elektronik') || loc.includes('hardware') || loc.includes('ace')) return 'bi-cpu';
  return 'bi-basket-fill';
}

const activePlansCount = computed(() => progressPlans.value.length);
const donePlansCount = computed(() => donePlans.value.length);

const activePlansEstTotal = computed(() => {
  return progressPlans.value.reduce((sum, p) => {
    const itemsSum = p.shopping_items?.reduce((s, i) => s + (parseFloat(i.price) || 0), 0) || 0;
    return sum + itemsSum;
  }, 0);
});

const donePlansSpentTotal = computed(() => {
  return donePlans.value.reduce((sum, p) => {
    if (p.transaction) return sum + parseFloat(p.transaction.amount || 0);
    const itemsSum = p.shopping_items?.reduce((s, i) => s + (parseFloat(i.price) || 0), 0) || 0;
    return sum + itemsSum;
  }, 0);
});

function getPlanProgressInfo(plan) {
  const items = plan.shopping_items || [];
  const total = items.length;
  if (total === 0) return { checked: 0, total: 0, percent: 0 };
  const checked = items.filter(i => i.is_checked).length;
  const percent = Math.round((checked / total) * 100);
  return { checked, total, percent };
}

const filteredMobilePlans = computed(() => {
  let base = filteredPlans.value;
  if (!mobileSearchQuery.value.trim()) return base;
  const q = mobileSearchQuery.value.toLowerCase().trim();
  return base.filter(p => {
    const locMatch = p.location?.toLowerCase().includes(q);
    const creatorMatch = p.created_by_member?.name?.toLowerCase().includes(q);
    return locMatch || creatorMatch;
  });
});


let subscription;

async function fetchData() {
  try {
    const { data } = await shoppingPlanService.list();
    plans.value = data.data;
  } catch (e) {
    toast.error('Failed to load shopping plans');
  }
}

async function fetchMembers() {
  try {
    const { data } = await memberService.list();
    members.value = data.data;
  } catch(e) {}
}

async function openAddPlan() {
  if (!members.value.length) {
    await fetchMembers();
  }
  const defaultMember = members.value[0]?.id ? Number(members.value[0].id) : null;
  planForm.value = {
    location: '',
    created_by: defaultMember,
    assigned_members: defaultMember ? [defaultMember] : [],
    notificationTarget: familyGroupId.value ? 'group' : 'members'
  };
  showAddModal.value = true;
}

function onCreatorChange() {
  // Automatically check the creator if they aren't already checked
  const creatorId = Number(planForm.value.created_by);
  if (creatorId && !planForm.value.assigned_members.includes(creatorId)) {
    planForm.value.assigned_members.push(creatorId);
  }
}

async function savePlan() {
  if (!planForm.value.location || !planForm.value.location.trim()) {
    toast.error(localeStore.currentLocale === 'id' ? 'Lokasi belanja harus diisi.' : 'Shopping location is required.');
    return;
  }

  const memberId = Number(planForm.value.created_by) || Number(members.value[0]?.id);
  if (!memberId) {
    toast.error(localeStore.currentLocale === 'id' ? 'Pilih anggota pembuat yang valid.' : 'Please select a valid member (Created By).');
    return;
  }

  let assignedIds = [];
  if (!familyGroupId.value || planForm.value.notificationTarget === 'members') {
    assignedIds = (planForm.value.assigned_members || [])
      .map(id => Number(id))
      .filter(id => !isNaN(id) && id > 0);
    if (assignedIds.length === 0) {
      assignedIds = [memberId];
    }
  }

  saving.value = true;
  const payload = {
    location: planForm.value.location.trim(),
    created_by: memberId,
    assigned_members: assignedIds,
    status: 'progress'
  };
  
  console.log('[DEBUG] Sending Shopping Plan payload to Supabase:', payload);
  
  try {
    const response = await shoppingPlanService.create(payload);
    console.log('[DEBUG] Supabase Success Response:', response);
    
    showAddModal.value = false;
    toast.success(localeStore.t('common.success') + ' - Plan Saved!');
    fetchData(); 

    // Dispatch PWA Web Push Notification (fire-and-forget)
    const creatorName = members.value.find(m => Number(m.id) === memberId)?.name || 'Someone';
    pushDispatcherService.dispatchPushNotification({
      templateKey: 'SHOPPING_PLAN_CREATED',
      params: { creator: creatorName, location: payload.location },
      url: '/shopping'
    }).catch(() => {});

    // Fire off the WhatsApp Notification asynchronously (never blocks plan saving)
    sendWhatsAppNotification(payload).catch(err => console.warn('WA plan notice failed:', err));

  } catch (e) {
    console.error('[DEBUG] Supabase Error Trace:', e);
    console.error('[DEBUG] Error details:', e.response?.data || e.message);
    toast.error(e.response?.data?.message || e.message || 'Failed to save shopping plan');
  } finally {
    saving.value = false;
  }
}

function confirmDeletePlan(plan) {
  planToDelete.value = plan;
  showDeleteModal.value = true;
}

async function doDeletePlan() {
  if (!planToDelete.value) return;
  deleting.value = true;
  try {
    await shoppingPlanService.delete(planToDelete.value.id);
    toast.success(localeStore.t('common.success'));
    fetchData();
    window.dispatchEvent(new CustomEvent('shopping-plans-updated'));
    showDeleteModal.value = false;
  } catch (e) {
    toast.error(localeStore.t('common.error'));
  } finally {
    deleting.value = false;
  }
}

function goToDetail(planId) {
  router.push(`/shopping/${planId}`);
}

async function sendWhatsAppNotification(planPayload) {
  try {
    const isGroup = planForm.value.notificationTarget === 'group';
    let targetGroupId = null;
    let targetPhoneNumbers = null;
    let assignedNamesStr = '';

    const creator = members.value.find(m => m.id === planPayload.created_by);
    const creatorName = creator ? creator.name : 'Unknown';

    if (isGroup) {
      if (!familyGroupId.value) return; 
      targetGroupId = familyGroupId.value;
    } else {
      if (!planPayload.assigned_members || planPayload.assigned_members.length === 0) return;
      const assignedMembers = members.value.filter(m => planPayload.assigned_members.includes(m.id) && m.whatsapp_number && m.notifications_enabled);
      if (assignedMembers.length === 0) {
         toast.warning('No assigned members have a valid WhatsApp number and notifications enabled. Notification skipped.');
         return;
      }
      targetPhoneNumbers = assignedMembers.map(m => m.whatsapp_number);
      assignedNamesStr = assignedMembers.map(m => m.name).join(', ');
    }

    const isId = localeStore.currentLocale === 'id';
    const dateStr = new Date().toLocaleDateString(isId ? 'id-ID' : 'en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
    let message = '';
    if (isId) {
      message = `*========================*\n🛒  *DAFTAR BELANJA BARU*  🛒\n*========================*\n\nHalo! 👋 Daftar belanja baru telah dibuat.\n\n📍 *Lokasi:*  ${planPayload.location}\n👤 *Dibuat oleh:* ${creatorName}\n`;
      if (!isGroup && assignedNamesStr) {
        message += `🎯 *Ditugaskan ke:* ${assignedNamesStr}\n`;
      }
      message += `📅 *Tanggal:*   ${dateStr}\n\n*------------------------*\nBuka aplikasi FamFin untuk melihat dan mengelola barang belanjaan! 🛍️`;
    } else {
      message = `*========================*\n🛒  *NEW SHOPPING LIST*  🛒\n*========================*\n\nHi! 👋 A new shopping list has been created in the *Family Finance App*.\n\n📍 *Location:*  ${planPayload.location}\n👤 *Created by:* ${creatorName}\n`;
      if (!isGroup && assignedNamesStr) {
        message += `🎯 *Assigned to:* ${assignedNamesStr}\n`;
      }
      message += `📅 *Date:*      ${dateStr}\n\n*------------------------*\nOpen the FamFin app to see and manage the items! 🛍️`;
    }

    const apiPayload = { message: message };
    if (isGroup) apiPayload.groupId = targetGroupId;
    else apiPayload.numbers = targetPhoneNumbers;

    toast.info('Sending WhatsApp notification...');

    const response = await fetch('https://finance-family-3ac25ba9b522.herokuapp.com/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_WA_API_KEY
      },
      body: JSON.stringify(apiPayload)
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Failed to send message');

    toast.success('WhatsApp Message Sent Successfully! 🚀');
  } catch (err) {
    console.error('WhatsApp Notification Error:', err);
    toast.error(`WhatsApp Error: ${err.message}`);
  }
}

function setupRealtime() {
  subscription = supabase
    .channel('public:shopping_plans')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_plans', filter: `family_id=eq.${authStore.familyId}` }, () => {
      fetchData();
    })
    .subscribe();
}

onMounted(async () => {
  startAutoTour(shoppingTourSteps);
  window.addEventListener('start-shopping-tour', handleTour);

  fetchData();
  fetchMembers();
  setupRealtime();
  if (authStore.familyId) {
    const { data } = await supabase.from('families').select('whatsapp_group_id').eq('id', authStore.familyId).single();
    if (data?.whatsapp_group_id) {
      familyGroupId.value = data.whatsapp_group_id;
    }
  }
});

onUnmounted(() => {
  window.removeEventListener('start-shopping-tour', handleTour);

  if (subscription) {
    supabase.removeChannel(subscription);
  }
});


</script>

<style scoped>
.plan-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.plan-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
}
</style>
