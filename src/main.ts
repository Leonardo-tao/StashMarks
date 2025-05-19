import { createApp } from 'vue'
import App from './App.vue'
import Antd from 'ant-design-vue';

import './assets/main.scss'
import 'ant-design-vue/dist/reset.css';
import * as Icons from '@ant-design/icons-vue'

const app = createApp(App)
app.use(Antd).mount('#app')

// 全局使用图标，遍历引入
const icons = Icons
for (const i in icons) {
  app.component(i, icons[i as keyof typeof Icons])
}
