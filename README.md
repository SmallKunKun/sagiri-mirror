<div align="center">

# Sagiri Mirror

基于 **Astro + Vue islands** 的 Sagiri 风格静态博客镜像<br>
构建时读取远端博客数据，部署后是无需后端的纯静态站点

[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white&style=flat-square)](https://astro.build)
[![Vue](https://img.shields.io/badge/Vue-3-42B883?logo=vue.js&logoColor=white&style=flat-square)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deploy-222?logo=github&style=flat-square)](https://pages.github.com)

[功能特性](#功能特性) · [技术栈](#技术栈) · [部署](#部署到-github-pages) · [本地开发](#本地开发) · [配置](#配置)

</div>

---

Sagiri Mirror 是一个将 [flare-stack-blog](https://github.com/du2333/flare-stack-blog) 的内容构建成纯静态站点的前端项目。它使用 Astro 和 Vue islands 复刻 Sagiri 主题的视觉与交互，在构建阶段从远端 API 读取站点配置、文章和友链，生成可以直接托管到 GitHub Pages 的 HTML、CSS 和 JavaScript。

部署完成后，浏览器不再访问博客 API，也不需要数据库、服务器或任何运行时后端。

> [!NOTE]
> 这是一个只读静态镜像。评论、后台管理、文章编辑、浏览量等需要登录或写入的功能不会包含在内。

## 功能特性

- 🎨 **Sagiri 风格界面**
  - 复刻 Sagiri / Pisces 主题的 banner、站点标题、头像、导航、文章卡片、侧栏、页脚插画和背景缎带动画。
  - 首页文章卡片、日期徽章、分类丝带、分页和归档式文章列表。
  - 响应式布局，桌面端与移动端分别适配。
  - 文章页侧栏支持「文章目录 / 关于我」切换。

- 📝 **文章与归档**
  - 文章详情页：封面、正文、标题锚点、阅读时长、标签、上一篇 / 下一篇。
  - 根据文章 `h2` / `h3` 自动生成目录，并在桌面侧栏展示。
  - 分类页、标签页和按年份分组的文章列表。
  - 友链页从远端 API 读取已审核友链。

- 🔍 **站内搜索**
  - 构建时生成静态搜索索引，不依赖后端搜索接口。
  - 支持标题、摘要、分类、标签和正文关键词匹配。
  - 搜索结果直接跳转到静态文章页。

- 🖼️ **阅读体验**
  - 文章图片点击放大，使用 [medium-zoom](https://github.com/francoischalifour/medium-zoom) 实现。
  - 页脚显示博客运行时间。
  - 回到顶部按钮、平滑锚点跳转和动态缎带背景。

- ⚙️ **自动部署**
  - GitHub Actions 自动构建并发布到 GitHub Pages。
  - 每天北京时间 04:00 自动同步一次，也支持 push 和手动触发。
  - 自动识别 `username.github.io` 根站点和 `username.github.io/repo/` 项目站点，不需要手动配置 `base`。
  - 支持自定义域名和可选的远端博客地址覆盖。

## 技术栈

| 模块 | 选型 | 说明 |
| :--- | :--- | :--- |
| **静态框架** | Astro 7 | 构建时生成 HTML，零运行时框架 |
| **交互岛** | Vue 3 + `@astrojs/vue` | 搜索等客户端交互 |
| **语言** | TypeScript | 数据层、页面与组件 |
| **样式** | 原生 CSS | 复刻 Sagiri / Pisces 的布局与动效 |
| **图片预览** | medium-zoom | 点击图片放大浏览 |
| **部署** | GitHub Actions + GitHub Pages | 定时同步、自动构建和静态托管 |
| **图标** | Font Awesome 5 | 导航和文章元信息图标 |
| **字体与插画** | 本地静态资源 | Candyshop 字体、页脚插画和回到顶部图片 |

## 数据流

```text
flare-stack-blog API
  ├─ /api/site/config
  ├─ /api/posts
  ├─ /api/friend-links
  └─ /feed.json
        │
        ▼
   Astro 构建（Node）
        │
        ▼
   dist/ 静态文件
        │
        ▼
   GitHub Pages
```

所有 API 请求都发生在构建阶段。接口不可用时构建会直接失败，不会生成假数据或回退内容。

## 部署到 GitHub Pages

### 1. Fork 仓库

Fork 本项目，或者直接使用本仓库。

### 2. 启用 GitHub Pages

打开仓库的 **Settings → Pages → Build and deployment**，把 **Source** 设置为：

```text
GitHub Actions
```

#### 可选：用 PAT 自动启用 Pages

如果不想手动打开 Pages，可以在 **Settings → Secrets and variables → Actions → Secrets** 中新建：

```text
PAGES_TOKEN
```

Token 要求：

- Classic PAT：勾选 `repo` scope
- Fine-grained PAT：授予 `Pages` 写权限和 `Administration` 写权限，并授权当前仓库

workflow 检测到 `PAGES_TOKEN` 后会把它传给 `configure-pages` 并开启自动启用；没有这个 secret 时继续使用 `GITHUB_TOKEN`，需要手动启用 Pages。

> [!IMPORTANT]
> PAT 只用于创建和配置 Pages 站点；实际部署仍然使用 `GITHUB_TOKEN` 和 OIDC。

### 3. 运行部署

打开 **Actions → Sync and deploy → Run workflow**。

部署地址会自动适配：

```text
仓库名 username.github.io
→ https://username.github.io/

其他仓库名
→ https://username.github.io/仓库名/
```

`astro.config.mjs` 会读取 Actions 提供的 `base_path`，自动处理子路径，不需要手动改 `base`。

### 4. 自动同步

workflow 会在以下时机运行：

- push 到 `main`
- 每天北京时间 04:00
- 手动触发 `workflow_dispatch`

定时任务使用 UTC：

```text
0 20 * * * UTC
= 04:00 Asia/Shanghai
```

GitHub 的定时任务可能有几分钟延迟。

### 5. 可选：更换数据源

默认镜像：

```text
https://your-blog.example.com
```

如果 fork 后想使用自己的 flare-stack-blog，在 **Settings → Secrets and variables → Actions → Variables** 中新建：

```text
BLOG_ORIGIN=https://your-blog.example.com
```

不需要修改代码。

### 6. 自定义域名

在 **Settings → Secrets and variables → Actions → Variables** 中新建：

```text
CNAME=blog.example.com
```

构建时会自动：

- 生成 `dist/CNAME`
- 把 `base` 强制设为 `/`
- 把站点 `site` 设为 `https://blog.example.com`

然后在 **Settings → Pages → Custom domain** 中填写同一个域名即可。

如果不设置 `CNAME`，不会生成 `CNAME` 文件，fork 默认使用：

```text
https://username.github.io/仓库名/
```

## 本地开发

环境要求：

- Node.js >= 22.23.4
- npm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

默认访问 `http://localhost:4321`。

### 构建静态文件

```bash
npm run build
```

输出目录为 `dist/`。

### 预览构建结果

```bash
npm run preview
```

### 常用脚本

| 命令 | 说明 |
| :--- | :--- |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 生成静态站点到 `dist/` |
| `npm run preview` | 本地预览构建结果 |

## 配置

| 位置 | 说明 |
| :--- | :--- |
| `src/blog.config.ts` → `blogSource.origin` | 默认远端博客地址 |
| `src/blog.config.ts` → `footerConfig` | 页脚运行时间、ICP 备案、Made with 文案 |
| `BLOG_ORIGIN` 环境变量 / Actions Variable | 覆盖默认远端博客地址 |
| `PAGES_TOKEN` Actions Secret | 可选，用 PAT 自动创建和配置 Pages 站点 |
| `BLOG_API_TOKEN` Actions Secret | 可选，配合 Cloudflare WAF 跳过规则读取后端 |
| `CNAME` Actions Variable | 自定义域名，生成 `dist/CNAME` 并强制 `base=/` |
| `BASE_PATH` | 部署子路径，GitHub Actions 自动设置 |
| `SITE_ORIGIN` | 站点 origin，GitHub Actions 自动设置 |
| `src/data/navigation.ts` | 首页 / 文章 / 友链固定导航 |
| 远端 `/api/site/config` | 站点标题、作者、tagline、头像、banner、社交链接和扩展导航 |

站点标题、作者、tagline、头像、banner 和社交链接都来自远端 Site Config，不在本地硬编码。

## 项目结构

```text
.
├── .github/workflows/deploy.yml   # GitHub Pages 自动部署
├── public/                        # 字体、页脚插画、回到顶部图片等静态资源
├── src/
│   ├── blog.config.ts             # 远端地址和页脚配置
│   ├── components/                # 页面组件与 Vue 搜索岛
│   ├── data/                      # 远端 API、文章、搜索索引数据层
│   ├── layouts/BaseLayout.astro   # 全站布局、背景与图片预览
│   ├── pages/                     # 首页、文章、分类、标签、友链、搜索
│   ├── styles/global.css          # Sagiri 风格样式
│   └── utils/url.ts               # GitHub Pages 子路径处理
├── astro.config.mjs               # Astro 配置与 base 自动推导
└── package.json
```

## 说明与限制

- 这是只读镜像，不包含登录、评论、后台编辑、浏览量统计和搜索后端。
- 构建机必须能访问远端 API；接口失败时构建会终止。
- 文章正文来自远端 `feed.json` 的 HTML，代码高亮、数学公式和 Mermaid 等效果取决于远端输出，前端不额外处理。
- 搜索索引同样来自远端内容；如果 feed 不可用，索引会退化为标题和摘要。
- 图片直接引用远端地址，首次加载速度取决于图床。

## 常见问题

### GitHub Actions 构建时后端返回 403

GitHub Actions 的出口 IP 可能被 Cloudflare 的托管挑战拦截，响应是 `Just a moment...`。只修改 `User-Agent` 不一定能通过。

解决方式是给构建请求加一个自定义请求头，并在 Cloudflare 里放行它：

1. 在 Cloudflare Dashboard → **Security → WAF → Custom rules** 新建规则：
   - Field：`http.request.headers["x-blog-mirror-token"]`
   - Operator：`equals`
   - Value：一个随机长字符串
   - Action：`Skip`
   - 按实际可用项勾选跳过 Managed Challenge、Super Bot Fight Mode 等
2. 在仓库 **Settings → Secrets and variables → Actions → Secrets** 新建：
   ```text
   BLOG_API_TOKEN=同一个随机长字符串
   ```
3. 重新运行 **Sync and deploy**。

如果站点使用的是免费版 Bot Fight Mode 且无法用 WAF 跳过，需要先在 Cloudflare 中关闭 Bot Fight Mode，或改用其他构建出口。

## 致谢

- **[flare-stack-blog](https://github.com/du2333/flare-stack-blog)**：提供完整博客后端、内容模型和 API。
- **[hexo-theme-sagiri](https://github.com/DIYgod/hexo-theme-sagiri)**：Sagiri 主题的视觉与交互参考。
- **[Astro](https://astro.build)**、**[Vue](https://vuejs.org)**、**[medium-zoom](https://github.com/francoischalifour/medium-zoom)**：本项目使用的开源框架与库。

## 许可

本仓库目前未单独附带 `LICENSE` 文件。使用或再分发前，请同时遵守上游项目的许可：

- `flare-stack-blog` 采用 GPL-3.0。
- `hexo-theme-sagiri` 采用 MIT。
