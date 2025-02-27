const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const distHtmlPath = path.join(distDir, 'index.html');

// Find JS and CSS files
const jsFile = fs.readdirSync(distDir).find(f => f.match(/^index\.[a-f0-9]+\.js$/));
const cssFile = fs.readdirSync(distDir).find(f => f.match(/^index\.[a-f0-9]+\.css$/));

if (!jsFile || !cssFile) {
  console.error('Missing JS or CSS file in dist/:', { jsFile, cssFile });
  process.exit(1);
}

const jsContent = fs.readFileSync(path.join(distDir, jsFile), 'utf8');
const cssContent = fs.readFileSync(path.join(distDir, cssFile), 'utf8');

let html = fs.readFileSync(distHtmlPath, 'utf8');

// Flexible regex to match JS and CSS tags
const jsRegex = new RegExp(`<script\\s+src=["']\\.?/?${jsFile}["']\\s*></script>`, 'i');
const cssRegex = new RegExp(`<link\\s+rel=["']stylesheet["']\\s+href=["']\\.?/?${cssFile}["']\\s*/?>`, 'i');

// Log matches
const jsMatch = html.match(jsRegex);
const cssMatch = html.match(cssRegex);
console.log('JS tag match:', jsMatch ? jsMatch[0] : 'Not found');
console.log('CSS tag match:', cssMatch ? cssMatch[0] : 'Not found');

// Replace tags
html = html.replace(jsRegex, `<script>${jsContent}</script>`);
html = html.replace(cssRegex, `<style>${cssContent}</style>`);

// Verify inlining (ignore CDN scripts)
const remainingLocalScripts = html.match(/<script src=["']\.?\/?index\.[a-f0-9]+\.js["']>/g);
const remainingLocalLinks = html.match(/<link rel=["']stylesheet["'] href=["']\.?\/?index\.[a-f0-9]+\.css["']>/g);
if (remainingLocalScripts || remainingLocalLinks) {
  console.error('Inlining failed - local external references remain:');
  if (remainingLocalScripts) console.error('Remaining local scripts:', remainingLocalScripts);
  if (remainingLocalLinks) console.error('Remaining local links:', remainingLocalLinks);
  process.exit(1);
} else {
  console.log('Inlining successful!');
}

fs.writeFileSync(distHtmlPath, html, 'utf8');