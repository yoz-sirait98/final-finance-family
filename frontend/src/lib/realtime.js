import { supabase } from './supabase';
import { useTransactionStore } from '../stores/transactions';
import { useAccountStore } from '../stores/accounts';
import { useBudgetStore } from '../stores/budgets';
import { useGoalStore } from '../stores/goals';

export function initializeRealtime() {
  const transactionStore = useTransactionStore();
  const accountStore = useAccountStore();
  const budgetStore = useBudgetStore();
  const goalStore = useGoalStore();

  supabase.channel('global-db-changes')
    .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
      console.log('Realtime DB Change:', payload);
      
      // Auto-refresh the relevant stores to keep the UI perfectly synced
      if (payload.table === 'transactions') {
         transactionStore.fetchTransactions();
         accountStore.fetchAccounts(); // Balances likely changed
         if (budgetStore.fetchBudgets) budgetStore.fetchBudgets();
      }
      if (payload.table === 'accounts') {
         accountStore.fetchAccounts();
      }
      if (payload.table === 'budgets' && budgetStore.fetchBudgets) {
         budgetStore.fetchBudgets();
      }
      if (payload.table === 'saving_goals' && goalStore.fetchGoals) {
         goalStore.fetchGoals();
      }
    })
    .subscribe();
}
