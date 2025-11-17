import { useState, useMemo, useEffect } from 'react'
import { Category } from './types'
import siteConfig from './config/sites.json'
import SearchBar from './components/SearchBar'
import CategorySection from './components/CategorySection'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // 控制body滚动
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add('sidebar-open')
    } else {
      document.body.classList.remove('sidebar-open')
    }

    return () => {
      document.body.classList.remove('sidebar-open')
    }
  }, [isSidebarOpen])

  const categories = siteConfig.categories as Category[]

  // 过滤分类和站点
  const filteredCategories = useMemo(() => {
    if (!searchQuery && !selectedCategory) {
      return categories
    }

    return categories
      .filter(category => {
        if (selectedCategory && category.id !== selectedCategory) {
          return false
        }
        return true
      })
      .map(category => {
        if (!searchQuery) {
          return category
        }

        const filteredSites = category.sites.filter(site =>
          site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )

        return {
          ...category,
          sites: filteredSites
        }
      })
      .filter(category => category.sites.length > 0)
  }, [searchQuery, selectedCategory, categories])

  const allSites = useMemo(() => {
    return categories.flatMap(category => category.sites)
  }, [categories])

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`app-content ${isSidebarOpen ? 'blurred' : ''}`}>
        <header className="app-header">
          <button
            className="mobile-menu-button"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="header-content">
            <h1 className="app-title">BANLAN的导航站</h1>
            <p className="app-subtitle">快速访问您喜爱的网站</p>
          </div>
        </header>

        <div className="main-content">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            allSites={allSites}
          />

          <main className="app-main">
            {filteredCategories.length > 0 ? (
              filteredCategories.map(category => (
                <CategorySection key={category.id} category={category} />
              ))
            ) : (
              <div className="no-results">
                <p>未找到匹配的站点</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
