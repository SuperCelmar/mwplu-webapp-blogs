<template>
  <div class="preview-carousel" data-test="carousel">
    <div class="carousel-header">
      <div class="dots" role="tablist" aria-label="Prévisualisations">
        <button
          v-for="(name, idx) in slideNames"
          :key="name"
          class="dot"
          :class="{ active: currentIndex === idx }"
          :aria-label="`Aller à ${name}`"
          :aria-selected="currentIndex === idx"
          role="tab"
          :data-test="`dot-${idx}`"
          @click="goTo(idx)"
        />
      </div>
      <div class="actions">
        <button v-if="currentIndex === 2" class="nav" :aria-label="'Basculer thème SERP'" data-test="serp-theme-toggle" @click="toggleSerpTheme">SERP</button>
        <button class="nav" :aria-label="'Précédent'" data-test="prev" @click="prev">‹</button>
        <button class="nav" :aria-label="'Suivant'" data-test="next" @click="next">›</button>
      </div>
    </div>

    <div class="slides" @keydown.left.prevent="prev" @keydown.right.prevent="next" tabindex="0">
      <!-- 1. Article Page Preview -->
      <section
        class="slide"
        :class="{ active: currentIndex === 0 }"
        data-test="slide-article"
        :aria-hidden="currentIndex !== 0"
      >
        <div class="article-card">
          <div v-if="imageUrl" class="article-cover" :style="{ backgroundImage: `url(${imageUrl})` }" />
          <div class="article-body">
            <h1 class="article-title">{{ titleText }}</h1>
            <div class="article-content" v-html="renderedHtml"></div>
          </div>
        </div>
      </section>

      <!-- 2. Listing Row Preview -->
      <section
        class="slide"
        :class="{ active: currentIndex === 1 }"
        data-test="slide-listing"
        :aria-hidden="currentIndex !== 1"
      >
        <div class="listing-row" role="link" tabindex="0" aria-label="Aperçu tuile d'article cliquable">
          <div class="thumb" :class="{ empty: !imageUrl }" :style="imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}" />
          <div class="listing-text">
            <h3 class="listing-title" :title="titleText">{{ truncated(titleText, 90) }}</h3>
            <p class="listing-excerpt" :title="excerptText">{{ truncated(excerptText, 140) }}</p>
          </div>
        </div>
      </section>

      <!-- 3. SEO (Google) Snippet Preview -->
      <section
        class="slide"
        :class="{ active: currentIndex === 2 }"
        data-test="slide-serp"
        :aria-hidden="currentIndex !== 2"
      >
        <div class="serp" :class="{ 'serp-dark': serpDark }" aria-label="Aperçu Google (SERP)">
          <a class="serp-title" href="#" tabindex="-1">{{ serpTitle }}</a>
          <div class="serp-url">{{ serpUrl }}</div>
          <div class="serp-desc">{{ truncated(serpDescription, 160) }}</div>
        </div>
      </section>

      <!-- 4. X/Twitter Card Preview -->
      <section
        class="slide"
        :class="{ active: currentIndex === 3 }"
        data-test="slide-twitter"
        :aria-hidden="currentIndex !== 3"
      >
        <article class="twitter-card" aria-label="Aperçu X / Twitter card">
          <div class="tc-image" :class="{ empty: !cardImage }" :style="cardImage ? { backgroundImage: `url(${cardImage})` } : {}" />
          <div class="tc-body">
            <div class="tc-handle">@mwplu</div>
            <div class="tc-title">{{ truncated(cardTitle, 100) }}</div>
            <div class="tc-desc">{{ truncated(cardDescription, 140) }}</div>
          </div>
        </article>
      </section>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  article: { type: Object, default: () => ({}) },
})

const currentIndex = ref(0)
const slideNames = ['Article', 'Listing', 'SEO', 'X/Twitter']
const serpDark = ref(false)

function goTo(i) {
  currentIndex.value = (i + slideNames.length) % slideNames.length
}
function next() { goTo(currentIndex.value + 1) }
function prev() { goTo(currentIndex.value - 1) }
function toggleSerpTheme() { serpDark.value = !serpDark.value }

const titleText = computed(() => props.article.meta_title || props.article.title || 'Sans titre')
const excerptText = computed(() => props.article.excerpt || 'Aucun extrait')
const contentText = computed(() => props.article.content || '')

// Lightweight markdown-like rendering without extra deps (very limited)
const renderedHtml = computed(() => {
  const src = contentText.value || ''
  // Convert headings (# ) to bold line
  let html = src
    .replace(/^#\s+(.+)$/gm, '<strong>$1</strong>')
    .replace(/^##\s+(.+)$/gm, '<strong>$1</strong>')
  // Bold **text**
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
  // Italic _text_ or *text*
  html = html.replace(/_(.*?)_/g, '<em>$1</em>').replace(/\*(.*?)\*/g, '<em>$1</em>')
  // New lines to paragraphs
  html = html
    .split(/\n\n+/)
    .map(p => `<p>${p.replace(/\n/g, '<br/>')}</p>`) 
    .join('')
  return html
})
const imageUrl = computed(() => props.article.cover_image_url || '')

const origin = typeof window !== 'undefined' && window.location?.origin ? window.location.origin : ''
const slug = computed(() => props.article.slug || 'aperçu-article')
const serpTitle = computed(() => props.article.meta_title || props.article.title || 'Sans titre')
const serpDescription = computed(() => props.article.meta_description || props.article.excerpt || 'Aucune description SEO')
const serpUrl = computed(() => `${origin}/blog/${slug.value}`)

const cardImage = computed(() => props.article.twitter_image_url || props.article.og_image_url || props.article.cover_image_url || '')
const cardTitle = computed(() => props.article.twitter_title || props.article.og_title || props.article.title || 'Sans titre')
const cardDescription = computed(() => props.article.twitter_description || props.article.og_description || props.article.excerpt || 'Aucune description')

function truncated(text, max) {
  if (!text) return ''
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}
</script>

<style scoped>
.preview-carousel { background: var(--color-white); color: var(--color-black); border: 1px solid var(--border-gray); border-radius: var(--radius-card); box-shadow: var(--shadow-sm); }
.carousel-header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--border-gray); }
.dots { display: inline-flex; gap: 6px; }
.dot { width: 8px; height: 8px; border-radius: 999px; background: var(--accent-gray); border: 1px solid var(--border-gray); cursor: pointer; }
.dot.active { background: var(--color-black); }
.actions { display: inline-flex; gap: var(--space-2); }
.nav { background: transparent; border: 1px solid var(--border-gray); border-radius: var(--radius-button); padding: 4px 8px; cursor: pointer; }

.slides { padding: var(--space-4); outline: none; }
.slide { display: none; }
.slide.active { display: block; }

/* Article Page Preview */
.article-card { border: 1px solid var(--border-gray); border-radius: var(--radius-card); overflow: hidden; }
.article-cover { background-size: cover; background-position: center; height: 140px; }
.article-body { padding: var(--space-4); }
.article-title { font-size: var(--font-size-2xl); margin: 0 0 var(--space-3) 0; }
.article-content { color: var(--color-gray-700); white-space: pre-wrap; }

/* Listing Row Preview */
.listing-row { display: grid; grid-template-columns: 120px 1fr; gap: var(--space-4); align-items: start; border: 1px solid var(--border-gray); border-radius: var(--radius-card); padding: var(--space-3); cursor: pointer; transition: background var(--transition-base), transform var(--transition-base), box-shadow var(--transition-base); }
.listing-row:hover { background: var(--color-gray-50); box-shadow: var(--shadow-sm); transform: translateY(-1px); }
.thumb { width: 120px; height: 80px; background-size: cover; background-position: center; border-radius: 6px; border: 1px solid var(--border-gray); }
.thumb.empty { background: var(--accent-gray); }
.listing-title { margin: 0 0 6px 0; font-size: var(--font-size-xl); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.listing-excerpt { margin: 0; color: var(--color-gray-700); overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }

/* SERP Preview (Google-like cues) */
.serp { max-width: 640px; font-family: Arial, Helvetica, sans-serif; }
.serp-title { color: var(--color-blue); text-decoration: none; font-size: 18px; display: inline-block; margin-bottom: 4px; line-height: 1.3; }
.serp-url { color: #202124; opacity: 0.75; font-size: 12px; margin-bottom: 6px; }
.serp-desc { color: #4d5156; line-height: 1.58; font-size: 14px; }
.serp.serp-dark { background: #202124; padding: 10px; border-radius: 8px; }
.serp.serp-dark .serp-title { color: #8ab4f8; }
.serp.serp-dark .serp-url { color: #bdc1c6; opacity: 1; }
.serp.serp-dark .serp-desc { color: #bdc1c6; }

/* Twitter Card Preview (X-like cues) */
.twitter-card { border: 1px solid var(--border-gray); border-radius: 12px; overflow: hidden; max-width: 520px; background: var(--color-white); }
.tc-image { background-size: cover; background-position: center; height: 260px; border-bottom: 1px solid var(--border-gray); }
.tc-image.empty { background: var(--accent-gray); }
.tc-body { padding: 12px; font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; }
.tc-handle { color: var(--color-gray-600); font-size: 13px; margin-bottom: 6px; }
.tc-title { font-weight: 600; margin-bottom: 6px; line-height: 1.35; font-size: 15px; }
.tc-desc { color: var(--color-gray-700); line-height: 1.5; font-size: 14px; }
</style>
