import { defineStore } from 'pinia';
import { pantryService } from '../services/pantryService';

export const usePantryStore = defineStore('pantry', {
  state: () => ({
    items: [],
    expiringSoonItems: [],
    expiredItems: [],
    loading: false,
    filterLocation: 'all', // 'all' | 'fridge' | 'freezer' | 'pantry'
    filterCategory: 'all',
    searchQuery: '',
  }),

  getters: {
    filteredItems(state) {
      return state.items.filter((item) => {
        // Location filter
        if (state.filterLocation !== 'all' && item.location !== state.filterLocation) {
          return false;
        }
        // Category filter
        if (state.filterCategory !== 'all' && item.category !== state.filterCategory) {
          return false;
        }
        // Search filter
        if (state.searchQuery.trim()) {
          const q = state.searchQuery.toLowerCase();
          const matchName = item.name?.toLowerCase().includes(q);
          const matchNotes = item.notes?.toLowerCase().includes(q);
          if (!matchName && !matchNotes) return false;
        }
        return true;
      });
    },

    fridgeCount(state) {
      return state.items.filter((i) => i.location === 'fridge').length;
    },

    freezerCount(state) {
      return state.items.filter((i) => i.location === 'freezer').length;
    },

    pantryCount(state) {
      return state.items.filter((i) => i.location === 'pantry').length;
    },

    expiringCount(state) {
      return state.expiringSoonItems.length;
    },

    expiredCount(state) {
      return state.expiredItems.length;
    },

    totalCount(state) {
      return state.items.length;
    }
  },

  actions: {
    async fetchItems() {
      this.loading = true;
      try {
        const [itemsRes, expiringRes, expiredRes] = await Promise.all([
          pantryService.list(),
          pantryService.getExpiringSoon(3),
          pantryService.getExpired()
        ]);
        this.items = itemsRes.data?.data || [];
        this.expiringSoonItems = expiringRes || [];
        this.expiredItems = expiredRes || [];
      } finally {
        this.loading = false;
      }
    },

    async addItem(payload) {
      const { data } = await pantryService.create(payload);
      await this.fetchItems();
      return data;
    },

    async updateItem(id, payload) {
      const { data } = await pantryService.update(id, payload);
      await this.fetchItems();
      return data;
    },

    async deleteItem(id) {
      await pantryService.delete(id);
      this.items = this.items.filter((i) => i.id !== id);
      this.expiringSoonItems = this.expiringSoonItems.filter((i) => i.id !== id);
      this.expiredItems = this.expiredItems.filter((i) => i.id !== id);
    },

    async adjustQuantity(id, delta) {
      const updated = await pantryService.adjustQuantity(id, delta);
      const index = this.items.findIndex((i) => i.id === id);
      if (index !== -1) {
        if (updated.status === 'consumed') {
          this.items.splice(index, 1);
        } else {
          this.items[index] = { ...this.items[index], ...updated };
        }
      }
      return updated;
    },

    async restockFromShopping(shoppingItem, location = 'fridge') {
      const newItem = await pantryService.addFromShoppingItem(shoppingItem, location);
      await this.fetchItems();
      return newItem;
    },

    setLocationFilter(loc) {
      this.filterLocation = loc;
    },

    setCategoryFilter(cat) {
      this.filterCategory = cat;
    },

    setSearchQuery(query) {
      this.searchQuery = query;
    }
  }
});
