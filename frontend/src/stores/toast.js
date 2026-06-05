import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([]);
  let nextId = 1;

  function show(message, type = 'success', duration = 3000) {
    const id = nextId++;
    toasts.value.push({ id, message, type });
    setTimeout(() => remove(id), duration);
  }

  function remove(id) {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index > -1) toasts.value.splice(index, 1);
  }

  const success = (msg, ms) => show(msg, 'success', ms);
  const error = (msg, ms) => show(msg, 'error', ms);
  const warning = (msg, ms) => show(msg, 'warning', ms);
  const info = (msg, ms) => show(msg, 'info', ms);

  return { toasts, show, remove, success, error, warning, info };
});
