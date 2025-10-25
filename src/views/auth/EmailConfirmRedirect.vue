<template>
  <AppLayout :show-container="false" :padded="false" full-height>
    <div class="auth-page-wrapper">
      <div class="auth-container card">
        <div class="auth-header">
          <h2 class="auth-title">Vérification de l'email…</h2>
        </div>

        <div class="redirect-card">
          <BaseSpinner size="small" />
          <p class="redirect-text">Redirection en cours, veuillez patienter…</p>
          <p v-if="errorMessage" class="alert alert-error">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppLayout from '@/components/layout/AppLayout.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'

const route = useRoute()
const router = useRouter()
const errorMessage = ref('')

onMounted(async () => {
  try {
    const rawParam = route.query.confirmation_url || ''
    if (!rawParam) {
      errorMessage.value = "Lien de confirmation manquant."
      await router.replace({ name: 'confirmation' })
      return
    }

    // Some providers/email clients may wrap/encode line breaks or prepend '=?UTF-8?'
    // Normalize by removing stray whitespaces and decoding once
    const normalized = String(rawParam).toString().trim()
    let decoded = ''
    try {
      decoded = decodeURIComponent(normalized)
    } catch {
      decoded = normalized
    }

    // Remove any leading '=' introduced by quoted-printable encoding
    while (decoded.startsWith('=')) {
      decoded = decoded.slice(1)
    }

    // Some clients double-encode. Try a second decode safely.
    try {
      decoded = decodeURIComponent(decoded)
    } catch {
      // ignore
    }

    // Safety: ensure it points to Supabase verify endpoint with required params
    const url = new URL(decoded)
    const isVerify = /\/auth\/v1\/verify$/.test(url.pathname)
    const hasToken = !!url.searchParams.get('token')
    const hasType = !!url.searchParams.get('type')

    if (!isVerify || !hasToken || !hasType) {
      errorMessage.value = "Lien de confirmation invalide."
      await router.replace({ name: 'confirmation' })
      return
    }

    // If no redirect_to is present, fall back to home
    if (!url.searchParams.get('redirect_to')) {
      url.searchParams.set('redirect_to', `${window.location.origin}/dashboard`)
    }

    window.location.replace(url.toString())
  } catch (e) {
    console.error('Email confirmation redirect error:', e)
    errorMessage.value = "Impossible de traiter le lien de confirmation."
    await router.replace({ name: 'confirmation' })
  }
})
</script>

<style scoped>
.auth-page-wrapper {
  min-height: 50vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-container {
  width: 100%;
  max-width: 420px;
  padding: var(--space-8);
  background: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-md);
}

.auth-header {
  text-align: center;
  margin-bottom: var(--space-4);
}

.auth-title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.redirect-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
}

.redirect-text {
  color: var(--color-gray-700);
  font-size: var(--font-size-sm);
}

.alert.alert-error {
  color: var(--color-error);
}
</style>
