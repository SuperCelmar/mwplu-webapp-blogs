// src/services/contactService.js
/**
 * Contact Service Module
 * @module contactService
 * @description Handles contact form submissions via Discord webhook, Telegram, or email fallback
 * @version 1.0.0
 * @author GreyPanda
 */

import { supabase } from './supabase'

/**
 * Contact service for handling form submissions
 */
export const contactService = {
  /**
   * Submit contact form message
   * @param {Object} formData - Contact form data
   * @param {string} formData.name - User's name
   * @param {string} formData.email - User's email
   * @param {string} formData.subject - Message subject
   * @param {string} formData.message - Message content
   * @returns {Promise<Object>} Response object
   */
  async submitMessage(formData) {
    try {
      // First, save to database for backup and tracking
      const { data: savedMessage, error: dbError } = await supabase
        .from('contact_messages')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            subject: formData.subject,
            message: formData.message,
            status: 'pending',
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (dbError) {
        console.error('Database error:', dbError)
        // Continue with webhook even if DB fails
      }

      // Try Discord webhook
      const discordSuccess = await this.sendToDiscord(formData, savedMessage?.id)
      if (discordSuccess) {
        // Update message status to sent if we have a DB record
        if (savedMessage?.id) {
          await this.updateMessageStatus(savedMessage.id, 'sent_discord')
        }
        return { success: true, method: 'discord' }
      }

      // If Discord fails, mark as failed but don't throw error
      if (savedMessage?.id) {
        await this.updateMessageStatus(savedMessage.id, 'failed')
      }

      throw new Error('Le canal Discord a échoué')
    } catch (error) {
      console.error('Contact service error:', error)
      throw error
    }
  },

  /**
   * Send message to Discord via webhook
   */
  async sendToDiscord(formData, messageId = null) {
    const webhookUrl = import.meta.env.VITE_DISCORD_WEBHOOK_URL
    if (!webhookUrl) {
      console.log('Discord webhook URL not configured')
      return false
    }

    try {
      const embed = {
        title: `📩 Nouveau message de contact`,
        color: 0x3b82f6, // Blue color
        fields: [
          {
            name: '👤 Nom',
            value: formData.name,
            inline: true,
          },
          {
            name: '📧 Email',
            value: formData.email,
            inline: true,
          },
          {
            name: '📝 Sujet',
            value: formData.subject,
            inline: false,
          },
          {
            name: '💬 Message',
            value:
              formData.message.length > 1000
                ? formData.message.substring(0, 1000) + '...'
                : formData.message,
            inline: false,
          },
        ],
        footer: {
          text: messageId ? `ID: ${messageId}` : 'MWPLU Contact Form',
        },
        timestamp: new Date().toISOString(),
      }

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          embeds: [embed],
        }),
      })

      if (response.ok) {
        console.log('Message sent to Discord successfully')
        return true
      } else {
        console.error('Discord webhook failed:', response.status, response.statusText)
        return false
      }
    } catch (error) {
      console.error('Discord webhook error:', error)
      return false
    }
  },

  /**
   * Update message status in database
   */
  async updateMessageStatus(messageId, status) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', messageId)

      if (error) {
        console.error('Failed to update message status:', error)
      }
    } catch (error) {
      console.error('Status update error:', error)
    }
  },
}
