// src/router/index.js
/**
 * Vue Router Module
 * @module router
 * @description Vue Router configuration for the application.
 * This file defines the routes and navigation guards for the application.
 * It ensures that users are redirected to the appropriate views based on their authentication status.
 * It also handles the initialization of the authentication state.
 * @version 1.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 1.0.0 (2025-06-02): Initial version with basic routing and authentication guards.
 */

import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUIStore } from '@/stores/ui'
import {
  isExpiredConfirmationLink,
  getExpiredConfirmationMessage,
  cleanUrlHash,
} from '@/utils/helpers'

// Import your views
import DashboardView from '@/views/DashboardView.vue'
import HomeView from '@/views/HomeView.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import PluSynthesisView from '@/views/PluSynthesisView.vue'
import ProfileView from '@/views/ProfileView.vue'

// Auth views
import LoginView from '@/views/auth/LoginView.vue'
import SignupView from '@/views/auth/SignupView.vue'
import ResetPasswordView from '@/views/auth/ResetPasswordView.vue'
import ConfirmationView from '@/views/auth/ConfirmationView.vue'

// Docs views
import DocumentationView from '@/views/docs/DocumentationView.vue'
import FAQView from '@/views/docs/FAQView.vue'

// Info views
import AboutView from '@/views/info/AboutView.vue'
import ContactView from '@/views/info/ContactView.vue'
import DonationView from '@/views/info/DonationView.vue'

// Donation result views (moved to info folder)
import DonationSuccessView from '@/views/info/DonationSuccessView.vue'
import DonationCancelView from '@/views/info/DonationCancelView.vue'

// Policies views
import CookiesView from '@/views/policies/CookiesView.vue'
import LegalNoticeView from '@/views/policies/LegalNoticeView.vue'
import PrivacyView from '@/views/policies/PrivacyView.vue'
import SalesPolicyView from '@/views/policies/SalesPolicyView.vue'
import TermsView from '@/views/policies/TermsView.vue'
import BlogAdminView from '@/views/admin/BlogAdminView.vue'
import PreviewBlogDashboard from '@/views/dev/blog/PreviewBlogDashboard.vue'
import PreviewBlogStatsOverview from '@/views/dev/blog/PreviewBlogStatsOverview.vue'
import PreviewBlogContentPlanner from '@/views/dev/blog/PreviewBlogContentPlanner.vue'
import PreviewBlogArticleList from '@/views/dev/blog/PreviewBlogArticleList.vue'
import PreviewBlogSchedulingCalendar from '@/views/dev/blog/PreviewBlogSchedulingCalendar.vue'
import PreviewBlogEditor from '@/views/dev/blog/PreviewBlogEditor.vue'
import BlogArticleEditorView from '@/views/admin/BlogArticleEditorView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: {
      title: 'Accueil - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/admin/blog',
    name: 'admin-blog',
    component: BlogAdminView,
    meta: {
      title: 'Administration du Blog - MWPLU',
      requiresAuth: false,
    },
  },
  // Dev preview routes for blog components
  {
    path: '/dev/blog/dashboard',
    name: 'dev-blog-dashboard',
    component: PreviewBlogDashboard,
    meta: { title: 'Dev: Blog Dashboard - MWPLU', requiresAuth: false },
  },
  {
    path: '/dev/blog/stats',
    name: 'dev-blog-stats',
    component: PreviewBlogStatsOverview,
    meta: { title: 'Dev: Blog Stats Overview - MWPLU', requiresAuth: false },
  },
  {
    path: '/dev/blog/planner',
    name: 'dev-blog-planner',
    component: PreviewBlogContentPlanner,
    meta: { title: 'Dev: Blog Content Planner - MWPLU', requiresAuth: false },
  },
  {
    path: '/dev/blog/list',
    name: 'dev-blog-list',
    component: PreviewBlogArticleList,
    meta: { title: 'Dev: Blog Article List - MWPLU', requiresAuth: false },
  },
  {
    path: '/dev/blog/calendar',
    name: 'dev-blog-calendar',
    component: PreviewBlogSchedulingCalendar,
    meta: { title: 'Dev: Blog Scheduling Calendar - MWPLU', requiresAuth: false },
  },
  {
    path: '/dev/blog/editor',
    name: 'dev-blog-editor',
    component: PreviewBlogEditor,
    meta: { title: 'Dev: Blog Editor - MWPLU', requiresAuth: false },
  },
  {
    path: '/admin/blog/editor/:id',
    name: 'admin-blog-editor',
    component: BlogArticleEditorView,
    meta: { title: 'Admin: Blog Editor - MWPLU', requiresAuth: false },
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      title: 'Connexion - MWPLU',
      requiresAuth: false,
      requiresGuest: true,
    },
  },
  {
    path: '/signup',
    name: 'signup',
    component: SignupView,
    meta: {
      title: 'Créer un compte - MWPLU',
      requiresGuest: true,
    },
  },
  {
    path: '/confirmation',
    name: 'confirmation',
    component: ConfirmationView,
    meta: {
      title: "Confirmation de l'email - MWPLU",
      requiresAuth: false,
    },
  },
  {
    path: '/auth/confirmation',
    name: 'auth-confirmation-redirect',
    component: () => import('@/views/auth/EmailConfirmRedirect.vue'),
    meta: {
      title: 'Redirection de confirmation - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/reset-password',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: {
      title: 'Réinitialisation du mot de passe - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: {
      title: 'Profil - MWPLU',
      requiresAuth: true,
    },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: DashboardView,
    meta: {
      title: 'Tableau de bord - MWPLU',
      requiresAuth: true,
    },
  },
  {
    path: '/plu-repository/',
    name: 'plu-search',
    component: () => import('@/views/PluSearchView.vue'),
    meta: {
      title: 'Répertoire de Synthèses PLU - MWPLU',
      requiresAuth: true,
    },
  },
  {
    path: '/plu-repository/:city/:zoning/:zone',
    name: 'plu-synthesis',
    component: PluSynthesisView,
    meta: {
      title: 'Synthèse du PLU - MWPLU',
      requiresAuth: true,
    },
  },
  {
    path: '/contact',
    name: 'contact',
    component: ContactView,
    meta: {
      title: 'Contact - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/info/about',
    name: 'about',
    component: AboutView,
    meta: {
      title: 'À propos - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/info/donation',
    name: 'donation',
    component: DonationView,
    meta: {
      title: 'Nous soutenir - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/donation/success',
    name: 'donation-success',
    component: DonationSuccessView,
    meta: {
      title: 'Don réalisé avec succès - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/donation/cancel',
    name: 'donation-cancel',
    component: DonationCancelView,
    meta: {
      title: 'Don annulé - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/docs/documentation',
    name: 'documentation',
    component: DocumentationView,
    meta: {
      title: 'Documentation - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/docs/faq',
    name: 'faq',
    component: FAQView,
    meta: {
      title: 'Foire aux questions - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/policies/legal',
    name: 'legal',
    component: LegalNoticeView,
    meta: {
      title: 'Mentions légales - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/policies/terms',
    name: 'terms',
    component: TermsView,
    meta: {
      title: "Conditions Générales d'Utilisation - MWPLU",
      requiresAuth: false,
    },
  },
  {
    path: '/policies/privacy',
    name: 'privacy',
    component: PrivacyView,
    meta: {
      title: 'Politique de confidentialité - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/policies/cookies',
    name: 'cookies',
    component: CookiesView,
    meta: {
      title: 'Politique de cookies - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/policies/sales',
    name: 'sales',
    component: SalesPolicyView,
    meta: {
      title: 'Politiques de Ventes - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/test/analytics',
    name: 'analytics-test',
    component: () => import('@/views/AnalyticsTestView.vue'),
    meta: {
      title: 'Analytics Test - MWPLU',
      requiresAuth: false,
    },
  },
  {
    path: '/404',
    name: 'not-found',
    component: NotFoundView,
    meta: { title: 'Page Not Found - MWPLU' },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation Guards
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Handle expired email confirmation links
  if (isExpiredConfirmationLink(window.location.hash)) {
    // Clean the URL by removing hash parameters
    cleanUrlHash()

    // Show error notification using the popup system
    const uiStore = useUIStore()
    uiStore.showNotification({
      type: 'error',
      message: getExpiredConfirmationMessage(),
      autoDismiss: true,
      autoDismissDelay: 12000,
    })

    // Redirect to signup page without query parameters
    next({ name: 'signup' })
    return
  }

  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Check if we need to initialize auth state
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }

  const isAuthenticated = authStore.isAuthenticated
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  // Route requires authentication but user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    })
    return
  }

  // Route requires guest (login/signup) but user is authenticated
  if (requiresGuest && isAuthenticated) {
    const redirect = to.query.redirect || '/'
    next(redirect)
    return
  }

  next()
})

// After navigation
router.afterEach(() => {
  // You can add analytics tracking here if needed
  // gtag('config', 'GA_TRACKING_ID', { page_path: to.path })
})

export default router
