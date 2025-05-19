import { zhNav } from '../navbar'
import { zhSidebar } from '../sidebar'
import type { DefaultTheme, LocaleSpecificConfig } from 'vitepress'

export const zhConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  themeConfig: {
    lastUpdated: {
      text: "最后更新于",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },
    returnToTopLabel: "返回顶部",
    search: {
      provider: "local",
      options: {
        locales: {
          zh: {
            translations: {
              button: {
                buttonText: "搜索",
                buttonAriaLabel: "搜索",
              },
              modal: {
                displayDetails: "显示详细列表",
                resetButtonTitle: "重制搜索",
                backButtonTitle: "关闭搜索",
                noResultsText: "没有找到相关结果",
                footer: {
                  selectText: "选择",
                  selectKeyAriaLabel: "enter",
                  navigateText: "切换",
                  navigateUpKeyAriaLabel: "上方向键",
                  navigateDownKeyAriaLabel: "下方向键",
                  closeText: "关闭",
                  closeKeyAriaLabel: "esc",
                },
              },
            },
          },
        },
      },
    },
    nav: zhNav,
    sidebar: zhSidebar,
    docFooter: {
      prev: "上一篇",
      next: "下一篇",
    },
    darkModeSwitchLabel: "深浅模式",
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025-present Leonardo-tao",
    },
    outline: {
      level: [1, 6],
      label: "目录",
    },
    outlineTitle: "界面导航",
  },
};