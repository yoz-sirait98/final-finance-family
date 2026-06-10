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
    <div v-else class="flex-grow-1 d-flex flex-column overflow-hidden glass-chat-container rounded-4 border border-white border-opacity-10 mb-3">
      <!-- Messages List -->
      <div class="flex-grow-1 overflow-y-auto p-4 d-flex flex-column gap-3 messages-list" ref="messagesContainer">
        
        <!-- Welcome Message -->
        <div class="message-bubble assistant">
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
          class="message-bubble" 
          :class="msg.sender === 'user' ? 'user align-self-end' : 'assistant'"
        >
          <div v-if="msg.sender === 'assistant'" class="avatar"><i class="bi bi-stars"></i></div>
          <div class="message-content">
            <h6 class="fw-bold mb-1">{{ msg.sender === 'user' ? ($t('common.you') || 'You') : 'Aurora AI' }}</h6>
            <div class="mb-0 small" v-html="formatMessage(msg.text)"></div>
          </div>
        </div>

        <!-- Loading / Typing Indicator -->
        <div v-if="loading" class="message-bubble assistant loading-state">
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
      <div v-if="chatHistory.length === 0" class="suggestions-bar px-4 py-2 border-top border-white border-opacity-10 d-flex flex-wrap gap-2">
        <button 
          v-for="(sug, idx) in suggestions" 
          :key="idx" 
          class="btn btn-sm btn-outline-light border-white border-opacity-10 rounded-pill"
          @click="useSuggestion(sug)"
        >
          {{ sug }}
        </button>
      </div>

      <!-- Chat Input -->
      <div class="chat-input-bar p-3 border-top border-white border-opacity-10 bg-black bg-opacity-20">
        <form @submit.prevent="sendMessage" class="d-flex gap-2">
          <input 
            v-model="userInput" 
            type="text" 
            class="form-control rounded-pill border-0 px-4 bg-white bg-opacity-10 text-white chat-input-field" 
            placeholder="Ask AI Advisor about your family budgets..."
            required
            :disabled="loading"
          />
          <button type="submit" class="btn btn-primary-gradient rounded-circle d-flex align-items-center justify-content-center" style="width: 42px; height: 42px;" :disabled="loading || !userInput.trim()">
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
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(12px);
}

.messages-list {
  scroll-behavior: smooth;
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
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 0 10px rgba(111, 66, 193, 0.3);
}

.message-bubble.user .avatar {
  background: rgba(255,255,255,0.1);
  box-shadow: none;
}

.message-bubble .message-content {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 12px 16px;
  color: var(--text-color);
  box-shadow: 0 4px 6px rgba(0,0,0,0.05);
}

.message-bubble.user .message-content {
  background: linear-gradient(135deg, rgba(111, 66, 193, 0.15), rgba(0, 123, 255, 0.1));
  border: 1px solid rgba(111, 66, 193, 0.25);
  border-radius: 16px;
}

.ai-pulse-icon {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: rgba(111, 66, 193, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse-glowing 2s infinite;
}

@keyframes pulse-glowing {
  0% {
    box-shadow: 0 0 0 0 rgba(111, 66, 193, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(111, 66, 193, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(111, 66, 193, 0);
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

.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1.0); }
}

.chat-input-field:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(111, 66, 193, 0.25);
  background: rgba(255,255,255,0.15);
}
</style>
