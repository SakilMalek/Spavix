import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const files = ['gemini_image_generate.py', 'gemini_config.json'];

files.forEach(file => {
  const src = path.join(__dirname, file);
  const dst = path.join(__dirname, 'dist', file);
  
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dst);
    console.log(`✓ Copied ${file} to dist/`);
  } else {
    console.warn(`⚠ Warning: ${file} not found at ${src}`);
  }
});
