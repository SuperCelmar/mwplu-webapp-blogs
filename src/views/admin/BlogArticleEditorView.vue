<template>
  <div>
    <BlogAdminBanner />
    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
    <h1 style="margin-bottom: var(--space-6);">Éditeur d’article</h1>
    <BlogEditor :can-publish="canPublish" :metadata="metadata" :initial-content="initialContent" :action-label="actionLabel" @open-metadata="openMetadata" @save-draft="handleSaveDraft" @publish="handlePrimaryAction" />
    <BlogMetadataModal
      :visible="metadataVisible"
      :categories="categories"
      :tags="tags"
      v-model="metadata"
      @close="metadataVisible = false"
      @validate="handleValidateMeta"
      @save="handleSaveMeta"
    />
    <BlogScheduleModal
      :visible="scheduleVisible"
      @close="scheduleVisible = false"
      @save="handleScheduleSave"
    />
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BlogEditor from '@/components/blog/BlogEditor.vue'
import BlogMetadataModal from '@/components/blog/BlogMetadataModal.vue'
import BlogScheduleModal from '@/components/blog/BlogScheduleModal.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
import { dbService } from '@/services/supabase'
import { useErrorHandler } from '@/services/errorHandler'

const route = useRoute()
const router = useRouter()
const { showSuccess, showError } = useErrorHandler()

const articleId = ref(route.params.id)
const metadataVisible = ref(false)
const scheduleVisible = ref(false)
const canPublish = ref(false)
const metadata = ref({ title: '', slug: '', excerpt: '', category_id: '', tag_ids: [], cover_image_url: '' })
const categories = ref([])
const tags = ref([])
const initialContent = ref('')
const actionLabel = ref('Enregistrer l’article')
const status = ref('draft')

onMounted(async () => {
  // load taxonomy
  const [cats, tagList] = await Promise.all([
    dbService.getBlogCategories(),
    dbService.getBlogTags(),
  ])
  if (cats.success) categories.value = cats.data
  if (tagList.success) tags.value = tagList.data

  // load article
  const res = await dbService.getBlogArticleById(String(articleId.value))
  if (!res.success || !res.data) {
    showError("Article introuvable")
    router.push({ name: 'admin-blog' })
    return
  }
  const a = res.data
  status.value = a.status || 'draft'
  metadata.value = {
    title: a.meta_title || a.title || '',
    slug: a.slug || '',
    excerpt: a.meta_description || a.excerpt || '',
    category_id: a.category_id || '',
    tag_ids: [],
    cover_image_url: a.cover_image_url || a.og_image_url || a.twitter_image_url || '',
  }
  // fetch tag ids from junction
  const tagsRes = await dbService.getArticleTagIds(String(articleId.value))
  if (tagsRes.success) metadata.value.tag_ids = tagsRes.data
  initialContent.value = a.markdown_content || a.content || ''
  // enable publish if minimal metadata present
  canPublish.value = Boolean(metadata.value.title && metadata.value.slug && metadata.value.category_id)
  actionLabel.value = status.value === 'ready' ? 'Planifier' : 'Enregistrer l’article'
  // If navigated from list with schedule intent and article is ready, open modal
  if (status.value === 'ready' && route.query.action === 'schedule') {
    scheduleVisible.value = true
  }
})

function openMetadata() { metadataVisible.value = true }

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
  metadata.value = { ...meta }
  metadataVisible.value = false
  canPublish.value = Boolean(meta.title && meta.slug && meta.category_id)
  showSuccess('Métadonnées enregistrées')
}

async function handleSaveDraft(payload) {
  try {
    const { content } = payload
    const { success, data, error } = await dbService.upsertBlogDraft(String(articleId.value), {
      content,
      meta_title: metadata.value.title,
      meta_description: metadata.value.excerpt,
      canonical_url: `/blog/${metadata.value.slug}`,
      category_id: metadata.value.category_id || null,
      cover_image_url: metadata.value.cover_image_url || null,
      tag_ids: metadata.value.tag_ids || [],
    })
    if (!success) throw new Error(error || "Échec de l'enregistrement du brouillon")
    showSuccess('Brouillon mis à jour')
  } catch (err) {
    showError(`Erreur d'enregistrement: ${err.message}`)
  }
}

function handlePrimaryAction() {
  if (status.value === 'ready') {
    scheduleVisible.value = true
    return
  }
  handlePublish()
}

async function handlePublish() {
  try {
    if (!canPublish.value) {
      showError('Métadonnées non validées')
      return
    }
    const res = await dbService.markArticleReady(String(articleId.value), {
      meta_title: metadata.value.title,
      meta_description: metadata.value.excerpt,
      canonical_url: `/blog/${metadata.value.slug}`,
      category_id: metadata.value.category_id,
      cover_image_url: metadata.value.cover_image_url,
    })
    if (!res.success) throw new Error(res.error || 'Mise à jour du statut échouée')
    showSuccess('Article marqué comme prêt')
    setTimeout(() => {
      router.push({ name: 'admin-blog' })
    }, 1000)
  } catch (err) {
    showError(`Erreur de publication: ${err.message}`)
  }
}

async function handleScheduleSave(payload) {
  try {
    const res = await dbService.scheduleArticle(String(articleId.value), payload)
    if (!res.success) throw new Error(res.error || 'Planification échouée')
    showSuccess('Article planifié')
    setTimeout(() => {
      router.push({ name: 'admin-blog' })
    }, 1000)
  } catch (err) {
    showError(`Erreur de planification: ${err.message}`)
  } finally {
    scheduleVisible.value = false
  }
}
</script>
