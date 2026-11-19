export interface SocialLink {
  label: string;
  href: string;
}

export const site = {
  title: "your-name",
  author: "your-name",
  tagline: "Dream it.Chase it.Code it.",
  avatar: "/images/avatar.png",
  card: "/images/card.webp",
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
