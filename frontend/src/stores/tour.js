import { defineStore } from 'pinia';
import { ref } from 'vue';

const STORAGE_KEY = 'ff_tour_seen';

function loadSeen() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    return {};
  }
}

export const useTourStore = defineStore('tour', () => {
  const seen = ref(loadSeen());

  function hasSeen(page) {
    return !!seen.value[page];
  }

  function markSeen(page) {
    seen.value[page] = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen.value));
  }

  function resetAll() {
    seen.value = {};
    localStorage.removeItem(STORAGE_KEY);
  }

  function resetPage(page) {
    delete seen.value[page];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seen.value));
  }

  return { seen, hasSeen, markSeen, resetAll, resetPage };
});
