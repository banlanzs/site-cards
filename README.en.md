# Static Site Hub

**Language / 语言：** [中文](./README.md)

A lightweight, fast static site directory with built-in search and support for common search engines.

## Quick Start

### Install dependencies

```powershell
npm install
```

### Development

```powershell
npm run dev
```

### Build for production

```powershell
npm run build
```

The built files are in the `dist` directory and can be deployed to any static hosting provider.

## Configuration

Edit `src/config/sites.json` to add categories and sites. Example format:

```json
{
  "categories": [
    {
      "id": "category-id",
      "name": "Category Name",
      "icon": "🎨",
      "sites": [
        {
          "id": "site-id",
          "name": "Site Name",
          "url": "https://example.com",
          "description": "A short description",
          "icon": "https://example.com/favicon.ico"
        }
      ]
    }
  ]
}
```

Search engines are configured in `src/config/searchEngines.json`.

## Fields

- `id`: unique identifier
- `name`: display name
- `url`: site URL
- `description`: optional description
- `icon`: optional icon URL or emoji

## Deploy

Deploy `dist` to GitHub Pages, Netlify, Vercel, or any static host.

## Tech

- React 18
- TypeScript
- Vite

## License

MIT

## Data source & conversion script

- `data.txt`: the raw data file for this project. It contains HTML fragments where categories are denoted by `<h4>` headings and each category is followed by a `.row` container holding site entries. Each site entry is represented as an `a.card` element with `strong`, `p`, and `img` child elements. This file is an input for the conversion script — it is not directly consumed by the frontend.
- Conversion script: `scripts/convertDataWithCategories.cjs`. Its purpose is to parse `data.txt` and generate/update the app configuration `src/config/sites.json` so the frontend has a ready list of categories and sites.
- Key behaviors:
  - Group sites by `<h4>` category and read each `a.card`'s `name`, `url`, `description`, and `img` (icon).
  - Generate a slug `id` for each site and ensure IDs are unique across the parse and when merging (append counters if needed).
  - Normalize `icon`: if the icon is an http(s) URL, use it directly; if a local path, the script will try to resolve it to a project-accessible path (e.g. `/asset/...`); otherwise the placeholder `/asset/404.png` is used.
  - Merge into `src/config/sites.json`: categories are added or replaced by id; if the target config already contains a category `icon` that is not the placeholder (`"🔖"`), the script preserves that icon instead of overwriting it.
- Usage (run from the project root):

```powershell
node scripts\convertDataWithCategories.cjs
```

- Recommended workflow: edit or replace `data.txt` → run conversion script → start dev server (`npm run dev`) and verify UI and console logs.
- Icon recommendations:
  - Simple: put images in `public/asset/...` and reference them in `sites.json` as `/asset/...` (this is the current approach and is straightforward).
  - Advanced: store images in `src/asset/...` and resolve them at runtime in components using `import.meta.glob` to obtain the built URLs (supports hashed filenames, but requires component-side resolution logic).
- Legacy scripts `convertData.cjs` / `convertData.js` are archived in `scripts/legacy/`.
