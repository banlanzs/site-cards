const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

const root = path.resolve(__dirname, '..');
const dataPath = path.join(root, 'data.txt');
const sitesPath = path.join(root, 'src', 'config', 'sites.json');

if (!fs.existsSync(dataPath)) {
  console.error('data.txt not found at', dataPath);
  process.exit(1);
}

const raw = fs.readFileSync(dataPath, 'utf8');
const $ = cheerio.load(raw);

const sites = [];

$('a.card').each((i, el) => {
  const $el = $(el);
  const url = $el.attr('href') || $el.attr('data-url') || '';
  // name in <strong>
  const name = $el.find('strong').first().text().trim() || $el.find('img').attr('alt') || url;
  const description = $el.find('p').first().text().trim() || '';
  // image src may be relative
  let icon = $el.find('img').first().attr('src') || '';
  if (icon && !icon.startsWith('http') && !icon.startsWith('/')) {
    // make it absolute path under /assets
    icon = '/' + icon.replace(/^\//, '');
  }

  if (!url) return;

  const id = slugify(name) || slugify(url);

  sites.push({
    id,
    name,
    url: url.trim(),
    description: description || undefined,
    icon: icon || undefined
  });
});

if (!fs.existsSync(sitesPath)) {
  console.error('sites.json not found at', sitesPath);
  process.exit(1);
}

const sitesJsonRaw = fs.readFileSync(sitesPath, 'utf8');
let sitesJson;
try {
  sitesJson = JSON.parse(sitesJsonRaw);
} catch (e) {
  console.error('Failed to parse sites.json:', e.message);
  process.exit(1);
}

// Replace or add category with id 'liman'
const newCategory = {
  id: 'liman',
  name: '利曼收集',
  icon: '🔖',
  sites
};

let replaced = false;
if (Array.isArray(sitesJson.categories)) {
  sitesJson.categories = sitesJson.categories.map(cat => {
    if (cat.id === 'liman') {
      replaced = true;
      return newCategory;
    }
    return cat;
  });
  if (!replaced) sitesJson.categories.push(newCategory);
} else {
  sitesJson.categories = [newCategory];
}

fs.writeFileSync(sitesPath, JSON.stringify(sitesJson, null, 2), 'utf8');
console.log('Wrote', sites.length, 'sites into category "liman" in', sitesPath);
if (!replaced) console.log('Category did not exist previously; it was appended.');
else console.log('Category replaced.');
