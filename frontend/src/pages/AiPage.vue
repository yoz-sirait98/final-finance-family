<template>
  <div class="ai-page fade-in h-100 d-flex flex-column">
    <!-- Header with Model Switcher Bar -->
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
      <div id="tour-ai-header" class="page-header mb-0">
        <h4 class="mb-1">{{ $t('ai.title') || 'Aurora AI Advisor' }}</h4>
        <p class="text-muted mb-0 small">{{ $t('ai.subtitle') || 'Your personal family finance coach and budget advisor.' }}</p>
      </div>

      <!-- Engine Selector & Settings Quick Link -->
      <div class="d-flex align-items-center gap-2">
        <div class="engine-picker d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill border shadow-sm">
          <i class="bi bi-cpu-fill text-primary"></i>
          <select 
            v-model="selectedEngine" 
            class="form-select form-select-sm border-0 bg-transparent py-0 ps-1 pe-4 fw-semibold text-color-custom"
            style="cursor: pointer; width: auto; max-width: 220px;"
            @change="handleEngineChange"
          >
            <option value="gemini:gemini-flash-lite-latest">⚡ Gemini 2.5 Flash</option>
            <option value="deepseek:deepseek-chat">🧠 DeepSeek V3 (Chat)</option>
            <option value="deepseek:deepseek-reasoner">💭 DeepSeek R1 (Reasoner)</option>
            <option value="groq:openai/gpt-oss-20b">⚡ Groq GPT-OSS 20B</option>
            <option value="groq:qwen/qwen3.6-27b">💭 Groq Qwen 3.6 (Thinking)</option>
            <option value="openrouter:google/gemma-4-31b-it:free">🌐 OpenRouter Hub</option>
          </select>
        </div>
        <button 
          class="btn btn-sm btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center settings-quick-btn" 
          style="width: 36px; height: 36px;" 
          @click="router.push('/settings')"
          title="Configure API Keys"
        >
          <i class="bi bi-gear"></i>
        </button>
      </div>
    </div>

    <!-- API Key Missing State for Active Provider -->
    <div v-if="!hasKeyForActiveEngine" class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="stat-card text-center p-5 border border-primary border-opacity-25" style="max-width: 500px;">
        <div class="ai-pulse-icon mx-auto mb-4">
          <i class="bi bi-stars text-primary fs-1"></i>
        </div>
        <h5 class="fw-bold mb-3">Setup {{ activeProviderName }}</h5>
        <p class="text-muted small mb-4">
          To chat with the <strong>{{ selectedEngineLabel }}</strong> engine, please configure your {{ activeProviderName }} API Key in Settings.
        </p>
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-primary-gradient px-4 rounded-pill" @click="router.push('/settings')">
            <i class="bi bi-gear me-1"></i>Go to Settings
          </button>
          <button v-if="selectedEngine.startsWith('deepseek')" class="btn btn-outline-secondary px-3 rounded-pill" @click="switchEngine('groq:openai/gpt-oss-20b')">
            Try Free Groq
          </button>
        </div>
      </div>
    </div>

    <!-- Active Chat State -->
    <div v-else class="flex-grow-1 d-flex flex-column overflow-hidden glass-chat-container rounded-4 mb-3">
      <!-- Messages List -->
      <div class="flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-3 messages-list" ref="messagesContainer">
        
        <!-- Welcome Message -->
        <div class="message-bubble assistant animate-slide-up">
          <div class="avatar"><i class="bi bi-stars"></i></div>
          <div class="message-content">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <h6 class="fw-bold mb-0">Aurora AI</h6>
              <span class="badge bg-primary bg-opacity-10 text-primary x-small px-2 py-0.5 rounded-pill">{{ selectedEngineLabel }}</span>
            </div>
            <p class="mb-0 small">
              {{ $t('ai.welcome') || 'Hello! I am Aurora, your family finance coach. I can analyze your budgets, spending history, savings goals, and accounts to give you personalized suggestions. How can I help you today?' }}
            </p>
          </div>
        </div>

        <!-- Dynamic Message History -->
        <div 
          v-for="(msg, idx) in chatHistory" 
          :key="idx" 
          class="message-bubble animate-slide-up" 
          :class="msg.sender === 'user' ? 'user align-self-end' : 'assistant'"
        >
          <div v-if="msg.sender === 'assistant'" class="avatar"><i class="bi bi-stars"></i></div>
          <div class="message-content">
            <div class="d-flex align-items-center justify-content-between mb-1">
              <h6 class="fw-bold mb-0">{{ msg.sender === 'user' ? ($t('common.you') || 'You') : 'Aurora AI' }}</h6>
              <span v-if="msg.sender === 'assistant' && msg.modelUsed" class="badge bg-secondary bg-opacity-10 text-muted x-small px-2 py-0.5 rounded-pill">
                {{ formatModelBadge(msg.modelUsed) }}
              </span>
            </div>

            <!-- Expandable Chain of Thought / Reasoning Accordion (DeepSeek-R1 / Qwen / Groq) -->
            <div v-if="msg.reasoning" class="reasoning-container my-2 rounded-3 border">
              <button 
                type="button" 
                class="btn btn-sm reasoning-toggle d-flex align-items-center justify-content-between w-100 px-3 py-2"
                @click="msg.showReasoning = !msg.showReasoning"
              >
                <span class="d-flex align-items-center gap-2 small fw-semibold text-primary">
                  <i class="bi bi-lightbulb-fill text-warning"></i>
                  <span>{{ msg.showReasoning ? ($t('ai.hideThinking') || 'Hide Thinking Process') : ($t('ai.showThinking') || '💭 View Thinking & Mathematical Logic') }}</span>
                </span>
                <i class="bi" :class="msg.showReasoning ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </button>
              <div v-if="msg.showReasoning" class="reasoning-body p-3 pt-1 border-top">
                <div class="reasoning-content small" v-html="formatMessage(msg.reasoning)"></div>
              </div>
            </div>

            <!-- Formatted Final Answer Content -->
            <div class="mb-0 small" v-html="formatMessage(msg.text)"></div>
          </div>
        </div>

        <!-- Loading / Typing Indicator -->
        <div v-if="loading" class="message-bubble assistant loading-state animate-fade-in">
          <div class="avatar"><i class="bi bi-stars spinner-glowing"></i></div>
          <div class="message-content">
            <div class="d-flex align-items-center gap-2 mb-1">
              <h6 class="fw-bold mb-0">Aurora AI</h6>
              <span class="text-muted x-small">Thinking with {{ selectedEngineLabel }}...</span>
            </div>
            <div class="typing-dots d-flex gap-1 py-1">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick suggestions -->
      <div v-if="chatHistory.length === 0" class="suggestions-bar px-4 py-3 d-flex flex-wrap gap-2">
        <button 
          v-for="(sug, idx) in suggestions" 
          :key="idx" 
          class="btn btn-sm suggestion-btn rounded-pill px-3 py-1.5"
          @click="useSuggestion(sug)"
        >
          {{ sug }}
        </button>
      </div>

      <!-- Chat Input -->
      <div class="chat-input-bar p-3">
        <form @submit.prevent="sendMessage" class="d-flex gap-2">
          <input 
            v-model="userInput" 
            type="text" 
            class="form-control rounded-pill px-4 chat-input-field" 
            :placeholder="`Ask AI Coach (${selectedEngineLabel})...`"
            required
            :disabled="loading"
          />
          <button type="submit" class="btn btn-primary-gradient rounded-circle d-flex align-items-center justify-content-center send-btn" style="width: 42px; height: 42px;" :disabled="loading || !userInput.trim()">
            <i class="bi bi-send-fill"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useTour } from '../composables/useTour';
import { aiTourSteps } from '../tours/aiTour';

const { startAutoTour, startTour } = useTour('ai');
const handleTour = () => startTour(aiTourSteps);

import { ref, computed, nextTick, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../stores/locale';
import { aiService } from '../services/aiService';

const router = useRouter();
const localeStore = useLocaleStore();

// Engine & Provider selection
const savedProvider = localStorage.getItem('ai_provider') || 'gemini';
const savedModel = localStorage.getItem('ai_model') || 'gemini-flash-lite-latest';
const selectedEngine = ref(`${savedProvider}:${savedModel}`);

const activeProvider = computed(() => selectedEngine.value.split(':')[0] || 'gemini');

const activeProviderName = computed(() => {
  const p = activeProvider.value;
  if (p === 'deepseek') return 'DeepSeek';
  if (p === 'groq') return 'Groq';
  if (p === 'openrouter') return 'OpenRouter';
  return 'Google Gemini';
});

const selectedEngineLabel = computed(() => {
  const [provider, model] = selectedEngine.value.split(':');
  if (provider === 'deepseek') return model.includes('reasoner') ? 'DeepSeek-R1' : 'DeepSeek-V3';
  if (provider === 'groq') return model.includes('qwen') ? 'Groq Qwen 3.6' : 'Groq GPT-OSS';
  if (provider === 'openrouter') return 'OpenRouter';
  return 'Gemini Flash';
});

const hasKeyForActiveEngine = computed(() => {
  const provider = activeProvider.value;
  if (provider === 'gemini') return !!(localStorage.getItem('gemini_api_key') || import.meta.env.VITE_GEMINI_API_KEY);
  if (provider === 'deepseek') return !!(localStorage.getItem('deepseek_api_key') || import.meta.env.VITE_DEEPSEEK_API_KEY);
  if (provider === 'groq') return !!(localStorage.getItem('groq_api_key') || import.meta.env.VITE_GROQ_API_KEY);
  if (provider === 'openrouter') return !!(localStorage.getItem('openrouter_api_key') || import.meta.env.VITE_OPENROUTER_API_KEY);
  return true;
});

function handleEngineChange() {
  const [provider, model] = selectedEngine.value.split(':');
  localStorage.setItem('ai_provider', provider);
  localStorage.setItem('ai_model', model);
}

function switchEngine(engineKey) {
  selectedEngine.value = engineKey;
  handleEngineChange();
}

function formatModelBadge(modelName) {
  if (!modelName) return 'AI';
  if (modelName.includes('reasoner') || modelName.includes('r1')) return 'DeepSeek-R1';
  if (modelName.includes('deepseek-chat') || modelName.includes('v3')) return 'DeepSeek-V3';
  if (modelName.includes('qwen')) return 'Qwen 3.6';
  if (modelName.includes('gpt-oss')) return 'GPT-OSS';
  if (modelName.includes('gemini')) return 'Gemini Flash';
  return modelName;
}

const userInput = ref('');
const loading = ref(false);
const chatHistory = ref([]);
const messagesContainer = ref(null);

const suggestions = computed(() => {
  if (localeStore.currentLocale === 'id') {
    return [
      'Bagaimana penggunaan anggaran saya bulan ini?',
      'Berikan 3 tips menabung berdasarkan spending log',
      'Analisis ringkasan aset bersih keluarga saya'
    ];
  }
  return [
    'How is my budget utilization doing?',
    'Give me 3 savings tips based on transactions',
    'Analyze my family net worth summary'
  ];
});

function useSuggestion(sugText) {
  userInput.value = sugText;
  sendMessage();
}

async function sendMessage() {
  if (!userInput.value.trim() || loading.value) return;

  const text = userInput.value;
  userInput.value = '';

  const [provider, model] = selectedEngine.value.split(':');

  // 1. Add user message to history
  chatHistory.value.push({ sender: 'user', text });
  scrollToBottom();

  loading.value = true;
  try {
    // 2. Query AI Coach with selected provider & model
    const result = await aiService.chatWithCoach(
      chatHistory.value, 
      localeStore.currentLocale,
      { provider, model }
    );
    
    // 3. Add AI response to history (including reasoning if provided)
    chatHistory.value.push({ 
      sender: 'assistant', 
      text: result.reply,
      reasoning: result.reasoning,
      showReasoning: false,
      modelUsed: result.modelUsed,
      provider: result.provider
    });
  } catch (error) {
    const errorStr = error.message.toLowerCase();
    const isInsufficientBalance = errorStr.includes('insufficient balance');
    const isRateLimit = errorStr.includes('429') || errorStr.includes('rate limit') || errorStr.includes('quota');

    let advice = 'Please verify your API Key in Settings.';
    if (isInsufficientBalance) {
      advice = localeStore.t('ai.insufficientBalance') || 'DeepSeek balance is 0. Please top up at platform.deepseek.com or switch to Groq / Gemini in Settings.';
    } else if (isRateLimit) {
      advice = 'Temporary rate limit reached. Please try again in a few moments or switch to another model.';
    }

    chatHistory.value.push({ 
      sender: 'assistant', 
      text: `Error (${selectedEngineLabel.value}): ${error.message}. ${advice}` 
    });
  } finally {
    loading.value = false;
    scrollToBottom();
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
}

/**
 * Super lightweight markdown parser for clean chat formatting
 */
function formatMessage(text) {
  if (!text) return '';
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text**)
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  
  // Bullet points (- item)
  html = html.replace(/^\s*-\s+(.*?)$/gm, '<li>$1</li>');
  // Wrap sequential list items
  html = html.replace(/(<li>.*?<\/li>)/gs, '<ul>$1</ul>');
  // Clean duplicate <ul> wraps
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // Line breaks
  html = html.replace(/\n/g, '<br />');

  return html;
}

onMounted(() => {
  startAutoTour(aiTourSteps);
  window.addEventListener('start-ai-tour', handleTour);

  scrollToBottom();
});

onUnmounted(() => {
  window.removeEventListener('start-ai-tour', handleTour);
});
</script>

<style scoped>
.glass-chat-container {
  background: var(--card-bg);
  border: var(--card-border);
  box-shadow: var(--card-shadow);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Custom Themed Scrollbar */
.messages-list {
  scroll-behavior: smooth;
}
.messages-list::-webkit-scrollbar {
  width: 6px;
}
.messages-list::-webkit-scrollbar-track {
  background: transparent;
}
.messages-list::-webkit-scrollbar-thumb {
  background: var(--input-border);
  border-radius: 3px;
}
.messages-list::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.message-bubble {
  max-width: 80%;
  display: flex;
  gap: 12px;
}

.message-bubble.user {
  flex-direction: row-reverse;
}

.message-bubble .avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-gradient);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 10px rgba(138, 43, 226, 0.25);
}

.message-bubble.user .avatar {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-color);
  box-shadow: none;
}

.message-bubble .message-content {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  border-radius: 16px;
  padding: 12px 16px;
  color: var(--text-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);
}

[data-theme="dark"] .message-bubble .message-content {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.message-bubble.user .message-content {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.12), rgba(118, 75, 162, 0.08));
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.05);
}

[data-theme="dark"] .message-bubble.user .message-content {
  background: linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(74, 108, 247, 0.1));
  border-color: rgba(138, 43, 226, 0.25);
  box-shadow: 0 4px 12px rgba(138, 43, 226, 0.1);
}

.suggestions-bar {
  border-top: 1px solid var(--input-border);
  background: rgba(0, 0, 0, 0.01);
}

[data-theme="dark"] .suggestions-bar {
  background: rgba(0, 0, 0, 0.1);
}

.suggestion-btn {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-color);
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 0.8rem;
}

.suggestion-btn:hover {
  background: var(--primary-color);
  color: #ffffff;
  border-color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(102, 126, 234, 0.25);
}

.chat-input-bar {
  border-top: 1px solid var(--input-border);
  background: rgba(0, 0, 0, 0.02);
}

[data-theme="dark"] .chat-input-bar {
  background: rgba(0, 0, 0, 0.15);
}

.chat-input-field {
  background: var(--input-bg);
  border: 1px solid var(--input-border);
  color: var(--text-color);
  transition: all 0.25s ease;
}

.chat-input-field:focus {
  background: var(--input-bg);
  outline: none;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.25);
  border-color: var(--primary-color);
}

.chat-input-field::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.send-btn {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.08) rotate(-5deg);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.35);
}

.ai-pulse-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(138, 43, 226, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-glowing 2s infinite;
}

@keyframes pulse-glowing {
  0% {
    box-shadow: 0 0 0 0 rgba(138, 43, 226, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(138, 43, 226, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(138, 43, 226, 0);
  }
}

.spinner-glowing {
  animation: spin-glowing 2s linear infinite;
}

@keyframes spin-glowing {
  100% {
    transform: rotate(360deg);
  }
}

/* Typing Dots Animation */
.typing-dots span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-color);
  opacity: 0.4;
  display: inline-block;
  animation: typing-bounce 1.4s infinite ease-in-out both;
}

.typing-dots span:nth-child(1) {
  animation-delay: -0.32s;
  background: var(--primary-color);
}
.typing-dots span:nth-child(2) {
  animation-delay: -0.16s;
  background: var(--primary-hover);
}
.typing-dots span:nth-child(3) {
  background: var(--primary-color);
}

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

/* Slide up and fade-in animations for message bubbles */
.animate-slide-up {
  animation: slide-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.engine-picker {
  background: var(--card-bg);
  border-color: var(--card-border);
}

.text-color-custom {
  color: var(--text-color);
}

.reasoning-container {
  background: rgba(0, 0, 0, 0.02);
  border-color: var(--input-border) !important;
  overflow: hidden;
}

[data-theme="dark"] .reasoning-container {
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08) !important;
}

.reasoning-toggle {
  background: transparent;
  border: none;
  color: var(--text-color);
  font-size: 0.82rem;
  transition: background 0.2s ease;
}

.reasoning-toggle:hover {
  background: rgba(102, 126, 234, 0.08);
}

.reasoning-body {
  border-top-color: var(--input-border) !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.8rem;
  line-height: 1.5;
  color: var(--text-muted);
}

[data-theme="dark"] .reasoning-body {
  border-top-color: rgba(255, 255, 255, 0.08) !important;
  background: rgba(0, 0, 0, 0.2);
}

.settings-quick-btn {
  border-color: var(--input-border);
  color: var(--text-color);
}

.settings-quick-btn:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.x-small {
  font-size: 0.72rem;
}
</style>
