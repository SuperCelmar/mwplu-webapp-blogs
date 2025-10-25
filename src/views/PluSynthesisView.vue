<template>
  <AppLayout>
    <div class="main-content">
      <!-- Loading State -->
      <div v-if="isLoading" class="loading-container">
        <BaseSpinner size="large" />
        <p class="loading-text">Chargement du document PLU...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="errorMessage" class="error-page-container">
        <div class="error-card card">
          <h2 class="error-title">Erreur de chargement</h2>
          <p class="error-message-text">{{ errorMessage }}</p>
          <div class="error-actions">
            <button @click="loadPluData" class="btn btn-primary">
              Réessayer
            </button>
            <router-link to="/" class="btn btn-secondary">
              Retour à l'accueil
            </router-link>
          </div>
        </div>
      </div>

      <!-- PLU Content -->
      <div v-else-if="pluData" class="plu-details-view">
        <BreadcrumbNav :items="breadcrumbItems" class="plu-breadcrumb-nav" />

        <!-- Header Section -->
        <section class="plu-header-section card">
          <div class="plu-header-content">
            <h1 class="plu-main-title">PLU {{ pluData.city_name }}</h1>
            <div class="plu-meta-info">
              <span class="plu-zone-name">{{ pluData.zoning_name }} - {{ pluData.zone_name }}</span>
              <span class="plu-update-date">
                Mis à jour le {{ formatDate(pluData.updated_at) }}
              </span>
            </div>

            <!-- Smart-match reminder banner with external (IGN) zone label -->
            <div v-if="pluStore.lastSmartMatch?.usedSmartMatch && pluStore.lastSmartMatch.externalZoneLabel"
              class="smart-match-banner">
              <span class="banner-label">Zone IGN exacte</span>
              <span class="banner-value">{{ pluStore.lastSmartMatch.externalZoneLabel }}</span>
              <span class="banner-sep">→</span>
              <span class="banner-note">associée à</span>
              <span class="banner-value">{{ pluStore.lastSmartMatch.internalZoneName }}</span>
            </div>
          </div>

          <div class="plu-stats-grid">
            <div class="stat-item">
              <span class="stat-number">{{ documentStats?.ratings_average || 'N/A' }}</span>
              <span class="stat-label">Note moyenne</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ documentStats?.comments_count || 0 }}</span>
              <span class="stat-label">Commentaires</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">{{ documentStats?.downloads_count || 0 }}</span>
              <span class="stat-label">Téléchargements</span>
            </div>
          </div>
        </section>

        <!-- Tab Navigation -->
        <nav class="plu-tab-navigation">
          <div class="tabs-container">
            <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
              :class="['tab-button', { 'tab-button--active': activeTab === tab.id }]">
              {{ tab.label }}
            </button>
          </div>
        </nav>

        <!-- Tab Content Area -->
        <main class="plu-tab-content-area card">
          <!-- Synthesis Tab -->
          <section v-if="activeTab === 'synthesis'" class="tab-panel-content">
            <div class="content-section">
              <h2 class="section-heading">Synthèse du PLU</h2>
              <div class="synthesis-text-content"
                v-html="pluData.synthesis_content || 'Contenu de synthèse non disponible.'">
              </div>
            </div>
          </section>

          <!-- Comments Tab -->
          <section v-if="activeTab === 'comments'" class="tab-panel-content">
            <PluCommentsTab v-if="pluData" :document-id="pluData.id" :document-rating="documentStats?.ratings_average"
              :rating-count="documentStats?.ratings_count || 0" @rating-updated="handleRatingUpdated"
              @comment-added="handleCommentAdded" />
          </section>

          <!-- Sources Tab -->
          <section v-if="activeTab === 'sources'" class="tab-panel-content">
            <PluSourcesTab :document="pluData" :document-id="String(pluData.id)" />
          </section>

          <!-- Downloads Tab -->
          <section v-if="activeTab === 'downloads'" class="tab-panel-content">
            <div class="downloads-section">
              <div class="download-item card">
                <div class="download-info">
                  <h4 class="download-title">Document de Synthèse</h4>
                  <p class="download-remaining">Téléchargements restants: {{ userDownloadInfo.remaining }} / {{
                    userDownloadInfo.allowed }}</p>
                </div>
                <button @click="downloadFile('synthesis', 'pdf')" class="btn btn-primary"
                  :disabled="!authStore.isAuthenticated || userDownloadInfo.remaining === 0">
                  Télécharger PDF
                </button>
                <p v-if="!authStore.isAuthenticated" class="download-hint">Connectez-vous pour télécharger des
                  documents.</p>
                <p v-else-if="userDownloadInfo.remaining === 0" class="download-hint">Vous avez atteint votre limite de
                  téléchargements.</p>
              </div>
            </div>
          </section>
        </main>
      </div>

      <!-- Back to Top Button -->
      <button v-if="showBackToTop" @click="scrollToTop" class="back-to-top-btn" title="Retour en haut"
        aria-label="Retour en haut de la page">
        <img src="@/assets/icons/elements/arrow-up.svg" alt="Retour en haut" class="back-to-top-icon" color="white"
          width="20" height="20" />
      </button>
    </div>
  </AppLayout>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import { usePluStore } from '@/stores/plu'
import { dbService } from '@/services/supabase'
import AppLayout from '@/components/layout/AppLayout.vue'
import BreadcrumbNav from '@/components/layout/BreadcrumbNav.vue'
import BaseSpinner from '@/components/common/BaseSpinner.vue'
import PluCommentsTab from '@/components/plu/synthesis/PluCommentsTab.vue'
import PluSourcesTab from '@/components/plu/synthesis/PluSourcesTab.vue'
import { formatCityName } from '@/utils/helpers'

export default {
  name: 'PluSynthesisView',

  components: {
    AppLayout,
    BreadcrumbNav,
    BaseSpinner,
    PluCommentsTab,
    PluSourcesTab,
  },

  setup() {
    const route = useRoute()
    const authStore = useAuthStore()
    const uiStore = useUIStore()
    const pluStore = usePluStore()

    const isLoading = ref(true)
    const errorMessage = ref('')
    const pluData = ref(null)
    const activeTab = ref('synthesis') // Default active tab
    const documentStats = ref(null)
    const userDownloadInfo = ref({ used: 0, remaining: 5, allowed: 5 })

    // Back to top functionality
    const showBackToTop = ref(false)

    const tabs = [
      { id: 'synthesis', label: 'Synthèse' },
      { id: 'comments', label: 'Commentaires' },
      { id: 'sources', label: 'Sources' },
      { id: 'downloads', label: 'Téléchargements' },
    ]

    // Computed properties for breadcrumbs
    const breadcrumbItems = computed(() => {
      const items = [
        {
          label: 'Répertoire de Synthèses',
          path: '/plu-repository/',
          current: false
        },
      ]

      if (pluStore.selectedCity) {
        items.push({
          label: formatCityName(pluStore.selectedCity.name),
          path: `/plu-repository/?preselect=city&city=${pluStore.selectedCity.id}`,
          current: false
        })
      }

      if (pluStore.selectedZoning) {
        items.push({
          label: pluStore.selectedZoning.name,
          path: `/plu-repository/?preselect=zoning&city=${pluStore.selectedCity.id}&zoning=${pluStore.selectedZoning.id}`,
          current: false
        })
      }

      if (pluStore.selectedZone) {
        items.push({
          label: `Zone ${pluStore.selectedZone.name}`,
          path: undefined, // Current page, no link
          current: true
        })
      }

      return items
    })

    /**
     * Loads document statistics (ratings, comments, downloads)
     */
    const loadDocumentStats = async () => {
      if (!pluData.value) return

      try {
        // Get ratings statistics
        const ratingsResult = await dbService.getRatings(pluData.value.id)

        // Get comments count
        const commentsResult = await dbService.getComments(pluData.value.id)

        // Get downloads count
        const downloadsResult = await dbService.getDownloadStats(pluData.value.id)

        if (ratingsResult.success) {
          documentStats.value = {
            ratings_average: ratingsResult.data.average,
            ratings_count: ratingsResult.data.count,
            comments_count: commentsResult.success ? commentsResult.data.length : 0,
            downloads_count: downloadsResult.success ? downloadsResult.data.count : 0
          }
        }
      } catch (error) {
        console.error('Error loading document stats:', error)
      }
    }

    const loadUserDownloadInfo = async () => {
      try {
        const res = await dbService.getUserDownloadCount()
        if (res.success) {
          userDownloadInfo.value = { used: res.used, remaining: res.remaining, allowed: res.allowed }
        }
      } catch {
        // ignore
      }
    }

    /**
     * Handles rating update events from the comments tab
     */
    const handleRatingUpdated = async () => {
      await loadDocumentStats()
    }

    /**
     * Handles comment added events from the comments tab
     */
    const handleCommentAdded = async () => {
      await loadDocumentStats()
    }

    /**
     * Fetches PLU data from Supabase based on route parameters.
     */
    const loadPluData = async () => {
      isLoading.value = true
      errorMessage.value = ''
      pluData.value = null

      // Extract slugs from route parameters
      const { city: citySlug, zoning: zoningSlug, zone: zoneSlug } = route.params

      if (!citySlug || !zoningSlug || !zoneSlug) {
        errorMessage.value = 'Paramètres de sélection manquants'
        isLoading.value = false
        return
      }

      try {
        // Initialize PLU store from slugs to get actual IDs
        const success = await pluStore.initializeFromSlugs(citySlug, zoningSlug, zoneSlug)
        if (!success) {
          errorMessage.value = pluStore.error || 'Sélection invalide'
          isLoading.value = false
          return
        }

        const result = await dbService.getDocument(pluStore.selectedZoningId, pluStore.selectedZoneId)

        if (result.success) {
          pluData.value = result.data
          // Load document statistics
          await loadDocumentStats()
          // If the document's zone matches exactly the selected zone, clear smart-match reminder
          if (pluStore.selectedZone?.name && !pluStore.lastSmartMatch?.externalZoneLabel) {
            pluStore.clearSmartMatch()
          }
        } else {
          errorMessage.value = `Erreur: ${result.error || 'Document non trouvé'}`
        }
      } catch (error) {
        console.error('Error loading PLU data:', error)
        errorMessage.value = 'Une erreur inattendue est survenue lors du chargement du PLU.'
      } finally {
        isLoading.value = false
      }
    }

    /**
     * Handles PDF file download from Supabase storage.
     * @param {string} type - Only 'synthesis' is supported now
     * @param {string} format - Only 'pdf' is supported
     */
    const downloadFile = async (type, format) => {
      try {
        // Only support PDF synthesis downloads
        if (type !== 'synthesis' || format !== 'pdf') {
          throw new Error('Type de téléchargement non supporté');
        }

        if (!pluData.value || !pluData.value.pdf_storage_path) {
          throw new Error('Document PDF non disponible');
        }

        // Clean the storage path (remove leading slash if present)
        // const cleanPath = pluData.value.pdf_storage_path.replace(/^\//, '');

        // Request a limited, signed URL via Edge Function (enforces 5 free downloads)
        const limited = await dbService.requestLimitedDownload(pluData.value.id)
        if (!limited.success) {
          if (limited.code === 'download_limit_reached') {
            uiStore.showWarning('Limite de téléchargements atteinte.', `Vous avez utilisé vos téléchargements (${userDownloadInfo.value.used}/${userDownloadInfo.value.allowed}).`);
            return
          }
          uiStore.showError(limited.error || 'Échec lors de la demande de téléchargement.')
          return
        }

        // Create proper filename based on document data
        const cityName = pluData.value.city_name || 'Document';
        const zoneName = pluData.value.zone_name || 'Zone';
        const fileName = `PLU_${cityName}_${zoneName}.pdf`;

        // Force download using a temporary link element
        const link = document.createElement('a');
        link.href = limited.url;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        uiStore.showSuccess('Téléchargement lancé avec succès !');
        // refresh user download counter optimistically
        if (typeof limited.used === 'number' && typeof limited.allowed === 'number') {
          const used = limited.used
          const allowed = limited.allowed
          userDownloadInfo.value = { used, allowed, remaining: Math.max(0, allowed - used) }
        } else {
          await loadUserDownloadInfo()
        }

      } catch (error) {
        console.error('Download error:', error);

        // Provide user-friendly error messages
        let errorMessage = "Une erreur inattendue s'est produite lors du téléchargement.";

        if (error.message?.includes('Object not found') || error.message?.includes('not found')) {
          errorMessage = 'Le fichier PDF n\'a pas été trouvé. Veuillez contacter l\'administrateur.';
        } else if (error.message?.includes('not available') || error.message?.includes('non disponible')) {
          errorMessage = 'Le document PDF n\'est pas encore disponible pour ce PLU.';
        } else if (error.message?.includes('non supporté') || error.message?.includes('not supported')) {
          errorMessage = 'Seuls les téléchargements PDF sont actuellement supportés.';
        } else if (error.message) {
          errorMessage = error.message;
        }

        uiStore.showError(errorMessage);
      }
    };

    /**
     * Formats a date string for display.
     */
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A'
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(dateString).toLocaleDateString('fr-FR', options)
    }

    /**
     * Formats file size in bytes to a human-readable format.
     */
    const formatFileSize = (bytes, decimalPoint) => {
      if (bytes == 0) return '0 Bytes'
      const k = 1000
      const dm = decimalPoint || 2
      const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
    }

    /**
     * Scrolls smoothly to the top of the page.
     */
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    /**
     * Handles scroll events to show/hide the back to top button.
     */
    const handleScroll = () => {
      // Show button when user has scrolled down 300px or more
      showBackToTop.value = window.scrollY > 300
    }

    // Load data on component mount and when route changes
    onMounted(async () => {
      loadPluData()
      await loadUserDownloadInfo()
      // Show smart-match reminder if present
      if (pluStore.lastSmartMatch?.usedSmartMatch && pluStore.lastSmartMatch.externalZoneLabel) {
        uiStore.showInfo(
          `Note: la zone IGN "${pluStore.lastSmartMatch.externalZoneLabel}" a été associée à la zone "${pluStore.lastSmartMatch.internalZoneName}".`
        )
      }
      // Add scroll event listener for back to top button
      window.addEventListener('scroll', handleScroll)
    })

    // Cleanup scroll event listener
    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    watch(
      () => route.params,
      (newParams, oldParams) => {
        // Only reload if relevant route params change
        if (newParams.city !== oldParams.city || newParams.zoning !== oldParams.zoning || newParams.zone !== oldParams.zone) {
          loadPluData()
          // Re-emit reminder after navigation change if smart-match persisted
          if (pluStore.lastSmartMatch?.usedSmartMatch && pluStore.lastSmartMatch.externalZoneLabel) {
            uiStore.showInfo(
              `Note: la zone IGN "${pluStore.lastSmartMatch.externalZoneLabel}" a été associée à la zone "${pluStore.lastSmartMatch.internalZoneName}".`
            )
          } else {
            // If no smart-match info remains, ensure banner hides
            pluStore.clearSmartMatch()
          }
        }
      },
      { deep: true }
    )

    return {
      isLoading,
      errorMessage,
      pluData,
      activeTab,
      tabs,
      breadcrumbItems,
      authStore,
      pluStore,
      documentStats,
      // Back to top functionality
      showBackToTop,
      // Methods
      loadPluData,
      loadDocumentStats,
      loadUserDownloadInfo,
      handleRatingUpdated,
      handleCommentAdded,
      downloadFile,
      scrollToTop,
      formatDate,
      formatFileSize,
      userDownloadInfo,
    }
  },
}
</script>

<style scoped>
.main-content {
  max-width: 1200px;
  margin: var(--space-8) auto;
  padding: 0 var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-12);
}

/* Loading and Error States */
.loading-container,
.error-page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--header-height) - var(--footer-height) - var(--space-16));
  gap: var(--space-4);
  text-align: center;
}

.loading-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
}

.error-card {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
  max-width: 500px;
  width: 90%;
}

.error-title {
  font-size: var(--font-size-2xl);
  color: var(--color-red-600);
  margin-bottom: var(--space-4);
}

.error-message-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin-bottom: var(--space-8);
  line-height: 1.5;
}

.error-actions {
  display: flex;
  justify-content: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

/* PLU Details View Structure */
.plu-details-view {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.plu-breadcrumb-nav {
  margin-bottom: var(--space-4);
}

/* Header Section */
.plu-header-section {
  padding: var(--space-8);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-6) var(--space-8);
}

.plu-header-content {
  flex-grow: 1;
}

.plu-main-title {
  font-size: var(--font-size-3xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-2);
  line-height: 1.2;
}

.plu-meta-info {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

.plu-zone-name,
.plu-update-date {
  margin-right: var(--space-4);
}

/* Smart match banner */
.smart-match-banner {
  margin-top: var(--space-3);
  display: inline-flex;
  gap: var(--space-2);
  align-items: center;
  padding: 6px 10px;
  border: 1px dashed var(--color-gray-300);
  border-radius: var(--radius-button);
  background: var(--color-gray-50);
}

.smart-match-banner .banner-label {
  font-weight: var(--font-weight-semibold);
  color: var(--color-gray-800);
}

.smart-match-banner .banner-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-black);
}

.smart-match-banner .banner-note {
  color: var(--color-gray-700);
}

.smart-match-banner .banner-sep {
  color: var(--color-gray-500);
}

.plu-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-4);
  background-color: var(--color-gray-50);
  padding: var(--space-4);
  border-radius: var(--radius-button);
}

.stat-item {
  text-align: center;
  border-right: 1px solid var(--color-gray-200);
  padding-right: var(--space-4);
}

.stat-item:last-child {
  border-right: none;
  padding-right: 0;
}

.stat-number {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-color-black);
  display: block;
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--color-gray-600);
  display: block;
}

/* Tab Navigation */
.plu-tab-navigation {
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4);
}

.tabs-container {
  display: flex;
  justify-content: space-around;
  gap: var(--space-2);
  max-width: 800px;
  margin: 0 auto;
}

.tab-button {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  border: none;
  background-color: transparent;
  color: var(--color-gray-700);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  border-radius: var(--radius-button);
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  position: relative;
}

/* Add vertical separator after each button except the last one */
.tab-button:not(:last-child)::after {
  content: '';
  position: absolute;
  right: calc(var(--space-2) / -2);
  top: 10%;
  bottom: 10%;
  width: 1px;
  background-color: var(--color-gray-200);
}

/* Hide separator when button or next button is active */
.tab-button--active::after,
.tab-button:hover:not(.tab-button--active) {
  background-color: var(--color-gray-100);
  color: var(--color-color-black);
}

.tab-button--active {
  background-color: var(--color-black);
  color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.tab-button-icon {
  font-size: var(--font-size-lg);
}

/* Tab Content Area */
.plu-tab-content-area {
  padding: var(--space-8);
}

.tab-panel-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-10);
}

.content-section {
  padding: var(--space-6);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
}

.section-heading {
  font-size: var(--font-size-xl);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--color-gray-200);
}

.section-subheading {
  font-size: var(--font-size-lg);
  color: var(--color-color-black);
  margin-bottom: var(--space-4);
}

.section-description {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  line-height: 1.6;
  margin-bottom: var(--space-6);
}

/* Synthesis Tab Specifics */
.synthesis-text-content {
  font-size: var(--font-size-md);
  line-height: 1.7;
  color: var(--color-gray-800);
}

.synthesis-text-content :deep(p) {
  margin-bottom: var(--space-4);
}

.synthesis-text-content :deep(h1),
.synthesis-text-content :deep(h2),
.synthesis-text-content :deep(h3) {
  color: var(--color-color-black);
  margin-top: var(--space-8);
  margin-bottom: var(--space-4);
}

.synthesis-text-content :deep(h1) {
  font-size: var(--font-size-2xl);
}

.synthesis-text-content :deep(h2) {
  font-size: var(--font-size-xl);
}

.synthesis-text-content :deep(h3) {
  font-size: var(--font-size-lg);
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.rule-card {
  padding: var(--space-6);
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
}

.rule-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
  margin-bottom: var(--space-2);
}

.rule-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.6;
}

.constraints-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.constraint-item {
  padding: var(--space-4);
  background-color: var(--color-white);
  border-radius: var(--radius-button);
  box-shadow: var(--shadow-xs);
  border: 1px solid var(--color-gray-200);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.constraint-type {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-blue);
  background-color: var(--color-blue-50);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill);
  white-space: nowrap;
}

.constraint-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.5;
}

/* Comments Tab Specifics */
.comments-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.add-comment-section,
.auth-prompt-card,
.comments-list-section {
  padding: var(--space-8);
  border-radius: var(--radius-card);
  background-color: var(--color-white);
  box-shadow: var(--shadow-md);
}

.comment-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.form-textarea {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  border: 1px solid var(--color-gray-300);
  border-radius: var(--radius-button);
  background-color: var(--color-white);
  font-size: var(--font-size-md);
  color: var(--color-color-black);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--color-blue);
  box-shadow: var(--shadow-focus);
}

.rating-input {
  display: flex;
  gap: var(--space-1);
}

.star-button {
  background: none;
  border: none;
  font-size: var(--font-size-xl);
  color: var(--color-gray-300);
  cursor: pointer;
  transition: color var(--transition-fast);
  padding: 0 var(--space-1);
}

.star-button--active {
  color: var(--color-yellow-500);
}

.auth-prompt-card {
  text-align: center;
}

.auth-prompt-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-700);
  margin-bottom: var(--space-6);
}

.empty-state-message {
  padding: var(--space-6);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  text-align: center;
  color: var(--color-gray-600);
  font-style: italic;
  font-size: var(--font-size-md);
}

.comment-item {
  padding: var(--space-6);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-card);
  border: 1px solid var(--color-gray-200);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  flex-wrap: wrap;
}

.comment-author {
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
}

.comment-date {
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.comment-rating {
  margin-left: auto;
  /* Push rating to the right */
  display: flex;
  gap: 1px;
  /* Tighter star spacing */
}

.star-display {
  color: var(--color-gray-300);
  font-size: var(--font-size-md);
}

.star-display--filled {
  color: var(--color-yellow-500);
}

.comment-content-text {
  font-size: var(--font-size-md);
  color: var(--color-gray-800);
  line-height: 1.6;
}

/* Sources Tab Specifics */
.sources-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.sources-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.source-item {
  padding: var(--space-6);
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--space-4);
}

.source-info {
  flex-grow: 1;
}

.source-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
  margin-bottom: var(--space-1);
}

.source-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.5;
  margin-bottom: var(--space-2);
}

.source-meta {
  display: flex;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-gray-500);
}

.source-type,
.source-date,
.source-size {
  background-color: var(--color-gray-100);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-pill);
  font-weight: var(--font-weight-medium);
  color: var(--color-gray-700);
}

.source-actions .btn {
  white-space: nowrap;
}

/* Downloads Tab Specifics */
.downloads-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  align-items: center;
}

.download-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
}

.download-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: var(--space-6);
}

.download-item {
  padding: var(--space-6);
  background-color: var(--color-white);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-gray-200);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  max-width: 350px;
}

.download-info {
  flex-grow: 1;
  text-align: center;
}

.download-title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-color-black);
  margin-bottom: var(--space-1);
}

.download-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-700);
  line-height: 1.5;
}

/* Rating Section Styles */
.rating-section {
  padding: var(--space-6);
  margin-bottom: var(--space-6);
}

.rating-description {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-bottom: var(--space-4);
}

.rating-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.current-rating {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background-color: var(--color-gray-50);
  border-radius: var(--radius-form);
}

.rating-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-black);
  margin-bottom: var(--space-2);
  display: block;
}

.rating-display {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.rating-value {
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
  margin-left: var(--space-2);
}

.rating-input {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.rating-stars {
  display: flex;
  gap: var(--space-1);
}

.star-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--color-gray-300);
  cursor: pointer;
  transition: color var(--transition-fast);
  padding: var(--space-1);
}

.star-button:hover,
.star-button--active {
  color: #FFD700;
  /* Gold color for stars */
}

.star-button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.star-display {
  font-size: 1rem;
  color: var(--color-gray-300);
}

.star-display--filled {
  color: #FFD700;
}

.rating-loading {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  color: var(--color-gray-600);
}

/* General Buttons (used in different sections) */
.btn {
  padding: var(--space-3) var(--space-6);
  border-radius: var(--radius-button);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  text-decoration: none;
  transition: all var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  cursor: pointer;
}

.btn-primary {
  background-color: var(--color-black);
  color: var(--color-white);
  width: 100%;
}

.btn-primary:hover {
  background-color: var(--color-gray-700);
}

.btn-secondary {
  background-color: transparent;
  color: var(--color-color-black);
  border: 1px solid var(--color-gray-300);
}

.btn-secondary:hover {
  background-color: var(--color-gray-100);
  border-color: var(--color-gray-400);
}

.btn-danger {
  background-color: var(--color-red-600);
  color: var(--color-white);
  border: 1px solid var(--color-red-600);
}

.btn-danger:hover {
  background-color: var(--color-red-700);
  border-color: var(--color-red-700);
}

.btn-small {
  padding: var(--space-2) var(--space-4);
  font-size: var(--font-size-sm);
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .plu-header-section {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-6);
    text-align: center;
  }

  .plu-main-title {
    font-size: var(--font-size-2xl);
    text-align: center;
    width: 100%;
  }

  .plu-meta-info {
    text-align: center;
    width: 100%;
    margin-bottom: var(--space-4);
  }

  .plu-stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    width: 100%;
  }

  .stat-item {
    border-right: none;
    padding-right: 0;
    padding: var(--space-2) 0;
  }

  .plu-tab-navigation {
    padding: var(--space-2);
  }

  .tabs-container {
    flex-wrap: wrap;
    justify-content: center;
  }

  .tab-button {
    flex-basis: 48%;
    /* Two buttons per row */
    font-size: var(--font-size-sm);
    padding: var(--space-2) var(--space-3);
  }

  .plu-tab-content-area {
    padding: var(--space-6);
  }

  .content-section {
    padding: var(--space-4);
  }

  .section-heading {
    font-size: var(--font-size-xl);
  }

  .section-subheading {
    font-size: var(--font-size-md);
  }

  .rules-grid {
    grid-template-columns: 1fr;
  }

  .constraint-item {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
    padding: var(--space-3);
  }

  .constraint-type {
    width: 100%;
    text-align: center;
  }

  .add-comment-section,
  .auth-prompt-card,
  .comments-list-section {
    padding: var(--space-6);
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-1);
  }

  .comment-rating {
    margin-left: 0;
    margin-top: var(--space-1);
  }

  .source-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .source-meta {
    flex-wrap: wrap;
  }

  .download-grid {
    grid-template-columns: 1fr;
  }

  .download-item {
    align-items: flex-start;
  }
}

/* Back to Top Button */
.back-to-top-btn {
  position: fixed;
  bottom: var(--space-6);
  right: var(--space-6);
  width: 48px;
  height: 48px;
  background-color: var(--color-black);
  color: var(--color-white);
  border: none;
  border-radius: 50%;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-lg);
  transition: all var(--transition-fast);
  z-index: 1000;
  line-height: 1;
}

.back-to-top-btn:hover {
  background-color: var(--color-gray-700);
  transform: translateY(-2px);
  box-shadow: var(--shadow-xl);
}

.back-to-top-btn:active {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
}

/* Responsive adjustment for mobile */
@media (max-width: 768px) {
  .back-to-top-btn {
    bottom: var(--space-4);
    right: var(--space-4);
    width: 44px;
    height: 44px;
    font-size: var(--font-size-md);
  }
}
</style>
