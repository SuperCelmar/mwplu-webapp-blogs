<template>
  <div class="chat-welcome">
    <div class="chat-welcome__logo">
      <svg
        fill="none"
        height="48"
        viewBox="0 0 48 48"
        width="48"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect fill="#0A0D12" height="48" rx="12" width="48" />
        <path
          clip-rule="evenodd"
          d="m6 24c11.4411 0 18-6.5589 18-18 0 11.4411 6.5589 18 18 18-11.4411 0-18 6.5589-18 18 0-11.4411-6.5589-18-18-18z"
          fill="url(#gradient)"
          fill-rule="evenodd"
        />
        <defs>
          <linearGradient id="gradient" x1="24" x2="24" y1="6" y2="42">
            <stop offset="0" stop-color="#fff" stop-opacity="0.8" />
            <stop offset="1" stop-color="#fff" stop-opacity="0.5" />
          </linearGradient>
        </defs>
      </svg>
    </div>

    <div class="chat-welcome__text">
      <h2 class="chat-welcome__greeting">Bonjour {{ userName }},</h2>
      <h3 class="chat-welcome__title">Comment puis-je vous aider ?</h3>
      <p class="chat-welcome__description">
        Je suis là pour vous aider à comprendre ce PLU. Choisissez une suggestion ci-dessous ou posez votre question !
      </p>
    </div>

    <div class="chat-welcome__prompts">
      <BaseBadge
        v-for="prompt in prompts"
        :key="prompt.id"
        variant="secondary"
        :clickable="true"
        @click="handlePromptClick(prompt.text)"
      >
        <component :is="prompt.icon" :size="14" />
        {{ prompt.label }}
      </BaseBadge>
    </div>
  </div>
</template>

<script setup>
import { FileText, HelpCircle, List, Search, BookOpen, Lightbulb } from 'lucide-vue-next'
import BaseBadge from '@/components/ui/BaseBadge.vue'

defineProps({
  userName: {
    type: String,
    default: 'Utilisateur',
  },
})

const emit = defineEmits(['prompt-selected'])

const prompts = [
  {
    id: 1,
    label: 'Résumer le document',
    text: 'Peux-tu me faire un résumé de ce document PLU ?',
    icon: FileText,
  },
  {
    id: 2,
    label: 'Expliquer les règles',
    text: 'Quelles sont les principales règles de zonage ?',
    icon: BookOpen,
  },
  {
    id: 3,
    label: 'Contraintes',
    text: 'Quelles sont les contraintes de construction dans cette zone ?',
    icon: List,
  },
  {
    id: 4,
    label: 'Rechercher info',
    text: 'Comment puis-je rechercher une information spécifique ?',
    icon: Search,
  },
  {
    id: 5,
    label: 'Questions courantes',
    text: 'Quelles sont les questions fréquemment posées sur ce PLU ?',
    icon: HelpCircle,
  },
  {
    id: 6,
    label: 'Conseils',
    text: 'As-tu des conseils pour mieux comprendre ce PLU ?',
    icon: Lightbulb,
  },
]

const handlePromptClick = (promptText) => {
  emit('prompt-selected', promptText)
}
</script>

<style scoped>
.chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-6);
  padding: var(--space-8) var(--space-6);
  text-align: center;
}

.chat-welcome__logo {
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.chat-welcome__text {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  max-width: 400px;
}

.chat-welcome__greeting {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  margin: 0;
}

.chat-welcome__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  margin: 0;
}

.chat-welcome__description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  line-height: 1.6;
  margin: 0;
}

.chat-welcome__prompts {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  justify-content: center;
  max-width: 500px;
}

@media (max-width: 768px) {
  .chat-welcome {
    padding: var(--space-6) var(--space-4);
  }

  .chat-welcome__greeting {
    font-size: var(--font-size-lg);
  }

  .chat-welcome__title {
    font-size: var(--font-size-md);
  }
}
</style>
