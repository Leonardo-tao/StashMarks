<template>
  <a-layout class="s-container">
  <a-row>
    <a-col :span="12">
      <a-carousel dot-position="right" arrows>
        <a-card 
          hoverable 
          v-for="item in unclassifiedBookmarks" 
          :key="item.id">
          <template #cover>
              <img alt="website preview" :src="item.icon" class="markImg" style="width: 100%"/>
          </template>
          <a-card-meta :title="item.title">
            <template #description>{{ item.url }}</template>
          </a-card-meta>
        </a-card>
      </a-carousel>
    </a-col>
    <a-col :span="12">
      <a-row v-for="folder in folders">
        <a-dropdown :trigger="['contextmenu']">
            <a-card hoverable @dragover.prevent @drop="handleDrop(folder)"
              @contextmenu.prevent class="folder-card">
                <folder-outlined style="font-size: 24px" />
                <h3>{{ folder.name }}</h3>
            </a-card>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleRename">重命名</a-menu-item>
                <a-menu-item @click="handleDelete">删除</a-menu-item>
                <a-menu-item @click="handleDisband">解散文件夹</a-menu-item>
              </a-menu>
            </template>
        </a-dropdown>
      </a-row>
    </a-col>
  </a-row>
    <!-- <a-row class="bookmarks" :gutter="[16, 24]" justify="space-evenly">
      <a-col v-for="item in unclassifiedBookmarks" :key="item.id" draggable="true"
        @dragstart="handleDragStart($event, item)">
        <a-card hoverable :body-style="{ padding: '12px' }">
          <template #cover>
            <img alt="website preview" :src="item.icon" style="height: 120px; object-fit: contain" />
          </template>
          <a-card-meta :title="item.title">
            <template #description>{{ item.url }}</template>
          </a-card-meta>
        </a-card>
      </a-col>
    </a-row>
    <a-row class="folders" :gutter="[16, 16]">
      <a-col v-for="folder in folders" :key="folder.id" :xs="24" :sm="12" :md="8" :lg="6">
          <a-badge :count="folder.items.length">
        <a-dropdown :trigger="['contextmenu']">
            <a-card hoverable @dragover.prevent @drop="handleDrop(folder)"
              :body-style="{ padding: '12px', position: 'relative' }"
              @contextmenu.prevent class="folder-card">
                <folder-outlined style="font-size: 24px" />
                <h3>{{ folder.name }}</h3>
            </a-card>
            <template #overlay>
              <a-menu>
                <a-menu-item @click="handleRename">重命名</a-menu-item>
                <a-menu-item @click="handleDelete">删除</a-menu-item>
                <a-menu-item @click="handleDisband">解散文件夹</a-menu-item>
              </a-menu>
            </template>
        </a-dropdown>
          </a-badge>
      </a-col>
      <a-col :xs="24" :sm="12" :md="8" :lg="6">
        <a-card hoverable :body-style="{
          padding: '12px',
          cursor: 'pointer',
          textAlign: 'center',
        }" @click="handleCreate" class="new-folder-card">
          <plus-outlined style="font-size: 32px; color: #1890ff" />
          <h3>新建文件夹</h3>
        </a-card>
      </a-col>
    </a-row>
    <a-modal v-model:visible="renameFolder.visible" title="重命名文件夹" @ok="confirmRename">
      <a-input v-model:value="renameFolder.newName" placeholder="请输入新名称" />
    </a-modal>
    <a-modal v-model:visible="newFolder.visible" title="新建文件夹" @ok="confirmCreate">
      <a-form ref="formRef" :model="newFolder">
        <a-form-item name="newName" :rules="[
          { required: true, message: '请输入文件夹名称' },
          { validator: checkFolderUnique }
        ]">
          <a-input v-model:value="newFolder.newName" placeholder="请输入文件夹名称" />
        </a-form-item>
      </a-form>
    </a-modal> -->
  </a-layout>
</template>

<script setup lang="ts">
import { Modal } from "ant-design-vue";
import { ref, reactive } from "vue";
import { FolderOutlined, PlusOutlined } from "@ant-design/icons-vue";
import { withBase } from "vitepress";

const icon = withBase("/logo.svg");

const renameFolder = reactive({
  visible: false,
  value: "",
})

const newFolder = reactive({
  visible: false,
  value: "",
})

// 书签数据
const unclassifiedBookmarks = ref([
  { id: 1, title: "GitHub", url: "https://github.com", icon },
  { id: 2, title: "Google", url: "https://google.com", icon },
  { id: 3, title: "Baidu", url: "https://baidu.com", icon },
  { id: 4, title: "Bing", url: "https://bing.com", icon },
  { id: 5, title: "YouTube", url: "https://youtube.com", icon },
  { id: 6, title: "Twitter", url: "https://twitter.com", icon },
  { id: 7, title: "Facebook", url: "https://facebook.com", icon },
  { id: 8, title: "Instagram", url: "https://instagram.com", icon },
  { id: 9, title: "LinkedIn", url: "https://linkedin.com", icon },
]);

// 文件夹数据
const folders = reactive([
  {
    id: 1,
    name: "工作",
    items: [{ id: 3, title: "Notion", url: "https://notion.so", icon }],
  },
  {
    id: 2,
    name: "学习",
    items: [],
  },
  {
    id: 3,
    name: "娱乐",
    items: [
      { id: 10, title: "YouTube", url: "https://youtube.com", icon },
      { id: 11, title: "Netflix", url: "https://netflix.com", icon },
    ],
  },
]);

// 菜单操作处理函数
const handleRename = () => {
};

const confirmRename = () => {
};

const handleCreate = () => {
};

// 简化后的提交逻辑
const confirmCreate = () => {
};

const handleDelete = () => {
  Modal.confirm({
    title: "确认删除",
    content: "确定要永久删除这个文件夹吗？",
    onOk: () => {
    },
  });
};

const handleDisband = () => {
  Modal.confirm({
    title: "解散文件夹",
    content: "确定要解散这个文件夹吗？书签将移回未分类区域",
    onOk: () => {
    },
  });
};

// 新增拖放相关逻辑
let draggedBookmark = ref(null);

// 书签拖动处理
const handleDragStart = (event, bookmark) => {
  draggedBookmark.value = bookmark;
};

// 文件夹放置处理
const handleDrop = (folder) => {
  if (draggedBookmark.value) {
    // 添加到文件夹
    folder.bookmarks.push({ ...draggedBookmark.value });
    // 从未分类中移除
    const index = unclassifiedBookmarks.value.findIndex(
      (b) => b.id === draggedBookmark.value.id
    );
    if (index > -1) {
      unclassifiedBookmarks.value.splice(index, 1);
    }
  }
};

// 修复右键菜单问题
const closeContextMenu = () => {
};

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.s-container {
  height: calc(100vh - 64px);
  max-width: 1528px;
}

.markImg {
  height: 120px;
  object-fit: contain;
}
</style>
