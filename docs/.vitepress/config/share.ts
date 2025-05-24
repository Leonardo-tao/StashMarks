import { defineConfig } from "vitepress";
import { vitepressDemoPlugin } from 'vitepress-demo-plugin';

export const sharedConfig = defineConfig({
  rewrites: {
    'en/:rest*': ':rest*',
  },
  metaChunk: true,
  lang: 'en',
  title: 'StashMarks',
  titleTemplate: 'Hi，终于等到你',
  description: 'xxx、xxx',
  head: [['link', { rel: 'icon', href: '/docs/favicon.ico' }]],
  base: '/StashMark/docs/',
  lastUpdated: true,
  vite: {
    build: {
      chunkSizeWarningLimit: 1600,
    },
    plugins: [],
    server: {
      port: 18089,
    },
  },
  markdown: {
    // markdown 配置
    config(md) {
      md.use(vitepressDemoPlugin)
    },
    math: true,
    lineNumbers: true, // 行号显示
    image: {
      // 开启图片懒加载
      lazyLoading: true,
    },
  },
  themeConfig: {
    // 主题设置
    search: {
      provider: 'local',
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: 'Search',
                buttonAriaLabel: 'Search',
              },
              modal: {
                displayDetails: 'Display detailed list',
                resetButtonTitle: 'Reset search',
                backButtonTitle: 'Close search',
                noResultsText: 'No results for',
                footer: {
                  selectText: 'to select',
                  selectKeyAriaLabel: 'enter',
                  navigateText: 'to navigate',
                  navigateUpKeyAriaLabel: 'up arrow',
                  navigateDownKeyAriaLabel: 'down arrow',
                  closeText: 'to close',
                  closeKeyAriaLabel: 'escape',
                },
              },
            },
          },
        },
      },
    },
    logo: '/StashMarks/docs/logo.svg',
  },
})
