/**
 * 远端 flare-stack-blog 地址。
 *
 * 必须填写自己的后端地址；也可以通过 BLOG_ORIGIN 环境变量覆盖。
 * 留空时构建会直接报错，不会使用任何默认博客。
 */
export const blogSource = {
  origin: "",
};

/** 页脚文案。留空则不显示对应内容。 */
export const footerConfig = {
  /** 博客开始运行的时间，用于「博客已萌萌哒运行…」计时。留空则不显示。 */
  since: "",
  /** ICP 备案号。留空则不显示。 */
  icp: "",
  /** ICP 链接，例如 https://beian.miit.gov.cn/。留空则只显示文字。 */
  icpUrl: "",
  /** Made with ♥ by 后面的名字。留空使用站点作者。 */
  madeBy: "",
  /** Made with 名字的链接。留空则不链接。 */
  madeByUrl: "",
};
