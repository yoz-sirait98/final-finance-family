<template>
  <div class="goals-page fade-in">
    <div id="tour-goals-header" class="page-header d-flex justify-content-between align-items-center">
      <div><h4>Saving Goals</h4><p>Track your saving targets</p></div>
      <button id="tour-goals-add-btn" class="btn btn-primary-gradient" @click="openCreate"><i class="bi bi-plus-lg me-1"></i>Add Goal</button>
    </div>
    <div id="tour-goals-list" class="row g-3">
      <div v-for="g in goals" :key="g.id" class="col-md-6 col-lg-4">
        <div class="stat-card">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <div>
              <h6 class="fw-bold mb-0">
                {{ g.name }}
              </h6>
              <div v-if="g.account_id" class="badge bg-info mt-1 mb-1 me-1"><i class="bi bi-link-45deg"></i> {{ g.account_name }}</div>
              <small class="text-muted d-block">{{ g.deadline || 'No deadline' }}</small>
            </div>
            <span class="badge" :class="g.status === 'active' ? 'bg-primary' : g.status === 'completed' ? 'bg-success' : 'bg-secondary'">
              {{ g.status }}
            </span>
          </div>
          <div class="d-flex justify-content-between small text-muted mb-1">
            <span>{{ g.current_amount_formatted }}</span>
            <span>{{ g.target_amount_formatted }}</span>
          </div>
          <div class="progress mb-2" style="height:10px">
            <div class="progress-bar bg-primary" :style="{ width: g.progress_percentage + '%' }"></div>
          </div>
          <div class="small text-muted mb-3">{{ g.progress_percentage }}% complete</div>
          <div class="d-flex gap-1">
            <button v-if="g.status === 'active' && !g.account_id" class="btn btn-sm btn-primary-gradient" @click="openContribute(g)"><i class="bi bi-plus-circle me-1"></i>Contribute</button>
            <button class="btn btn-sm btn-outline-primary" @click="openEdit(g)"><i class="bi bi-pencil"></i></button>
            <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(g)"><i class="bi bi-trash"></i></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showModal" class="vue-modal-backdrop" @mousedown.self="showModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">{{ editingId ? 'Edit' : 'Add' }} Goal</h5>
          <button type="button" class="btn-close" @click="showModal = false"></button>
        </div>
        <form @submit.prevent="save">
          <div class="modal-body">
            <div v-if="formError" class="alert alert-danger small">{{ formError }}</div>
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input v-model="form.name" class="form-control" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Target Amount (Rp)</label>
              <input v-model.number="form.target_amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Link to Account (Optional)</label>
              <select v-model="form.account_id" class="form-select">
                <option value="">-- No Account Linked --</option>
                <option v-for="a in accounts" :key="a.id" :value="a.id">{{ a.name }}</option>
              </select>
              <div class="form-text small">If linked, goal progress automatically mirrors the account balance.</div>
            </div>
            <div class="mb-3">
              <label class="form-label">Deadline</label>
              <input v-model="form.deadline" type="date" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" :disabled="saving" @click="showModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Save
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Contribute Modal -->
    <div v-if="showContributeModal" class="vue-modal-backdrop" @mousedown.self="showContributeModal = false">
      <div class="vue-modal">
        <div class="modal-header">
          <h5 class="modal-title">Contribute to {{ contributingGoal?.name }}</h5>
          <button type="button" class="btn-close" @click="showContributeModal = false"></button>
        </div>
        <form @submit.prevent="doContribute">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Amount (Rp)</label>
              <input v-model.number="contributeForm.amount" type="number" class="form-control" min="1" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Note</label>
              <input v-model="contributeForm.note" class="form-control" />
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" :disabled="saving" @click="showContributeModal = false">Cancel</button>
            <button type="submit" class="btn btn-primary-gradient" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-1"></span>
              Contribute
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirm Modal -->
    <div v-if="showDeleteModal" class="vue-modal-backdrop" @mousedown.self="showDeleteModal = false">
      <div class="vue-modal" style="max-width:420px">
        <div class="modal-header border-0 pb-0">
          <h5 class="modal-title text-danger"><i class="bi bi-exclamation-triangle me-2"></i>Delete Goal</h5>
          <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">Are you sure you want to delete the goal <strong>{{ deletingItem?.name }}</strong>? This cannot be undone.</p>
        </div>
        <div class="modal-footer border-0 pt-0">
          <button class="btn btn-secondary" :disabled="deleting" @click="showDeleteModal = false">Cancel</button>
          <button class="btn btn-danger" :disabled="deleting" @click="doDelete">
            <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useTour } from '../composables/useTour';
import { goalsTourSteps } from '../tours/goalsTour';
import { goalService } from '../services/goalService';
import { accountService } from '../services/accountService';
import { useToastStore } from '../stores/toast';

const goals = ref([]);
const accounts = ref([]);
const editingId = ref(null);
const form = ref({ name: '', target_amount: 0, deadline: '' });
const formError = ref('');

const showModal = ref(false);
const showContributeModal = ref(false);
const showDeleteModal = ref(false);

const contributingGoal = ref(null);
const contributeForm = ref({ amount: 0, note: '' });
const deletingItem = ref(null);
const toast = useToastStore();

const saving = ref(false);
const deleting = ref(false);

async function fetchData() {
  const { data } = await goalService.list();
  goals.value = data.data;
}

function openCreate() {
  editingId.value = null;
  form.value = { name: '', target_amount: 0, deadline: '', account_id: '' };
  formError.value = '';
  showModal.value = true;
}

function openEdit(g) {
  editingId.value = g.id;
  form.value = { name: g.name, target_amount: g.target_amount, deadline: g.deadline_raw || '', account_id: g.account_id || '' };
  formError.value = '';
  showModal.value = true;
}

function openContribute(g) {
  contributingGoal.value = g;
  contributeForm.value = { amount: 0, note: '' };
  showContributeModal.value = true;
}

async function save() {
  formError.value = '';
  saving.value = true;
  try {
    const payload = {
      name: form.value.name,
      target_amount: form.value.target_amount,
      deadline: form.value.deadline || null,
      account_id: form.value.account_id || null,
    };
    if (editingId.value) {
      await goalService.update(editingId.value, payload);
      toast.success('Goal updated successfully');
    } else {
      await goalService.create(payload);
      toast.success('Goal created successfully');
    }
    showModal.value = false;
    fetchData();
  } catch(e) {
    formError.value = e.response?.data?.message || 'Error occurred';
    toast.error(formError.value);
  } finally {
    saving.value = false;
  }
}

async function doContribute() {
  saving.value = true;
  try {
    await goalService.contribute(contributingGoal.value.id, contributeForm.value);
    toast.success('Contribution added successfully');
    showContributeModal.value = false;
    fetchData();
  } catch(e) {
    toast.error(e.response?.data?.message || 'Error contributing');
  } finally {
    saving.value = false;
  }
}

function confirmDelete(g) {
  deletingItem.value = g;
  showDeleteModal.value = true;
}

async function doDelete() {
  if (!deletingItem.value) return;
  deleting.value = true;
  try {
    await goalService.delete(deletingItem.value.id);
    toast.success('Goal deleted successfully');
    showDeleteModal.value = false;
    deletingItem.value = null;
    fetchData();
  } catch(e) {
    toast.error(e.response?.data?.message || 'Failed to delete goal');
  } finally {
    deleting.value = false;
  }
}

const { startTour, startAutoTour } = useTour('goals');

onMounted(async () => {
  const [goalsRes, accRes] = await Promise.all([
    goalService.list().catch(() => ({ data: { data: [] } })),
    accountService.list().catch(() => ({ data: { data: [] } }))
  ]);
  goals.value = goalsRes.data.data;
  accounts.value = accRes.data.data;
  startAutoTour(goalsTourSteps);
  window.addEventListener('start-goals-tour', () => startTour(goalsTourSteps));
});

onUnmounted(() => {
  window.removeEventListener('start-goals-tour', () => startTour(goalsTourSteps));
});
</script>
