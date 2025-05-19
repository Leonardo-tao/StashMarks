import { DefaultTheme } from "vitepress";

export const enSidebar: DefaultTheme.Sidebar = {
  "/": [
    {
      text: "Guide",
      items: [
        { text: "guide", link: `/guide/` },
        { text: "quick started", link: `/quick-started/` },
        { text: "reference", link: `/reference/` },
      ],
    },
  ],
};