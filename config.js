// Configuration file for environment variables
// This file should be updated during the build process to inject actual environment variables
// For development, it uses default values

window.EMAILJS_CONFIG = {
  PUBLIC_KEY: process.env.EMAILJS_PUBLIC_KEY || 'jqDn0eJgHsEGzhMjA',
  SERVICE_ID: process.env.EMAILJS_SERVICE_ID || 'service_ifxv35f',
  TEMPLATE_ID: process.env.EMAILJS_TEMPLATE_ID || 'template_dw4xdjj'
};

// Server configuration
window.SERVER_CONFIG = {
  PORT: process.env.PORT || 3001,
  HOST: process.env.HOST || 'localhost'
};

// Log configuration (for debugging)
console.log('Configuration loaded:', {
  EMAILJS: window.EMAILJS_CONFIG,
  SERVER: window.SERVER_CONFIG
}); 