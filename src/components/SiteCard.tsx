import { Site } from '../types'
import './SiteCard.css'

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

const fallback = iconMap['404.png'] || ''

interface SiteCardProps {
  site: Site
}

export default function SiteCard({ site }: SiteCardProps) {
  const handleClick = () => {
    window.open(site.url, '_blank', 'noopener,noreferrer')
  }

  // 判断图标类型并解析为可用的 URL
  const getIconSrc = () => {
    if (!site.icon) return null

    // base64 图标（以 data: 开头）
    if (site.icon.startsWith('data:')) return site.icon

    // 绝对/相对 URL（http(s) 或 //）
    if (/^https?:\/\//.test(site.icon) || site.icon.startsWith('//')) return site.icon

    // 处理 site.icon 为可能的字符串形式：
    // - 'world-news.png'
    // - 'src/asset/images/world-news.png' 或 '/src/asset/images/world-news.png'
    // - '/asset/images/world-news.png' （如果使用 public）
    const parts = site.icon.split('/')
    let fileName = parts[parts.length - 1]
    if (!fileName) return null

    // 如果 sites.json 里直接写了以 / 开头的 public 路径：
    // - 公共静态文件（例如 `/asset/...` 或 `/404.png`）可以直接返回
    // - 但以 `/src/...` 开头的路径并不是对外可用，需要尝试用 import.meta.glob 映射
    if (site.icon.startsWith('/')) {
      if (site.icon.startsWith('/src/')) {
        // 去掉开头的 `/src/` 以匹配我们在 iconMap 中存储的相对路径
        const candidate = site.icon.replace(/^\/src\//, '')
        const resolvedFromSrc = iconMap[candidate] || iconMap['/' + candidate] || iconMap[candidate.replace(/^\//, '')]
        if (resolvedFromSrc) return resolvedFromSrc
        // 继续下面的文件名查找或回退
      } else {
        return site.icon
      }
    }

    // 查找映射
    const resolved = iconMap[fileName] || iconMap[site.icon.replace(/^\.\//, '')] || iconMap[site.icon]
    if (resolved) return resolved

    // 没找到则使用 fallback（如果存在）
    return fallback || null
  }

  const iconSrc = getIconSrc()

  return (
    <div className="site-card" onClick={handleClick}>
      <div className="site-icon-wrapper">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={site.name}
            className="site-icon"
            loading="lazy"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              // 尝试使用 fallback，如果失败则隐藏并显示首字母占位
              if (fallback) {
                if (target.src !== fallback) {
                  target.src = fallback
                  return
                }
              }
              target.style.display = 'none'
              const parent = target.parentElement
              if (parent && !parent.querySelector('.site-icon-fallback')) {
                const fallbackDiv = document.createElement('div')
                fallbackDiv.className = 'site-icon-fallback'
                fallbackDiv.textContent = site.name.charAt(0)
                parent.appendChild(fallbackDiv)
              }
            }}
          />
        ) : (
          <div className="site-icon-fallback">{site.name.charAt(0)}</div>
        )}
      </div>
      <div className="site-info">
        <h3 className="site-name">{site.name}</h3>
        {site.description && (
          <p className="site-description">{site.description}</p>
        )}
      </div>
    </div>
  )
}

