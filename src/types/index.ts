export interface Site {
  id: string;
  name: string;
  url: string;
  searchUrl?: string;
  description?: string;
  // 图标支持：base64 数据（data:image/...）、本地路径（/icons/xxx.png）、或 URL
  icon?: string;
  // 图标类型：'base64' | 'local' | 'url'，用于优化加载
  iconType?: 'base64' | 'local' | 'url';
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  sites: Site[];
}

export interface SiteConfig {
  categories: Category[];
}

