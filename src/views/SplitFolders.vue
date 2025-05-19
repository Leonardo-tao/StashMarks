<template>
  <a-card title="选择要释放书签的文件夹：">
    <template #extra>
      <a-button :type="selectAll ? 'primary' : 'default'" @click="toggleSelectAll" size="small">
        {{ selectAll ? '取消全选' : '全选' }}
      </a-button>
    </template>
    <div class="folder-selection">
      <div class="folders-grid">
        <a-row :gutter="[16, 16]">
          <a-col
            v-for="(folder, index) in allFolders"
            :key="index"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            :xl="4"
          >
            <div
              class="folder-item"
              :class="{
                selected: isSelected(folder.title),
                'other-folder': folder.title === '未分类书签',
              }"
              @click="handleFolderClick($event, folder.title)"
            >
              <div class="folder-info">
                <div class="folder-title">{{ folder.title }}</div>
                <div class="folder-count">{{ folder.items.length }} 个书签</div>
              </div>
              <div class="ripple-container" v-if="rippleMap[folder.title]">
                <div
                  class="ripple"
                  :style="getRippleStyle(folder.title)"
                  @animationend="removeRipple(folder.title)"
                ></div>
              </div>
            </div>
          </a-col>
        </a-row>
      </div>
    </div>
  </a-card>
</template>

<script setup lang="ts">
import { ref, computed, provide, inject, watch, defineExpose } from 'vue'
import { message } from 'ant-design-vue'
import type { BookmarkCategory, BookmarkItem } from '@/types'

// 从父组件注入书签数据
const injectedBookmarksData = inject('bookmarksData', ref<Array<BookmarkCategory>>([]))
const bookmarksData = injectedBookmarksData

// 文件夹列表（过滤掉"未分类书签"分类）
const foldersList = computed(() => {
  return bookmarksData.value.filter((folder) => folder.title !== '未分类书签')
})

// 所有文件夹列表（包括"未分类书签"分类）
const allFolders = computed(() => {
  return bookmarksData.value
})

// 定义事件
const emit = defineEmits(['releaseFolders'])

// 选中的文件夹
const selectedFolders = ref<string[]>([])
const selectAll = ref(false)

// 水波纹效果状态管理
const rippleMap = ref<Record<string, boolean>>({})
// 存储每个文件夹的点击位置
const ripplePositions = ref<Record<string, { x: number; y: number }>>({})

/**
 * 检查文件夹是否被选中
 * @param folderTitle 文件夹标题
 * @returns 是否选中
 */
function isSelected(folderTitle: string): boolean {
  return selectedFolders.value.includes(folderTitle)
}

/**
 * 切换全选/取消全选状态
 */
function toggleSelectAll(): void {
  if (selectAll.value) {
    // 取消全选
    selectedFolders.value = []
    selectAll.value = false
  } else {
    // 全选
    selectedFolders.value = foldersList.value.map((folder) => folder.title)
    selectAll.value = true

    // 为所有新选中的文件夹添加水波纹效果（默认中心位置）
    foldersList.value.forEach((folder) => {
      rippleMap.value[folder.title] = true
      ripplePositions.value[folder.title] = { x: 50, y: 50 } // 默认中心位置（百分比）
    })
  }
}

/**
 * 处理文件夹点击事件
 * @param event 鼠标事件
 * @param folderTitle 文件夹标题
 */
function handleFolderClick(event: MouseEvent, folderTitle: string): void {
  // 获取点击位置相对于文件夹卡片的坐标
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const x = ((event.clientX - rect.left) / rect.width) * 100
  const y = ((event.clientY - rect.top) / rect.height) * 100

  // 存储点击位置
  ripplePositions.value[folderTitle] = { x, y }

  // 切换文件夹选中状态
  toggleFolder(folderTitle)
}

/**
 * 获取水波纹样式
 * @param folderTitle 文件夹标题
 * @returns 样式对象
 */
function getRippleStyle(folderTitle: string): Record<string, string> {
  const position = ripplePositions.value[folderTitle] || { x: 50, y: 50 }
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
  }
}

/**
 * 切换文件夹选中状态
 * @param folderTitle 文件夹标题
 */
function toggleFolder(folderTitle: string): void {
  const index = selectedFolders.value.indexOf(folderTitle)
  if (index === -1) {
    // 选中文件夹
    selectedFolders.value.push(folderTitle)
    // 添加水波纹效果
    rippleMap.value[folderTitle] = true
  } else {
    // 取消选中
    selectedFolders.value.splice(index, 1)
  }

  // 更新全选状态
  selectAll.value = selectedFolders.value.length === foldersList.value.length
}

/**
 * 移除水波纹效果
 * @param folderTitle 文件夹标题
 */
function removeRipple(folderTitle: string): void {
  rippleMap.value[folderTitle] = false
}

/**
 * 释放文件夹中的书签
 * 此方法将在用户点击下一步时被调用
 * @returns 是否成功释放书签
 */
function releaseFolders(): boolean {
  if (selectedFolders.value.length === 0) {
    message.warning('请至少选择一个文件夹')
    return false
  }

  // 收集所有选中文件夹中的书签
  const releasedBookmarks: BookmarkItem[] = []
  // 记录被选中的文件夹标题，用于后续从书签数据中移除
  const selectedFolderTitles: string[] = [...selectedFolders.value]

  // 遍历所有选中的文件夹
  selectedFolders.value.forEach((folderTitle) => {
    const folder = bookmarksData.value.find((f) => f.title === folderTitle)
    if (folder && folder.items && folder.items.length > 0) {
      // 将书签添加到释放列表
      releasedBookmarks.push(...folder.items)
    }
  })

  if (releasedBookmarks.length === 0) {
    message.info('选中的文件夹中没有书签')
    return false
  }

  // 使用emit向父组件传递数据
  emit('releaseFolders', {
    bookmarks: releasedBookmarks,
    folderTitles: selectedFolderTitles,
  })
  return true
}

// 暴露方法给父组件调用
defineExpose({
  releaseFolders,
})
</script>

<style scoped>
.container {
  width: 100%;
  height: 100%;
  padding: 20px;
  box-sizing: border-box;
  overflow-x: hidden;
}

.title {
  font-size: 20px;
  margin-bottom: 16px;
  color: #333;
}

.folder-selection {
  width: 100%;
  height: calc(100% - 60px);
  overflow-y: auto;
  overflow-x: hidden;
}

/* 自定义滚动条样式 */
.folder-selection::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.folder-selection::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

.folder-selection::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

.folder-selection::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
}

/* 隐藏滚动条上下箭头 */
.folder-selection::-webkit-scrollbar-button {
  display: none;
}

/* 在火狐浏览器中的滚动条样式 */
.folder-selection {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) rgba(0, 0, 0, 0.05);
}

.select-all-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #f0f0f0;
}

.selected-count {
  color: #1890ff;
  font-size: 14px;
  font-weight: 500;
}

.folders-grid {
  width: 100%;
  padding-right: 5px; /* 防止出现横向滚动条 */
}

.folder-item {
  padding: 14px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
  transition: all 0.3s ease;
  cursor: pointer;
  height: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  position: relative;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.folder-item:hover {
  border-color: #1890ff;
  box-shadow: 0 3px 10px rgba(24, 144, 255, 0.15);
  /* 移除了transform: translateY(-2px); */
}

.folder-item.selected {
  background: linear-gradient(135deg, #1890ff, #096dd9);
  border-color: #096dd9;
  color: white;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.25);
}

.folder-item.selected::before {
  content: '';
  position: absolute;
  top: 10px;
  right: 10px;
  width: 16px;
  height: 16px;
  background-color: white;
  border-radius: 50%;
  opacity: 0.9;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%231890ff'%3E%3Cpath d='M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z'/%3E%3C/svg%3E");
  background-size: 12px;
  background-position: center;
  background-repeat: no-repeat;
}

.folder-info {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.folder-title {
  font-weight: 500;
  margin-bottom: 8px;
  font-size: 15px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: all 0.3s;
}

.folder-item.selected .folder-title {
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.folder-item.selected .folder-count {
  color: rgba(255, 255, 255, 0.9);
}

.folder-count {
  font-size: 12px;
  color: #999;
  transition: all 0.3s;
}

/* 水波纹效果 */
.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  pointer-events: none;
}

.ripple {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 0;
  height: 0;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  animation: ripple-effect 0.6s ease-out forwards;
}

@keyframes ripple-effect {
  0% {
    width: 0;
    height: 0;
    opacity: 0;
  }
  10% {
    opacity: 0.5;
  }
  100% {
    width: 300px;
    height: 300px;
    opacity: 0;
  }
}

.folder-item.other-folder {
  background-color: #fffbe6; /* 淡黄色背景 */
  border-color: #ffe58f;
}

.folder-item.other-folder:hover {
  border-color: #ffd666;
  box-shadow: 0 3px 10px rgba(255, 214, 102, 0.15);
}

.folder-item.other-folder.selected {
  background: linear-gradient(135deg, #faad14, #d48806);
  border-color: #d48806;
  color: white;
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.25);
}
</style>
