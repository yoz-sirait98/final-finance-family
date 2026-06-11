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
      <div class="sidebar-brand" @dblclick="router.push('/gem')" style="cursor: pointer;" title="Double click for a surprise!">
        <i class="bi bi-wallet2 brand-icon"></i>
        <span class="brand-text">{{ $t('nav.brand') }}</span>
      </div>

      <nav class="sidebar-nav">
        <span class="sidebar-section-title">{{ $t('nav.main') }}</span>
        <div class="nav-item">
          <router-link to="/" class="nav-link" @click="closeMobile">
            <i class="bi bi-grid-1x2"></i>
            <span class="nav-text">{{ $t('nav.dashboard') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/transactions" class="nav-link" @click="closeMobile">
            <i class="bi bi-arrow-left-right"></i>
            <span class="nav-text">{{ $t('nav.transactions') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/calendar" class="nav-link" @click="closeMobile">
            <i class="bi bi-calendar3"></i>
            <span class="nav-text">{{ $t('nav.calendar') || 'Calendar' }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/accounts" class="nav-link" @click="closeMobile">
            <i class="bi bi-bank"></i>
            <span class="nav-text">{{ $t('nav.accounts') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/shopping" class="nav-link" @click="closeMobile">
            <i class="bi bi-cart"></i>
            <span class="nav-text">{{ $t('shopping.title') }}</span>
            <span v-if="pendingShoppingCount > 0" class="badge rounded-pill bg-danger ms-auto" style="font-size: 0.65rem;">{{ pendingShoppingCount }}</span>
          </router-link>
        </div>

        <span class="sidebar-section-title">{{ $t('nav.management') }}</span>
        <div class="nav-item">
          <router-link to="/categories" class="nav-link" @click="closeMobile">
            <i class="bi bi-tags"></i>
            <span class="nav-text">{{ $t('nav.categories') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/budgets" class="nav-link" @click="closeMobile">
            <i class="bi bi-pie-chart"></i>
            <span class="nav-text">{{ $t('nav.budgets') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/goals" class="nav-link" @click="closeMobile">
            <i class="bi bi-trophy"></i>
            <span class="nav-text">{{ $t('nav.goals') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/projects" class="nav-link" @click="closeMobile">
            <i class="bi bi-briefcase"></i>
            <span class="nav-text">{{ $t('nav.projectPockets') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/recurring" class="nav-link" @click="closeMobile">
            <i class="bi bi-arrow-repeat"></i>
            <span class="nav-text">{{ $t('nav.recurring') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/members" class="nav-link" @click="closeMobile">
            <i class="bi bi-people"></i>
            <span class="nav-text">{{ $t('nav.members') }}</span>
          </router-link>
        </div>

        <span class="sidebar-section-title">{{ $t('nav.analytics') }}</span>
        <div class="nav-item">
          <router-link to="/reports" class="nav-link" @click="closeMobile">
            <i class="bi bi-bar-chart-line"></i>
            <span class="nav-text">{{ $t('nav.reports') }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/ai" class="nav-link" @click="closeMobile">
            <i class="bi bi-stars"></i>
            <span class="nav-text">{{ $t('nav.aiadvisor') || 'AI Advisor' }}</span>
          </router-link>
        </div>
        <div class="nav-item">
          <router-link to="/settings" class="nav-link" @click="closeMobile">
            <i class="bi bi-gear"></i>
            <span class="nav-text">{{ $t('nav.settings') }}</span>
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

        <!-- Theme Toggle Button -->
        <button
          class="toggle-btn"
          @click="toggleTheme"
          :title="theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
        >
          <i class="bi" :class="theme === 'dark' ? 'bi-sun-fill text-warning' : 'bi-moon-stars-fill'"></i>
        </button>

        <!-- Tour Help Button -->
        <button
          id="tour-help-btn"
          class="toggle-btn tour-help-btn"
          @click="triggerTour"
          :title="$t('nav.replayTour')"
          v-tooltip="$t('nav.replayTour')"
        >
          <i class="bi bi-compass"></i>
        </button>

        <!-- Language Dropdown -->
        <div class="vue-dropdown" ref="langDropdownRef">
          <button class="toggle-btn" @click.stop="toggleLang" title="Change Language">
            <i class="bi bi-translate"></i>
          </button>
          <div v-show="langOpen" class="vue-dropdown-menu" style="min-width: 140px; right: 0">
            <div class="vue-dropdown-header">
              <i class="bi bi-translate me-2"></i>Language
            </div>
            <button
              type="button"
              class="vue-dropdown-item d-flex align-items-center justify-content-between w-100 border-0 bg-transparent text-start"
              @click="changeLang('en')"
            >
              <span>English</span>
              <i v-if="localeStore.currentLocale === 'en'" class="bi bi-check-lg text-success"></i>
            </button>
            <button
              type="button"
              class="vue-dropdown-item d-flex align-items-center justify-content-between w-100 border-0 bg-transparent text-start"
              @click="changeLang('id')"
            >
              <span>Indonesia</span>
              <i v-if="localeStore.currentLocale === 'id'" class="bi bi-check-lg text-success"></i>
            </button>
          </div>
        </div>

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
              <i class="bi bi-bell me-2"></i>{{ $t('nav.budgetAlerts') }}
            </div>
            <div v-if="!budgetAlerts.length" class="vue-dropdown-item text-muted small">
              {{ $t('nav.noAlerts') }}
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
              <i class="bi bi-gear me-2"></i>{{ $t('nav.settings') }}
            </router-link>
            <div class="vue-dropdown-divider"></div>
            <a class="vue-dropdown-item text-danger" href="#" @click.prevent="handleLogout">
              <i class="bi bi-box-arrow-right me-2"></i>{{ $t('nav.logout') }}
            </a>
          </div>
        </div>

      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
      <router-view />
    </main>

    <GoalNotificationModal />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useBudgetStore } from '../stores/budgets';
import { useTourStore } from '../stores/tour';
import { useLocaleStore } from '../stores/locale';
import GoalNotificationModal from '../components/GoalNotificationModal.vue';
import { supabase } from '../lib/supabase';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const budgetStore = useBudgetStore();
const tourStore = useTourStore();
const localeStore = useLocaleStore();

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
const langOpen = ref(false);
const theme = ref(localStorage.getItem('theme') || 'light');

function toggleTheme() {
  theme.value = theme.value === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', theme.value);
  document.documentElement.setAttribute('data-theme', theme.value);
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme.value }));
}

const bellDropdownRef = ref(null);
const userDropdownRef = ref(null);
const langDropdownRef = ref(null);

let pollTimer = null;
const pendingShoppingCount = ref(0);
let shoppingSub = null;

const budgetAlerts = computed(() => budgetStore.alerts || []);
const currentPageTitle = computed(() => {
  if (!route.name) return localeStore.t('nav.dashboard');
  const key = `nav.${route.name.toLowerCase()}`;
  return localeStore.t(key);
});

async function refreshAlerts() {
  try {
    await budgetStore.fetchAlerts();
  } catch {}
}

async function fetchPendingShopping() {
  if (!authStore.familyId) return;
  const { count } = await supabase.from('shopping_plans').select('*', { count: 'exact', head: true })
    .eq('status', 'progress').eq('family_id', authStore.familyId);
  pendingShoppingCount.value = count || 0;
}

function setupShoppingRealtime() {
  if (!authStore.familyId) return;
  shoppingSub = supabase.channel('dashboard_shopping')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'shopping_plans', filter: `family_id=eq.${authStore.familyId}` }, () => {
      fetchPendingShopping();
    }).subscribe();
}

function handleShoppingUpdated() {
  fetchPendingShopping();
}

function toggleBell() {
  bellOpen.value = !bellOpen.value;
  userOpen.value = false;
  langOpen.value = false;
}

function toggleUser() {
  userOpen.value = !userOpen.value;
  bellOpen.value = false;
  langOpen.value = false;
}

function toggleLang() {
  langOpen.value = !langOpen.value;
  bellOpen.value = false;
  userOpen.value = false;
}

function changeLang(lang) {
  localeStore.setLocale(lang);
  langOpen.value = false;
}

// Close dropdowns when clicking outside
function handleOutsideClick(e) {
  if (bellDropdownRef.value && !bellDropdownRef.value.contains(e.target)) {
    bellOpen.value = false;
  }
  if (userDropdownRef.value && !userDropdownRef.value.contains(e.target)) {
    userOpen.value = false;
  }
  if (langDropdownRef.value && !langDropdownRef.value.contains(e.target)) {
    langOpen.value = false;
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
  document.documentElement.setAttribute('data-theme', theme.value);
  document.addEventListener('mousedown', handleOutsideClick);
  window.addEventListener('shopping-plans-updated', handleShoppingUpdated);
  await refreshAlerts();
  startAlertsPolling();
  fetchPendingShopping();
  setupShoppingRealtime();
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  window.removeEventListener('shopping-plans-updated', handleShoppingUpdated);
  stopAlertsPolling();
  if (shoppingSub) supabase.removeChannel(shoppingSub);
});
</script>
