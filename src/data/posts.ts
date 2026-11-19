export interface PostCover {
  url: string;
  width?: number | null;
  height?: number | null;
}

export interface PostSummary {
  slug: string;
  title: string;
  summary: string;
  publishedAt: string;
  category: string;
  tags: string[];
  readingTime: number;
  cover?: PostCover | null;
}

export const POSTS_PER_PAGE = 5;

export const posts: PostSummary[] = [
  {
    slug: "rebuild-blog-with-astro-and-vue-islands",
    title: "用 Astro 与 Vue islands 重做博客",
    summary:
      "把 Sagiri 的视觉拆成 Astro 布局，把搜索、菜单、图片查看这些交互留给 Vue，看看这种混合方式到底值不值得。",
    publishedAt: "2026-11-18T09:30:00+08:00",
    category: "前端",
    tags: ["Astro", "Vue"],
    readingTime: 8,
    cover: { url: "/images/card.webp", width: 4800, height: 3392 },
  },
  {
    slug: "cloudflare-workers-fullstack-blog",
    title: "Cloudflare Workers 上的全栈博客是怎么跑的",
    summary:
      "从 Workers、D1、R2 到 Queues，拆解一个没有传统服务器的博客系统，以及它在真实使用中的边界。",
    publishedAt: "2026-11-12T20:10:00+08:00",
    category: "技术",
    tags: ["Cloudflare", "Workers", "D1"],
    readingTime: 12,
  },
  {
    slug: "sagiri-theme-visual-breakdown",
    title: "Sagiri 主题的视觉拆解",
    summary:
      "日期徽章、侧栏卡片、标题动画和那点橙色，是 Sagiri 最难替代的部分。这篇记录哪些能复用，哪些必须重写。",
    publishedAt: "2026-11-03T14:05:00+08:00",
    category: "设计",
    tags: ["Sagiri", "Hexo", "CSS"],
    readingTime: 9,
    cover: { url: "/images/banner.svg", width: 1600, height: 900 },
  },
  {
    slug: "why-static-sites-still-matter",
    title: "为什么静态站点仍然值得做",
    summary:
      "在到处都是 SSR 和边缘渲染的今天，静态站点依然有它的位置。前提是你想清楚了自己要优化什么。",
    publishedAt: "2026-10-27T08:45:00+08:00",
    category: "思考",
    tags: ["静态站点", "SEO"],
    readingTime: 6,
  },
  {
    slug: "from-hexo-to-astro",
    title: "从 Hexo 迁移到 Astro 的取舍",
    summary:
      "Hexo 的插件生态很成熟，Astro 的组件模型更自由。迁移不是换一个生成器，而是换一种组织内容的方式。",
    publishedAt: "2026-10-19T21:20:00+08:00",
    category: "前端",
    tags: ["Hexo", "Astro"],
    readingTime: 10,
  },
  {
    slug: "add-local-search-to-blog",
    title: "给博客加一个本地搜索",
    summary:
      "不依赖后端，也不把文章正文塞进浏览器。用构建时生成的索引做站内搜索，够快，也够简单。",
    publishedAt: "2026-10-08T11:15:00+08:00",
    category: "前端",
    tags: ["搜索", "Pagefind"],
    readingTime: 7,
  },
  {
    slug: "code-highlighting-with-shiki",
    title: "代码高亮：Shiki 和它的朋友们",
    summary:
      "从 Prism 到 Shiki，代码高亮的重点不只是颜色，而是构建时、运行时、主题切换和包体积之间的平衡。",
    publishedAt: "2026-09-30T16:40:00+08:00",
    category: "技术",
    tags: ["Shiki", "Markdown"],
    readingTime: 8,
  },
  {
    slug: "math-and-mermaid-in-static-blog",
    title: "把数学公式和 Mermaid 放进静态博客",
    summary:
      "KaTeX 负责公式，Mermaid 负责图。它们都能在构建时处理，但代价和降级方案要先想清楚。",
    publishedAt: "2026-09-21T10:25:00+08:00",
    category: "技术",
    tags: ["KaTeX", "Mermaid"],
    readingTime: 9,
  },
  {
    slug: "cloudflare-d1-migration-notes",
    title: "一次 Cloudflare D1 迁移的记录",
    summary:
      "迁移数据库最麻烦的从来不是 SQL，而是那些没有写在文档里的默认值、时区和索引行为。",
    publishedAt: "2026-09-12T19:50:00+08:00",
    category: "技术",
    tags: ["D1", "数据库"],
    readingTime: 11,
  },
  {
    slug: "writing-consistency-over-tools",
    title: "写博客这件事，坚持比工具重要",
    summary:
      "换过很多编辑器、主题和部署方式之后，最后留下来的经验只有一条：先把东西写出来。",
    publishedAt: "2026-08-30T22:05:00+08:00",
    category: "生活",
    tags: ["写作", "随笔"],
    readingTime: 5,
  },
  {
    slug: "image-optimization-from-r2-to-page",
    title: "图片优化：从 R2 到页面",
    summary:
      "原图、响应式尺寸、WebP/AVIF、缓存和懒加载，图片是博客里最容易拖慢首屏的部分。",
    publishedAt: "2026-08-18T13:30:00+08:00",
    category: "技术",
    tags: ["图片", "R2", "性能"],
    readingTime: 10,
  },
  {
    slug: "my-2026-dev-setup",
    title: "我的 2026 年开发环境",
    summary:
      "编辑器、终端、浏览器插件和一些自动化脚本。没有什么神奇配置，只有用顺手的组合。",
    publishedAt: "2026-08-05T09:10:00+08:00",
    category: "生活",
    tags: ["工具", "效率"],
    readingTime: 6,
  },
  {
    slug: "css-variables-for-theme-colors",
    title: "CSS 变量做主题色的一点经验",
    summary:
      "主题色不只是改一个十六进制值。对比度、悬停态、浅色背景和深色模式都要一起考虑。",
    publishedAt: "2026-07-22T15:45:00+08:00",
    category: "前端",
    tags: ["CSS", "主题"],
    readingTime: 7,
  },
  {
    slug: "add-toc-and-reading-progress",
    title: "给文章加目录和阅读进度",
    summary:
      "目录是长文的导航，阅读进度是读者的位置感。两者都不难，难的是在移动端保持克制。",
    publishedAt: "2026-07-10T18:20:00+08:00",
    category: "前端",
    tags: ["TOC", "交互"],
    readingTime: 8,
  },
];

export const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);

export function pagePosts(page: number) {
  const start = (page - 1) * POSTS_PER_PAGE;
  return posts.slice(start, start + POSTS_PER_PAGE);
}
