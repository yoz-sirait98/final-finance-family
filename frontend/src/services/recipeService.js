import { createCrudService } from './crud.js';
import { supabase } from '../lib/supabase.js';
import { useAuthStore } from '../stores/auth.js';

const crud = createCrudService('recipes');

export const recipeService = {
  ...crud,

  list: async (params = {}) => {
    let query = supabase
      .from('recipes')
      .select('*')
      .order('is_favorite', { ascending: false })
      .order('name', { ascending: true });

    if (params.category && params.category !== 'all') {
      query = query.eq('category', params.category);
    }
    if (params.is_favorite !== undefined && params.is_favorite !== null) {
      query = query.eq('is_favorite', params.is_favorite);
    }
    if (params.search) {
      query = query.ilike('name', `%${params.search}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { data: { data: data || [] } };
  },

  toggleFavorite: async (id, isFavorite) => {
    const { data, error } = await supabase
      .from('recipes')
      .update({ is_favorite: isFavorite, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * AI-powered Recipe Generator ("Masak Apa Dari Kulkas?")
   * Reads available pantry items and generates 3 tailored home recipes.
   *
   * @param {Array<Object>} pantryItems - Available ingredients
   * @param {Object} options - { preferences, diet, expiringSoonOnly, locale }
   */
  generateAiRecipes: async (pantryItems = [], options = {}) => {
    const locale = options.locale || 'id';
    const provider = localStorage.getItem('ai_provider') || 'gemini';
    const apiKey =
      provider === 'gemini'
        ? localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY
        : provider === 'groq'
        ? localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY
        : provider === 'deepseek'
        ? localStorage.getItem('deepseek_api_key') || import.meta.env.VITE_DEEPSEEK_API_KEY
        : localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY;

    // Filter items if expiring soon only
    let targetItems = pantryItems;
    if (options.expiringSoonOnly) {
      const today = new Date();
      targetItems = pantryItems.filter((item) => {
        if (!item.expiration_date) return false;
        const exp = new Date(item.expiration_date);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        return diffDays <= 4;
      });
      if (targetItems.length === 0) targetItems = pantryItems;
    }

    // Format pantry ingredients list
    const ingredientsList = targetItems.length > 0
      ? targetItems.map(i => `${i.name} (${i.quantity} ${i.unit || 'pcs'}, loc: ${i.location || 'pantry'}${i.expiration_date ? `, exp: ${i.expiration_date}` : ''})`).join(', ')
      : 'Beras, Telur, Bawang Merah, Bawang Putih, Minyak Goreng, Sayuran campur';

    const systemPrompt = `You are Chef Nusantara AI, an exceptional family chef and home culinary advisor.
Your goal is to generate practical, family-friendly, delicious home recipes based primarily on ingredients currently available in the user's kitchen pantry and fridge.

CRITICAL OUTPUT FORMAT:
Output MUST be valid JSON and ONLY valid JSON, with NO surrounding markdown or conversational text.
Return an array of exactly 3 recipe objects with this exact structure:
[
  {
    "name": "Recipe Name",
    "description": "One sentence appetizing summary",
    "category": "breakfast" | "lunch" | "dinner" | "snack",
    "prep_time_minutes": 15,
    "cook_time_minutes": 25,
    "servings": 4,
    "difficulty": "easy" | "medium" | "hard",
    "ingredients": [
      { "name": "Ingredient name", "quantity": "2", "unit": "pcs", "in_pantry": true }
    ],
    "instructions": [
      "Step 1...",
      "Step 2..."
    ],
    "tips": "Pro-tip for taste or reducing waste"
  }
]

Language: ${locale === 'id' ? 'Bahasa Indonesia' : 'English'}.
Make sure at least 2 recipes prioritize using ingredients that are expiring soon or in the fridge.`;

    const userPrompt = `Available kitchen pantry & fridge items:
${ingredientsList}

Special preferences or instructions: ${options.notes || 'None - make hearty family meals'}.
Please suggest 3 amazing recipes!`;

    if (!apiKey) {
      // Fallback demo recipes when no API key configured
      return getMockAiRecipes(locale);
    }

    try {
      let rawText = '';

      if (provider === 'gemini') {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }]
                }
              ],
              generation_config: {
                temperature: 0.7,
                response_mime_type: 'application/json'
              }
            })
          }
        );

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error?.message || `Gemini status ${response.status}`);
        }

        const data = await response.json();
        rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        // Groq, DeepSeek, OpenRouter
        const endpoint =
          provider === 'groq'
            ? 'https://api.groq.com/openai/v1/chat/completions'
            : provider === 'deepseek'
            ? 'https://api.deepseek.com/chat/completions'
            : 'https://openrouter.ai/api/v1/chat/completions';

        const model =
          provider === 'groq'
            ? 'openai/gpt-oss-20b'
            : provider === 'deepseek'
            ? 'deepseek-chat'
            : 'google/gemini-2.0-flash-001';

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.7
          })
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          throw new Error(err.error?.message || `${provider} status ${response.status}`);
        }

        const data = await response.json();
        rawText = data.choices?.[0]?.message?.content || '';
      }

      // Clean markdown code fence if present
      let cleanJson = rawText.trim();
      if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
      }

      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
      return getMockAiRecipes(locale);
    } catch (err) {
      console.warn('AI Recipe generator error, returning curated suggestions:', err);
      return getMockAiRecipes(locale);
    }
  }
};

/**
 * Fallback curated recipes when AI is unavailable or offline
 */
function getMockAiRecipes(locale = 'id') {
  if (locale === 'en') {
    return [
      {
        name: 'Quick Garlic Butter Chicken & Veggies',
        description: 'Tender chicken cubes sauteed with fresh garden vegetables and garlic butter sauce.',
        category: 'dinner',
        prep_time_minutes: 10,
        cook_time_minutes: 15,
        servings: 4,
        difficulty: 'easy',
        ingredients: [
          { name: 'Chicken Breast', quantity: '300', unit: 'g', in_pantry: true },
          { name: 'Mixed Vegetables', quantity: '200', unit: 'g', in_pantry: true },
          { name: 'Garlic', quantity: '3', unit: 'cloves', in_pantry: true },
          { name: 'Butter / Oil', quantity: '2', unit: 'tbsp', in_pantry: true }
        ],
        instructions: [
          'Dice chicken into bite-sized cubes and mince garlic.',
          'Melt butter in a pan over medium-high heat. Add garlic and saute until aromatic.',
          'Add chicken and cook until lightly browned (6-8 minutes).',
          'Toss in vegetables and saute for 4 minutes until crisp-tender.',
          'Season with salt and pepper to taste. Serve hot!'
        ],
        tips: 'Pairs wonderfully with warm rice or mashed potatoes.'
      },
      {
        name: 'Savory Egg Fried Rice (Nasi Goreng)',
        description: 'Classic comfort meal utilizing leftover rice and fridge staple aromatics.',
        category: 'lunch',
        prep_time_minutes: 5,
        cook_time_minutes: 10,
        servings: 3,
        difficulty: 'easy',
        ingredients: [
          { name: 'Cooked Rice', quantity: '3', unit: 'cups', in_pantry: true },
          { name: 'Eggs', quantity: '2', unit: 'pcs', in_pantry: true },
          { name: 'Shallots & Garlic', quantity: '4', unit: 'pcs', in_pantry: true },
          { name: 'Sweet Soy Sauce', quantity: '2', unit: 'tbsp', in_pantry: true }
        ],
        instructions: [
          'Scramble eggs in a hot wok, set aside.',
          'Saute aromatics until golden brown.',
          'Add cold rice, break up clumps over high heat.',
          'Add soy sauce and seasonings, return eggs to the wok and mix evenly.',
          'Serve with sliced cucumbers or crackers.'
        ],
        tips: 'Cold or day-old refrigerated rice yields the best texture.'
      },
      {
        name: 'Fluffy Banana Honey Pancakes',
        description: 'Naturally sweetened breakfast treats perfect for using ripe pantry bananas.',
        category: 'breakfast',
        prep_time_minutes: 10,
        cook_time_minutes: 10,
        servings: 4,
        difficulty: 'easy',
        ingredients: [
          { name: 'Ripe Bananas', quantity: '2', unit: 'pcs', in_pantry: true },
          { name: 'Eggs', quantity: '2', unit: 'pcs', in_pantry: true },
          { name: 'Flour', quantity: '1', unit: 'cup', in_pantry: true },
          { name: 'Milk', quantity: '100', unit: 'ml', in_pantry: true }
        ],
        instructions: [
          'Mash bananas in a bowl until smooth.',
          'Whisk in eggs and milk, then fold in flour until just combined.',
          'Pour batter onto a lightly greased non-stick skillet over medium-low heat.',
          'Flip when bubbles appear on the surface, cook for 1-2 more minutes.',
          'Drizzle with honey or maple syrup.'
        ],
        tips: 'Great for freezing and reheating on busy school mornings.'
      }
    ];
  }

  return [
    {
      name: 'Ayam Tumis Brokoli Gurih',
      description: 'Tumisan ayam gurih berpadu dengan sayuran segar kaya vitamin untuk santap malam sehat.',
      category: 'dinner',
      prep_time_minutes: 12,
      cook_time_minutes: 15,
      servings: 4,
      difficulty: 'easy',
      ingredients: [
        { name: 'Dada Ayam Fillet', quantity: '300', unit: 'gram', in_pantry: true },
        { name: 'Brokoli Segar', quantity: '1', unit: 'bonggol', in_pantry: true },
        { name: 'Bawang Putih', quantity: '4', unit: 'siung', in_pantry: true },
        { name: 'Saus Tiram', quantity: '2', unit: 'sdm', in_pantry: true },
        { name: 'Minyak Wijen', quantity: '1', unit: 'sdt', in_pantry: false }
      ],
      instructions: [
        'Potong dada ayam dadu dan rendam dengan sedikit garam serta merica.',
        'Potong brokoli per kuntum, rendam air garam hangat sebentar lalu tiriskan.',
        'Tumis bawang putih cincang hingga harum kekuningan di wajan panas.',
        'Masukkan ayam hingga berubah warna keputihan.',
        'Tambahkan brokoli, saus tiram, dan sedikit air. Aduk cepat selama 3-4 menit sampai brokoli matang renyah.',
        'Teteskan minyak wijen sebelum diangkat. Sajikan selagi hangat.'
      ],
      tips: 'Brokoli jangan dimasak terlalu lama agar tetap renyah (crunchy) dan nutrisinya terjaga.'
    },
    {
      name: 'Nasi Goreng Spesial Kulkas',
      description: 'Menu praktis penyelamat sisa nasi dingin dan bahan kulkas dengan bumbu khas rumahan.',
      category: 'lunch',
      prep_time_minutes: 8,
      cook_time_minutes: 10,
      servings: 3,
      difficulty: 'easy',
      ingredients: [
        { name: 'Nasi Putih Dingin', quantity: '3', unit: 'piring', in_pantry: true },
        { name: 'Telur Ayam', quantity: '2', unit: 'butir', in_pantry: true },
        { name: 'Bawang Merah & Putih', quantity: '5', unit: 'siung', in_pantry: true },
        { name: 'Kecap Manis', quantity: '2', unit: 'sdm', in_pantry: true },
        { name: 'Cabai Merah / Rawit', quantity: '3', unit: 'buah', in_pantry: true }
      ],
      instructions: [
        'Orak-arik telur dengan sedikit minyak di wajan, sisihkan ke tepi.',
        'Tumis irisan bawang dan cabai sampai harum semerbak.',
        'Masukkan nasi putih dingin, aduk cepat dengan api besar agar tidak menggumpal.',
        'Bumbui dengan kecap manis, garam, dan kaldu bubuk.',
        'Aduk rata hingga beraroma wajan sedap (smoky). Angkat dan sajikan.'
      ],
      tips: 'Gunakan nasi yang sudah diinapkan di kulkas semalam untuk tekstur nasi goreng yang tidak lembek.'
    },
    {
      name: 'Sup Sayur Telur Puyuh Hangat',
      description: 'Sup bening berkaldu gurih yang menyejukkan tenggorokan, favorit seluruh anggota keluarga.',
      category: 'dinner',
      prep_time_minutes: 15,
      cook_time_minutes: 20,
      servings: 4,
      difficulty: 'easy',
      ingredients: [
        { name: 'Wortel & Kentang', quantity: '2', unit: 'buah', in_pantry: true },
        { name: 'Telur Puyuh Rebus', quantity: '10', unit: 'butir', in_pantry: true },
        { name: 'Daun Bawang & Seledri', quantity: '2', unit: 'batang', in_pantry: true },
        { name: 'Bawang Putih Goreng', quantity: '1', unit: 'sdm', in_pantry: true }
      ],
      instructions: [
        'Didihkan air kaldu atau air matang dalam panci sedang.',
        'Masukkan potongan kentang dan wortel, masak sampai setengah empuk.',
        'Masukkan bumbu halus bawang putih dan merica bubuk tumis.',
        'Tambahkan telur puyuh rebus dan bumbui garam, gula, serta kaldu.',
        'Sesaat sebelum diangkat, masukkan daun seledri dan taburan bawang goreng.'
      ],
      tips: 'Sangat cocok untuk anak-anak karena kuahnya segar dan telur puyuhnya lezat.'
    }
  ];
}
