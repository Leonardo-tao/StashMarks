import { enNav } from "../navbar";
import { enSidebar } from "../sidebar";
import type { DefaultTheme, LocaleSpecificConfig } from "vitepress";

export const enConfig: LocaleSpecificConfig<DefaultTheme.Config> = {
  themeConfig: {
    lastUpdated: {
      text: "last updated at",
      formatOptions: {
        dateStyle: "short",
        timeStyle: "medium",
      },
    },
    returnToTopLabel: "back to top",
    search: { provider: "local" },
    nav: enNav,
    sidebar: enSidebar,
    docFooter: {
      prev: "last page",
      next: "next page",
    },
    darkModeSwitchLabel: "dark mode",
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025-present Leonardo-tao",
    },
    outline: {
      level: "deep",
    },
  },
};
