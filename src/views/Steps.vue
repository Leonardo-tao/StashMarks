<template>
  <div class="steps-container">
    <a-steps :current="current" :items="steps"></a-steps>
    <div class="steps-content">
      <Upload v-if="current === 0" />
      <SplitFolders
        v-else-if="current === 1"
        ref="splitFoldersRef"
        @releaseFolders="handleReleaseFolders"
      />
      <BookmarkSorter v-else-if="current === 2" />
      <DownloadBookmarks v-else-if="current === 3" />
      <span v-else>
        {{ steps[current].content }}
      </span>
    </div>
    <div class="steps-action">
      <a-button v-if="current > 0" style="margin-right: 8px" @click="prev">上一步</a-button>
      <a-button
        v-if="current < steps.length - 1"
        type="primary"
        @click="next"
        :disabled="!canProceedToNextStep"
      >
        下一步
      </a-button>
      <a-button
        v-if="current == steps.length - 1"
        type="primary"
        @click="message.success('处理完成！')"
      >
        完成
      </a-button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, provide, computed } from 'vue'
import { message } from 'ant-design-vue'
import Upload from '@/views/Upload.vue'
import SplitFolders from '@/views/SplitFolders.vue'
import BookmarkSorter from '@/views/BookmarkSorter.vue'
import DownloadBookmarks from '@/views/DownloadBookmarks.vue'
import type { BookmarkCategory, BookmarkItem } from '@/types'

// 创建共享状态
const bookmarksData = ref<Array<BookmarkCategory>>([])
const processing = ref<boolean>(false)
const completed = ref<boolean>(false)
const progressPercent = ref<number>(0)
const progressText = ref<string>('')
const progressStatus = ref<'normal' | 'success' | 'exception'>('normal')
const lastFile = ref<File | null>(null)
// 待分类书签数组
const releasedBookmarks = ref<BookmarkItem[]>([])
// 被解散的文件夹标题
const releasedFolderTitles = ref<string[]>([])

// 提供共享状态给子组件
provide('bookmarksData', bookmarksData)
provide('processing', processing)
provide('completed', completed)
provide('progressPercent', progressPercent)
provide('progressText', progressText)
provide('progressStatus', progressStatus)
provide('lastFile', lastFile)
provide('releasedBookmarks', releasedBookmarks)
provide('releasedFolderTitles', releasedFolderTitles)

const current = ref<number>(0)
const splitFoldersRef = ref<InstanceType<typeof SplitFolders> | null>(null)

/**
 * 处理从SplitFolders组件释放的书签
 * @param data 包含书签和文件夹标题的数据对象
 */
function handleReleaseFolders(data: { bookmarks: BookmarkItem[]; folderTitles: string[] }): void {
  // 保存释放的书签
  releasedBookmarks.value = data.bookmarks
  // 保存被解散的文件夹标题
  releasedFolderTitles.value = data.folderTitles

  // 从书签数据中移除被解散的文件夹
  data.folderTitles.forEach((title) => {
    const index = bookmarksData.value.findIndex((folder) => folder.title === title)
    if (index !== -1) {
      bookmarksData.value.splice(index, 1)
    }
  })
}

/**
 * 进入下一步
 */
const next = () => {
  // 如果当前是第二步（书签管理），则调用释放文件夹方法
  if (current.value === 1 && splitFoldersRef.value) {
    const success = splitFoldersRef.value.releaseFolders()
    if (!success) return
  }

  current.value++
}

/**
 * 返回上一步
 */
const prev = () => {
  current.value--
}

const steps = [
  {
    title: '上传书签',
    content: 'First-content',
  },
  {
    title: '选择文件夹',
    content: 'Second-content',
  },
  {
    title: '分类书签',
    content: 'Third-content',
  },
  {
    title: '下载书签',
    content: '下载整理后的书签文件',
  },
]

/**
 * 计算属性：判断是否可以进入下一步
 */
const canProceedToNextStep = computed(() => {
  // 第一步（上传书签）：检查是否已成功上传并解析书签
  if (current.value === 0) {
    return completed.value && progressStatus.value === 'success'
  }

  // 第二步（选择文件夹）：检查是否有书签数据
  if (current.value === 1) {
    return bookmarksData.value && bookmarksData.value.length > 0
  }

  // 第三步（分类书签）：可以添加分类相关的检查
  if (current.value === 2) {
    return true
  }
  return true
})
</script>

<style scoped>
.steps-container {
  width: 100%;
  margin: 0 auto;
  padding: 48px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  height: 100vh;
  box-sizing: border-box;
}

/* 保留 :deep 选择器，因为这是修改 ant-design 组件的必要方式 */
:deep(.ant-steps) {
  margin-bottom: 24px;
}

/* 保留对 ant-steps 组件的样式修改 */
:deep(.ant-steps-item-title) {
  font-family: 'Roboto', sans-serif;
  font-weight: 500;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.87);
}

:deep(.ant-steps-item-icon) {
  background: #fff;
  border-color: #1a73e8;
}

:deep(.ant-steps-item-active .ant-steps-item-icon) {
  background-color: #1a73e8;
}

:deep(.ant-steps-item-finish .ant-steps-item-icon) {
  background-color: #fff;
}

:deep(.ant-steps-item-finish .ant-steps-icon) {
  color: #1a73e8;
}

:deep(.ant-steps-item-process .ant-steps-item-icon) {
  background-color: #1a73e8;
}

.steps-content {
  flex: 1;
  margin-bottom: 24px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background-color: #fafafa;
  text-align: center;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
}

.steps-action {
  display: flex;
  justify-content: center;
}

/* 修改按钮样式，但仅限于当前组件中的按钮 */
.steps-action :deep(.ant-btn) {
  height: 36px;
  padding: 0 16px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.steps-action :deep(.ant-btn-primary) {
  background-color: #1a73e8;
  border-color: #1a73e8;
}

.steps-action :deep(.ant-btn-primary:hover) {
  background-color: #1765cc;
  border-color: #1765cc;
}

@media (max-width: 768px) {
  .steps-container {
    padding: 24px;
  }

  .steps-content {
    padding: 16px;
  }

  :deep(.ant-steps-horizontal:not(.ant-steps-label-vertical) .ant-steps-item) {
    margin-right: 8px;
  }
}
</style>
