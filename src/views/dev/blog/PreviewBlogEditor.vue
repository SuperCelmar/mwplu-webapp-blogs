<template>
  <div>
    <BlogAdminBanner />
    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
      <h1 style="margin-bottom: var(--space-6);">Prévisualisation: Éditeur Blog</h1>
      <BlogEditor :can-publish="canPublish" :metadata="metadata" @open-metadata="openMetadata" @save-draft="handleSaveDraft" @publish="handlePublish" />
      <BlogMetadataModal
        :visible="metadataVisible"
        :categories="categories"
        :tags="tags"
        v-model="metadata"
        @close="metadataVisible = false"
        @validate="handleValidateMeta"
        @save="handleSaveMeta"
      />
    </div>
  
</template>

<script setup>
import BlogEditor from '@/components/blog/BlogEditor.vue'
import BlogMetadataModal from '@/components/blog/BlogMetadataModal.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
import { dbService } from '@/services/supabase'
import { onMounted, ref } from 'vue'
import { useErrorHandler } from '@/services/errorHandler'
import { useRouter } from 'vue-router'

const { showSuccess, showError } = useErrorHandler()
const router = useRouter()

const metadataVisible = ref(false)
const canPublish = ref(false)
const metadata = ref({ title: '', slug: '', excerpt: '', category_id: '', tag_ids: [], cover_image_url: '' })
const categories = ref([])
const tags = ref([])
const lastDraftId = ref(null)

onMounted(async () => {
  // Load taxonomy
  const [cats, tagList] = await Promise.all([
    dbService.getBlogCategories(),
    dbService.getBlogTags(),
  ])
  if (cats.success) categories.value = cats.data
  if (tagList.success) tags.value = tagList.data
})

function openMetadata() {
  metadataVisible.value = true
}

async function handleValidateMeta(meta) {
  try {
    const { success, data, error } = await dbService.validateSEO({
      content: '',
      meta_title: meta.title,
      meta_description: meta.excerpt,
      canonical_url: `/blog/${meta.slug}`,
      target_keywords: [],
    })
    if (!success) throw new Error(error || 'Validation SEO échouée')
    canPublish.value = true
    showSuccess(`Métadonnées validées (Score: ${data?.score ?? '—'})`)
  } catch (err) {
    canPublish.value = false
    showError(`Erreur de validation SEO: ${err.message}`)
  }
}

function handleSaveMeta(meta) {
  // convert modal values into payload
  const payload = {
    meta_title: meta.title,
    meta_description: meta.excerpt,
    canonical_url: meta.slug ? `/blog/${meta.slug}` : null,
    category_id: meta.category_id || null,
    cover_image_url: meta.cover_image_url || null,
    tag_ids: Array.isArray(meta.tag_ids) ? meta.tag_ids : [],
  }

  ;(async () => {
    try {
      if (!lastDraftId.value) {
        const res = await dbService.saveBlogDraft(payload)
        if (!res.success) throw new Error(res.error || 'Enregistrement du brouillon échoué')
        lastDraftId.value = res.data?.id
        if (payload.tag_ids.length) {
          await dbService.setArticleTags(lastDraftId.value, payload.tag_ids)
        }
      } else {
        const res = await dbService.upsertBlogDraft(lastDraftId.value, payload)
        if (!res.success) throw new Error(res.error || 'Mise à jour du brouillon échouée')
        if (payload.tag_ids.length) {
          await dbService.setArticleTags(lastDraftId.value, payload.tag_ids)
        }
      }
    } catch (err) {
      console.error('[Blog] Metadata save error', err)
    }
  })()

  metadata.value = { ...meta }
  metadataVisible.value = false
  // Enable publish after saving required metadata (aligns with UX spec)
  canPublish.value = Boolean(meta.title && meta.slug && meta.category_id)
  showSuccess('Métadonnées enregistrées')
}

async function handleSaveDraft(payload) {
  try {
    const { content } = payload
    console.debug('[Blog] Save draft clicked', { hasContent: Boolean(content), metadata: metadata.value })
    const { success, data, error } = await dbService.saveBlogDraft({
      content,
      meta_title: metadata.value.title || payload.metaTitle,
      meta_description: metadata.value.excerpt || payload.metaDescription,
      canonical_url: metadata.value.slug ? `/blog/${metadata.value.slug}` : payload.canonicalUrl,
      category_id: metadata.value.category_id || null,
      cover_image_url: metadata.value.cover_image_url || null,
    })
    if (!success) throw new Error(error || "L'enregistrement du brouillon a échoué")
    lastDraftId.value = data?.id
    if (metadata.value.tag_ids?.length) {
      await dbService.setArticleTags(lastDraftId.value, metadata.value.tag_ids)
    }
    console.debug('[Blog] Draft saved', { id: data?.id, data })
    // Redirect immediately to dashboard (no blocking overlay)
    router.push({ name: 'dev-blog-dashboard' })
  } catch (err) {
    showError(`Erreur d'enregistrement: ${err.message}`)
    console.error('[Blog] Draft save error', err)
  }
}

async function handlePublish(payload) {
  try {
    if (!canPublish.value) {
      showError('Métadonnées non validées: Validez les métadonnées avant publication')
      return
    }
    // ensure a draft exists first
    if (!lastDraftId.value) {
      const draft = await dbService.saveBlogDraft({
        content: payload.content,
        meta_title: metadata.value.title,
        meta_description: metadata.value.excerpt,
        canonical_url: `/blog/${metadata.value.slug}`,
        category_id: metadata.value.category_id,
        cover_image_url: metadata.value.cover_image_url,
      })
      if (!draft.success) throw new Error(draft.error || 'Draft failed')
      lastDraftId.value = draft.data?.id
      if (metadata.value.tag_ids?.length) {
        await dbService.setArticleTags(lastDraftId.value, metadata.value.tag_ids)
      }
    }

    const res = await dbService.markArticleReady(lastDraftId.value, {
      meta_title: metadata.value.title,
      meta_description: metadata.value.excerpt,
      canonical_url: `/blog/${metadata.value.slug}`,
      category_id: metadata.value.category_id,
      cover_image_url: metadata.value.cover_image_url,
    })
    if (!res.success) throw new Error(res.error || 'Publication échouée')
    showSuccess('Article marqué comme prêt')
    setTimeout(() => {
      router.push({ name: 'dev-blog-dashboard' })
    }, 1000)
  } catch (err) {
    showError(`Erreur de publication: ${err.message}`)
  }
}
</script>



