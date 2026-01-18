/**
 * Verify Routing Configuration
 *
 * Checks if the codebase has the necessary fixes for GitHub Pages routing.
 */

import fs from 'fs';
import path from 'path';

const APP_TSX = path.join(process.cwd(), 'App.tsx');
const MERGE_SCRIPT = path.join(process.cwd(), 'scripts', 'merge-builds.js');

function verify() {
  console.log('🔍 Verifying routing configuration...');
  let errors = 0;

  // 1. Check App.tsx for basename
  const appContent = fs.readFileSync(APP_TSX, 'utf-8');
  if (!appContent.includes('basename={import.meta.env.BASE_URL}')) {
    console.error('❌ App.tsx: Router missing basename={import.meta.env.BASE_URL}');
    errors++;
  } else {
    console.log('✅ App.tsx: Router basename configured');
  }

  // 2. Check merge-builds.js for 404.html generation
  const mergeContent = fs.readFileSync(MERGE_SCRIPT, 'utf-8');
  if (!mergeContent.includes('404.html')) {
    console.error('❌ scripts/merge-builds.js: Missing 404.html generation step');
    errors++;
  } else {
    console.log('✅ scripts/merge-builds.js: 404.html generation configured');
  }

  if (errors > 0) {
    console.error(`\nFound ${errors} configuration issues.`);
    process.exit(1);
  } else {
    console.log('\n✨ All routing configurations look correct.');
  }
}

verify();
