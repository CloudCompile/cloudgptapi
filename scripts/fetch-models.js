#!/usr/bin/env node

/**
 * Script to fetch available models from MapleAI and Pollinations APIs
 * Usage: node scripts/fetch-models.js
 */

const fs = require('fs');
const path = require('path');

const MAPLEAI_KEY = process.env.MAPLEAI_API_KEY || 'sk-mapleai-BXUAtcXsHipIAv2RiepYngHX9edhXGat9KSdor38JkQzabSVFKTJ6Uih8rIFGp5aOSWN9nPP9BFLICFR';
const POLLINATIONS_KEY = process.env.POLLINATIONS_API_KEY || 'pk_9TfuB6vtf1x67xg5';

async function fetchModels(url, apiKey, name) {
  try {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log(`✓ Fetched ${name}`);
    return data;
  } catch (error) {
    console.error(`✗ Error fetching ${name}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('Fetching models from APIs...\n');

  const [mapleai, pollinationsText, pollinationsImage] = await Promise.all([
    fetchModels('https://api.mapleai.de/v1/models', MAPLEAI_KEY, 'MapleAI'),
    fetchModels('https://gen.pollinations.ai/v1/models', POLLINATIONS_KEY, 'Pollinations Text'),
    fetchModels('https://gen.pollinations.ai/image/models', POLLINATIONS_KEY, 'Pollinations Image')
  ]);

  const outputDir = path.join(__dirname, '../.models-cache');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  if (mapleai) fs.writeFileSync(path.join(outputDir, 'mapleai.json'), JSON.stringify(mapleai, null, 2));
  if (pollinationsText) fs.writeFileSync(path.join(outputDir, 'pollinations-text.json'), JSON.stringify(pollinationsText, null, 2));
  if (pollinationsImage) fs.writeFileSync(path.join(outputDir, 'pollinations-image.json'), JSON.stringify(pollinationsImage, null, 2));

  console.log(`\n✓ Saved to ${outputDir}/`);
}

main().catch(console.error);
