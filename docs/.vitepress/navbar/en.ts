import type { DefaultTheme } from 'vitepress'

export const enNav: DefaultTheme.NavItem[] = [
  { text: "Home", link: "/" },
  {
    text: "Quick Start",
    link: "/quick-started/",
    activeMatch: "/quick-started/",
  },
  { text: "reference", link: "/reference/", activeMatch: "/reference/" },
];