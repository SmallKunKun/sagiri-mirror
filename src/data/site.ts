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

export interface SocialLink {
  label: string;
  href: string;
}

export const site = {
  title: "Sagiri Blog",
  subtitle: "记录技术与生活",
  author: "your-name",
  description: "一个基于 Astro 与 Vue islands 的静态博客。",
  nav: [
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
  ] satisfies NavItem[],
  social: [
    { label: "GitHub", href: "https://github.com/" },
    { label: "RSS", href: "/rss.xml" },
  ] satisfies SocialLink[],
  stats: [
    { label: "文章", value: "0" },
    { label: "标签", value: "0" },
    { label: "分类", value: "0" },
  ],
};
