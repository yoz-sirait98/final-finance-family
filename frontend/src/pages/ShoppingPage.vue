<template>
  <div class="shopping-page fade-in">
    <div class="page-header d-flex justify-content-between align-items-center mb-4">
      <div>
        <h4>{{ $t('shopping.title') }}</h4>
        <p class="text-muted mb-0">{{ $t('shopping.subtitle') }}</p>
      </div>
      <button class="btn btn-primary-gradient" @click="openAddPlan">
        <i class="bi bi-plus-lg"></i><span class="d-none d-sm-inline">{{ $t('shopping.createPlan') || 'Create Plan' }}</span>
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
            <span v-else class="text-muted small">
              <i class="bi bi-people me-1"></i> {{ plan.assigned_members?.length || 0 }} assigned
            </span>
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
const showDeleteModal = ref(false);
const deleting = ref(false);
const planToDelete = ref(null);
const familyGroupId = ref('');
const planForm = ref({ location: '', created_by: '', assigned_members: [], notificationTarget: 'members' });

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
  planForm.value = { location: '', created_by: '', assigned_members: [], notificationTarget: familyGroupId.value ? 'group' : 'members' };
  showAddModal.value = true;
}

function onCreatorChange() {
  // Automatically check the creator if they aren't already checked
  if (planForm.value.created_by && !planForm.value.assigned_members.includes(planForm.value.created_by)) {
    planForm.value.assigned_members.push(planForm.value.created_by);
  }
}

async function savePlan() {
  if ((!familyGroupId.value || planForm.value.notificationTarget === 'members') && planForm.value.assigned_members.length === 0) {
    toast.error('Please select at least one member to notify.');
    return;
  }
  
  if (familyGroupId.value && planForm.value.notificationTarget === 'group') {
    planForm.value.assigned_members = []; // Clear members to trigger exclusive group notification
  }
  
  saving.value = true;
  const payload = {
    location: planForm.value.location,
    created_by: planForm.value.created_by,
    assigned_members: planForm.value.assigned_members,
    status: 'progress'
  };
  
  console.log('[DEBUG] Sending Shopping Plan payload to Supabase:', payload);
  
  try {
    const response = await shoppingPlanService.create(payload);
    console.log('[DEBUG] Supabase Success Response:', response);
    
    showAddModal.value = false;
    toast.success(localeStore.t('common.success') + ' - Plan Saved!');
    fetchData(); 

    // Fire off the WhatsApp Notification directly from the frontend
    await sendWhatsAppNotification(payload);

  } catch (e) {
    console.error('[DEBUG] Supabase Error Trace:', e);
    console.error('[DEBUG] Error details:', e.response?.data || e.message);
    toast.error(e.response?.data?.message || e.message);
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

    const dateStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    let message = `*========================*\n🛒  *NEW SHOPPING LIST*  🛒\n*========================*\n\nHi! 👋 A new shopping list has been created in the *Family Finance App*.\n\n📍 *Location:*  ${planPayload.location}\n👤 *Created by:* ${creatorName}\n`;
    if (!isGroup && assignedNamesStr) {
      message += `🎯 *Assigned to:* ${assignedNamesStr}\n`;
    }
    message += `📅 *Date:*      ${dateStr}\n\n*------------------------*\nOpen the FamFin app to see and manage the items! 🛍️`;

    const apiPayload = { message: message };
    if (isGroup) apiPayload.groupId = targetGroupId;
    else apiPayload.numbers = targetPhoneNumbers;

    toast.info('Sending WhatsApp notification...');

    const response = await fetch('https://finance-family-3ac25ba9b522.herokuapp.com/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'D@rk4rdz03011998'
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
