# astro-blog

Sagiri 风格的静态博客镜像。构建时从远端博客 API 读取站点配置、文章和友链，生成纯静态页面，部署到 GitHub Pages 后不需要任何后端服务。

## Fork 后部署

1. Fork 本仓库。
2. 打开仓库的 **Settings → Pages → Build and deployment**。
3. 把 **Source** 设为 **GitHub Actions**。
4. 打开 **Actions → Sync and deploy → Run workflow**。

部署地址会自动适配仓库类型：

```text
仓库名 username.github.io
→ https://username.github.io/

其他仓库名
→ https://username.github.io/仓库名/
```

`astro.config.mjs` 会读取 Actions 提供的 `base_path`，自动处理子路径，不需要手动改 `base`。

## 定时同步

workflow 默认在北京时间每天 04:00 重新构建一次：

```text
0 20 * * * UTC
= 04:00 Asia/Shanghai
```

也可以在 Actions 页面手动运行。

## 配置

默认镜像：

```text
https://your-blog.example.com
```

想换成自己的后端，在 **Settings → Secrets and variables → Actions → Variables** 新建：

```text
BLOG_ORIGIN=https://your-blog.example.com
```

页脚时间和备案信息在 `src/blog.config.ts` 的 `footerConfig` 里修改。

## 本地开发

```bash
npm install
npm run dev
```

构建：

```bash
npm run build
```
