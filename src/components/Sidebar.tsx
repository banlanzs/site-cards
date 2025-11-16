import { Category } from '../types'
import './Sidebar.css'

// 在模块级别构建图片映射，方便在侧边栏也能解析 /asset/... 或 src 路径
const modules = (import.meta as any).glob('../asset/**/*.{png,jpg,jpeg,svg,ico}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const iconMap: Record<string, string> = {}
for (const p in modules) {
  const parts = p.split('/')
  const name = parts[parts.length - 1]
  iconMap[name] = modules[p]
  const withoutDots = p.replace(/^\.\.\//, '')
  iconMap[withoutDots] = modules[p]
  iconMap['/' + withoutDots] = modules[p]
}

const resolveCategoryIcon = (icon: string | undefined) => {
  if (!icon || typeof icon !== 'string') return null
  if (icon.length <= 2) return null
  if (/^https?:\/\//.test(icon) || icon.startsWith('//')) return icon
  if (icon.startsWith('/')) {
    if (icon.startsWith('/src/')) {
      const candidate = icon.replace(/^\/src\//, '')
      return iconMap[candidate] || iconMap['/' + candidate] || iconMap[candidate.replace(/^\//, '')] || null
    }
    // public 下的 /asset/... 路径应直接可用
    return icon
  }
  const parts = icon.split('/')
  const fileName = parts[parts.length - 1]
  return iconMap[fileName] || iconMap[icon] || null
}

interface SidebarProps {
  categories: Category[]
  selectedCategory: string | null
  onCategorySelect: (categoryId: string | null) => void
}

export default function Sidebar({ categories, selectedCategory, onCategorySelect }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-section">
          <button
            className={`sidebar-item ${selectedCategory === null ? 'active' : ''}`}
            onClick={() => onCategorySelect(null)}
          >
            <span className="sidebar-icon"><img src="../asset/images/icon/website.png" alt="网站" /></span>
            <span className="sidebar-text">全部站点</span>
            <svg
              className="sidebar-arrow"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section">
          <h3 className="sidebar-section-title">分类导航</h3>
          {categories.map(category => {
            const iconSrc = resolveCategoryIcon(category.icon as string | undefined)
            return (
              <button
                key={category.id}
                className={`sidebar-item ${selectedCategory === category.id ? 'active' : ''}`}
                onClick={() => onCategorySelect(category.id)}
              >
                <span className="sidebar-icon">
                  {iconSrc ? (
                    <img src={iconSrc} alt={category.name} className="sidebar-icon-img" />
                  ) : (
                    category.icon
                  )}
                </span>
                <span className="sidebar-text">{category.name}</span>
                <svg
                  className="sidebar-arrow"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )
          })}
        </div>

        <div className="sidebar-footer">
          <a
            href="https://github.com/banlanzs"
            target="_blank"
            rel="noopener noreferrer"
            className="sidebar-footer-link"
          >
            <svg
              className="sidebar-footer-icon"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            <span>我的 GitHub</span>
          </a>
        </div>
      </div>
    </aside>
  )
}

