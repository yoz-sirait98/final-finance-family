import { accountService } from './accountService';
import { budgetService } from './budgetService';
import { transactionService } from './transactionService';
import { goalService } from './goalService';
import { memberService } from './memberService';
import { useAuthStore } from '../stores/auth';

export const aiService = {
  /**
   * Fetch a snapshot of family financial data to use as AI context
   */
  async getFinanceSnapshot() {
    try {
      const [accRes, budRes, txRes, goalRes, memRes] = await Promise.all([
        accountService.list({ is_active: true }),
        budgetService.list(),
        transactionService.list({ limit: 15 }),
        goalService.list(),
        memberService.list()
      ]);

      const accounts = accRes.data?.data || [];
      const budgets = budRes.data?.data || [];
      const transactions = txRes.data?.data || [];
      const goals = goalRes.data?.data || [];
      const members = memRes.data?.data || [];

      // Format snapshot as readable text summary
      let summary = "FAMILY FINANCE SUMMARY SNAPSHOT:\n\n";

      // 1. Members
      summary += "Family Members:\n";
      members.forEach(m => {
        summary += `- ${m.name} (${m.role || 'Member'})\n`;
      });
      summary += "\n";

      // 2. Accounts & Balances
      summary += "Accounts & Current Balances:\n";
      let totalNetWorth = 0;
      accounts.forEach(a => {
        const bal = parseFloat(a.balance || 0);
        totalNetWorth += bal;
        summary += `- ${a.name} (${a.type || 'Bank'}): Rp ${bal.toLocaleString('id-ID')}\n`;
      });
      summary += `Total Unified Net Worth: Rp ${totalNetWorth.toLocaleString('id-ID')}\n\n`;

      // 3. Budgets
      summary += "Active Budgets & Spending caps:\n";
      budgets.forEach(b => {
        const limit = parseFloat(b.amount || 0);
        const spent = parseFloat(b.spent || 0);
        const pct = limit > 0 ? Math.round((spent / limit) * 100) : 0;
        summary += `- Category: ${b.category_name || 'Others'}, Budget: Rp ${limit.toLocaleString('id-ID')}, Spent: Rp ${spent.toLocaleString('id-ID')} (${pct}% utilized)\n`;
      });
      summary += "\n";

      // 4. Goals
      summary += "Saving Goals:\n";
      goals.forEach(g => {
        const target = parseFloat(g.target_amount || 0);
        const current = parseFloat(g.current_amount || 0);
        const pct = target > 0 ? Math.round((current / target) * 100) : 0;
        summary += `- Goal: ${g.name}, Target: Rp ${target.toLocaleString('id-ID')}, Current: Rp ${current.toLocaleString('id-ID')} (${pct}% complete, status: ${g.status})\n`;
      });
      summary += "\n";

      // 5. Recent Transactions
      summary += "Last 15 Transactions:\n";
      transactions.forEach(t => {
        summary += `- Date: ${t.transaction_date}, ${t.type.toUpperCase()}: Rp ${parseFloat(t.amount || 0).toLocaleString('id-ID')} | Desc: ${t.description || 'No desc'} (Category: ${t.category_name || 'Others'}, Account: ${t.account_name || 'Others'}, logged by: ${t.member_name || 'Unknown'})\n`;
      });

      return summary;
    } catch (e) {
      console.error('Failed to gather financial context for AI:', e);
      return "Unable to load financial snapshot context due to a database fetch error.";
    }
  },

  /**
   * Send chat history and context to Gemini API
   */
  async chatWithCoach(messages, locale = 'en') {
    const apiKey = localStorage.getItem('gemini_api_key');
    if (!apiKey) {
      throw new Error('Gemini API Key is missing. Please configure it in Settings.');
    }

    // 1. Get financial snapshot context
    const financeSnapshot = await this.getFinanceSnapshot();

    // 2. Build system instructions
    const systemPrompt = `You are Aurora AI, a premium, friendly, and expert family financial advisor. 
You are coaching a family on how to manage their budgets, save money, and improve their financial health.

CRITICAL INSTRUCTIONS:
1. Speak in ${locale === 'id' ? 'Indonesian (Bahasa Indonesia)' : 'English'}. Match the requested language.
2. Use the provided FAMILY FINANCE SUMMARY SNAPSHOT below to give concrete, actual numbers, advice, and tips. Do not invent fake accounts, categories, or transaction histories.
3. Be supportive, concise, and professional. Point out if they are over-budget, recommend transferring balances, or offer savings tips when asked.
4. Keep formatting clean with bullet points and bold highlights.
5. If the snapshot says database load failed, tell the user politely.

---
${financeSnapshot}
---`;

    // 3. Map conversation history to Gemini contents structure
    const contents = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: {
              parts: [{ text: systemPrompt }]
            },
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 1000
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Gemini API returned status ${response.status}`);
      }

      const resData = await response.json();
      const reply = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!reply) {
        throw new Error('Empty response from Gemini API.');
      }

      return reply;
    } catch (err) {
      console.error('Gemini chat coach error:', err);
      throw err;
    }
  }
};
