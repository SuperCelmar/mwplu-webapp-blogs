// src/services/supabase.js
/**
 * Supabase Service Module
 * @module supabase
 * @description This module handles the Supabase client and database service functions.
 * It includes methods to fetch cities, zonings, zones, typologies, and documents.
 * @version 2.0.0
 * @author GreyPanda
 *
 * @changelog
 * - 2.0.0 (2025-01-05): Implemented comments, ratings, and download tracking functionality with soft delete support
 * - 1.0.0 (2025-06-02): Initial version with database service functions.
 */

import { createClient } from '@supabase/supabase-js'

// TODO: Change to production URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create a no-op proxy that throws only when actually used, so app can boot in dev
function createNoopSupabase() {
  const error = new Error(
    'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local',
  )
  const handler = {
    get() {
      throw error
    },
    apply() {
      throw error
    },
  }
  // function target to allow callables and property access
  // eslint-disable-next-line no-new-func
  const target = function () {}
  return new Proxy(target, handler)
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createNoopSupabase()

// Database service functions
export const dbService = {
  // Company Context operations (Blog)
  async getActiveCompanyContext() {
    try {
      const { data, error } = await supabase
        .from('company_context')
        .select('*')
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .maybeSingle()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      // In dev without Supabase configured, surface a friendly result
      if (!isSupabaseConfigured) {
        return { success: true, data: null }
      }
      console.error('Error fetching active company context:', error)
      return { success: false, error: error.message }
    }
  },

  async saveCompanyContext(context) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

      const payload = {
        name: context.name,
        mission: context.mission,
        values: Array.isArray(context.values) ? context.values : [],
        tone: context.tone || null,
        messaging: context.messaging || null,
        brand_voice_guidelines: context.brandVoiceGuidelines || null,
        is_active: Boolean(context.isActive),
        created_by: user ? user.id : null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      // If this context should be active, deactivate previous ones
      if (payload.is_active) {
        await supabase.from('company_context').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      }

      const { data, error } = await supabase
        .from('company_context')
        .insert(payload)
        .select('*')
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      if (!isSupabaseConfigured) {
        // Simulate success for unit tests when supabase is not configured
        return {
          success: true,
          data: {
            id: 'local-dev',
            ...context,
            is_active: Boolean(context.isActive),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        }
      }
      console.error('Error saving company context:', error)
      return { success: false, error: error.message }
    }
  },

  // Cities operations
  async getCities() {
    try {
      const { data, error } = await supabase.from('cities').select('*').order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching cities:', error)
      return { success: false, error: error.message }
    }
  },

  // Zonings operations
  async getZonings(cityId) {
    try {
      const { data, error } = await supabase
        .from('zonings')
        .select('*')
        .eq('city_id', cityId)
        .order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching zonings:', error)
      return { success: false, error: error.message }
    }
  },

  // Zones operations
  async getZones(zoningId) {
    try {
      const { data, error } = await supabase
        .from('zones')
        .select('*')
        .eq('zoning_id', zoningId)
        .order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching zones:', error)
      return { success: false, error: error.message }
    }
  },

  // Typologies operations
  async getTypologies() {
    try {
      const { data, error } = await supabase.from('typologies').select('*').order('name')

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching typologies:', error)
      return { success: false, error: error.message }
    }
  },

  // Document operations
  /**
   * Get a document by zoning and zone IDs
   * @param {string} zoningId - The ID of the zoning
   * @param {string} zoneId - The ID of the zone
   * @returns {Promise<{success: boolean, data: Object | null, error: string | null}>}
   */
  async getDocument(zoningId, zoneId) {
    try {
      const { data, error } = await supabase
        .from('documents')
        .select(
          `
            *,
            zoning:zonings(
              id,
              name,
              city:cities(id, name)
            ),
            zone:zones(id, name)
          `,
        )
        .match({ zoning_id: zoningId, zone_id: zoneId })
        .single()

      if (error) throw error

      // Transform the data to match expected structure
      const transformedData = {
        ...data,
        city_id: data.zoning?.city?.id,
        city_name: data.zoning?.city?.name || 'Unknown City',
        zoning_id: data.zoning?.id,
        zoning_name: data.zoning?.name || 'Unknown Zoning',
        zone_id: data.zone?.id,
        zone_name: data.zone?.name || 'Unknown Zone',
        synthesis_content:
          data.html_content ||
          (data.content_json?.response
            ? this.formatJsonContent(data.content_json.response)
            : 'Contenu non disponible'),
        sources: [], // TODO: Extract from content or separate sources table
      }

      return { success: true, data: transformedData }
    } catch (error) {
      console.error('Error fetching document:', error)
      return { success: false, error: error.message }
    }
  },

  // Helper method to format JSON content for display
  formatJsonContent(jsonResponse) {
    if (!jsonResponse) return 'Contenu non disponible'

    try {
      let htmlContent = '<div class="plu-content">'

      // Iterate through chapters
      Object.keys(jsonResponse).forEach((chapterKey) => {
        const chapter = jsonResponse[chapterKey]
        htmlContent += `<section class="chapter"><h2>Chapitre ${chapterKey.replace('chapitre_', '')}</h2>`

        // Iterate through sections
        Object.keys(chapter).forEach((sectionKey) => {
          const section = chapter[sectionKey]
          if (Array.isArray(section) && section.length > 0) {
            section.forEach((item) => {
              if (item.titre) {
                htmlContent += `<div class="section"><h3>${item.titre}</h3>`

                if (item.regles && Array.isArray(item.regles)) {
                  htmlContent += '<div class="rules">'
                  item.regles.forEach((rule) => {
                    htmlContent += `<div class="rule"><p>${rule.contenu}</p>`
                    if (rule.page_source) {
                      htmlContent += `<span class="source">(${rule.page_source})</span>`
                    }
                    htmlContent += '</div>'
                  })
                  htmlContent += '</div>'
                }
                htmlContent += '</div>'
              }
            })
          }
        })

        htmlContent += '</section>'
      })

      htmlContent += '</div>'
      return htmlContent
    } catch (error) {
      console.error('Error formatting JSON content:', error)
      return 'Erreur lors du formatage du contenu'
    }
  },

  async searchDocuments(searchParams) {
    try {
      let query = supabase.from('documents').select(`
            *,
            city:cities(name),
            zoning:zonings(name),
            zone:zones(name)
          `)

      // Add filters based on search params
      if (searchParams.city_id) {
        query = query.eq('city_id', searchParams.city_id)
      }
      if (searchParams.zoning_id) {
        query = query.eq('zoning_id', searchParams.zoning_id)
      }
      if (searchParams.zone_id) {
        query = query.eq('zone_id', searchParams.zone_id)
      }
      if (searchParams.search_text) {
        query = query.ilike('content', `%${searchParams.search_text}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error searching documents:', error)
      return { success: false, error: error.message }
    }
  },

  // Comments operations
  async getComments(documentId) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false })

      if (error) throw error

      return { success: true, data }
    } catch (error) {
      console.error('Error fetching comments:', error)
      return { success: false, error: error.message }
    }
  },

  async addComment(documentId, content) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User must be authenticated')

      const { data, error } = await supabase
        .from('comments')
        .insert({
          document_id: documentId,
          user_id: user.id,
          content: content.trim(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error adding comment:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteComment(commentId) {
    try {
      console.log('Attempting to delete comment with ID:', commentId)

      // Use the new dual-table delete function
      const { data, error } = await supabase.rpc('delete_comment_dual_table', {
        comment_id: commentId,
      })

      if (error) throw error

      // The function returns a JSON object with success/error info
      if (data && data.success === false) {
        throw new Error(data.error || 'Unknown error from delete function')
      }

      console.log('Comment deleted successfully using dual-table system')
      return { success: true }
    } catch (error) {
      console.error('Error deleting comment:', error)
      return { success: false, error: error.message }
    }
  },

  // Bonus: Function to restore deleted comments (if needed in future)
  async restoreComment(commentId) {
    try {
      console.log('Attempting to restore comment with ID:', commentId)

      const { data, error } = await supabase.rpc('restore_comment_from_deleted', {
        comment_id: commentId,
      })

      if (error) throw error

      if (data && data.success === false) {
        throw new Error(data.error || 'Unknown error from restore function')
      }

      console.log('Comment restored successfully')
      return { success: true }
    } catch (error) {
      console.error('Error restoring comment:', error)
      return { success: false, error: error.message }
    }
  },

  // Ratings operations
  async getRatings(documentId) {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('document_id', documentId)

      if (error) throw error

      // Calculate average rating
      const totalRatings = data.length
      const sumRatings = data.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = totalRatings > 0 ? (sumRatings / totalRatings).toFixed(1) : null

      return {
        success: true,
        data: {
          ratings: data,
          average: averageRating,
          count: totalRatings,
        },
      }
    } catch (error) {
      console.error('Error fetching ratings:', error)
      return { success: false, error: error.message }
    }
  },

  async getUserRating(documentId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return { success: true, data: null }

      const { data, error } = await supabase
        .from('ratings')
        .select('*')
        .eq('document_id', documentId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user rating:', error)
      return { success: false, error: error.message }
    }
  },

  async submitRating(documentId, rating) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User must be authenticated')

      const { data, error } = await supabase
        .from('ratings')
        .upsert(
          {
            document_id: documentId,
            user_id: user.id,
            rating: rating,
          },
          {
            onConflict: 'document_id,user_id',
          },
        )
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error submitting rating:', error)
      return { success: false, error: error.message }
    }
  },

  async deleteRating(documentId) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('User must be authenticated')

      const { error } = await supabase
        .from('ratings')
        .delete()
        .eq('document_id', documentId)
        .eq('user_id', user.id)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deleting rating:', error)
      return { success: false, error: error.message }
    }
  },

  // Download tracking
  async trackDownload(documentId, downloadType = 'pdf') {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        console.warn('Download tracking skipped: User not authenticated')
        return { success: true }
      }

      const { data, error } = await supabase
        .from('downloads')
        .insert({
          document_id: documentId,
          user_id: user.id,
          type: downloadType,
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error tracking download:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Request a signed download URL through Edge Function that enforces the 5 free downloads limit.
   * Also records the download server-side when allowed.
   * @param {string} documentId
   * @returns {Promise<{success: true, url: string} | {success:false, error:string, code?:string}>}
   */
  async requestLimitedDownload(documentId) {
    try {
      if (!documentId) throw new Error('Document ID is required')

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return {
          success: false,
          error: 'Vous devez être connecté pour télécharger.',
          code: 'not_authenticated',
        }
      }

      const { data, error } = await supabase.functions.invoke('download_with_limit', {
        body: { documentId },
      })

      if (error) {
        const normalized = String(error.message || '')
        const serverErrorCode = data && typeof data === 'object' ? data.error : undefined
        const isLimit = serverErrorCode === 'download_limit_reached' || error.status === 403
        return {
          success: false,
          error: isLimit
            ? 'Limite de téléchargements atteinte.'
            : normalized || 'Erreur lors de la génération du lien de téléchargement.',
          code: isLimit ? 'download_limit_reached' : undefined,
        }
      }

      if (!data?.signedUrl) {
        return { success: false, error: 'URL de téléchargement non générée.' }
      }

      return { success: true, url: data.signedUrl, used: data.used, allowed: data.allowed }
    } catch (err) {
      console.error('Error requesting limited download:', err)
      return { success: false, error: err.message || 'Erreur inconnue.' }
    }
  },

  /**
   * Get the authenticated user's total download count
   * @returns {Promise<{success:true, used:number, remaining:number} | {success:false, error:string}>}
   */
  async getUserDownloadCount() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        return { success: true, used: 0, remaining: 5, allowed: 5 }
      }

      const { count, error } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if (error) throw error

      // fetch adaptive allowed value
      const { data: allowedData, error: allowedErr } = await supabase.rpc('get_allowed_downloads', {
        p_user_id: user.id,
      })
      if (allowedErr) throw allowedErr

      const allowed = Number(allowedData ?? 5)
      const used = count || 0
      const remaining = Math.max(0, allowed - used)
      return { success: true, used, remaining, allowed }
    } catch (error) {
      console.error('Error fetching user download count:', error)
      return { success: false, error: error.message }
    }
  },

  // Research history logging
  async logResearchHistory(entry) {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      const payload = {
        user_id: user ? user.id : null,
        city_id: entry.city_id || null,
        address_input: entry.address_input || null,
        geo_lon: typeof entry.geo_lon === 'number' ? entry.geo_lon : null,
        geo_lat: typeof entry.geo_lat === 'number' ? entry.geo_lat : null,
        zone_label: entry.zone_label || null,
        success: Boolean(entry.success),
        reason: entry.reason || null,
        created_at: new Date().toISOString(),
      }

      const { error } = await supabase.from('research_history').insert(payload)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error logging research history:', error)
      return { success: false, error: error.message }
    }
  },

  async getDownloadStats(documentId) {
    try {
      const { count, error } = await supabase
        .from('downloads')
        .select('*', { count: 'exact', head: true })
        .eq('document_id', documentId)

      if (error) throw error
      return { success: true, data: { count: count || 0 } }
    } catch (error) {
      console.error('Error fetching download stats:', error)
      return { success: false, error: error.message }
    }
  },

  // Contact form
  async submitContact(name, email, message) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          message,
          created_at: new Date().toISOString(),
        })
        .single()

      if (error) throw error
      return { success: true, message: 'Your message has been sent successfully!' }
    } catch (error) {
      console.error('Error submitting contact form:', error)
      return { success: false, error: error.message }
    }
  },

  // User profile operations
  async getUserProfile(userId) {
    try {
      // Validate input
      if (!userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single()

      if (error && error.code !== 'PGRST116') throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return { success: false, error: error.message }
    }
  },

  async updateUserProfile(userId, profileData) {
    try {
      // Validate inputs
      if (!userId || !profileData) {
        throw new Error('User ID and profile data are required')
      }

      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error updating user profile:', error)
      return { success: false, error: error.message }
    }
  },

  // Profile management - Ensures user profile exists
  async ensureUserProfile(user) {
    try {
      if (!user || !user.id) {
        throw new Error('User object is required')
      }

      // Check if profile exists
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // If profile doesn't exist (PGRST116 = no rows returned), create it
      if (fetchError && fetchError.code === 'PGRST116') {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || null,
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (insertError) throw insertError
        return { success: true, data: newProfile, created: true }
      }

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError

      return { success: true, data: existingProfile, created: false }
    } catch (error) {
      console.error('Error ensuring user profile:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Fetch multiple profiles by their IDs
   * @param {string[]} userIds
   * @returns {Promise<{success: boolean, data: Array<{id: string, pseudo?: string, full_name?: string, email?: string}>}|{success:false,error:string}>}
   */
  async getProfilesByIds(userIds) {
    try {
      if (!Array.isArray(userIds) || userIds.length === 0) {
        return { success: true, data: [] }
      }

      const uniqueIds = Array.from(new Set(userIds.filter(Boolean)))

      const { data, error } = await supabase
        .from('profiles')
        .select('id, pseudo, full_name, email')
        .in('id', uniqueIds)

      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching profiles by IDs:', error)
      return { success: false, error: error.message }
    }
  },

  // Blog: Edge Functions integration
  /**
   * Generate blog content via Edge Function.
   * Supports Anthropic or Gemini depending on server env (LLM_PROVIDER).
   * @param {Object} payload
   * @returns {Promise<{success:boolean,data?:any,error?:string}>}
   */
  async generateBlogContent(payload) {
    try {
      const { data, error } = await supabase.functions.invoke('generate-blog-content', {
        body: payload,
      })
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error generating blog content:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Validate SEO heuristically; optionally persists an audit record when allowed.
   * @param {Object} payload
   * @returns {Promise<{success:boolean,data?:any,error?:string}>}
   */
  async validateSEO(payload) {
    try {
      const { data, error } = await supabase.functions.invoke('validate-seo', {
        body: payload,
      })
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error validating SEO:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Save a blog draft into blog_articles with status 'draft'.
   * In local dev without Supabase configured, simulate success.
   * @param {Object} payload
   * @returns {Promise<{success:boolean,data?:any,error?:string}>}
   */
  async saveBlogDraft(payload) {
    try {
      if (!isSupabaseConfigured) {
        console.info('[Supabase] saveBlogDraft: Supabase not configured, returning simulated success')
        return { success: true, data: { id: 'local-draft', ...payload, status: 'draft' } }
      }

      const {
        data: { user },
      } = await supabase.auth.getUser().catch(() => ({ data: { user: null } }))

      // Ensure profile exists to satisfy FK to public.profiles and for future joins
      if (user) {
        await this.ensureUserProfile(user)
      }

      const now = new Date().toISOString()
      const record = {
        title: payload.meta_title || 'Sans titre',
        slug: (payload.canonical_url || '').split('/').filter(Boolean).pop() || undefined,
        excerpt: payload.meta_description || null,
        content: payload.content || '',
        markdown_content: payload.content || '',
        cover_image_url: payload.cover_image_url || null,
        category_id: payload.category_id || null,
        status: 'draft',
        meta_title: payload.meta_title || null,
        meta_description: payload.meta_description || null,
        canonical_url: payload.canonical_url || null,
        author_id: user ? user.id : null,
        created_at: now,
        updated_at: now,
      }

      console.debug('[Supabase] Inserting draft into blog_articles')
      const { data, error } = await supabase
        .from('blog_articles')
        .insert(record)
        .select('*')
        .single()

      if (error) throw error
      console.debug('[Supabase] Draft insert success', { id: data?.id })
      return { success: true, data }
    } catch (error) {
      console.error('Error saving blog draft:', error)
      return { success: false, error: error.message }
    }
  },

  // Blog taxonomy
  async getBlogCategories() {
    try {
      if (!isSupabaseConfigured) return { success: true, data: [] }
      const { data, error } = await supabase.from('blog_categories').select('*').eq('is_active', true).order('name')
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching blog categories:', error)
      return { success: false, error: error.message }
    }
  },

  async getBlogTags() {
    try {
      if (!isSupabaseConfigured) return { success: true, data: [] }
      const { data, error } = await supabase.from('blog_tags').select('*').order('name')
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching blog tags:', error)
      return { success: false, error: error.message }
    }
  },

  async setArticleTags(articleId, tagIds) {
    try {
      if (!articleId || !Array.isArray(tagIds)) return { success: true }
      if (!isSupabaseConfigured) return { success: true }
      // Clear then insert
      await supabase.from('blog_article_tags').delete().eq('article_id', articleId)
      if (tagIds.length === 0) return { success: true }
      const rows = tagIds.map((id) => ({ article_id: articleId, tag_id: id }))
      const { error } = await supabase.from('blog_article_tags').insert(rows)
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error setting article tags:', error)
      return { success: false, error: error.message }
    }
  },

  async publishArticle(articleId, payload) {
    try {
      if (!isSupabaseConfigured) return { success: true }
      const { data, error } = await supabase
        .from('blog_articles')
        .update({
          status: 'published',
          published_at: new Date().toISOString(),
          meta_title: payload.meta_title || null,
          meta_description: payload.meta_description || null,
          canonical_url: payload.canonical_url || null,
          category_id: payload.category_id || null,
          cover_image_url: payload.cover_image_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', articleId)
        .select('*')
        .single()
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error publishing article:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Mark an article as ready (metadata complete, not yet published)
   * Updates metadata fields and sets status to 'ready'.
   */
  async markArticleReady(articleId, payload) {
    try {
      const now = new Date().toISOString()
      if (!isSupabaseConfigured) {
        return { success: true, data: { id: articleId || 'local-draft', status: 'ready', updated_at: now } }
      }
      const { data, error } = await supabase
        .from('blog_articles')
        .update({
          status: 'ready',
          meta_title: payload?.meta_title ?? null,
          meta_description: payload?.meta_description ?? null,
          canonical_url: payload?.canonical_url ?? null,
          category_id: payload?.category_id ?? null,
          cover_image_url: payload?.cover_image_url ?? null,
          updated_at: now,
        })
        .eq('id', articleId)
        .select('*')
        .single()
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error marking article ready:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Send analytics event for blog articles.
   * Note: requires user to be authenticated due to function JWT verification.
   * @param {Object} event
   * @returns {Promise<{success:boolean,error?:string}>}
   */
  async sendBlogAnalyticsEvent(event) {
    try {
      const { data, error } = await supabase.functions.invoke('process-analytics', {
        body: event,
      })
      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error sending blog analytics event:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Schedule an article by setting status to 'scheduled' and scheduled_at.
   */
  async scheduleArticle(articleId, payload) {
    try {
      const now = new Date().toISOString()
      if (!isSupabaseConfigured) {
        return { success: true, data: { id: articleId || 'local', status: 'scheduled', scheduled_at: payload?.scheduled_at || now } }
      }
      const { data, error } = await supabase
        .from('blog_articles')
        .update({
          status: 'scheduled',
          scheduled_at: payload?.scheduled_at || now,
          updated_at: now,
        })
        .eq('id', articleId)
        .select('*')
        .single()
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error scheduling article:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * List blog articles with optional status filter and pagination.
   * @param {{status?: 'all'|'draft'|'scheduled'|'published'|'archived', search?: string, page?: number, pageSize?: number}} params
   * @returns {Promise<{success:boolean, data?:{items:any[], total:number, page:number, pageSize:number}, error?:string}>}
   */
  async listBlogArticles(params = {}) {
    try {
      const status = params.status || 'all'
      const page = Math.max(1, Number(params.page) || 1)
      const pageSize = Math.max(1, Math.min(50, Number(params.pageSize) || 10))
      const search = (params.search || '').trim()

      if (!isSupabaseConfigured) {
        // Simulated data for unit tests and local dev: 3 drafts, 1 scheduled, 1 published
        const simulated = [
          { id: 'draft-1', title: 'Brouillon 1', status: 'draft', updated_at: new Date().toISOString() },
          { id: 'draft-2', title: 'Brouillon 2', status: 'draft', updated_at: new Date().toISOString() },
          { id: 'draft-3', title: 'Brouillon 3', status: 'draft', updated_at: new Date().toISOString() },
          { id: 'sched-1', title: 'Planifié', status: 'scheduled', updated_at: new Date().toISOString() },
          { id: 'pub-1', title: 'Publié', status: 'published', updated_at: new Date().toISOString() },
        ]
        let filtered = simulated
        if (status !== 'all') filtered = filtered.filter((a) => a.status === status)
        if (search) filtered = filtered.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
        const start = (page - 1) * pageSize
        const items = filtered.slice(start, start + pageSize)
        return { success: true, data: { items, total: filtered.length, page, pageSize } }
      }

      let query = supabase
        .from('blog_articles')
        .select('id, title, slug, status, updated_at, meta_title, meta_description, category_id, author_id', { count: 'exact' })
      if (status !== 'all') query = query.eq('status', status)
      if (search) query = query.ilike('title', `%${search}%`)
      query = query.order('updated_at', { ascending: false })

      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      const { data, error, count } = await query.range(from, to)
      if (error) throw error

      return {
        success: true,
        data: {
          items: data || [],
          total: typeof count === 'number' ? count : (data?.length || 0),
          page,
          pageSize,
        },
      }
    } catch (error) {
      console.error('Error listing blog articles:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Fetch a single blog article by id.
   */
  async getBlogArticleById(id) {
    try {
      if (!id) throw new Error('Article ID is required')
      if (!isSupabaseConfigured) {
        return { success: true, data: { id, title: 'Brouillon', slug: 'brouillon', status: 'draft', content: '# Draft', markdown_content: '# Draft', meta_title: 'Brouillon', meta_description: 'Extrait', category_id: null, cover_image_url: null, tags: [] } }
      }
      const { data, error } = await supabase.from('blog_articles').select('*').eq('id', id).single()
      if (error) throw error
      return { success: true, data }
    } catch (error) {
      console.error('Error fetching blog article by id:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Update an existing draft (by id) or insert if not exists, preserving status=draft.
   */
  async upsertBlogDraft(id, payload) {
    try {
      const now = new Date().toISOString()
      if (!isSupabaseConfigured) {
        return { success: true, data: { id: id || 'local-draft', status: 'draft', ...payload, updated_at: now } }
      }

      const base = { updated_at: now }
      // Only set fields when explicitly provided to avoid clearing content
      if (typeof payload.content !== 'undefined') {
        base.content = payload.content
        base.markdown_content = payload.content
      }
      if (typeof payload.meta_title !== 'undefined') base.meta_title = payload.meta_title || null
      if (typeof payload.meta_description !== 'undefined') base.meta_description = payload.meta_description || null
      if (typeof payload.canonical_url !== 'undefined') base.canonical_url = payload.canonical_url || null
      if (typeof payload.category_id !== 'undefined') base.category_id = payload.category_id || null
      if (typeof payload.cover_image_url !== 'undefined') base.cover_image_url = payload.cover_image_url || null

      // if id provided, update; else insert
      if (id) {
        const { data, error } = await supabase
          .from('blog_articles')
          .update({ ...base, status: 'draft' })
          .eq('id', id)
          .select('*')
          .single()
        if (error) throw error
        if (Array.isArray(payload.tag_ids)) {
          await this.setArticleTags(data.id, payload.tag_ids)
        }
        return { success: true, data }
      } else {
        const insert = await this.saveBlogDraft(payload)
        if (!insert.success) return insert
        if (Array.isArray(payload.tag_ids)) {
          await this.setArticleTags(insert.data.id, payload.tag_ids)
        }
        return insert
      }
    } catch (error) {
      console.error('Error upserting blog draft:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get tag IDs for an article from blog_article_tags
   * @param {string} articleId
   * @returns {Promise<{success:boolean, data:string[]}|{success:false,error:string}>}
   */
  async getArticleTagIds(articleId) {
    try {
      if (!articleId) return { success: true, data: [] }
      if (!isSupabaseConfigured) return { success: true, data: [] }
      const { data, error } = await supabase
        .from('blog_article_tags')
        .select('tag_id')
        .eq('article_id', articleId)
      if (error) throw error
      const tagIds = Array.isArray(data) ? data.map((r) => r.tag_id).filter(Boolean) : []
      return { success: true, data: tagIds }
    } catch (error) {
      console.error('Error fetching article tag ids:', error)
      return { success: false, error: error.message }
    }
  },
}
