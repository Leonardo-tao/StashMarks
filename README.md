# Marks - 书签管理工具
## 项目简介
Marks 是一个功能强大的书签管理工具，帮助用户导入、整理、分类和导出浏览器书签。通过直观的界面和流程化的操作，使书签管理变得简单高效。

## 主要功能
- 书签导入 ：支持从 Chrome、Firefox、Edge 等主流浏览器导入 HTML 格式的书签文件
- 文件夹管理 ：可选择性释放文件夹，将书签提取出来进行重新分类
- 书签分类 ：通过拖拽方式将书签分配到不同文件夹中
- 暂存功能 ：提供暂存区和回收站，方便书签的临时存放和恢复
- 书签导出 ：支持导出为 HTML 格式（可导入浏览器）或 JSON 格式（数据备份）
## 项目结构
```bash
src/
├── assets/           # 静态资源文件
│   ├── logo.svg
│   └── main.scss     # 全局样式
├── components/       # 通用组件
│   └── BookmarkItem.vue  # 书签项组件
├── layout/           # 布局组件
│   ├── Layout.vue    # 主布局
│   └── Steps.vue     # 步骤导航组件
├── types/            # TypeScript 类型定义
│   ├── BookmarkItem.ts  # 书签相关类型定义
│   └── index.ts
├── views/            # 页面视图组件
│   ├── Upload.vue           # 上传书签页面
│   ├── SplitFolders.vue     # 文件夹拆分页面
│   ├── BookmarkSorter.vue   # 书签分类页面
│   ├── BookmarksList.vue    # 书签列表展示页面
│   ├── DownloadBookmarks.vue # 书签下载页面
│   └── bookmarks.vue        # 书签展示组件
├── App.vue           # 应用根组件
└── main.ts           # 应用入口文件
```



## 使用流程

应用采用步骤式导航，引导用户完成书签管理的整个流程：

1. 上传书签 ：用户可以拖拽或点击上传浏览器导出的书签 HTML 文件
2. 选择文件夹 ：选择需要释放的文件夹，将书签从原有文件夹结构中提取出来
3. 分类书签 ：将书签拖拽到目标文件夹中进行重新分类，也可以暂存或删除
4. 下载书签 ：选择导出格式（HTML 或 JSON），生成并下载整理后的书签文件
5. 完成 ：整个书签管理流程结束



## 数据结构
项目使用以下主要数据结构：

- BookmarkItem ：表示单个书签的数据结构，包含标题、链接、图标等信息
- BookmarkCategory ：表示书签分类/文件夹，包含标题和书签项数组
- TempBookmarkItem ：用于解析过程中的中间数据结构



## 技术栈
- 前端框架 ：Vue 3 + TypeScript
- UI 组件库 ：Ant Design Vue
- 状态管理 ：Vue 的 Provide/Inject API



## 开发指南
### 安装依赖
```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```



## 许可证
MIT License