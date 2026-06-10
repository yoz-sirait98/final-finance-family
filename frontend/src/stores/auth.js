import { defineStore } from 'pinia';
import { supabase } from '../lib/supabase';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    family: null,
    initialized: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.session,
    userName: (state) => state.user?.full_name || state.user?.name || '',
    familyId: (state) => state.user?.family_id || null,
  },

  actions: {
    async initialize() {
      if (this.initialized) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      this.session = session;
      
      if (session) {
        await this.fetchProfile(session.user.id);
      }
      
      // Listen to auth changes (e.g., login, logout across tabs)
      supabase.auth.onAuthStateChange((_event, session) => {
        this.session = session;
        if (session && (!this.user || this.user.id !== session.user.id)) {
           this.fetchProfile(session.user.id);
        } else if (!session) {
           this.user = null;
        }
      });
      
      this.initialized = true;
    },

    async register(data) {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.name
          }
        }
      });
      if (error) throw error;
    },

    async login(credentials) {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      if (error) throw error;
    },

    async fetchProfile(userId) {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
      if (!error && data) {
        this.user = data;
        
        // Fetch family record to retrieve cross-device gemini_api_key
        const { data: family } = await supabase.from('families').select('*').eq('id', data.family_id).single();
        if (family) {
          this.family = family;
          if (family.gemini_api_key) {
            localStorage.setItem('gemini_api_key', family.gemini_api_key);
          }
        }
      }
    },

    async logout() {
      await supabase.auth.signOut();
      this.user = null;
      this.session = null;
    },
  },
});
