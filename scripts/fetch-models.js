#!/usr/bin/env node

/**
 * Script to fetch available models from Pollinations API
 * Usage: node scripts/fetch-models.js
 */

const fs = require('fs');
const path = require('path');

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
  console.log('Fetching models from Pollinations API...\n');

  const [pollinationsText, pollinationsImage] = await Promise.all([
    fetchModels('https://gen.pollinations.ai/v1/models', POLLINATIONS_KEY, 'Pollinations Text'),
    fetchModels('https://gen.pollinations.ai/image/models', POLLINATIONS_KEY, 'Pollinations Image')
  ]);

  const outputDir = path.join(__dirname, '../.models-cache');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  if (pollinationsText) fs.writeFileSync(path.join(outputDir, 'pollinations-text.json'), JSON.stringify(pollinationsText, null, 2));
  if (pollinationsImage) fs.writeFileSync(path.join(outputDir, 'pollinations-image.json'), JSON.stringify(pollinationsImage, null, 2));

  console.log(`\n✓ Saved to ${outputDir}/`);
}

main().catch(console.error);
