import { defineConfig } from 'vitepress'
import { sharedConfig } from './config/share'
import { enConfig } from './config/en'
import { zhConfig } from './config/zh'

export default defineConfig({
  ...sharedConfig,
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      ...enConfig,
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      ...zhConfig,
    }
  }
})
