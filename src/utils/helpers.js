/**
 * Helper Functions Module
 * @module helpers
 * @description This module provides various utility functions used throughout the application.
 * @version 1.0.0
 * @author GreyPanda
 */

/**
 * Capitalizes the first letter of each word in a string.
 * @param {string} str - The input string.
 * @returns {string} The string with the first letter of each word capitalized.
 */
export function formatCityName(str) {
  if (!str) return ''
  return 'Métropole de ' + str.replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Converts a string to a URL-safe slug.
 * @param {string} str - The input string.
 * @returns {string} A URL-safe slug.
 */
export function createSlug(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Converts a slug back to a readable string.
 * @param {string} slug - The URL slug.
 * @returns {string} A readable string.
 */
export function slugToString(slug) {
  if (!slug) return ''
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Finds an item by slug in an array.
 * @param {Array} items - Array of objects with name and id properties.
 * @param {string} slug - The slug to search for.
 * @returns {Object|null} The matching item or null.
 */
export function findBySlug(items, slug) {
  if (!items || !slug) return null
  return items.find((item) => createSlug(item.name) === slug) || null
}

/**
 * Parse URL hash parameters
 * Handles URL fragments like #error=access_denied&error_code=otp_expired
 * @param {string} hash - The hash string from window.location.hash
 * @returns {Object} - Parsed parameters as key-value pairs
 */
export function parseHashParams(hash) {
  const params = {}

  // Remove the # symbol and split by &
  const cleanHash = hash.replace('#', '')
  if (!cleanHash) return params

  const pairs = cleanHash.split('&')

  pairs.forEach((pair) => {
    const [key, value] = pair.split('=')
    if (key && value) {
      // Decode URL-encoded values
      params[key] = decodeURIComponent(value.replace(/\+/g, ' '))
    }
  })

  return params
}

/**
 * Check if URL contains expired confirmation link parameters
 * @param {string} hash - The hash string from window.location.hash
 * @returns {boolean} - True if the link is expired
 */
export function isExpiredConfirmationLink(hash) {
  const params = parseHashParams(hash)
  return params.error_code === 'otp_expired' && params.error === 'access_denied'
}

/**
 * Get user-friendly error message for expired confirmation
 * @returns {string} - Localized error message
 */
export function getExpiredConfirmationMessage() {
  return 'Votre lien de confirmation a expiré. Veuillez créer à nouveau un compte afin de recevoir un nouveau lien.'
}

/**
 * Clean URL hash parameters
 * Removes hash fragments from the current URL
 */
export function cleanUrlHash() {
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, null, window.location.pathname + window.location.search)
  }
}
