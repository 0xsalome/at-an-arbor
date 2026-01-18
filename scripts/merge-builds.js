/**
 * Merge Builds Script
 *
 * このスクリプトは、AstroとReactのビルド結果をマージして
 * 最終的なdist/ディレクトリを作成します。
 *
 * ビルドフロー:
 * 1. Astro build → astro-blog/dist/ (ブログ詳細ページ + API)
 * 2. React build → dist-react/ (SPA: ホーム、一覧、poem、moment)
 * 3. このスクリプト → dist/ (Astro + React をマージ)
 *
 * 最終的なdist/の構造:
 * dist/
 * ├── index.html           (React SPA)
 * ├── blog/
 * │   ├── slug-1/
 * │   │   └── index.html   (Astro生成)
 * │   └── slug-2/
 * │       └── index.html   (Astro生成)
 * ├── api/
 * │   └── blog-index.json  (Astro生成)
 * ├── _astro/              (Astroアセット)
 * └── assets/              (Reactアセット)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ASTRO_DIST = path.join(PROJECT_ROOT, 'astro-blog', 'dist');
const REACT_DIST = path.join(PROJECT_ROOT, 'dist-react');
const FINAL_DIST = path.join(PROJECT_ROOT, 'dist');

// ロギング用のユーティリティ
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`),
  success: (msg) => console.log(`✅ ${msg}`),
  warn: (msg) => console.warn(`⚠️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`),
};

/**
 * ディレクトリを再帰的にコピーする
 *
 * @param {string} src - コピー元ディレクトリ
 * @param {string} dest - コピー先ディレクトリ
 * @param {Object} options - オプション
 * @param {boolean} options.overwrite - 既存ファイルを上書きするか（デフォルト: true）
 * @param {string[]} options.skipFiles - スキップするファイル名のリスト
 */
function copyDir(src, dest, options = {}) {
  const { overwrite = true, skipFiles = [] } = options;

  if (!fs.existsSync(src)) {
    log.warn(`Source directory does not exist: ${src}`);
    return;
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  let copiedFiles = 0;
  let skippedFiles = 0;

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDir(srcPath, destPath, options);
    } else {
      // スキップリストにあるファイルはコピーしない
      if (skipFiles.includes(entry.name)) {
        skippedFiles++;
        continue;
      }

      // 既存ファイルがあり、overwriteがfalseの場合はスキップ
      if (!overwrite && fs.existsSync(destPath)) {
        skippedFiles++;
        continue;
      }

      fs.copyFileSync(srcPath, destPath);
      copiedFiles++;
    }
  }

  return { copiedFiles, skippedFiles };
}

/**
 * ディレクトリを削除する（存在する場合のみ）
 *
 * @param {string} dir - 削除するディレクトリ
 */
function removeDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
    log.info(`Removed directory: ${path.basename(dir)}`);
  }
}

/**
 * ディレクトリ内のファイル数をカウントする
 *
 * @param {string} dir - カウントするディレクトリ
 * @returns {number} ファイル数
 */
function countFiles(dir) {
  if (!fs.existsSync(dir)) return 0;

  let count = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      count += countFiles(path.join(dir, entry.name));
    } else {
      count++;
    }
  }

  return count;
}

/**
 * メイン処理: ビルドをマージする
 */
function mergeBuilds() {
  log.info('Starting build merge process...');

  // 0. ビルド元のディレクトリが存在するか確認
  if (!fs.existsSync(ASTRO_DIST)) {
    log.error(`Astro build not found: ${ASTRO_DIST}`);
    log.error('Please run "cd astro-blog && npm run build" first.');
    process.exit(1);
  }

  if (!fs.existsSync(REACT_DIST)) {
    log.error(`React build not found: ${REACT_DIST}`);
    log.error('Please run "vite build --outDir dist-react" first.');
    process.exit(1);
  }

  // 1. 既存のdist/ディレクトリをクリーンアップ
  log.info('Cleaning up existing dist/ directory...');
  removeDir(FINAL_DIST);
  fs.mkdirSync(FINAL_DIST, { recursive: true });

  // 2. Astroビルドをベースとしてコピー
  log.info('Copying Astro build (blog pages + API)...');
  const astroStats = copyDir(ASTRO_DIST, FINAL_DIST);
  log.success(
    `Copied ${astroStats.copiedFiles} files from Astro build`
  );

  // 3. Reactビルドをマージ（Astroのindex.htmlは上書き）
  log.info('Merging React build (SPA: home, poem, moment)...');
  const reactStats = copyDir(REACT_DIST, FINAL_DIST, {
    overwrite: true,  // Reactのindex.htmlでAstroのindex.htmlを上書き
  });
  log.success(
    `Merged ${reactStats.copiedFiles} files from React build (${reactStats.skippedFiles} skipped)`
  );

  // 4. 一時ディレクトリ（dist-react）を削除
  log.info('Cleaning up temporary build directory...');
  removeDir(REACT_DIST);

  // 5. 最終確認
  const totalFiles = countFiles(FINAL_DIST);
  log.success(`Build merge complete! Total files: ${totalFiles}`);
  log.info(`Output directory: ${FINAL_DIST}`);

  // 6. 構造を表示
  console.log('\n📦 Final build structure:');
  const topLevel = fs.readdirSync(FINAL_DIST);
  topLevel.forEach(item => {
    const itemPath = path.join(FINAL_DIST, item);
    const isDir = fs.statSync(itemPath).isDirectory();
    const icon = isDir ? '📁' : '📄';
    console.log(`   ${icon} ${item}`);

    // blog/ と api/ の中身を表示
    if (isDir && (item === 'blog' || item === 'api')) {
      const subItems = fs.readdirSync(itemPath).slice(0, 3);  // 最初の3つだけ
      subItems.forEach(subItem => {
        console.log(`      └─ ${subItem}`);
      });
      const remaining = fs.readdirSync(itemPath).length - 3;
      if (remaining > 0) {
        console.log(`      └─ ... (${remaining} more)`);
      }
    }
  });
}

// 実行
try {
  mergeBuilds();
} catch (error) {
  log.error(`Build merge failed: ${error.message}`);
  console.error(error);
  process.exit(1);
}
