// Frontend Configuration
// This file loads environment variables for the frontend
// In production, these should be replaced with actual environment variables

const config = {
  // EmailJS Configuration
  EMAILJS_PUBLIC_KEY: 'jqDn0eJgHsEGzhMjA',
  EMAILJS_SERVICE_ID: 'service_ifxv35f',
  EMAILJS_TEMPLATE_ID: 'template_dw4xdjj',
  
  // Server Configuration
  API_BASE_URL: typeof window !== 'undefined' ? window.location.origin : '',
  
  // Development flag
  IS_DEVELOPMENT: false
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = config;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
  window.APP_CONFIG = config;
} 