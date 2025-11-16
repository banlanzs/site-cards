#  静态站点导航

**Language / 语言：** [English](./README.en.md)

一个快速、简洁、高效的静态站点导航工具，支持站内搜索和主流搜索引擎。

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

构建后的文件在 `dist` 目录，可以直接部署到任何静态网站托管服务。

## 配置说明

### 添加站点

编辑 `src/config/sites.json` 文件，按照以下格式添加站点：

```json
{
  "categories": [
    {
      "id": "category-id",
      "name": "分类名称",
      "icon": "🎨",
      "sites": [
        {
          "id": "site-id",
          "name": "站点名称",
          "url": "https://example.com",
          "description": "站点描述",
          "icon": "https://example.com/favicon.ico"
        }
      ]
    }
  ]
}
```

### 配置搜索引擎

编辑 `src/config/searchEngines.json` 文件，可以添加或修改搜索引擎：

```json
[
  {
    "id": "internal",
    "name": "站内搜索",
    "icon": "🔍"
  },
  {
    "id": "google",
    "name": "Google",
    "url": "https://www.google.com/search?q={query}",
    "icon": "https://www.google.com/favicon.ico"
  }
]
```

### 字段说明

**站点字段：**
- `id`: 唯一标识符
- `name`: 站点名称
- `url`: 站点地址
- `description`: 站点描述（可选）
- `icon`: 站点图标URL（可选，如果加载失败会显示默认图标）

**搜索引擎字段：**
- `id`: 唯一标识符（`internal` 为站内搜索）
- `name`: 搜索引擎名称
- `url`: 搜索URL（必须包含 `{query}` 占位符，站内搜索不需要）
- `icon`: 搜索引擎图标URL或 emoji（可选）

## 部署

构建完成后，将 `dist` 目录的内容部署到：

- GitHub Pages
- Netlify
- Vercel
- 任何静态网站托管服务

## 技术栈

- React 18
- TypeScript
- Vite
- CSS3

## 许可证

MIT

## 数据来源与转换脚本

- `data.txt`：项目的原始数据文件，包含 HTML 片段。格式约定为若干分类标题（`<h4>`），每个分类后面紧随一个 `.row` 容器，容器内的每个站点由 `a.card` 表示（内部包含 `strong`、`p`、`img` 等）。该文件不是前端直接消费的静态资源，而是作为数据源供脚本解析。
- 转换脚本：`scripts/convertDataWithCategories.cjs`。作用是解析 `data.txt` 并生成或更新应用配置文件 `src/config/sites.json`，使其成为前端可读的分类与站点列表。
- 主要功能与行为：
  - 按 `<h4>` 划分类，读取每个 `a.card` 的 `name`、`url`、`description`、`img`（icon）。
  - 为每个站点生成 `id`（slugify），并在解析与合并时保持唯一性（必要时追加计数字尾）。
  - 规范化 `icon`：若为 http(s) 链接直接使用；若为本地路径，脚本会尝试解析为项目内的可访问路径（例如 `/asset/...`），若找不到则使用占位图 `/asset/404.png`。
  - 合并到 `src/config/sites.json`：脚本会新增或替换同 id 的分类站点列表；当目标 `sites.json` 已存在并且分类的 `icon` 非占位（非 `"🔖"`）时，脚本会保留该 icon，避免覆盖用户自定义图标。
- 使用方法：在项目根目录运行：

```powershell
node scripts\convertDataWithCategories.cjs
```

- 推荐工作流：编辑或替换 `data.txt` → 运行转换脚本 → 启动开发服务器 `npm run dev` 并在浏览器中检查显示与控制台日志。
- 关于 icon 的建议：
  - 简单方案：把图片放到 `public/asset/...`，在 `sites.json` 中使用 `/asset/...` 绝对路径（这是当前项目的做法）。
  - 进阶方案：把图片放在 `src/asset/...`，并在组件中使用 `import.meta.glob` 在运行时映射到构建后的 URL（可得到带哈希的资源路径，但需要额外的组件解析逻辑）。
- 历史脚本：早期简化脚本 `convertData.cjs` / `convertData.js` 已归档到 `scripts/legacy/`（不会影响当前流程）。

如需脚本做更细粒度的合并控制（例如只覆盖空字段、保留排序或其它自定义元数据），我可以帮你把脚本扩展成带命令行参数的版本。

