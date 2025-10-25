<template>
  <div class="chat-welcome">
    <div class="welcome-icon">
      <Sparkles :size="48" />
    </div>

    <div class="welcome-content">
      <h2 class="welcome-title">Bonjour {{ userName }} !</h2>
      <h3 class="welcome-subtitle">Comment puis-je vous aider ?</h3>
      <p class="welcome-description">
        Je suis là pour vous aider à comprendre les règles d'urbanisme. Choisissez parmi les suggestions ci-dessous ou posez votre propre question !
      </p>
    </div>

    <div class="quick-prompts">
      <Badge
        v-for="prompt in quickPrompts"
        :key="prompt.id"
        variant="secondary"
        size="md"
        @click="handlePromptClick(prompt.text)"
      >
        <component :is="prompt.icon" :size="16" :class="`icon-${prompt.color}`" />
        {{ prompt.label }}
      </Badge>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Sparkles, Ruler, Building2, MapPin, TreePine, ParkingCircle, Maximize } from 'lucide-vue-next'
import Badge from '@/components/ui/Badge.vue'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['prompt-selected'])

const authStore = useAuthStore()

const userName = computed(() => {
  if (authStore.user?.user_metadata?.full_name) {
    return authStore.user.user_metadata.full_name.split(' ')[0]
  }
  return 'Utilisateur'
})

const quickPrompts = [
  {
    id: 'rules',
    label: 'Règles de construction',
    text: 'Quelles sont les principales règles de construction dans cette zone ?',
    icon: Building2,
    color: 'blue',
  },
  {
    id: 'height',
    label: 'Limites de hauteur',
    text: 'Quelles sont les limites de hauteur pour les constructions ?',
    icon: Ruler,
    color: 'orange',
  },
  {
    id: 'cos',
    label: 'Calculer le COS',
    text: 'Comment calculer le coefficient d\'occupation des sols (COS) ?',
    icon: Maximize,
    color: 'green',
  },
  {
    id: 'setback',
    label: 'Reculs obligatoires',
    text: 'Quels sont les reculs obligatoires par rapport aux limites ?',
    icon: MapPin,
    color: 'pink',
  },
  {
    id: 'environmental',
    label: 'Contraintes environnementales',
    text: 'Quelles sont les contraintes environnementales à respecter ?',
    icon: TreePine,
    color: 'teal',
  },
  {
    id: 'parking',
    label: 'Stationnement',
    text: 'Quelles sont les exigences en matière de stationnement ?',
    icon: ParkingCircle,
    color: 'yellow',
  },
]

const handlePromptClick = (text) => {
  emit('prompt-selected', text)
}
</script>

<style scoped>
.chat-welcome {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-6);
  text-align: center;
  gap: var(--space-6);
}

.welcome-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-gray-100) 0%, var(--color-gray-200) 100%);
  border-radius: 50%;
  color: var(--color-black);
}

.welcome-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.welcome-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-600);
  margin: 0;
}

.welcome-subtitle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  margin: 0;
}

.welcome-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  line-height: 1.5;
  max-width: 400px;
  margin: 0 auto;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  max-width: 500px;
}

.icon-blue {
  color: #3b82f6;
}

.icon-orange {
  color: #f97316;
}

.icon-green {
  color: #10b981;
}

.icon-pink {
  color: #ec4899;
}

.icon-teal {
  color: #14b8a6;
}

.icon-yellow {
  color: #eab308;
}

@media (max-width: 768px) {
  .chat-welcome {
    padding: var(--space-4);
    gap: var(--space-4);
  }

  .welcome-icon {
    width: 60px;
    height: 60px;
  }

  .welcome-icon :deep(svg) {
    width: 36px;
    height: 36px;
  }

  .welcome-title {
    font-size: var(--font-size-lg);
  }

  .welcome-subtitle {
    font-size: var(--font-size-md);
  }

  .welcome-description {
    font-size: var(--font-size-xs);
  }
}
</style>
