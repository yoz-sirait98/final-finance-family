import { createCrudService } from './crud.js';
import { supabase } from '../lib/supabase.js';
import { useAuthStore } from '../stores/auth.js';

const crud = createCrudService('meal_plans');

export const mealPlanService = {
  ...crud,

  /**
   * Fetch all meal plans within a date range (e.g., Mon-Sun)
   */
  getWeekPlan: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .select('*, assigned_member:members!assigned_member_id(id, name, role)')
      .gte('plan_date', startDate)
      .lte('plan_date', endDate)
      .order('plan_date', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) throw error;
    return { data: { data: data || [] } };
  },

  /**
   * Toggle meal plan completion status
   */
  toggleCompleted: async (id, isCompleted) => {
    const { data, error } = await supabase
      .from('meal_plans')
      .update({ is_completed: isCompleted, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, assigned_member:members!assigned_member_id(id, name, role)')
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Copy meal plans from one week to another
   */
  copyWeek: async (sourceStartDate, targetStartDate) => {
    const authStore = useAuthStore();
    const sourceEnd = new Date(new Date(sourceStartDate).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const { data: sourceMeals, error: fetchErr } = await supabase
      .from('meal_plans')
      .select('*')
      .gte('plan_date', sourceStartDate)
      .lte('plan_date', sourceEnd);

    if (fetchErr) throw fetchErr;
    if (!sourceMeals || sourceMeals.length === 0) return [];

    const targetStartTime = new Date(targetStartDate).getTime();
    const sourceStartTime = new Date(sourceStartDate).getTime();
    const diffDays = Math.round((targetStartTime - sourceStartTime) / (24 * 60 * 60 * 1000));

    const newRows = sourceMeals.map((meal) => {
      const originalDate = new Date(meal.plan_date);
      const newDate = new Date(originalDate.getTime() + diffDays * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      return {
        family_id: authStore.familyId,
        plan_date: newDate,
        meal_type: meal.meal_type,
        recipe_title: meal.recipe_title,
        description: meal.description,
        assigned_member_id: meal.assigned_member_id,
        ingredients: meal.ingredients || [],
        is_completed: false,
        created_by: authStore.user?.id || null,
      };
    });

    const { data, error } = await supabase
      .from('meal_plans')
      .insert(newRows)
      .select();

    if (error) throw error;
    return data;
  },

  /**
   * Export missing ingredients into an active Shopping Plan
   */
  exportMissingIngredientsToShopping: async (ingredients, shoppingPlanId, defaultStoreName = 'Supermarket') => {
    const authStore = useAuthStore();
    if (!ingredients || ingredients.length === 0) return [];

    const itemsToInsert = ingredients.map((ing) => ({
      family_id: authStore.familyId,
      shopping_plan_id: shoppingPlanId,
      name: typeof ing === 'string' ? ing : ing.name,
      qty: (ing.quantity && !isNaN(parseFloat(ing.quantity))) ? parseFloat(ing.quantity) : 1,
      unit: ing.unit || 'pcs',
      price: 0,
      is_bought: false,
      notes: 'Added from Meal Planner',
    }));

    const { data, error } = await supabase
      .from('shopping_items')
      .insert(itemsToInsert)
      .select();

    if (error) throw error;
    return data;
  }
};
