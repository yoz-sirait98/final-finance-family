import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../pages/RegisterPage.vue'),
    meta: { guest: true },
  },
  {
    path: '/',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: () => import('../pages/DashboardPage.vue') },
      { path: 'members', name: 'Members', component: () => import('../pages/MembersPage.vue') },
      { path: 'accounts', name: 'Accounts', component: () => import('../pages/AccountsPage.vue') },
      { path: 'categories', name: 'Categories', component: () => import('../pages/CategoriesPage.vue') },
      { path: 'transactions', name: 'Transactions', component: () => import('../pages/TransactionsPage.vue') },
      { path: 'shopping', name: 'Shopping', component: () => import('../pages/ShoppingPage.vue') },
      { path: 'budgets', name: 'Budgets', component: () => import('../pages/BudgetsPage.vue') },
      { path: 'goals', name: 'Goals', component: () => import('../pages/GoalsPage.vue') },
      { path: 'recurring', name: 'Recurring', component: () => import('../pages/RecurringPage.vue') },
      { path: 'reports', name: 'Reports', component: () => import('../pages/ReportsPage.vue') },
      { path: 'settings', name: 'Settings', component: () => import('../pages/SettingsPage.vue') },
      { path: 'gem', name: 'IconsGem', component: () => import('../pages/IconsGemPage.vue') },
    ],
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next('/');
  } else {
    next();
  }
});

// Handle lazy-loaded chunk errors (happens when a new version is deployed while user has app open)
router.onError((error, to) => {
  if (error.message.includes('Failed to fetch dynamically imported module') || error.name === 'ChunkLoadError' || error.message.includes('Importing a module script failed')) {
    window.location.href = to.fullPath;
  }
});

export default router;
