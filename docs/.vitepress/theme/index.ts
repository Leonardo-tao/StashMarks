// 框架核心
import Theme from "vitepress/theme";
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css';
//样式文件
import "./style/index.scss"; // 自定义样式
import demo from './demo.vue'

export default {
  ...Theme,
  enhanceApp({ app }) {
    // 注册全局组件
    app.component('demo', demo)
    app.use(Antd)
  },
};
