<template>
    <div class="category-container">
        <draggable v-for="category in categories" :key="category.id" v-model="category.bookmarks" group="bookmarks"
            @end="onDragEnd" class="category-column" item-key="id">
            <template #header>
                <h3 class="category-title">{{ category.name }}</h3>
            </template>
            <template #item="{ element }">
                <div class="bookmark-item">
                    <a :href="element.url" target="_blank">{{ element.title }}</a>
                </div>
            </template>
        </draggable>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import draggable from 'vuedraggable';

// 示例数据结构
const categories = ref([
    {
        id: 1,
        name: '未分类',
        bookmarks: [
            { id: 1, title: 'GitHub', url: 'https://github.com' },
            { id: 2, title: 'Google', url: 'https://google.com' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
    {
        id: 2,
        name: '技术',
        bookmarks: [
            { id: 3, title: 'Vue.js', url: 'https://vuejs.org' }
        ]
    },
]);

const onDragEnd = (event) => {
    console.log('拖拽后的数据:', categories.value);
    // 这里可以添加持久化到本地存储或API的逻辑
};
</script>

<style>
.category-container {
    display: flex;
    gap: 20px;
    padding: 20px;
}

.category-column {
    background: #f5f5f5;
    padding: 15px;
    border-radius: 8px;
    min-width: 300px;
    min-height: 400px;
}

.bookmark-item {
    background: white;
    margin: 8px 0;
    padding: 12px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    cursor: move;
}

.category-title {
    margin: 0 0 15px 0;
    color: #333;
}
</style>