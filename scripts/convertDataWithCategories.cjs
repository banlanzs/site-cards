const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

const ROOT = path.resolve(__dirname, '..');
const dataPath = path.join(ROOT, 'data.txt');
const sitesJsonPath = path.join(ROOT, 'src', 'config', 'sites.json');
const placeholder = '/asset/404.png';

function slugify(name) {
  return name
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9\u4e00-\u9fa5\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function makeIconPath(src) {
  if (!src) return placeholder;
  src = src.trim();
  if (/^https?:\/\//i.test(src)) return src;
  // normalize leading slash
  const normalized = src.startsWith('/') ? src.slice(1) : src;
  const absPath = path.join(ROOT, normalized);
  if (fs.existsSync(absPath)) {
    return '/' + normalized.replace(/\\/g, '/');
  }
  return placeholder;
}

function parse() {
  const html = fs.readFileSync(dataPath, 'utf8');
  const $ = cheerio.load(html);

  const categories = [];

  $('h4').each((i, h4) => {
    const $h4 = $(h4);
    const categoryName = $h4.text().trim();
    if (!categoryName) return;
    const categoryId = slugify(categoryName);

    // find next .row sibling
    let $row = $h4.parent().nextAll('.row').first();
    if (!$row || $row.length === 0) {
      // fallback: search for the next .row in the document
      $row = $h4.nextAll('.row').first();
    }

    const sites = [];
    if ($row && $row.length) {
      $row.find('a.card').each((j, a) => {
        const $a = $(a);
        const url = $a.attr('href') || $a.attr('data-url') || '';
        const name = $a.find('strong').first().text().trim() || $a.attr('title') || url;
        const desc = $a.find('p').first().text().trim() || '';
        // find img src or data-src
        const $img = $a.find('img').first();
        let icon = '';
        if ($img && $img.length) {
          icon = $img.attr('data-src') || $img.attr('src') || '';
        }

        let baseId = slugify(name) || slugify(url || 'site-' + j);
        let id = baseId;
        // ensure uniqueness across this parse; will be de-duplicated against existing later
        let counter = 1;
        while (sites.some(s => s.id === id)) {
          id = `${baseId}-${counter++}`;
        }

        sites.push({ id, name, url, description: desc, icon: makeIconPath(icon) });
      });
    }

    categories.push({ id: categoryId, name: categoryName, icon: '🔖', sites });
  });

  return categories;
}

function mergeIntoSitesJson(parsedCategories) {
  if (!fs.existsSync(sitesJsonPath)) {
    // When creating new file, ensure ids are unique (no cross-category duplicates)
    const all = { categories: parsedCategories };
    fs.writeFileSync(sitesJsonPath, JSON.stringify(all, null, 2), 'utf8');
    console.log('Created new sites.json with', parsedCategories.length, 'categories');
    return;
  }

  const existing = JSON.parse(fs.readFileSync(sitesJsonPath, 'utf8'));
  const existingCats = existing.categories || [];

  // collect all used ids to avoid collisions
  const usedIds = new Set();
  existingCats.forEach(c => {
    (c.sites || []).forEach(s => usedIds.add(s.id));
  });

  // For each parsed category, ensure site ids do not collide with existing ones
  parsedCategories.forEach(pc => {
    pc.sites = pc.sites.map(s => {
      let id = s.id;
      const base = id;
      let counter = 1;
      while (usedIds.has(id)) {
        id = `${base}-${counter++}`;
      }
      usedIds.add(id);
      return { ...s, id };
    });

    const idx = existingCats.findIndex(c => c.id === pc.id);
    if (idx >= 0) {
      // Preserve existing category icon when present and not the placeholder marker
      const existingIcon = existingCats[idx] && existingCats[idx].icon;
      if (existingIcon && existingIcon !== '🔖') {
        pc.icon = existingIcon;
      }
      existingCats[idx] = pc;
      console.log('Replaced category:', pc.id, 'with', pc.sites.length, 'sites (icon preserved if present)');
    } else {
      existingCats.push(pc);
      console.log('Added category:', pc.id, 'with', pc.sites.length, 'sites');
    }
  });

  existing.categories = existingCats;
  fs.writeFileSync(sitesJsonPath, JSON.stringify(existing, null, 2), 'utf8');
  console.log('Wrote', parsedCategories.length, 'categories into', sitesJsonPath);
}

function main() {
  const parsed = parse();
  if (!parsed.length) {
    console.log('No categories parsed from data.txt');
    return;
  }
  mergeIntoSitesJson(parsed);

  // report placeholder usage
  const allSites = parsed.flatMap(c => c.sites || []);
  const placeholders = allSites.filter(s => s.icon === placeholder);
  console.log('Total sites parsed:', allSites.length);
  console.log('Sites using placeholder icon:', placeholders.length);
  if (placeholders.length) {
    placeholders.forEach(p => console.log(' -', p.name, p.url));
  }
}

main();
