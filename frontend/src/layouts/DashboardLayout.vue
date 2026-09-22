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
          <router-link to="/scheduler" class="nav-link" @click="closeMobile">
            <i class="bi bi-calendar-check"></i>
            <span class="nav-text">{{ $t('nav.scheduler') || 'Scheduler & Chores' }}</span>
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
        <div class="nav-item">
          <router-link to="/meals" class="nav-link" @click="closeMobile">
            <i class="bi bi-egg-fried"></i>
            <span class="nav-text">{{ $t('nav.meals') || 'Meals & Pantry' }}</span>
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

        <!-- Install PWA Button -->
        <InstallPwa />

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

        <!-- Alerts Hub Bell -->
        <div class="vue-dropdown" ref="bellDropdownRef">
          <button id="tour-bell-icon" class="toggle-btn position-relative" @click.stop="toggleBell" :title="$t('nav.alertsHub')">
            <i class="bi bi-bell"></i>
            <span
              v-if="totalAlertsCount > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style="font-size:0.6rem"
            >{{ totalAlertsCount }}</span>
          </button>
          <div v-show="bellOpen" class="vue-dropdown-menu" style="min-width:320px; max-width: 360px; right:0; padding: 0.5rem 0;">
            <div class="vue-dropdown-header d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
              <span class="fw-bold text-dark dark:text-light">
                <i class="bi bi-bell-fill text-primary me-2"></i>{{ $t('nav.alertsHub') }}
              </span>
              <span v-if="totalAlertsCount > 0" class="badge bg-danger rounded-pill">{{ totalAlertsCount }}</span>
            </div>

            <!-- Category Filter Tabs -->
            <div class="px-2 py-1.5 border-bottom bg-light d-flex gap-1 overflow-x-auto">
              <button 
                type="button"
                class="btn btn-xs rounded-pill flex-fill text-nowrap"
                :class="alertTab === 'all' ? 'btn-primary' : 'btn-outline-secondary'"
                style="font-size: 0.7rem; padding: 2px 6px;"
                @click.stop="alertTab = 'all'"
              >
                {{ $t('nav.allAlerts') }} ({{ totalAlertsCount }})
              </button>
              <button 
                type="button"
                class="btn btn-xs rounded-pill flex-fill text-nowrap"
                :class="alertTab === 'budget' ? 'btn-danger' : 'btn-outline-secondary'"
                style="font-size: 0.7rem; padding: 2px 6px;"
                @click.stop="alertTab = 'budget'"
              >
                {{ $t('nav.budgetAlerts') }} ({{ budgetAlertsList.length }})
              </button>
              <button 
                type="button"
                class="btn btn-xs rounded-pill flex-fill text-nowrap"
                :class="alertTab === 'goal' ? 'btn-warning text-dark' : 'btn-outline-secondary'"
                style="font-size: 0.7rem; padding: 2px 6px;"
                @click.stop="alertTab = 'goal'"
              >
                {{ $t('nav.goalAlerts') }} ({{ goalAlertsList.length }})
              </button>
              <button 
                type="button"
                class="btn btn-xs rounded-pill flex-fill text-nowrap"
                :class="alertTab === 'shopping' ? 'btn-info text-white' : 'btn-outline-secondary'"
                style="font-size: 0.7rem; padding: 2px 6px;"
                @click.stop="alertTab = 'shopping'"
              >
                {{ $t('nav.shoppingAlerts') }} ({{ shoppingAlertsList.length }})
              </button>
            </div>

            <!-- Alerts Feed -->
            <div style="max-height: 300px; overflow-y: auto;">
              <div v-if="!filteredAlerts.length" class="p-4 text-center text-muted small">
                <i class="bi bi-bell-slash d-block fs-4 mb-1 opacity-50"></i>
                {{ $t('nav.noAlertsFound') }}
              </div>
              <div
                v-for="(item, idx) in filteredAlerts"
                :key="idx"
                class="vue-dropdown-item py-2 px-3 border-bottom d-flex align-items-start gap-2"
                style="cursor: pointer;"
                @click="handleAlertClick(item)"
              >
                <i class="bi mt-1" :class="item.iconClass" style="font-size: 1.1rem;"></i>
                <div class="flex-grow-1 min-w-0">
                  <div class="d-flex align-items-center justify-content-between gap-1">
                    <span class="fw-semibold text-truncate small" :class="item.titleClass">{{ item.title }}</span>
                    <span class="badge" :class="item.badgeClass" style="font-size: 0.6rem;">{{ item.categoryLabel }}</span>
                  </div>
                  <div class="text-muted extra-small line-clamp-2" style="font-size: 0.75rem;">
                    {{ item.message }}
                  </div>
                </div>
                <i class="bi bi-chevron-right text-muted extra-small align-self-center"></i>
              </div>
            </div>
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
    <AlarmModal />
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
import AlarmModal from '../components/scheduler/AlarmModal.vue';
import InstallPwa from '../components/InstallPwa.vue';
import { goalService } from '../services/goalService';
import { supabase } from '../lib/supabase';
import { useSchedulerAlarmStore } from '../stores/schedulerAlarm';
import { reminderService } from '../services/scheduler/reminderService';
import { schedulerSyncService } from '../services/scheduler/schedulerSyncService';

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
  Calendar: 'start-calendar-tour',
  Shopping: 'start-shopping-tour',
  ShoppingDetail: 'start-shoppingdetail-tour',
  Categories: 'start-categories-tour',
  ProjectPockets: 'start-projects-tour',
  Members: 'start-members-tour',
  Settings: 'start-settings-tour',
  Ai: 'start-ai-tour',
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

import { useThemeStore } from '../stores/theme';
import { storeToRefs } from 'pinia';

const themeStore = useThemeStore();
const { currentTheme: theme } = storeToRefs(themeStore);

const sidebarCollapsed = ref(false);
const mobileOpen = ref(false);
const bellOpen = ref(false);
const userOpen = ref(false);
const langOpen = ref(false);

function toggleTheme() {
  themeStore.toggleTheme();
  window.dispatchEvent(new CustomEvent('theme-changed', { detail: theme.value }));
}

const bellDropdownRef = ref(null);
const userDropdownRef = ref(null);
const langDropdownRef = ref(null);

let pollTimer = null;
const pendingShoppingCount = ref(0);
let shoppingSub = null;

// Alerts Hub state
const alertTab = ref('all');
const goalAlertsList = ref([]);
const shoppingAlertsList = ref([]);

const budgetAlertsList = computed(() => {
  const isId = localeStore.currentLocale === 'id';
  return (budgetStore.alerts || []).map(a => ({
    category: 'budget',
    categoryLabel: isId ? 'Anggaran' : 'Budget',
    title: a.category?.name || (isId ? 'Peringatan Anggaran' : 'Budget Warning'),
    message: isId 
      ? `Terpakai ${a.percentage?.toFixed(1)}% (Rp ${Number(a.spent || 0).toLocaleString('id-ID')} dari Rp ${Number(a.amount || 0).toLocaleString('id-ID')})`
      : `Used ${a.percentage?.toFixed(1)}% (Rp ${Number(a.spent || 0).toLocaleString()} of Rp ${Number(a.amount || 0).toLocaleString()})`,
    iconClass: 'bi-exclamation-triangle-fill text-danger',
    titleClass: 'text-danger',
    badgeClass: 'bg-danger-subtle text-danger border border-danger-subtle',
    route: '/budgets'
  }));
});

const totalAlertsCount = computed(() => {
  return budgetAlertsList.value.length + goalAlertsList.value.length + shoppingAlertsList.value.length;
});

const filteredAlerts = computed(() => {
  const all = [
    ...budgetAlertsList.value,
    ...goalAlertsList.value,
    ...shoppingAlertsList.value
  ];
  if (alertTab.value === 'all') return all;
  return all.filter(item => item.category === alertTab.value);
});

const currentPageTitle = computed(() => {
  if (!route.name) return localeStore.t('nav.dashboard');
  const key = `nav.${route.name.toLowerCase()}`;
  return localeStore.t(key);
});

async function fetchGoalAlerts() {
  try {
    const { data } = await goalService.list();
    if (!data) return;
    const isId = localeStore.currentLocale === 'id';
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list = [];
    (data || []).forEach(g => {
      if (g.status !== 'active') return;
      const isMet = Number(g.current_amount || 0) >= Number(g.target_amount || 0);
      if (isMet) {
        list.push({
          category: 'goal',
          categoryLabel: isId ? 'Target' : 'Goal',
          title: g.name,
          message: isId 
            ? `Target Rp ${Number(g.target_amount || 0).toLocaleString('id-ID')} telah tercapai!` 
            : `Target Rp ${Number(g.target_amount || 0).toLocaleString()} reached!`,
          iconClass: 'bi-trophy-fill text-warning',
          titleClass: 'text-dark dark:text-light',
          badgeClass: 'bg-warning-subtle text-warning-emphasis border border-warning-subtle',
          route: '/goals'
        });
      } else if (g.deadline_raw) {
        const dl = new Date(g.deadline_raw);
        dl.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((dl - today) / (1000 * 60 * 60 * 24));
        if (diffDays >= -3 && diffDays <= 7) {
          const timeStr = diffDays > 0 
            ? (isId ? `Jatuh tempo dalam ${diffDays} hari` : `Due in ${diffDays} days`)
            : (diffDays === 0 ? (isId ? 'Jatuh tempo hari ini' : 'Due today') : (isId ? `Lewat jatuh tempo ${Math.abs(diffDays)} hari` : `Overdue ${Math.abs(diffDays)} days`));
          list.push({
            category: 'goal',
            categoryLabel: isId ? 'Target' : 'Goal',
            title: g.name,
            message: `${timeStr} — ${isId ? 'Terkumpul' : 'Saved'}: Rp ${Number(g.current_amount || 0).toLocaleString('id-ID')} / Rp ${Number(g.target_amount || 0).toLocaleString('id-ID')}`,
            iconClass: diffDays < 0 ? 'bi-exclamation-circle-fill text-danger' : 'bi-flag-fill text-primary',
            titleClass: diffDays < 0 ? 'text-danger' : 'text-primary',
            badgeClass: diffDays < 0 ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary',
            route: '/goals'
          });
        }
      }
    });
    goalAlertsList.value = list;
  } catch (err) {
    console.warn('Failed to fetch goal alerts:', err);
  }
}

async function fetchPendingShopping() {
  if (!authStore.familyId) return;
  const { data, count } = await supabase.from('shopping_plans')
    .select('id, location, title, created_at', { count: 'exact' })
    .eq('status', 'progress')
    .eq('family_id', authStore.familyId)
    .order('created_at', { ascending: false });

  pendingShoppingCount.value = count || 0;
  const isId = localeStore.currentLocale === 'id';

  shoppingAlertsList.value = (data || []).map(p => ({
    category: 'shopping',
    categoryLabel: isId ? 'Belanja' : 'Shopping',
    title: p.location || p.title || (isId ? 'Rencana Belanja' : 'Shopping Plan'),
    message: isId ? 'Daftar belanja aktif masih dalam proses' : 'Active shopping list in progress',
    iconClass: 'bi-cart-fill text-info',
    titleClass: 'text-info-emphasis',
    badgeClass: 'bg-info-subtle text-info border border-info-subtle',
    route: '/shopping'
  }));
}

async function refreshAlerts() {
  try {
    await Promise.all([
      budgetStore.fetchAlerts(),
      fetchGoalAlerts(),
      fetchPendingShopping()
    ]);
  } catch {}
}

function handleAlertClick(item) {
  bellOpen.value = false;
  if (item.route) {
    router.push(item.route);
  }
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

watch(mobileOpen, (newVal) => {
  if (newVal) {
    document.body.style.overflow = 'hidden';
  } else {
    document.body.style.overflow = '';
  }
});

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

  // Initialize Scheduler reminders and background sync
  useSchedulerAlarmStore().init();
  reminderService.start();
  if (authStore.familyId) {
    schedulerSyncService.triggerSync(authStore.familyId);
  }
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleOutsideClick);
  window.removeEventListener('shopping-plans-updated', handleShoppingUpdated);
  stopAlertsPolling();
  reminderService.stop();
  if (shoppingSub) supabase.removeChannel(shoppingSub);
});
</script>
