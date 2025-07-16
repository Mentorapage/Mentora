#!/usr/bin/env node

/**
 * Vercel build script to inject environment variables into config.js
 * This script runs during the Vercel build process
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Running Vercel build script...');

// Read the current config file
const configPath = path.join(__dirname, 'config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

// Replace placeholder values with actual environment variables
// Note: In Vercel, these will be available during build time
const emailjsPublicKey = process.env.EMAILJS_PUBLIC_KEY || 'jqDn0eJgHsEGzhMjA';
const emailjsServiceId = process.env.EMAILJS_SERVICE_ID || 'service_ifxv35f';
const emailjsTemplateId = process.env.EMAILJS_TEMPLATE_ID || 'template_dw4xdjj';

console.log('📧 EmailJS Configuration:');
console.log(`   Public Key: ${emailjsPublicKey.substring(0, 8)}...`);
console.log(`   Service ID: ${emailjsServiceId}`);
console.log(`   Template ID: ${emailjsTemplateId}`);

// Update the config content
configContent = configContent.replace(
  /PUBLIC_KEY: '[^']*'/,
  `PUBLIC_KEY: '${emailjsPublicKey}'`
);

configContent = configContent.replace(
  /SERVICE_ID: '[^']*'/,
  `SERVICE_ID: '${emailjsServiceId}'`
);

configContent = configContent.replace(
  /TEMPLATE_ID: '[^']*'/,
  `TEMPLATE_ID: '${emailjsTemplateId}'`
);

// Write the updated config file
fs.writeFileSync(configPath, configContent, 'utf8');

console.log('✅ Config file updated successfully');
console.log('🚀 Build script completed'); 