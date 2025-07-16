#!/usr/bin/env node

/**
 * Build script to inject environment variables into config.js
 * Usage: node build-config.js [production|development]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config();

const mode = process.argv[2] || 'development';
const configPath = path.join(__dirname, 'config.js');

console.log(`Building config for ${mode} mode...`);

// Read the current config file
let configContent = fs.readFileSync(configPath, 'utf8');

if (mode === 'production') {
  // Replace process.env references with actual values
  configContent = configContent.replace(
    /process\.env\.EMAILJS_PUBLIC_KEY \|\| '([^']+)'/g,
    `'${process.env.EMAILJS_PUBLIC_KEY || 'jqDn0eJgHsEGzhMjA'}'`
  );
  
  configContent = configContent.replace(
    /process\.env\.EMAILJS_SERVICE_ID \|\| '([^']+)'/g,
    `'${process.env.EMAILJS_SERVICE_ID || 'service_ifxv35f'}'`
  );
  
  configContent = configContent.replace(
    /process\.env\.EMAILJS_TEMPLATE_ID \|\| '([^']+)'/g,
    `'${process.env.EMAILJS_TEMPLATE_ID || 'template_dw4xdjj'}'`
  );
  
  configContent = configContent.replace(
    /process\.env\.PORT \|\| (\d+)/g,
    `${process.env.PORT || 3001}`
  );
  
  configContent = configContent.replace(
    /process\.env\.HOST \|\| '([^']+)'/g,
    `'${process.env.HOST || 'localhost'}'`
  );
  
  console.log('✅ Production config built with environment variables');
} else {
  console.log('✅ Development config (using fallback values)');
}

// Write the updated config
fs.writeFileSync(configPath, configContent);

console.log('Config file updated successfully!'); 