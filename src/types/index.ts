/**
 * 书签项接口 - 表示单个书签的数据结构
 */
export interface BookmarkItem {
  title: string
  link: string
  icon: string | null
  desc: string
  id?: string
}

/**
 * 书签分类接口 - 表示书签文件夹/分类的数据结构
 */
export interface BookmarkCategory {
  title: string
  items: Array<BookmarkItem>
  id?: string
}

/**
 * 临时书签项接口 - 用于解析过程中的中间数据结构
 */
export interface TempBookmarkItem {
  type: 'folder' | 'link'
  title: string
  link?: string
  icon?: string | null
  items?: Array<TempBookmarkItem>
}
