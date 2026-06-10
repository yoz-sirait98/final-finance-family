<template>
  <div class="ai-page fade-in h-100 d-flex flex-column">
    <div class="page-header mb-3">
      <h4>{{ $t('ai.title') || 'Aurora AI Advisor' }}</h4>
      <p class="text-muted mb-0">{{ $t('ai.subtitle') || 'Your personal family finance coach and budget advisor.' }}</p>
    </div>

    <!-- API Key Missing State -->
    <div v-if="!hasApiKey" class="flex-grow-1 d-flex align-items-center justify-content-center">
      <div class="stat-card text-center p-5 border border-primary border-opacity-25" style="max-width: 500px;">
        <div class="ai-pulse-icon mx-auto mb-4">
          <i class="bi bi-stars text-primary fs-1"></i>
        </div>
        <h5 class="fw-bold mb-3">Setup Aurora AI Coach</h5>
        <p class="text-muted small mb-4">
          To chat with your financial advisor, please configure your free Gemini API Key in the Settings page. This key stays locally in your browser.
        </p>
        <button class="btn btn-primary-gradient px-4 rounded-pill" @click="router.push('/settings')">
          <i class="bi bi-gear me-1"></i>Go to Settings
        </button>
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
            <h6 class="fw-bold mb-1">Aurora AI</h6>
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
            <h6 class="fw-bold mb-1">{{ msg.sender === 'user' ? ($t('common.you') || 'You') : 'Aurora AI' }}</h6>
            <div class="mb-0 small" v-html="formatMessage(msg.text)"></div>
          </div>
        </div>

        <!-- Loading / Typing Indicator -->
        <div v-if="loading" class="message-bubble assistant loading-state animate-fade-in">
          <div class="avatar"><i class="bi bi-stars spinner-glowing"></i></div>
          <div class="message-content">
            <h6 class="fw-bold mb-1">Aurora AI</h6>
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
            placeholder="Ask AI Advisor about your family budgets..."
            required
            :disabled="loading"
          />
          <button type="submit" class="btn btn-primary-gradient rounded-circle d-flex align-items-center justify-content-center send-btn" style="width: 42px; height: 42px;" :disabled="loading || !userInput.trim()">
            <i class="bi bi-send-fill fs-5 text-white"></i>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useLocaleStore } from '../stores/locale';
import { aiService } from '../services/aiService';

const router = useRouter();
const localeStore = useLocaleStore();

const hasApiKey = ref(!!localStorage.getItem('gemini_api_key'));
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

  // 1. Add user message to history
  chatHistory.value.push({ sender: 'user', text });
  scrollToBottom();

  loading.value = true;
  try {
    // 2. Query Gemini AI Coach
    const response = await aiService.chatWithCoach(chatHistory.value, localeStore.currentLocale);
    
    // 3. Add AI response to history
    chatHistory.value.push({ sender: 'assistant', text: response });
  } catch (error) {
    chatHistory.value.push({ 
      sender: 'assistant', 
      text: `Failed to connect with Gemini: ${error.message}. Please verify your API Key in Settings.` 
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
  scrollToBottom();
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

.animate-fade-in {
  animation: fade-in 0.3s ease both;
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
