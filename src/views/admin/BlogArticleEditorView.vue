<template>
  <div>
    <BlogAdminBanner />
    <div class="container" style="padding-top: var(--space-6); padding-bottom: var(--space-6);">
    <h1 style="margin-bottom: var(--space-6);">Éditeur d’article</h1>
    <BlogEditor :can-publish="canPublish" :metadata="metadata" :initial-content="initialContent" @open-metadata="openMetadata" @save-draft="handleSaveDraft" @publish="handlePublish" />
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
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BlogEditor from '@/components/blog/BlogEditor.vue'
import BlogMetadataModal from '@/components/blog/BlogMetadataModal.vue'
import BlogAdminBanner from '@/components/blog/BlogAdminBanner.vue'
import { dbService } from '@/services/supabase'
import { useErrorHandler } from '@/services/errorHandler'

const route = useRoute()
const router = useRouter()
const { showSuccess, showError } = useErrorHandler()

const articleId = ref(route.params.id)
const metadataVisible = ref(false)
const canPublish = ref(false)
const metadata = ref({ title: '', slug: '', excerpt: '', category_id: '', tag_ids: [], cover_image_url: '' })
const categories = ref([])
const tags = ref([])
const initialContent = ref('')

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
</script>
