<template>
  <div class="bookmark-sorter" tabindex="0" @keydown="handleKeyDown" ref="sorterRef">
    <div class="bookmark-area">
      <div class="bookmark-header">
        <h3>当前书签</h3>
      </div>

      <div class="bookmark-content-area">
        <div class="bookmark-counter">
          <a-badge
            :count="releasedBookmarks.length + (currentBookmark ? 1 : 0)"
            :number-style="{ backgroundColor: '#3a5ccc' }"
          />
        </div>

        <div class="bookmark-stack">
          <div class="card-container">
            <transition-group name="card" tag="div">
              <a-card
                v-if="currentBookmark"
                :key="currentBookmark.link"
                class="bookmark-card current-card"
                @click="visitBookmark(currentBookmark.link)"
              >
                <a-card-meta :title="currentBookmark.title" :description="currentBookmark.link">
                  <template #avatar>
                    <div class="bookmark-icon">
                      <img v-if="currentBookmark.icon" :src="currentBookmark.icon" />
                      <span v-else>{{ getIconText(currentBookmark.title) }}</span>
                    </div>
                  </template>
                </a-card-meta>
              </a-card>
            </transition-group>

            <a-empty
              v-if="!currentBookmark && previewBookmarks.length === 0"
              description="暂无书签"
            />
          </div>
        </div>
      </div>

      <div class="storage-cards">
        <a-card class="storage-card" @click="showTempModal">
          <template #title>
            <div class="card-title">
              <span>暂存区</span>
              <a-badge :count="tempBookmarks.length" :number-style="{ backgroundColor: '#999' }" />
            </div>
          </template>
          <p>暂时不分类的书签</p>
        </a-card>

        <a-card class="storage-card" @click="showTrashModal">
          <template #title>
            <div class="card-title">
              <span>回收站</span>
              <a-badge :count="trashBookmarks.length" :number-style="{ backgroundColor: '#999' }" />
            </div>
          </template>
          <p>标记删除的书签</p>
        </a-card>
      </div>
    </div>

    <div class="folders-area">
      <div class="folders-header">
        <div class="header-with-button">
          <h3>
            选择目标文件夹
            <a-button @click="showNewFolderModal">
              <template #icon><folder-add-outlined /></template>
            </a-button>
          </h3>
        </div>
      </div>

      <div class="folders-grid">
        <a-row :gutter="[16, 16]">
          <a-col
            v-for="(folder, index) in folders"
            :key="index"
            :xs="24"
            :sm="12"
            :md="4"
            :lg="8"
            :xl="6"
          >
            <a-card
              class="folder-card"
              @click="moveToFolder(folder.title)"
              :data-key="getFolderLetter(index)"
              @contextmenu.prevent="showContextMenu($event, folder)"
            >
              <a-card-meta :title="folder.title" :description="folder.items.length + '个书签'">
                <template #avatar>
                  <div class="bookmark-icon">
                    <span>{{ getFolderLetter(index) }}</span>
                  </div>
                </template>
              </a-card-meta>
              <div class="ripple-containeend" v-if="rippleMap[folder.title]">
                <div
                  class="ripple"
                  :style="getRippleStyle(folder.title)"
                  @animationend="removeRipple(folder.title)"
                ></div>
              </div>
            </a-card>
          </a-col>
        </a-row>
      </div>
    </div>

    <div v-if="contextMenuVisible" class="context-menu" :style="contextMenuStyle">
      <div class="context-menu-item" @click="renameFolder"><edit-outlined /> 重命名</div>
      <div class="context-menu-item" @click="dissolveFolder"><inbox-outlined /> 解散</div>
      <div class="context-menu-item" @click="confirmDeleteFolder">
        <span v-if="!deleteConfirmMode"><delete-outlined /> 删除</span>
        <span v-else class="delete-confirm"><close-outlined /> 确认删除</span>
      </div>
    </div>

    <a-modal
      v-model:open="tempModalVisible"
      title="暂存区书签"
      width="700px"
      @cancel="tempModalVisible = false"
    >
      <a-list :data-source="tempBookmarks" :pagination="{ pageSize: 10, size: 'small' }">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.title">
              <template #avatar>
                <div class="bookmark-list-icon">
                  <div v-if="item.icon" v-html="item.icon"></div>
                  <span v-else>{{ getIconText(item.title) }}</span>
                </div>
              </template>
              <template #description>
                <a :href="item.link" target="_blank" class="bookmark-link">{{ item.link }}</a>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-button type="primary" @click="setCurrentBookmark(item)">
                <template #icon><edit-outlined /></template>
                选择
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>

    <a-modal v-model:open="trashModalVisible" title="回收站书签" width="700px" :footer="null">
      <a-list :data-source="trashBookmarks" :pagination="{ pageSize: 10, size: 'small' }">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta :title="item.title">
              <template #avatar>
                <div class="bookmark-list-icon">
                  <div v-if="item.icon" v-html="item.icon"></div>
                  <span v-else>{{ getIconText(item.title) }}</span>
                </div>
              </template>
              <template #description>
                <a :href="item.link" target="_blank" class="bookmark-link">{{ item.link }}</a>
              </template>
            </a-list-item-meta>
            <template #actions>
              <a-button type="primary" @click="restoreFromTrash(item)">
                <template #icon><undo-outlined /></template>
                恢复
              </a-button>
            </template>
          </a-list-item>
        </template>
      </a-list>
    </a-modal>

    <!-- 新建文件夹模态框 -->
    <a-modal
      v-model:open="newFolderModalVisible"
      title="新建文件夹"
      @ok="createNewFolder"
      :okButtonProps="{ disabled: !newFolderName.trim() }"
    >
      <a-input v-model:value="newFolderName" placeholder="请输入文件夹名称" />
    </a-modal>

    <!-- 重命名文件夹模态框 -->
    <a-modal
      v-model:open="renameModalVisible"
      title="重命名文件夹"
      @ok="doRenameFolder"
      :okButtonProps="{ disabled: !newFolderName.trim() }"
    >
      <a-input v-model:value="newFolderName" placeholder="请输入新的文件夹名称" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import {
  DeleteOutlined,
  EditOutlined,
  UndoOutlined,
  InboxOutlined,
  FolderAddOutlined,
  CloseOutlined,
} from '@ant-design/icons-vue'
import type { BookmarkCategory, BookmarkItem } from '@/types'

// 从父组件注入书签数据
const bookmarksData = inject('bookmarksData', ref<Array<BookmarkCategory>>([]))
// 注入从父组件传递过来的待分类书签
const releasedBookmarks = inject('releasedBookmarks', ref<BookmarkItem[]>([]))

// 当前正在处理的书签
const currentBookmark = ref<BookmarkItem | null>(null)
const sorterRef = ref<HTMLElement | null>(null)

// 预览书签列表（最多显示3个）
const previewBookmarks = computed(() => {
  // 从待处理书签中获取前3个作为预览
  return releasedBookmarks.value.slice(0, 3)
})

// 模态框状态
const tempModalVisible = ref(false)
const trashModalVisible = ref(false)
// 新建文件夹相关状态
const newFolderModalVisible = ref(false)

/**
 * 显示新建文件夹模态框
 */
function showNewFolderModal(): void {
  newFolderModalVisible.value = true
  newFolderName.value = ''
}

/**
 * 创建新文件夹
 */
function createNewFolder(): void {
  const folderName = newFolderName.value.trim()
  if (!folderName) {
    message.warning('文件夹名称不能为空')
    return
  }

  // 检查文件夹名称是否已存在
  const exists = bookmarksData.value.some((folder) => folder.title === folderName)
  if (exists) {
    message.warning('文件夹名称已存在')
    return
  }

  // 创建新文件夹
  const newFolder: BookmarkCategory = {
    title: folderName,
    items: [],
  }

  // 添加到书签数据中
  bookmarksData.value.push(newFolder)
  message.success(`已创建文件夹 "${folderName}"`)
  newFolderModalVisible.value = false
}
// 书签移动动画状态
const isMovingBookmark = ref(false)
// 动画锁，防止连续点击导致动画错乱
const animationLock = ref(false)

// 水波纹效果状态管理
const rippleMap = ref<Record<string, boolean>>({})
// 存储每个文件夹的点击位置
const ripplePositions = ref<Record<string, { x: number; y: number }>>({})

function getRippleStyle(folderTitle: string): Record<string, string> {
  // 获取水波纹样式
  const position = ripplePositions.value[folderTitle] || { x: 50, y: 50 }
  return {
    left: `${position.x}%`,
    top: `${position.y}%`,
  }
}

function removeRipple(folderTitle: string): void {
  // 移除水波纹效果
  rippleMap.value[folderTitle] = false
}

// 暂存区书签列表
const tempBookmarks = ref<BookmarkItem[]>([])

// 回收站书签列表
const trashBookmarks = ref<BookmarkItem[]>([])

const folders = computed(() => {
  // 获取所有文件夹（排除暂存区和回收站）
  return bookmarksData.value.filter(
    (folder) => folder.title !== '暂存区' && folder.title !== '回收站' && folder.title !== '其他',
  )
})

function showTempModal(): void {
  // 显示暂存区模态框
  tempModalVisible.value = true
}

function showTrashModal(): void {
  // 显示回收站模态框
  trashModalVisible.value = true
}

function setCurrentBookmark(bookmark: BookmarkItem): void {
  // 设置当前处理的书签
  currentBookmark.value = bookmark

  // 从暂存区移除该书签
  const index = tempBookmarks.value.findIndex((item) => item === bookmark)
  if (index !== -1) {
    tempBookmarks.value.splice(index, 1)
  }

  // 关闭模态框
  tempModalVisible.value = false
}

function skipBookmark(): void {
  // 跳过当前书签，处理下一个
  if (animationLock.value) return // 如果动画锁定，则不执行
  animationLock.value = true // 锁定动画

  if (releasedBookmarks.value.length > 0) {
    // 将当前书签移到暂存区
    if (currentBookmark.value) {
      tempBookmarks.value.push(currentBookmark.value)
    }

    // 设置下一个书签为当前书签
    currentBookmark.value = releasedBookmarks.value.shift() || null

    // 延迟解锁动画
    setTimeout(() => {
      animationLock.value = false
    }, 600) // 动画时间稍长于CSS动画时间
  } else {
    currentBookmark.value = null
    message.info('所有书签已处理完毕')
    animationLock.value = false
  }
}

function moveToTrash(bookmark: BookmarkItem): void {
  // 将书签移动到回收站
  if (animationLock.value) return // 如果动画锁定，则不执行
  animationLock.value = true // 锁定动画

  // 添加到回收站
  trashBookmarks.value.push(bookmark)

  // 处理下一个书签
  if (releasedBookmarks.value.length > 0) {
    currentBookmark.value = releasedBookmarks.value.shift() || null
  } else {
    currentBookmark.value = null
    message.info('所有书签已处理完毕')
  }

  message.success('已将书签移至回收站')

  // 延迟解锁动画
  setTimeout(() => {
    animationLock.value = false
  }, 600) // 动画时间稍长于CSS动画时间
}

function restoreFromTrash(bookmark: BookmarkItem): void {
  // 从回收站恢复书签
  // 从回收站移除
  const index = trashBookmarks.value.findIndex((item) => item === bookmark)
  if (index !== -1) {
    trashBookmarks.value.splice(index, 1)
  }

  // 添加到待处理列表
  releasedBookmarks.value.push(bookmark)

  message.success('已将书签恢复到待处理列表')

  // 关闭模态框
  trashModalVisible.value = false
}

function moveToFolder(folderTitle: string): void {
  // 将当前书签移动到指定文件夹
  if (!currentBookmark.value) {
    message.warning('请先选择一个书签')
    return
  }

  if (animationLock.value) return // 如果动画锁定，则不执行
  animationLock.value = true // 锁定动画

  // 添加水波纹效果
  rippleMap.value[folderTitle] = true
  ripplePositions.value[folderTitle] = { x: 50, y: 50 } // 默认中心位置

  // 查找目标文件夹
  const targetFolder = bookmarksData.value.find((folder) => folder.title === folderTitle)
  if (targetFolder) {
    // 标记书签正在移动（触发动画）
    isMovingBookmark.value = true

    // 保存当前书签的引用，以便在动画完成后添加到目标文件夹
    const bookmarkToMove = currentBookmark.value

    // 立即更新当前书签，触发动画
    if (releasedBookmarks.value.length > 0) {
      // 延迟更新当前书签，等待离开动画完成
      setTimeout(() => {
        // 添加到目标文件夹
        targetFolder.items.push(bookmarkToMove)
        message.success(`已将书签添加到 "${folderTitle}"`)

        // 更新当前书签
        currentBookmark.value = releasedBookmarks.value.shift() || null

        // 重置动画状态
        isMovingBookmark.value = false

        // 延迟解锁动画
        setTimeout(() => {
          animationLock.value = false
        }, 300) // 给新卡片进入动画留出时间
      }, 300) // 与卡片离开动画时间匹配
    } else {
      // 如果没有更多书签，直接添加到目标文件夹
      setTimeout(() => {
        targetFolder.items.push(bookmarkToMove)
        message.success(`已将书签添加到 "${folderTitle}"`)
        currentBookmark.value = null
        message.info('所有书签已处理完毕')
        isMovingBookmark.value = false
        animationLock.value = false
      }, 300)
    }
  } else {
    animationLock.value = false // 如果没有找到目标文件夹，解锁动画
  }
}

function getIconText(title: string): string {
  // 获取书签标题的首字母作为图标文本
  if (!title) return '?'
  return title.charAt(0).toUpperCase()
}

function getFolderLetter(index: number): string {
  // 获取文件夹的字母标识，从A开始
  const charCode = 65 + (index % 26) // A的ASCII码是65
  return String.fromCharCode(charCode)
}

function visitBookmark(url: string): void {
  // 访问书签链接
  if (url) {
    window.open(url, '_blank')
  }
}

/**
 * 处理键盘按键事件
 * @param event 键盘事件对象
 */
function handleKeyDown(event: KeyboardEvent): void {
  // 只处理字母键 A-Z
  if (/^[a-zA-Z]$/.test(event.key)) {
    const keyUpperCase = event.key.toUpperCase() // 转换为大写字母
    const keyCode = keyUpperCase.charCodeAt(0) // 获取字符的ASCII码
    const folderIndex = keyCode - 65 // A的ASCII码是65，所以A对应索引0，B对应索引1，以此类推

    // 检查是否有对应索引的文件夹
    if (folderIndex >= 0 && folderIndex < folders.value.length) {
      const targetFolder = folders.value[folderIndex]

      // 触发水波纹效果
      rippleMap.value[targetFolder.title] = true
      ripplePositions.value[targetFolder.title] = { x: 50, y: 50 } // 默认中心位置

      // 移动书签到对应文件夹
      moveToFolder(targetFolder.title)
    }
  } else if (event.key === 'Escape') {
    // ESC键跳过当前书签
    skipBookmark()
    message.info('跳过当前书签')
  } else if (event.key === 'Delete' || event.key === 'Backspace') {
    // Delete或Backspace键将书签移到回收站
    if (currentBookmark.value) {
      moveToTrash(currentBookmark.value)
    }
  }
}

// 组件挂载时，自动设置第一个待处理书签为当前书签，并设置焦点
onMounted(() => {
  if (releasedBookmarks.value.length > 0) {
    currentBookmark.value = releasedBookmarks.value.shift() || null
  }

  // 设置焦点，以便能够捕获键盘事件
  if (sorterRef.value) {
    sorterRef.value.focus()
  }

  // 添加全局键盘事件监听
  window.addEventListener('keydown', handleGlobalKeyDown)
})

// 组件卸载时，移除全局键盘事件监听
onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeyDown)
})

/**
 * 处理全局键盘事件，确保即使组件失去焦点也能响应键盘操作
 * @param event 键盘事件对象
 */
function handleGlobalKeyDown(event: KeyboardEvent): void {
  // 如果事件目标是输入框，则不处理
  if (
    event.target instanceof HTMLInputElement ||
    event.target instanceof HTMLTextAreaElement ||
    event.target instanceof HTMLSelectElement
  ) {
    return
  }

  // 调用组件内的键盘处理函数
  handleKeyDown(event)
}

// 右键菜单相关状态
const contextMenuVisible = ref(false)
const contextMenuStyle = ref({
  top: '0px',
  left: '0px',
})
const currentContextFolder = ref<BookmarkCategory | null>(null)
const deleteConfirmMode = ref(false)

// 重命名模态框状态
const renameModalVisible = ref(false)
const newFolderName = ref('')

/**
 * 显示右键菜单
 * @param event 鼠标事件
 * @param folder 当前文件夹
 */
function showContextMenu(event: MouseEvent, folder: BookmarkCategory): void {
  // 设置右键菜单位置
  contextMenuStyle.value = {
    top: `${event.clientY}px`,
    left: `${event.clientX}px`,
  }

  // 显示菜单并设置当前文件夹
  contextMenuVisible.value = true
  currentContextFolder.value = folder
  deleteConfirmMode.value = false

  // 添加点击其他区域关闭菜单的事件
  setTimeout(() => {
    document.addEventListener('click', closeContextMenu)
  }, 0)
}

/**
 * 关闭右键菜单
 */
function closeContextMenu(): void {
  contextMenuVisible.value = false
  deleteConfirmMode.value = false
  document.removeEventListener('click', closeContextMenu)
}

/**
 * 显示重命名模态框
 */
function renameFolder(): void {
  if (!currentContextFolder.value) return

  renameModalVisible.value = true
  newFolderName.value = currentContextFolder.value.title
  closeContextMenu()
}

/**
 * 执行重命名操作
 */
function doRenameFolder(): void {
  if (!currentContextFolder.value) return

  const folderName = newFolderName.value.trim()
  if (!folderName) {
    message.warning('文件夹名称不能为空')
    return
  }

  // 检查文件夹名称是否已存在
  const exists = bookmarksData.value.some(
    (folder) => folder.title === folderName && folder !== currentContextFolder.value,
  )
  if (exists) {
    message.warning('文件夹名称已存在')
    return
  }

  // 更新文件夹名称
  currentContextFolder.value.title = folderName
  message.success('文件夹重命名成功')
  renameModalVisible.value = false
}

/**
 * 解散文件夹（将书签移到待处理列表）
 */
function dissolveFolder(): void {
  if (!currentContextFolder.value) return

  // 将文件夹中的书签添加到待处理列表
  if (currentContextFolder.value.items.length > 0) {
    releasedBookmarks.value.push(...currentContextFolder.value.items)

    // 清空文件夹中的书签
    currentContextFolder.value.items = []
    message.success(`已解散文件夹，${currentContextFolder.value.title} 中的书签已移至待处理列表`)
  } else {
    message.info('该文件夹中没有书签')
  }

  closeContextMenu()
}

/**
 * 确认删除文件夹
 */
function confirmDeleteFolder(): void {
  if (deleteConfirmMode.value) {
    // 已经在确认模式，执行删除
    if (!currentContextFolder.value) return

    // 从书签数据中删除文件夹
    const index = bookmarksData.value.findIndex((folder) => folder === currentContextFolder.value)
    if (index !== -1) {
      bookmarksData.value.splice(index, 1)
      message.success('文件夹已删除')
    }

    closeContextMenu()
  } else {
    // 进入确认模式
    deleteConfirmMode.value = true

    // 阻止事件冒泡，防止菜单关闭
    event?.stopPropagation()
  }
}

// 组件卸载时，移除事件监听
onUnmounted(() => {
  document.removeEventListener('click', closeContextMenu)
})
</script>

<style scoped>
.bookmark-sorter {
  display: flex;
  width: 100%;
  height: 100%;
  gap: 20px;
}

.bookmark-area {
  flex: 2;
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
}

.bookmark-header {
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.bookmark-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.bookmark-content-area {
  flex: 4;
  padding: 10px;
  overflow-y: auto;
  position: relative;
}

.bookmark-counter {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.bookmark-stack {
  position: relative;
  height: 100%;
  perspective: 1000px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 20px;
}

.card-container {
  position: relative;
  width: 100%;
  max-width: 600px;
  min-height: 200px;
}

.bookmark-card {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  transform-origin: center top;
}

.current-card {
  z-index: 20;
  cursor: pointer;
}

.current-card:hover {
  border-color: #3a5ccc;
  box-shadow: 0 4px 12px rgba(58, 92, 204, 0.15);
}

.card-enter-active {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.card-leave-active {
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  z-index: 1 !important;
}

.card-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.9);
}

.card-leave-to {
  opacity: 0;
  transform: translateY(60px) scale(0.8);
}

.card-move {
  transition: transform 0.5s cubic-bezier(0.23, 1, 0.32, 1);
}

.bookmark-icon {
  width: 40px;
  height: 40px;
  background-color: #f5f5f5;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #1890ff;
  font-size: 18px;
  flex-shrink: 0;
  overflow: hidden;
}

.bookmark-icon img {
  width: 24px;
  height: 24px;
}

.bookmark-list-icon {
  width: 32px;
  height: 32px;
  background-color: #f5f5f5;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: #1890ff;
  font-size: 14px;
  overflow: hidden;
}

.bookmark-list-icon svg {
  width: 20px;
  height: 20px;
}

.bookmark-title-container {
  flex: 1;
  overflow: hidden;
}

.bookmark-title {
  font-weight: 500;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bookmark-description {
  padding-top: 8px;
  border-top: 1px dashed #f0f0f0;
  flex: 1;
  overflow-y: auto;
}

.bookmark-url {
  color: #666;
  font-size: 13px;
  word-break: break-all;
}

.storage-cards {
  flex: 1;
  display: flex;
  gap: 16px;
  padding: 0 10px 10px 10px;
}

.storage-card {
  flex: 1;
  cursor: pointer;
  transition: all 0.3s;
}

.storage-card:hover {
  border-color: #3a5ccc;
  box-shadow: 0 4px 12px rgba(58, 92, 204, 0.15);
}

.card-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.bookmark-link {
  color: #1890ff;
  font-size: 12px;
  word-break: break-all;
}

.folders-area {
  flex: 3;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
}

.folders-header {
  padding: 12px 16px;
  background-color: #fafafa;
  border-bottom: 1px solid #f0f0f0;
}

.folders-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.folders-grid {
  flex: 1;
  overflow-y: auto;
  padding: 10px;
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
  border-color: #3a5ccc;
  box-shadow: 0 3px 10px rgba(58, 92, 204, 0.15);
}

.folder-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
}

.folder-card:hover {
  border-color: #3a5ccc;
  box-shadow: 0 3px 10px rgba(58, 92, 204, 0.15);
}

.folder-letter {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  font-size: 24px;
  font-weight: bold;
  color: #3a5ccc;
}

.folder-info {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.folder-title {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}

.folder-count {
  font-size: 12px;
  color: #999;
}

.ripple-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 8px;
  pointer-events: none;
}

.ripple {
  position: absolute;
  width: 10px;
  height: 10px;
  background-color: rgba(58, 92, 204, 0.3);
  border-radius: 50%;
  transform: scale(0);
  animation: ripple-effect 0.6s ease-out;
}

@keyframes ripple-effect {
  to {
    transform: scale(20);
    opacity: 0;
  }
}
/* 添加焦点样式 */
.bookmark-sorter:focus {
  outline: none; /* 移除默认的焦点轮廓 */
}

/* 添加键盘快捷键提示 */
.folder-card {
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  position: relative; /* 确保相对定位 */
}

.context-menu {
  position: fixed;
  z-index: 1000;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: 4px 0;
  min-width: 120px;
}

.context-menu-item {
  padding: 8px 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
}

.context-menu-item:hover {
  background-color: #f5f5f5;
}

.delete-confirm {
  color: #ff4d4f;
  font-weight: 500;
}
</style>
