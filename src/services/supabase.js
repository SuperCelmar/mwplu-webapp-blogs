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

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL or Anon Key is missing. Check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const dbService = {
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

  // Chat operations
  /**
   * Get or create a chat session for a user and document
   * @param {string} userId - The user ID
   * @param {string} documentId - The document ID
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async getOrCreateChatSession(userId, documentId) {
    try {
      if (!userId || !documentId) {
        throw new Error('User ID and document ID are required')
      }

      // Check for existing active session
      const { data: existingSession, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('document_id', documentId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fetchError) throw fetchError

      if (existingSession) {
        return { success: true, data: existingSession }
      }

      // Create new session
      const { data: newSession, error: insertError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: userId,
          document_id: documentId,
          is_active: true,
        })
        .select()
        .single()

      if (insertError) throw insertError
      return { success: true, data: newSession }
    } catch (error) {
      console.error('Error getting or creating chat session:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Get chat messages for a session
   * @param {string} sessionId - The session ID
   * @returns {Promise<{success: boolean, data: Array}>}
   */
  async getChatMessages(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required')
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return { success: true, data: data || [] }
    } catch (error) {
      console.error('Error fetching chat messages:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Save a chat message
   * @param {string} sessionId - The session ID
   * @param {string} userId - The user ID
   * @param {string} documentId - The document ID
   * @param {string} role - Message role ('user' or 'assistant')
   * @param {string} message - The message content
   * @param {Object} metadata - Optional metadata
   * @returns {Promise<{success: boolean, data: Object}>}
   */
  async saveChatMessage(sessionId, userId, documentId, role, message, metadata = {}) {
    try {
      if (!sessionId || !userId || !documentId || !role || !message) {
        throw new Error('Session ID, user ID, document ID, role, and message are required')
      }

      if (role !== 'user' && role !== 'assistant') {
        throw new Error('Role must be either "user" or "assistant"')
      }

      const { data, error } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          user_id: userId,
          document_id: documentId,
          role,
          message: message.trim(),
          metadata,
        })
        .select()
        .single()

      if (error) throw error

      // Update session's last_message_at
      await supabase
        .from('chat_sessions')
        .update({ last_message_at: new Date().toISOString() })
        .eq('id', sessionId)

      return { success: true, data }
    } catch (error) {
      console.error('Error saving chat message:', error)
      return { success: false, error: error.message }
    }
  },

  /**
   * Check if user has an active chat session for a document
   * @param {string} userId - The user ID
   * @param {string} documentId - The document ID
   * @returns {Promise<{success: boolean, hasSession: boolean, sessionId: string|null}>}
   */
  async hasActiveChatSession(userId, documentId) {
    try {
      if (!userId || !documentId) {
        return { success: true, hasSession: false, sessionId: null }
      }

      const { data, error } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', userId)
        .eq('document_id', documentId)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle()

      if (error) throw error

      return {
        success: true,
        hasSession: !!data,
        sessionId: data?.id || null,
      }
    } catch (error) {
      console.error('Error checking for active chat session:', error)
      return { success: false, hasSession: false, sessionId: null, error: error.message }
    }
  },

  /**
   * Clear/deactivate a chat session
   * @param {string} sessionId - The session ID
   * @returns {Promise<{success: boolean}>}
   */
  async deactivateChatSession(sessionId) {
    try {
      if (!sessionId) {
        throw new Error('Session ID is required')
      }

      const { error } = await supabase
        .from('chat_sessions')
        .update({ is_active: false })
        .eq('id', sessionId)

      if (error) throw error
      return { success: true }
    } catch (error) {
      console.error('Error deactivating chat session:', error)
      return { success: false, error: error.message }
    }
  },
}
