<template>
  <div class="container">
    <a-upload-dragger
      v-model:fileList="fileList"
      name="file"
      accept=".html"
      :multiple="false"
      :before-upload="beforeUpload"
      :show-upload-list="false"
      @drop="handleDrop"
    >
      <p class="ant-upload-drag-icon">
        <inbox-outlined></inbox-outlined>
      </p>
      <p class="ant-upload-text">点击或拖拽HTML书签文件到此区域上传</p>
      <p class="ant-upload-hint">
        支持 Chrome、Firefox、Edge 等浏览器导出的书签HTML文件
      </p>
    </a-upload-dragger>

    <div class="progress-container">
      <div class="progress-info">
        <a-spin :spinning="processing" />
        <span class="progress-text">{{ progressText || '等待上传书签文件...' }}</span>

        <!-- 成功状态显示下载按钮 -->
        <div class="action-icon" v-if="progressStatus === 'success' && bookmarksData.length && progressPercent === 100">
          <a-button shape="circle" :icon="h(DownloadOutlined)" @click="downloadBookmarks" title="下载JSON文件"></a-button>
        </div>

        <!-- 失败状态显示重试按钮 -->
        <div class="action-icon" v-if="progressStatus === 'exception'">
          <a-button shape="circle" :icon="h(ReloadOutlined)" @click="retryLastFile" title="重试"></a-button>
        </div>
      </div>
      <a-progress v-if="processing || completed" :percent="Math.floor(progressPercent)" :status="progressStatus" />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, h, inject, onMounted } from 'vue'
import { InboxOutlined, DownloadOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import type { UploadFile } from 'ant-design-vue'
import type { BookmarkCategory, TempBookmarkItem } from '@/types'

// 从父组件注入书签数据和状态
const injectedBookmarksData = inject('bookmarksData', ref<Array<BookmarkCategory>>([]));
const injectedProcessing = inject('processing', ref<boolean>(false));
const injectedCompleted = inject('completed', ref<boolean>(false));
const injectedProgressPercent = inject('progressPercent', ref<number>(0));
const injectedProgressText = inject('progressText', ref<string>(''));
const injectedProgressStatus = inject('progressStatus', ref<'normal' | 'success' | 'exception'>('normal'));
const injectedLastFile = inject('lastFile', ref<File | null>(null));

// 本地状态引用注入的值
const fileList = ref<UploadFile[]>([])
const bookmarksData = injectedBookmarksData;
const processing = injectedProcessing;
const completed = injectedCompleted;
const progressPercent = injectedProgressPercent;
const progressText = injectedProgressText;
const progressStatus = injectedProgressStatus;
const lastFile = injectedLastFile;

/**
 * 上传前处理函数
 * @param file 上传的文件对象
 * @returns 返回false阻止默认上传行为
 */
const beforeUpload = (file: File): boolean => {
  handleFile(file)
  return false
}

/**
 * 处理拖放事件
 * @param e 拖放事件对象
 */
function handleDrop(e: DragEvent): void {
  const dataTransfer = e.dataTransfer
  if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
    handleFile(dataTransfer.files[0])
  }
}

/**
 * 重试上次文件处理
 */
function retryLastFile(): void {
  if (lastFile.value) {
    handleFile(lastFile.value)
  } else {
    message.error('没有可重试的文件')
  }
}

/**
 * 更新进度条状态
 * @param text 进度文本
 * @param status 进度状态
 */
function updateProgress(
  text: string,
  status: 'normal' | 'success' | 'exception' = 'normal'
): void {
  // 更新文本和状态
  progressText.value = text;
  progressStatus.value = status;

  // 如果状态为异常或成功，设置相应的处理状态
  if (status === 'exception') {
    processing.value = false;
    completed.value = true;
    progressPercent.value = 100;
  } else if (status === 'success') {
    processing.value = false;
    completed.value = true;
    progressPercent.value = 100;
  }
}

/**
 * 处理文件函数
 * @param file 上传的文件对象
 */
async function handleFile(file: File): Promise<void> {
  // 保存当前文件，用于重试功能
  lastFile.value = file;

  if (!file.name.endsWith('.html') || !file.type.includes('html')) {
    updateProgress('请选择有效的HTML书签文件', 'exception');
    return;
  }

  // 开始处理
  completed.value = false;
  processing.value = true;
  progressPercent.value = 0;
  updateProgress(`已选择文件: ${file.name} (${formatFileSize(file.size)})`, 'normal');

  progressPercent.value = 10;

  const reader = new FileReader();

  reader.onload = async (e: ProgressEvent<FileReader>): Promise<void> => {
    try {
      updateProgress('解析文件中...', 'normal');
      // 文件读取完成，进度设置为50%
      progressPercent.value = 50;

      const parser = new DOMParser();
      const target = e.target;

      if (!target) {
        throw new Error('文件读取目标为空');
      }

      const result = target.result;
      if (typeof result !== 'string') {
        throw new Error('文件读取结果类型错误');
      }

      updateProgress('处理书签结构...', 'normal');
      progressPercent.value = 70;

      const doc = parser.parseFromString(result, "text/html");

      updateProgress('转换数据格式...', 'normal');
      progressPercent.value = 90;

      bookmarksData.value = parseBookmarks(doc);

      if (bookmarksData.value.length === 0) {
        throw new Error('解析结果为空');
      }

      // 处理完成，设置为100%
      progressPercent.value = 100;
      updateProgress('解析成功！', 'success');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      updateProgress(`解析失败: ${errorMessage}`, 'exception');
      bookmarksData.value = [];
    }
  };

  reader.onerror = (): void => {
    updateProgress('文件读取失败', 'exception');
  };

  reader.readAsText(file);
}

/**
 * 核心解析逻辑
 * @param doc HTML文档对象
 * @returns 解析后的书签数据数组
 */
function parseBookmarks(doc: Document): Array<BookmarkCategory> {
  const roots = doc.querySelector('DL') || doc.querySelector('dl') || doc.getElementsByTagName('dl')[0]

  if (!roots) throw new Error('无效的书签文件格式')

  // 临时存储解析结果
  const tempBookmarks: Array<TempBookmarkItem> = []

  /**
   * 递归解析节点
   * @param dlElement 要解析的DL元素
   * @param parent 父级数组，用于存储解析结果
   */
  const parseNode = (dlElement: Element, parent: Array<TempBookmarkItem>): void => {
    let currentNode = dlElement.firstChild
    while (currentNode) {
      if (currentNode.nodeType === Node.ELEMENT_NODE) {
        const element = currentNode as Element
        const tagName = element.tagName.toLowerCase()
        if (tagName === 'dt') {
          const folder = element.querySelector('h3, H3')
          const link = element.querySelector('a, A')

          // 优先处理文件夹
          if (folder) {
            const newFolder: TempBookmarkItem = {
              type: 'folder',
              title: folder.textContent?.trim() || '未命名文件夹',
              items: []
            }
            parent.push(newFolder)
            const nestedDL = element.querySelector('dl, DL')
            if (nestedDL && newFolder.items) parseNode(nestedDL, newFolder.items)
          }
          // 单独处理链接（当且仅当不存在文件夹时）
          else if (link) {
            const anchor = link as HTMLAnchorElement
            parent.push({
              type: 'link',
              title: anchor.textContent?.trim() || '未命名书签',
              link: anchor.href || '#',
              icon: anchor.getAttribute('icon')
            })
          }
        }
      }
      currentNode = currentNode.nextSibling
    }
  }

  parseNode(roots, tempBookmarks)

  /**
   * 将临时解析结果转换为最终格式
   * @param tempItems 临时解析结果
   * @returns 最终格式的书签数据
   */
  const convertToFinalFormat = (tempItems: Array<TempBookmarkItem>): Array<BookmarkCategory> => {
    const result: Array<BookmarkCategory> = []

    // 创建一个映射，用于存储第一层文件夹
    const folderMap: Record<string, BookmarkCategory> = {}

    // 创建"未分类书签"分类，用于存放未分类的链接
    const otherCategory: BookmarkCategory = {
      title: '未分类书签',
      items: []
    }

    /**
     * 查找书签栏文件夹
     * @param items 要搜索的项目数组
     * @returns 书签栏文件夹或null
     */
    const findBookmarksBar = (items: Array<TempBookmarkItem>): TempBookmarkItem | null => {
      // 查找名为"书签栏"或"Bookmarks Bar"的文件夹
      return items.find(item =>
        item.type === 'folder' &&
        (item.title === '书签栏' ||
         item.title === 'Bookmarks Bar' ||
         item.title === '收藏夹栏' ||
         item.title.toLowerCase().includes('bookmark') && item.title.toLowerCase().includes('bar'))
      ) || null
    }

    /**
     * 递归收集所有链接到指定文件夹
     * @param items 要处理的项目数组
     * @param targetFolder 目标文件夹
     */
    const collectAllLinks = (items: Array<TempBookmarkItem>, targetFolder: BookmarkCategory): void => {
      items.forEach(item => {
        if (item.type === 'link') {
          // 处理链接项
          targetFolder.items.push({
            title: item.title,
            link: item.link || '#',
            icon: item.icon || null,
            desc: '' // 默认描述为空
          })
        } else if (item.type === 'folder' && item.items && item.items.length > 0) {
          // 递归处理嵌套文件夹中的所有链接
          collectAllLinks(item.items, targetFolder)
        }
      })
    }

    // 查找书签栏文件夹
    const bookmarksBar = findBookmarksBar(tempItems)

    // 确定要处理的根项目
    const rootItems = bookmarksBar ? bookmarksBar.items || [] : tempItems

    // 处理第一层文件夹
    rootItems.forEach(item => {
      if (item.type === 'folder' && item.items && item.items.length > 0) {
        // 创建第一层文件夹分类
        const category: BookmarkCategory = {
          title: item.title,
          items: []
        }

        // 收集当前文件夹中的直接链接
        item.items.forEach(subItem => {
          if (subItem.type === 'link') {
            category.items.push({
              title: subItem.title,
              link: subItem.link || '#',
              icon: subItem.icon || null,
              desc: ''
            })
          }
        })

        // 处理嵌套文件夹，将所有子文件夹中的链接都收集到当前文件夹中
        const nestedFolders = item.items.filter(subItem =>
          subItem.type === 'folder' && subItem.items && subItem.items.length > 0
        )

        if (nestedFolders.length > 0) {
          nestedFolders.forEach(folder => {
            if (folder.items) {
              collectAllLinks(folder.items, category)
            }
          })
        }

        // 只添加非空分类
        if (category.items.length > 0) {
          folderMap[item.title] = category
        }
      } else if (item.type === 'link') {
        // 处理未分类的链接，添加到"未分类书签"分类
        otherCategory.items.push({
          title: item.title,
          link: item.link || '#',
          icon: item.icon || null,
          desc: ''
        })
      }
    })

    // 处理书签栏外的链接和文件夹
    if (bookmarksBar) {
      tempItems.forEach(item => {
        if (item !== bookmarksBar) {
          if (item.type === 'folder' && item.items && item.items.length > 0) {
            // 创建第一层文件夹分类
            const category: BookmarkCategory = {
              title: item.title,
              items: []
            }

            // 收集所有链接
            collectAllLinks(item.items, category)

            // 只添加非空分类
            if (category.items.length > 0) {
              folderMap[item.title] = category
            }
          } else if (item.type === 'link') {
            // 处理未分类的链接，添加到"未分类书签"分类
            otherCategory.items.push({
              title: item.title,
              link: item.link || '#',
              icon: item.icon || null,
              desc: ''
            })
          }
        }
      })
    }

    // 将所有文件夹添加到结果中
    Object.values(folderMap).forEach(folder => {
      result.push(folder)
    })

    // 如果有未分类的链接，添加"未分类书签"分类
    if (otherCategory.items.length > 0) {
      result.push(otherCategory)
    }

    return result
  }

  // 转换为最终格式并返回
  return convertToFinalFormat(tempBookmarks)
}

/**
 * 格式化文件大小
 * @param bytes 字节数
 * @returns 格式化后的文件大小字符串
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * 下载书签数据为JSON文件
 */
function downloadBookmarks(): void {
  if (bookmarksData.value.length === 0) {
    updateProgress('请先上传有效的书签文件', 'exception');
    return;
  }

  const jsonData = JSON.stringify(bookmarksData.value, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const filename = `bookmarks-${new Date().toISOString().slice(0, 10)}.json`;
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  message.success('书签数据已下载');
}

// 组件挂载时，如果已有数据则恢复状态
onMounted(() => {
  if (bookmarksData.value && bookmarksData.value.length > 0) {
    completed.value = true;
    progressStatus.value = 'success';
    progressText.value = '解析成功！';
    progressPercent.value = 100;
  }
});
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 20px auto;
  padding: 30px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

:deep(.ant-upload-drag) {
  border: 2px dashed #d9d9d9;
  border-radius: 8px;
  transition: all 0.3s;
}

:deep(.ant-upload-drag:hover) {
  border-color: #1890ff;
}

:deep(.ant-upload-drag-icon) {
  margin-bottom: 16px;
}

:deep(.ant-upload-drag-icon .anticon) {
  color: #1890ff;
  font-size: 48px;
}

:deep(.ant-upload-text) {
  font-size: 18px;
  color: #333;
  margin-bottom: 12px;
  font-weight: 500;
}

:deep(.ant-upload-hint) {
  color: #666;
  font-size: 14px;
  max-width: 80%;
  margin: 0 auto;
  line-height: 1.5;
}

/* 进度条容器样式 - 移除背景色 */
.progress-container {
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px;
  /* 移除背景色 */
  /* box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05); */
}

/* 进度信息样式 */
.progress-info {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  position: relative;
}

/* 进度文本样式 */
.progress-text {
  margin-left: 10px;
  font-size: 14px;
  color: #333;
  flex-grow: 1;
}

/* 操作图标样式 */
.action-icon {
  margin-left: 10px;
}
</style>
