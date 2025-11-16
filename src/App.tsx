import { useState, useMemo } from 'react'
import { Category } from './types'
import siteConfig from './config/sites.json'
import SearchBar from './components/SearchBar'
import CategorySection from './components/CategorySection'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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
      />

      <div className="app-content">
        <header className="app-header">
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
