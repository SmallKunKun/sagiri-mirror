export interface SocialLink {
  label: string;
  href: string;
}

export const site = {
  title: "Sagiri Blog",
  subtitle: "记录技术与生活",
  author: "your-name",
  description: "一个基于 Astro 与 Vue islands 的静态博客。",
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
