/**
 * 导航配置。
 *
 * 增删菜单项只需要改这个数组：
 * - `label`：显示的文本
 * - `href`：站内用 `/` 开头，外链写完整 `https://`
 * - `icon`：可选，支持 home / flask / archive / heart / message / user
 * - `children`：可选，二级菜单，每项同样有 label 和 href
 *
 * 外链会自动在新标签页打开，不需要额外配置。
 */
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

export const navigation: NavItem[] = [
  { label: "首页", href: "/", icon: "home" },
  {
    label: "实验室",
    href: "#",
    icon: "flask",
    children: [
      { label: "网盘", href: "https://drive.your-blog.example.com/" },
      { label: "音乐", href: "https://music.your-blog.example.com/" },
      { label: "起始", href: "https://search.your-blog.example.com/" },
      { label: "链接", href: "https://url.your-blog.example.com/" },
      { label: "监控", href: "https://status.your-blog.example.com/" },
    ],
  },
  { label: "归档", href: "/archives/", icon: "archive" },
  { label: "后宫", href: "/friends/", icon: "heart" },
  { label: "留言板", href: "/message/", icon: "message" },
  { label: "关于我", href: "/about/", icon: "user" },
];
