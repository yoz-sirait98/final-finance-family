import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { VueQueryPlugin } from '@tanstack/vue-query';
import { queryClient } from './utils/queryClient';
import router from './router';
import App from './App.vue';
import './style.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { useLocaleStore } from './stores/locale';

const app = createApp(App);
const pinia = createPinia();
app.use(pinia);

// Set up translation helper globally
const localeStore = useLocaleStore();
app.config.globalProperties.$t = localeStore.t;

app.use(VueQueryPlugin, { queryClient });
app.use(router);
app.mount('#app');
