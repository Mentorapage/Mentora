// Configuration file for environment variables
// This file should be updated during the build process to inject actual environment variables
// For development, it uses default values

window.EMAILJS_CONFIG = {
  PUBLIC_KEY: 'jqDn0eJgHsEGzhMjA', // This should be replaced with environment variable in production
  SERVICE_ID: 'service_ifxv35f',   // This should be replaced with environment variable in production
  TEMPLATE_ID: 'template_dw4xdjj'  // This should be replaced with environment variable in production
};

// Server configuration
window.SERVER_CONFIG = {
  PORT: 3001,
  HOST: 'localhost'
};

// Log configuration (for debugging)
console.log('Configuration loaded:', {
  EMAILJS: window.EMAILJS_CONFIG,
  SERVER: window.SERVER_CONFIG
}); 