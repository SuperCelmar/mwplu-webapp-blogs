/**
 * Donation Service
 * @module donationService
 * @description Handles donation-related operations and notifications
 * @version 1.0.0
 *
 * Features:
 * - Email notification handling for successful donations
 * - Integration with Supabase Edge Functions for email sending
 * - Donation tracking and analytics
 * - Receipt generation and delivery
 *
 * Design Principles:
 * - Separation of concerns from UI logic
 * - Reliable email delivery with error handling
 * - Integration with existing Supabase infrastructure
 * - Comprehensive logging for debugging
 */

import { supabase } from '@/services/supabase'

/**
 * Email templates for donation notifications
 */
const EMAIL_TEMPLATES = {
  success: {
    subject: 'Merci pour votre don à MWPLU !',
    getHtml: (donationData) => `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reçu de don - MWPLU</title>
        <style>
          body { font-family: 'Lato', Arial, sans-serif; margin: 0; padding: 20px; background-color: #f9f9f9; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .header { background: #000; color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .amount { font-size: 24px; font-weight: bold; color: #10B981; text-align: center; margin: 20px 0; }
          .details { background: #f3f4f6; padding: 20px; border-radius: 4px; margin: 20px 0; }
          .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 14px; color: #6b7280; }
          .button { display: inline-block; padding: 12px 24px; background: #000; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>MWPLU</h1>
            <p>Merci pour votre soutien !</p>
          </div>
          <div class="content">
            <h2>Votre don a été traité avec succès</h2>
            <p>Nous vous remercions sincèrement pour votre générosité. Votre contribution nous aide à améliorer l'accès aux documents d'urbanisme pour tous.</p>

            <div class="amount">
              Montant du don: ${donationData.amount}€
            </div>

            <div class="details">
              <strong>Détails de la transaction:</strong><br>
              Référence: ${donationData.reference}<br>
              Date: ${donationData.date}<br>
              Moyen de paiement: ${donationData.paymentMethod}<br>
              Email: ${donationData.email}
            </div>

            <h3>Ce que votre don nous permet de faire:</h3>
            <ul>
              <li>Améliorer la qualité de nos synthèses PLU</li>
              <li>Développer de nouvelles fonctionnalités</li>
              <li>Maintenir un accès gratuit pour tous</li>
              <li>Supporter l'infrastructure technique</li>
            </ul>

            <p>Ce reçu fait office de justificatif pour votre don. Conservez-le précieusement.</p>

            <a href="${donationData.dashboardUrl}" class="button">Accéder à votre tableau de bord</a>
          </div>
          <div class="footer">
            <p>MWPLU - Plateforme de synthèse des Plans Locaux d'Urbanisme</p>
            <p>Si vous avez des questions, contactez-nous à contact@mwplu.com</p>
          </div>
        </div>
      </body>
      </html>
    `,
    getText: (donationData) => `
      MWPLU - Merci pour votre don !

      Votre don de ${donationData.amount}€ a été traité avec succès.

      Détails de la transaction:
      - Référence: ${donationData.reference}
      - Date: ${donationData.date}
      - Email: ${donationData.email}

      Ce reçu fait office de justificatif pour votre don.

      Merci de votre soutien !

      L'équipe MWPLU
      contact@mwplu.com
    `,
  },
}

/**
 * Send donation success email notification
 * @param {Object} donationData - Donation information
 * @param {string} donationData.email - Recipient email
 * @param {number} donationData.amount - Donation amount
 * @param {string} donationData.reference - Transaction reference
 * @param {string} donationData.paymentMethod - Payment method used
 * @returns {Promise<Object>} Email sending result
 */
export async function sendDonationSuccessEmail(donationData) {
  try {
    const emailData = {
      to: donationData.email,
      subject: EMAIL_TEMPLATES.success.subject,
      html: EMAIL_TEMPLATES.success.getHtml({
        ...donationData,
        date: new Date().toLocaleDateString('fr-FR'),
        dashboardUrl: `${window.location.origin}/dashboard`,
        paymentMethod: donationData.paymentMethod || 'Carte bancaire',
      }),
      text: EMAIL_TEMPLATES.success.getText({
        ...donationData,
        date: new Date().toLocaleDateString('fr-FR'),
      }),
    }

    // Call Supabase Edge Function for sending email
    const { data, error } = await supabase.functions.invoke('send-donation-email', {
      body: emailData,
    })

    if (error) {
      throw error
    }

    console.log('Donation success email sent:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending donation success email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Track donation for analytics
 * @param {Object} donationData - Donation information
 * @returns {Promise<Object>} Tracking result
 */
export async function trackDonation(donationData) {
  try {
    const { data, error } = await supabase.from('donations').insert([
      {
        amount: donationData.amount,
        reference: donationData.reference,
        email: donationData.email,
        payment_method: donationData.paymentMethod || 'stripe',
        status: 'completed',
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      throw error
    }

    console.log('Donation tracked:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error tracking donation:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Handle complete donation process (email + tracking)
 * @param {Object} donationData - Donation information
 * @returns {Promise<Object>} Complete process result
 */
export async function processDonationCompletion(donationData) {
  try {
    // Send success email
    const emailResult = await sendDonationSuccessEmail(donationData)

    // Track donation (optional - continue even if fails)
    const trackingResult = await trackDonation(donationData)

    if (!trackingResult.success) {
      console.warn('Donation tracking failed but email was sent:', trackingResult.error)
    }

    return {
      success: emailResult.success,
      email: emailResult,
      tracking: trackingResult,
    }
  } catch (error) {
    console.error('Error processing donation completion:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Generate donation receipt data
 * @param {Object} stripeData - Data from Stripe webhook/session
 * @returns {Object} Formatted donation data for receipts
 */
export function formatDonationData(stripeData) {
  return {
    amount: stripeData.amount_total ? stripeData.amount_total / 100 : stripeData.amount,
    reference: stripeData.id || stripeData.payment_intent,
    email: stripeData.customer_details?.email || stripeData.customer_email,
    paymentMethod: stripeData.payment_method_types?.[0] || 'Carte bancaire',
    currency: stripeData.currency || 'eur',
  }
}

/**
 * Validate webhook signature (for production)
 * @param {string} payload - Raw webhook payload
 * @param {string} signature - Stripe signature header
 * @param {string} secret - Webhook secret
 * @returns {boolean} Whether signature is valid
 */
export function validateWebhookSignature(payload, signature, secret) {
  // In production, implement proper Stripe webhook signature validation
  // This is a placeholder for the implementation
  console.log('Webhook validation:', { payload: payload.length, signature, secret })
  return true
}

// Export for easier testing and modularity
export const donationService = {
  sendDonationSuccessEmail,
  trackDonation,
  processDonationCompletion,
  formatDonationData,
  validateWebhookSignature,
}

export default donationService
