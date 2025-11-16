import { Category } from '../types'
import SiteCard from './SiteCard'
import './CategorySection.css'

// 在模块级别执行一次 import.meta.glob，所有组件实例共享
const modules = import.meta.glob('../asset/**/*.{png,jpg,jpeg,svg,ico}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const iconMap: Record<string, string> = {}
for (const p in modules) {
  const parts = p.split('/')
  const name = parts[parts.length - 1]
  iconMap[name] = modules[p]
  // p 格式是 '../asset/...'，去掉开头 '../' 得到 'asset/...'
  const withoutDots = p.replace(/^\.\.\//, '')
  iconMap[withoutDots] = modules[p]
  iconMap['/' + withoutDots] = modules[p]
}

interface CategorySectionProps {
  category: Category
}

export default function CategorySection({ category }: CategorySectionProps) {

  const resolveIcon = (icon: string | undefined) => {
    if (!icon) return null
    if (typeof icon !== 'string') return null
    // 如果是 emoji 或短文本，直接显示
    if (icon.length <= 2) return null
    // URL
    if (/^https?:\/\//.test(icon) || icon.startsWith('//')) return icon
    // public 路径（以 / 开头）如果是 /src/ 开头需要特殊处理
    if (icon.startsWith('/')) {
      if (icon.startsWith('/src/')) {
        const candidate = icon.replace(/^\/src\//, '')
        return iconMap[candidate] || iconMap['/' + candidate] || iconMap[candidate.replace(/^\//, '')] || null
      }
      return icon
    }
    // 文件名或 src 路径
    const parts = icon.split('/')
    const fileName = parts[parts.length - 1]
    return iconMap[fileName] || iconMap[icon] || null
  }

  const iconSrc = resolveIcon(category.icon as string | undefined)
  // 调试输出（开发时使用）：打印原始字段与解析结果，方便定位为什么没渲染
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('Category icon raw:', category.icon, '-> resolved:', iconSrc)
  }

  return (
    <section className="category-section">
      <h2 className="category-title">
        <span className="category-icon">
          {iconSrc ? (
            <img src={iconSrc} alt={category.name} className="category-icon-img" />
          ) : (
            category.icon
          )}
        </span>
        {category.name}
      </h2>
      <div className="sites-grid">
        {category.sites.map((site) => (
          <SiteCard key={site.id} site={site} />
        ))}
      </div>
    </section>
  )
}

