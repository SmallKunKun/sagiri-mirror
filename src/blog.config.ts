const env = import.meta.env as Record<string, string | undefined>;

const footerDefaults = {
  since: "",
  icp: "",
  icpUrl: "",
};

function footerValue(key: string, fallback: string) {
  const value = process.env[key] ?? env[key];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/**
 * 远端 flare-stack-blog 地址。
 *
 * 必须填写自己的后端地址；也可以通过 BLOG_ORIGIN 环境变量覆盖。
 * 留空时构建会直接报错，不会使用任何默认博客。
 */
export const blogSource = {
  origin: "",
};

/**
 * 页脚文案。
 *
 * 可以修改 footerDefaults，也可以在 Actions Variables / 环境变量中设置：
 * FOOTER_SINCE、FOOTER_ICP、FOOTER_ICP_URL。
 * 留空则不显示对应内容。Made with 文案固定使用远端站点作者。
 */
export const footerConfig = {
  since: footerValue("FOOTER_SINCE", footerDefaults.since),
  icp: footerValue("FOOTER_ICP", footerDefaults.icp),
  icpUrl: footerValue("FOOTER_ICP_URL", footerDefaults.icpUrl),
};
