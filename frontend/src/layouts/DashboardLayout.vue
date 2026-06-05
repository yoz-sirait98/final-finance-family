<template>
  <div class="dashboard-wrapper">
    <!-- Sidebar Overlay (Mobile) -->
    <div
      class="sidebar-overlay"
      :class="{ active: mobileOpen }"
      @click="mobileOpen = false"
    ></div>

    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed, 'mobile-open': mobileOpen }">
      <div class="sidebar-brand">
        <i class="bi bi-wallet2 brand-icon"></i>
        <span class="brand-text">Family Finance</span>
      </div>

      <nav class="sidebar-nav">
        <span class="sidebar-section-title">Main</span>
        <div class="nav-item">
          <router-link to="/" class="nav-link" @click="closeMobile">
            <i class="bi bi-grid-1x2"></i>
            <span class="nav-text">Dashboard</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/transactions" class="nav-link" @click="closeMobile">
            <i class="bi bi-arrow-left-right"></i>
            <span class="nav-text">Transactions</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/accounts" class="nav-link" @click="closeMobile">
            <i class="bi bi-bank"></i>
            <span class="nav-text">Accounts</span>
          </router-link>
        </div>

        <span class="sidebar-section-title">Management</span>
        <div class="nav-item">
          <router-link to="/categories" class="nav-link" @click="closeMobile">
            <i class="bi bi-tags"></i>
            <span class="nav-text">Categories</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/budgets" class="nav-link" @click="closeMobile">
            <i class="bi bi-pie-chart"></i>
            <span class="nav-text">Budgets</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/goals" class="nav-link" @click="closeMobile">
            <i class="bi bi-trophy"></i>
            <span class="nav-text">Goals</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/recurring" class="nav-link" @click="closeMobile">
            <i class="bi bi-arrow-repeat"></i>
            <span class="nav-text">Recurring</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/members" class="nav-link" @click="closeMobile">
            <i class="bi bi-people"></i>
            <span class="nav-text">Members</span>
          </router-link>
        </div>

        <span class="sidebar-section-title">Analytics</span>
        <div class="nav-item">
          <router-link to="/reports" class="nav-link" @click="closeMobile">
            <i class="bi bi-bar-chart-line"></i>
            <span class="nav-text">Reports</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/settings" class="nav-link" @click="closeMobile">
            <i class="bi bi-gear"></i>
            <span class="nav-text">Settings</span>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- Top Navbar -->
    <header class="top-navbar" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <div class="d-flex align-items-center gap-3">
        <button class="toggle-btn" @click="toggleSidebar">
          <i class="bi bi-list"></i>
        </button>
        <h6 class="mb-0 d-none d-md-block text-muted">{{ currentPageTitle }}</h6>
      </div>

      <div class="d-flex align-items-center gap-3">

        <!-- Tour Help Button -->
        <button
          id="tour-help-btn"
          class="toggle-btn tour-help-btn"
          @click="triggerTour"
          title="Start guided tour"
          v-tooltip="'Replay tour'"
        >
          <i class="bi bi-compass"></i>
        </button>

        <!-- Budget Alerts Bell -->
        <div class="vue-dropdown" ref="bellDropdownRef">
          <button id="tour-bell-icon" class="toggle-btn position-relative" @click.stop="toggleBell">
            <i class="bi bi-bell"></i>
            <span
              v-if="budgetAlerts.length"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style="font-size:0.6rem"
            >{{ budgetAlerts.length }}</span>
          </button>
          <div v-show="bellOpen" class="vue-dropdown-menu" style="min-width:300px; right:0">
            <div class="vue-dropdown-header">
              <i class="bi bi-bell me-2"></i>Budget Alerts
            </div>
            <div v-if="!budgetAlerts.length" class="vue-dropdown-item text-muted small">
              No budget alerts
            </div>
            <a
              v-for="alert in budgetAlerts"
              :key="alert.id"
              class="vue-dropdown-item small text-danger"
            >
              <i class="bi bi-exclamation-triangle me-2"></i>
              {{ alert.category?.name }} — {{ alert.percentage?.toFixed(1) }}% used
            </a>
          </div>
        </div>

        <!-- User Dropdown -->
        <div class="vue-dropdown" ref="userDropdownRef">
          <button class="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" @click.stop="toggleUser">
            <i class="bi bi-person-circle"></i>
            <span class="d-none d-md-inline">{{ authStore.userName }}</span>
            <i class="bi bi-chevron-down small"></i>
          </button>
          <div v-show="userOpen" class="vue-dropdown-menu" style="right:0; min-width:180px">
            <div class="vue-dropdown-header small text-muted">
              {{ authStore.userName }}
            </div>
            <router-link to="/settings" class="vue-dropdown-item" @click="userOpen = false">
              <i class="bi bi-gear me-2"></i>Settings
            </router-link>
            <div class="vue-dropdown-divider"></div>
            <a class="vue-dropdown-item text-danger" href="#" @click.prevent="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i>Logout
            </a>
          </div>
        </div>

      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useBudgetStore } from '../stores/budgets';
import { useTourStore } from '../stores/tour';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const budgetStore = useBudgetStore();
const tourStore = useTourStore();

// Map route names to the eventBus key used by each page
const PAGE_TOUR_EVENTS = {
  Dashboard: 'start-dashboard-tour',
  Transactions: 'start-transactions-tour',
  Budgets: 'start-budgets-tour',
  Goals: 'start-goals-tour',
  Accounts: 'start-accounts-tour',
  Reports: 'start-reports-tour',
  Recurring: 'start-recurring-tour',
};

function triggerTour() {
  const eventName = PAGE_TOUR_EVENTS[route.name];
  if (eventName) {
    // Reset seen so the tour will re-run
    tourStore.resetPage(route.name?.toLowerCase());
    window.dispatchEvent(new CustomEvent(eventName));
  }
}

const POLL_INTERVAL_MS = 120000; // 2 minutes
const routeNamesToPollAlerts = ['Dashboard', 'Budgets', 'Transactions', 'Recurring'];

const sidebarCollapsed = ref(false);
const mobileOpen = ref(false);
const bellOpen = ref(false);
const userOpen = ref(false);
const bellDropdownRef = ref(null);
const userDropdownRef = ref(null);

let pollTimer = null;

const budgetAlerts = computed(() => budgetStore.alerts || []);
const currentPageTitle = computed(() => route.name || 'Dashboard');

async function refreshAlerts() {
  try {
    await budgetStore.fetchAlerts();
  } catch {}
}

function toggleBell() {
  bellOpen.value = !bellOpen.value;
  userOpen.value = false;
}

function toggleUser() {
  userOpen.value = !userOpen.value;
  bellOpen.value = false;
}

// Close dropdowns when clicking outside
function handleOutsideClick(e) {
  if (bellDropdownRef.value && !bellDropdownRef.value.contains(e.target)) {
    bellOpen.value = false;
  }
  if (userDropdownRef.value && !userDropdownRef.value.contains(e.target)) {
    userOpen.value = false;
  }
}

function toggleSidebar() {
  if (window.innerWidth < 992) {
    mobileOpen.value = !mobileOpen.value;
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  }
}

function closeMobile() {
  mobileOpen.value = false;
}

async function handleLogout() {
  userOpen.value = false;
  await authStore.logout();
  router.push('/login');
}

function startAlertsPolling() {
  clearInterval(pollTimer);

  if (routeNamesToPollAlerts.includes(route.name)) {
    pollTimer = setInterval(refreshAlerts, POLL_INTERVAL_MS);
  }
}

function stopAlertsPolling() {
  clearInterval(pollTimer);
  pollTimer = null;
}

watch(() => route.name, async (newRoute) => {
  if (routeNamesToPollAlerts.includes(newRoute)) {
    await refreshAlerts();
    startAlertsPolling();
  } else {
    stopAlertsPolling();
  }
});

onMounted(async () => {
  document.addEventListener('mousedown', handleOutsideClick);
  await refreshAlerts();
  startAlertsPolling();
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  stopAlertsPolling();
});
</script>
