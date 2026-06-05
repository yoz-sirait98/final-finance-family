import { defineStore } from 'pinia';
import { memberService } from '../services/memberService';

export const useMemberStore = defineStore('members', {
  state: () => ({
    members: [],
    loading: false,
  }),

  actions: {
    async fetchMembers() {
      this.loading = true;
      try {
        const { data } = await memberService.list();
        this.members = data.data;
      } finally {
        this.loading = false;
      }
    },
  },
});
