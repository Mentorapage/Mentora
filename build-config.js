#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const environment = process.argv[2] || 'development';

console.log(`Building config for environment: ${environment}`);

// Read the current config file
const configPath = path.join(__dirname, 'config.js');
let configContent = fs.readFileSync(configPath, 'utf8');

if (environment === 'production') {
  // Replace the config values with environment variables
  configContent = configContent.replace(
    /EMAILJS_PUBLIC_KEY: process\?\.env\?\.EMAILJS_PUBLIC_KEY \|\| '[^']*'/g,
    `EMAILJS_PUBLIC_KEY: '${process.env.EMAILJS_PUBLIC_KEY || 'jqDn0eJgHsEGzhMjA'}'`
  );
  
  configContent = configContent.replace(
    /EMAILJS_SERVICE_ID: process\?\.env\?\.EMAILJS_SERVICE_ID \|\| '[^']*'/g,
    `EMAILJS_SERVICE_ID: '${process.env.EMAILJS_SERVICE_ID || 'service_ifxv35f'}'`
  );
  
  configContent = configContent.replace(
    /EMAILJS_TEMPLATE_ID: process\?\.env\?\.EMAILJS_TEMPLATE_ID \|\| '[^']*'/g,
    `EMAILJS_TEMPLATE_ID: '${process.env.EMAILJS_TEMPLATE_ID || 'template_dw4xdjj'}'`
  );
  
  configContent = configContent.replace(
    /API_BASE_URL: process\?\.env\?\.API_BASE_URL \|\| '[^']*'/g,
    `API_BASE_URL: '${process.env.API_BASE_URL || 'http://localhost:3001'}'`
  );
  
  configContent = configContent.replace(
    /IS_DEVELOPMENT: process\?\.env\?\.NODE_ENV !== 'production'/g,
    "IS_DEVELOPMENT: false"
  );
  
  console.log('✅ Production config built with environment variables');
} else {
  console.log('✅ Development config preserved');
}

// Write the updated config
fs.writeFileSync(configPath, configContent);

console.log('Config file updated successfully!'); 