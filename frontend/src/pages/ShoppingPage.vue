<template>
  <div class="shopping-page fade-in">
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4>{{ $t('shopping.title') }}</h4>
        <p class="text-muted mb-0">{{ $t('shopping.subtitle') }}</p>
      </div>
      <button class="btn btn-primary-gradient" @click="openAddPlan">
        <i class="bi bi-plus-lg me-1"></i>{{ $t('shopping.createPlan') || 'Create Plan' }}
      </button>
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
              <span class="badge" :class="plan.status === 'done' ? 'bg-success' : 'bg-warning text-dark'">
                {{ plan.status === 'done' ? ($t('shopping.done') || 'Done') : ($t('shopping.onProgress') || 'On Progress') }}
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
            <span v-if="plan.status === 'done' && plan.transaction" class="fw-bold text-danger">
              Rp {{ parseFloat(plan.transaction.amount || 0).toLocaleString('id-ID') }}
            </span>
            <span v-else class="text-muted small">Tap to view items</span>
            <button class="btn btn-sm btn-outline-danger border-0" @click.stop="confirmDeletePlan(plan)">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
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
              <select v-model="planForm.created_by" class="form-select" required>
                <option value="" disabled>- {{ $t('transactions.selectMember') }} -</option>
                <option v-for="m in members" :key="m.id" :value="m.id">{{ m.name }}</option>
              </select>
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
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { shoppingPlanService } from '../services/shoppingPlanService';
import { memberService } from '../services/memberService';
import { useAuthStore } from '../stores/auth';
import { useToastStore } from '../stores/toast';
import { useLocaleStore } from '../stores/locale';
import { supabase } from '../lib/supabase';

const plans = ref([]);
const members = ref([]);
const activeTab = ref('progress');
const saving = ref(false);

const showAddModal = ref(false);
const planForm = ref({ location: '', created_by: '' });

const authStore = useAuthStore();
const toast = useToastStore();
const localeStore = useLocaleStore();
const router = useRouter();

const progressPlans = computed(() => plans.value.filter(p => p.status === 'progress'));
const donePlans = computed(() => plans.value.filter(p => p.status === 'done'));
const filteredPlans = computed(() => activeTab.value === 'progress' ? progressPlans.value : donePlans.value);

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

function openAddPlan() {
  planForm.value = { location: '', created_by: '' };
  showAddModal.value = true;
}

async function savePlan() {
  saving.value = true;
  try {
    await shoppingPlanService.create({
      location: planForm.value.location,
      created_by: planForm.value.created_by,
      status: 'progress'
    });
    showAddModal.value = false;
    toast.success(localeStore.t('common.success'));
    fetchData(); 
  } catch (e) {
    toast.error(e.response?.data?.message || e.message);
  } finally {
    saving.value = false;
  }
}

async function confirmDeletePlan(plan) {
  if (confirm(localeStore.t('common.confirmDelete'))) {
    try {
      await shoppingPlanService.delete(plan.id);
      toast.success(localeStore.t('common.success'));
      fetchData();
    } catch (e) {
      toast.error('Gagal menghapus');
    }
  }
}

function goToDetail(planId) {
  router.push(`/shopping/${planId}`);
}

function setupRealtime() {
  subscription = supabase
    .channel('public:shopping_plans')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_plans', filter: `family_id=eq.${authStore.familyId}` }, () => {
      fetchData();
    })
    .subscribe();
}

onMounted(() => {
  fetchData();
  fetchMembers();
  setupRealtime();
});

onUnmounted(() => {
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
