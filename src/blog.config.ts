/**
 * 你要镜像的 flare-stack-blog。
 *
 * 换一台部署，只改这里的 origin，重新构建即可显示那台博客的
 * 标题、作者、tagline、头像、banner 和社交链接。
 *
 * 也可以用环境变量 BLOG_ORIGIN 覆盖。
 */
export const blogSource = {
  origin: "https://your-blog.example.com",
};

/** 页脚文案，可以自己改。 */
export const footerConfig = {
  /** 博客开始运行的时间，用于「博客已萌萌哒运行…」计时。留空则不显示。 */
  since: "1970-01-01T00:00:00+08:00",
  /** ICP 备案号。留空则不显示。 */
  icp: "备案号.",
  /** ICP 链接，例如 https://beian.miit.gov.cn/。留空则只显示文字。 */
  icpUrl: "https://example.com/icp",
  /** Made with ♥ by 后面的名字。留空使用站点作者。 */
  madeBy: "",
  /** Made with 名字的链接。留空则不链接。 */
  madeByUrl: "",
};
