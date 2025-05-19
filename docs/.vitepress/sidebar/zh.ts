import type { DefaultTheme } from "vitepress";

export const zhSidebar: DefaultTheme.Sidebar = {
  "/zh/": [
    {
      text: "使用指南",
      items: [
        { text: "简介", link: `/zh/guide/` },
        { text: "快速开始", link: `/zh/quick-started/` },
        { text: "参考", link: `/zh/reference/` },
      ],
    },
  ],
};