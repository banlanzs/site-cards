import { useState, FormEvent, useRef, useEffect } from 'react'
import { Site } from '../types'
import searchEngines from '../config/searchEngines.json'
import './SearchBar.css'

interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  allSites: Site[]
}

interface SearchEngine {
  id: string
  name: string
  url?: string
  icon?: string
}

export default function SearchBar({ searchQuery, onSearchChange, allSites }: SearchBarProps) {
  const [selectedEngine, setSelectedEngine] = useState<SearchEngine>(searchEngines[0] as SearchEngine)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) return

    // 站内搜索
    if (selectedEngine.id === 'internal') {
      // 先尝试精确匹配站点名称
      const matchedSite = allSites.find(
        site => site.name.toLowerCase() === searchQuery.toLowerCase().trim()
      )

      if (matchedSite) {
        window.open(matchedSite.url, '_blank')
        return
      }

      // 如果没有精确匹配，站内搜索会通过 App.tsx 中的过滤逻辑来显示匹配的站点
      // 这里不需要额外操作，因为搜索框的 onChange 已经触发了过滤
      return
    }

    // 使用选中的搜索引擎搜索
    if (selectedEngine.url) {
      const searchUrl = selectedEngine.url.replace('{query}', encodeURIComponent(searchQuery))
      window.open(searchUrl, '_blank')
    }
  }

  const handleEngineSelect = (engine: SearchEngine) => {
    setSelectedEngine(engine)
    setShowDropdown(false)
  }

  return (
    <div className="search-container">
      <form className="search-form" onSubmit={handleSearch}>
        <div className="search-input-wrapper">
          <svg
            className="search-icon"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            className="search-input"
            placeholder={
              selectedEngine.id === 'internal'
                ? '搜索站点或输入关键词进行网络搜索...'
                : `使用 ${selectedEngine.name} 搜索...`
            }
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            autoFocus
          />
          <div className="search-engine-selector" ref={dropdownRef}>
            <button
              type="button"
              className="engine-select-btn"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {selectedEngine.icon && selectedEngine.id !== 'internal' ? (
                <img
                  src={selectedEngine.icon}
                  alt={selectedEngine.name}
                  className="engine-icon"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement
                    target.style.display = 'none'
                  }}
                />
              ) : (
                <span className="engine-icon-text">{selectedEngine.icon || '🔍'}</span>
              )}
              <span className="engine-name">{selectedEngine.name}</span>
              <svg
                className={`dropdown-arrow ${showDropdown ? 'open' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {showDropdown && (
              <div className="engine-dropdown">
                {searchEngines.map((engine) => (
                  <button
                    key={engine.id}
                    type="button"
                    className={`engine-option ${selectedEngine.id === engine.id ? 'active' : ''}`}
                    onClick={() => handleEngineSelect(engine as SearchEngine)}
                  >
                    {engine.icon && engine.id !== 'internal' ? (
                      <img
                        src={engine.icon}
                        alt={engine.name}
                        className="engine-option-icon"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <span className="engine-option-icon-text">{engine.icon || '🔍'}</span>
                    )}
                    <span>{engine.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="search-button" aria-label="搜索">
            <svg
              className="search-button-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              width={18}
              height={18}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>
      </form>
    </div>
  )
}
