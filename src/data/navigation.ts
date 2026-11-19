export interface NavChild {
  label: string;
  href: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon?: string;
  children?: NavChild[];
}

/** The links every mirror keeps, before the Site Config's own links. */
export const fixedNavigation: NavItem[] = [
  { label: "首页", href: "/", icon: "home" },
  { label: "文章", href: "/posts", icon: "archive" },
  { label: "友链", href: "/friends", icon: "heart" },
];

export const navigation = fixedNavigation;
