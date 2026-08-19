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
      const d = new Date();
      const currentMonth = d.getMonth() + 1;
      const currentYear = d.getFullYear();

      const [accRes, budRes, txRes, goalRes, memRes] = await Promise.all([
        accountService.list({ is_active: true }),
        budgetService.list({ month: currentMonth, year: currentYear }),
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
        summary += `- Category: ${b.category?.name || 'Others'}, Budget: Rp ${limit.toLocaleString('id-ID')}, Spent: Rp ${spent.toLocaleString('id-ID')} (${pct}% utilized)\n`;
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
        summary += `- Date: ${t.transaction_date}, ${t.type.toUpperCase()}: Rp ${parseFloat(t.amount || 0).toLocaleString('id-ID')} | Desc: ${t.description || 'No desc'} (Category: ${t.category?.name || 'Others'}, Account: ${t.account?.name || 'Others'}, logged by: ${t.member?.name || 'Unknown'})\n`;
      });

      return summary;
    } catch (e) {
      console.error('Failed to gather financial context for AI:', e);
      return "Unable to load financial snapshot context due to a database fetch error.";
    }
  },

  /**
   * Universal AI Coach Dispatcher
   * Supports Gemini, DeepSeek (V3 & R1), Groq, OpenRouter, and OpenAI-compatible endpoints.
   *
   * @param {Array<{sender: string, text: string}>} messages - Chat history
   * @param {string} locale - 'en' | 'id'
   * @param {Object} options - Override provider/model/keys
   * @returns {Promise<{reply: string, reasoning: string|null, modelUsed: string, provider: string}>}
   */
  async chatWithCoach(messages, locale = 'en', options = {}) {
    const provider = options.provider || localStorage.getItem('ai_provider') || 'gemini';
    const model = options.model || localStorage.getItem('ai_model') || (provider === 'deepseek' ? 'deepseek-chat' : provider === 'groq' ? 'openai/gpt-oss-20b' : 'gemini-flash-lite-latest');

    // 1. Fetch financial snapshot context
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

    if (provider === 'gemini') {
      return this.chatWithGemini({ messages, systemPrompt, locale, options });
    } else {
      return this.chatWithOpenAiCompatible({ messages, systemPrompt, provider, model, options });
    }
  },

  /**
   * Gemini API client
   */
  async chatWithGemini({ messages, systemPrompt, options }) {
    const apiKey = options.apiKey || localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('Gemini API Key is missing. Please configure it in Settings or .env file.');
    }

    const contents = messages.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    if (contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemPrompt}\n\n[USER QUESTION]:\n${contents[0].parts[0].text}`;
    } else {
      contents.unshift({
        role: 'user',
        parts: [{ text: `${systemPrompt}\n\n[USER QUESTION]:\nHello` }]
      });
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: contents,
            generation_config: {
              temperature: 0.7,
              max_output_tokens: 1000
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

      return {
        reply,
        reasoning: null,
        modelUsed: 'gemini-flash-lite',
        provider: 'gemini'
      };
    } catch (err) {
      console.error('Gemini chat coach error:', err);
      throw err;
    }
  },

  /**
   * OpenAI-Compatible API client (DeepSeek, Groq, OpenRouter, Custom)
   */
  async chatWithOpenAiCompatible({ messages, systemPrompt, provider, model, options }) {
    let apiKey = options.apiKey;
    let endpoint = options.endpoint;

    if (provider === 'deepseek') {
      apiKey = apiKey || localStorage.getItem('deepseek_api_key') || import.meta.env.VITE_DEEPSEEK_API_KEY;
      endpoint = endpoint || 'https://api.deepseek.com/chat/completions';
    } else if (provider === 'groq') {
      apiKey = apiKey || localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY;
      endpoint = endpoint || 'https://api.groq.com/openai/v1/chat/completions';
    } else if (provider === 'openrouter') {
      apiKey = apiKey || localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY;
      endpoint = endpoint || 'https://openrouter.ai/api/v1/chat/completions';
    } else {
      apiKey = apiKey || localStorage.getItem('custom_ai_api_key');
      endpoint = endpoint || localStorage.getItem('custom_ai_endpoint') || 'https://api.deepseek.com/chat/completions';
    }

    if (!apiKey) {
      const providerNames = {
        deepseek: 'DeepSeek',
        groq: 'Groq',
        openrouter: 'OpenRouter'
      };
      throw new Error(`${providerNames[provider] || 'AI'} API Key is missing. Please configure it in Settings.`);
    }

    // Build standard OpenAI messages array
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }))
    ];

    const bodyPayload = {
      model: model || (provider === 'deepseek' ? 'deepseek-chat' : 'openai/gpt-oss-20b'),
      messages: formattedMessages
    };

    // Only add temperature if model supports it (deepseek-reasoner rejects custom temperature)
    if (!model?.includes('reasoner')) {
      bodyPayload.temperature = 0.7;
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(bodyPayload)
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMsg = resData.error?.message || `API returned status ${response.status}`;
        if (errorMsg.toLowerCase().includes('insufficient balance')) {
          throw new Error('DeepSeek account balance is insufficient. Please check billing at platform.deepseek.com or switch to Groq / Gemini in Settings.');
        }
        throw new Error(`${provider.toUpperCase()} API Error: ${errorMsg}`);
      }

      const choice = resData.choices?.[0];
      const rawContent = choice?.message?.content || '';
      let explicitReasoning = choice?.message?.reasoning_content || choice?.message?.reasoning || null;

      // Also extract reasoning if embedded inside <think>...</think> tags (e.g. Qwen on Groq)
      let cleanReply = rawContent;
      if (!explicitReasoning && rawContent.includes('<think>')) {
        const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/i);
        if (thinkMatch) {
          explicitReasoning = thinkMatch[1].trim();
          cleanReply = rawContent.replace(/<think>[\s\S]*?<\/think>/i, '').trim();
        }
      }

      if (!cleanReply && !explicitReasoning) {
        throw new Error('Empty response from AI API.');
      }

      return {
        reply: cleanReply,
        reasoning: explicitReasoning,
        modelUsed: model || bodyPayload.model,
        provider: provider
      };
    } catch (err) {
      console.error(`${provider} chat error:`, err);
      throw err;
    }
  }
};

