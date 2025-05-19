<template>
  <div class="download-bookmarks">
    <div class="download-header">
      <h3>下载书签结构</h3>
    </div>

    <div class="download-content">
      <div class="folder-structure">
        <div class="structure-header">
          <h4>当前文件夹结构</h4>
        </div>

        <div class="structure-tree">
          <a-tree
            :tree-data="folderTreeData"
            :defaultExpandAll="true"
            :showIcon="true"
            :selectable="false"
          >
            <template #icon="{ data }">
              <folder-outlined v-if="data.isFolder" />
              <link-outlined v-else />
            </template>
            <template #title="{ title, bookmarkCount }">
              <span>{{ title }}</span>
              <a-tag v-if="bookmarkCount" color="blue" class="count-tag"
                >{{ bookmarkCount }} 个书签</a-tag
              >
            </template>
          </a-tree>
        </div>
      </div>

      <div class="download-options">
        <div class="options-header">
          <h4>导出选项</h4>
        </div>

        <div class="options-content">
          <a-radio-group v-model:value="exportFormat" class="format-options">
            <a-radio value="html">HTML 格式 (浏览器可导入)</a-radio>
            <a-radio value="json">JSON 格式 (数据备份)</a-radio>
          </a-radio-group>

          <div class="format-description">
            <p v-if="exportFormat === 'html'">HTML 格式可以直接导入到大多数浏览器中</p>
            <p v-else>JSON 格式保存完整的书签数据结构，适合备份和高级用途</p>
          </div>

          <a-button
            type="primary"
            size="large"
            :loading="generating"
            @click="generateBookmarkFile"
            class="download-button"
          >
            <template #icon><download-outlined /></template>
            生成并下载
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { FolderOutlined, LinkOutlined, DownloadOutlined } from '@ant-design/icons-vue'
import type { BookmarkCategory, BookmarkItem } from '@/types'

// 从父组件注入书签数据
const bookmarksData = inject('bookmarksData', ref<Array<BookmarkCategory>>([])) // 注入书签数据

// 导出格式选择
const exportFormat = ref<'html' | 'json'>('html')
const generating = ref<boolean>(false)

// 将书签数据转换为树形结构
const folderTreeData = computed(() => {
  return bookmarksData.value.map((folder) => ({
    key: folder.title,
    title: folder.title,
    bookmarkCount: folder.items.length,
    isFolder: true,
    children: folder.items.map((item, index) => ({
      key: `${folder.title}-${index}`,
      title: item.title,
      isFolder: false,
      isLeaf: true,
    })),
  }))
})

/**
 * 生成HTML格式的书签文件
 * @returns HTML格式的书签字符串
 */
function generateHtmlBookmarks(): string {
  // 生成HTML格式的书签文件头部
  let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>\n`

  // 遍历所有文件夹
  bookmarksData.value.forEach((folder) => {
    // 添加文件夹
    html += `    <DT><H3>${escapeHtml(folder.title)}</H3>\n    <DL><p>\n`

    // 添加文件夹中的书签
    folder.items.forEach((item) => {
      html += `        <DT><A HREF="${escapeHtml(item.link)}">${escapeHtml(item.title)}</A>\n`
    })

    // 关闭文件夹
    html += `    </DL><p>\n`
  })

  // 关闭文档
  html += `</DL><p>`

  return html
}

/**
 * 生成JSON格式的书签文件
 * @returns JSON格式的书签字符串
 */
function generateJsonBookmarks(): string {
  return JSON.stringify(bookmarksData.value, null, 2)
}

/**
 * HTML转义函数
 * @param text 需要转义的文本
 * @returns 转义后的文本
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * 生成并下载书签文件
 */
function generateBookmarkFile(): void {
  generating.value = true

  setTimeout(() => {
    try {
      // 根据选择的格式生成相应的内容
      const content =
        exportFormat.value === 'html' ? generateHtmlBookmarks() : generateJsonBookmarks()

      // 设置文件类型和扩展名
      const fileType = exportFormat.value === 'html' ? 'text/html' : 'application/json'
      const extension = exportFormat.value === 'html' ? 'html' : 'json'

      // 创建Blob对象
      const blob = new Blob([content], { type: fileType })

      // 创建下载链接
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `bookmarks_export_${new Date().toISOString().slice(0, 10)}.${extension}`

      // 触发下载
      document.body.appendChild(link)
      link.click()

      // 清理
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success('书签文件生成成功！')
    } catch (error) {
      console.error('生成书签文件时出错:', error)
      message.error('生成书签文件时出错，请重试')
    } finally {
      generating.value = false
    }
  }, 500) // 添加短暂延迟以显示加载状态
}
</script>

<style scoped>
.download-bookmarks {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.download-header {
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.download-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.download-content {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 30px;
  overflow: auto;
}

.folder-structure {
  flex: 1;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.structure-header {
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.structure-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.structure-tree {
  padding: 16px;
  max-height: 500px;
  overflow: auto;
}

.download-options {
  flex: 1;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  overflow: hidden;
}

.options-header {
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.options-header h4 {
  margin: 0;
  font-size: 14px;
  color: #333;
}

.options-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.format-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.format-description {
  padding: 12px;
  background-color: #f9f9f9;
  border-radius: 4px;
  font-size: 14px;
  color: #666;
}

.download-button {
  margin-top: 20px;
  height: 44px;
  font-size: 16px;
}

.count-tag {
  margin-left: 8px;
}

:deep(.ant-tree-list-holder-inner) {
  max-height: 340px;
}

/* 适配移动设备 */
@media (max-width: 768px) {
  .download-content {
    flex-direction: column;
  }
}
</style>
