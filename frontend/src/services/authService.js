import { supabase } from '../lib/supabase';

export const authService = {
  register: async (data) => {
    const { data: user, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { name: data.name }
      }
    });
    if (error) throw error;
    return { data: user };
  },
  login: async (credentials) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    });
    if (error) throw error;
    return { data };
  },
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },
  profile: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return { data: { user: data.user } };
  },
  changePassword: async (data) => {
    const { error } = await supabase.auth.updateUser({
      password: data.password
    });
    if (error) throw error;
  },
};
