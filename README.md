<div align="center">

# Sagiri Mirror

基于 **Astro + Vue islands** 的 Sagiri 风格静态博客镜像<br>
构建时读取远端博客数据，部署后是无需后端的纯静态站点

[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white&style=flat-square)](https://astro.build)
[![Vue](https://img.shields.io/badge/Vue-3-42B883?logo=vue.js&logoColor=white&style=flat-square)](https://vuejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)](https://www.typescriptlang.org)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-deploy-222?logo=github&style=flat-square)](https://pages.github.com)

[功能特性](#功能特性) · [技术栈](#技术栈) · [部署](#部署到用户站点仓库) · [本地开发](#本地开发) · [配置](#配置)

</div>

---

Sagiri Mirror 是一个将 [flare-stack-blog](https://github.com/du2333/flare-stack-blog) 的内容构建成纯静态站点的前端项目。它使用 Astro 和 Vue islands 复刻 Sagiri 主题的视觉与交互，在构建阶段从远端 API 读取站点配置、文章和友链，生成可以直接托管到 GitHub Pages 的 HTML、CSS 和 JavaScript。

部署完成后，浏览器不再访问博客 API，也不需要数据库、服务器或任何运行时后端。

> [!NOTE]
> 这是一个只读静态镜像。评论、后台管理、文章编辑、浏览量等需要登录或写入的功能不会包含在内。

## 功能特性

- 🎨 **Sagiri 风格界面**
  - 复刻 Sagiri / Pisces 主题的 banner、站点标题、头像、导航、文章卡片、侧栏、页脚插画和背景缎带动画。
  - 复刻 Sagiri 的自定义鼠标指针和点击粒子效果。
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
  - 构建时把远端头像、banner、站点图标、封面、文章图片和友链头像下载到 `dist/images/remote`，部署后不再依赖源站图床。
  - 文章标题和正文文字可选中复制；导航、侧栏、卡片、标签和页脚等界面元素禁止选中。
  - 文章图片和封面不能拖拽，只能点击放大预览。
  - 非文章页避免使用 `article` 语义并输出 `IE_RM_OFF`，减少浏览器自动进入阅读模式；文章页保留 `article`。
  - 文章图片点击放大，使用 [medium-zoom](https://github.com/francoischalifour/medium-zoom) 实现。
  - 页脚显示博客运行时间。
  - 回到顶部按钮、平滑锚点跳转和动态缎带背景。

- ⚙️ **自动部署**
  - GitHub Actions 自动构建并推送到 `username.github.io` 仓库的 `gh-pages` 分支。
  - 每天北京时间 04:00 自动同步一次，也支持 push 和手动触发。
  - 构建产物以根路径部署，适合用户站点自定义域名。
  - 支持自定义域名、目标仓库和远端博客地址配置。

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
        ├─ 生成 HTML / CSS
        └─ 下载远端图片到 dist/images/remote
        │
        ▼
   dist/ 静态文件
        │
        ▼
   用户站点仓库 gh-pages
        │
        ▼
   GitHub Pages
```

所有 API 请求都发生在构建阶段。接口不可用时构建会直接失败，不会生成假数据或回退内容。

## 部署到用户站点仓库

这个项目采用「构建与发布分离」的方式：

- `sagiri-mirror` 只负责构建
- 构建产物推送到 `username.github.io` 仓库的 `gh-pages` 分支
- `username.github.io` 的 GitHub Pages 负责托管，最终地址是根域名或自定义域名

### 1. Fork 仓库

Fork 本项目，或者直接使用本仓库。

### 2. 准备用户站点仓库

创建一个名为：

```text
<你的用户名>.github.io
```

的仓库，并确认：

- GitHub Pages 的 Source 是 `gh-pages` 分支
- 如果使用自定义域名，在 Pages 设置里绑定域名，并准备 `CNAME`

> [!IMPORTANT]
> workflow 会覆盖目标仓库的 `gh-pages` 分支内容。第一次部署前请确认该仓库里没有需要保留的源码；如果旧站是 Hexo 源码，请先备份。

> [!IMPORTANT]
> `sagiri-mirror` 仓库本身不要再启用 Pages。如果之前启用过，请在 **Settings → Pages** 里 **Unpublish site**。否则每次 push 都会触发 GitHub 的 Jekyll 构建，尝试解析 `src/pages/*.astro` 并失败。

### 3. 创建部署 Token

workflow 需要把 `dist/` 推送到另一个仓库，`GITHUB_TOKEN` 没有这个权限，所以需要 PAT。

Fine-grained PAT：

- Repository access：只选择目标仓库 `<用户名>/<用户名>.github.io`
- Repository permissions：
  - `Contents`：Read and write

Classic PAT：

- 勾选 `repo` scope

在 `sagiri-mirror` 仓库添加 Secret：

```text
DEPLOY_TOKEN=<PAT>
```

如果之前配置过 `PAGES_TOKEN`，并且它也有目标仓库的 Contents 写权限，workflow 会把它作为回退。

### 4. 配置仓库变量

在 **Settings → Secrets and variables → Actions → Variables** 中配置：

| 变量 | 说明 | 示例 |
| :--- | :--- | :--- |
| `PAGES_REPOSITORY` | 目标用户站点仓库（必填） | `your-name/your-name.github.io` |
| `CNAME` | 自定义域名，没有就留空 | `blog.example.com` |
| `BLOG_ORIGIN` | 后端地址（必填） | `https://your-blog.example.com` |

`PAGES_REPOSITORY` 必须填写自己的用户站点仓库：

```text
PAGES_REPOSITORY=your-name/your-name.github.io
```

`BLOG_ORIGIN` 也必须填写自己的 flare-stack-blog 地址。未填写时 workflow 会直接报错，不会使用任何内置默认值。

`CNAME` 会：

- 写入 `dist/CNAME`
- 把 `base` 设为 `/`
- 把站点 `site` 设为 `https://<CNAME>`

如果不使用自定义域名，`CNAME` 留空，部署到：

```text
https://yourname.github.io/
```

#### 可选：通过 Actions Variables 设置页脚

以下变量不是必填。`FOOTER_SINCE` / `FOOTER_ICP` 不设置则不显示。Made with ♥ by 固定显示远端站点作者。

| 变量 | 说明 | 示例 |
| :--- | :--- | :--- |
| `FOOTER_SINCE` | 博客开始运行时间 | `2020-01-01T00:00:00+08:00` |
| `FOOTER_ICP` | ICP 备案号 | `萌ICP备 00000000号` |
| `FOOTER_ICP_URL` | ICP 查询链接 | `https://beian.miit.gov.cn/` |

也可以直接修改 `src/blog.config.ts` 里的 `footerDefaults`，环境变量会覆盖它。

### 5. 运行部署

打开 **Actions → Sync and deploy → Run workflow**。

workflow 会：

```text
npm ci
→ 检查后端
→ npm run build
→ 推送 dist/ 到 PAGES_REPOSITORY 的 gh-pages 分支
```

成功后访问：

```text
https://yourname.github.io/
```

或自定义域名：

```text
https://your-domain.example/
```

### 6. 自动同步

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

### 7. 配置数据源

本项目不内置默认后端，必须在 Actions Variables 中配置：

```text
BLOG_ORIGIN=https://your-blog.example.com
```

本地开发时则使用环境变量或直接修改 `src/blog.config.ts` 的 `blogSource.origin`。

### 8. Cloudflare WAF 手动配置

如果后端在 Cloudflare 后面，需要手动创建一条放行规则。

1. 生成随机 token：

   ```bash
   openssl rand -hex 32
   ```

2. 在 GitHub Secret 中保存：

   ```text
   BLOG_API_TOKEN=上面的随机 token
   ```

3. 在 Cloudflare Dashboard → 你的后端域名 → **安全性 → WAF → 自定义规则 → 创建规则**：

   ```text
   名称：allow sagiri-mirror
   表达式：
   (any(http.request.headers["x-blog-mirror-token"][*] eq "上面的随机 token"))
   操作：跳过
   ```

   跳过选项勾选：

   ```text
   ✅ 所有剩余的自定义规则
   ✅ 所有托管规则
   ✅ 所有超级机器人防护模式规则（如果有）
   ✅ 安全级别
   ✅ 浏览器完整性检查
   ```

   不要勾选“此阶段中所有剩余的自定义规则”。

4. 保存并 **部署**，然后把规则移到自定义规则列表最上面。

构建请求会带上：

```text
x-blog-mirror-token: <BLOG_API_TOKEN>
```

> [!IMPORTANT]
> 免费版 Bot Fight Mode 不能被 WAF Skip 规则跳过。如果 Security Events 显示是 Bot Fight Mode 在 challenge，需要先在 Cloudflare 中关闭它，或升级到支持 Super Bot Fight Mode 的方案。

## 本地开发

环境要求：

- Node.js >= 22.23.4
- npm

### 安装依赖

```bash
npm install
```

### 启动开发服务器

先设置自己的后端地址：

```bash
export BLOG_ORIGIN=https://your-blog.example.com
npm run dev
```

也可以直接修改 `src/blog.config.ts` 的 `blogSource.origin`。

默认访问 `http://localhost:4321`。

### 构建静态文件

```bash
BLOG_ORIGIN=https://your-blog.example.com npm run build
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
| `src/blog.config.ts` → `blogSource.origin` | 必填，自己的远端博客地址 |
| `src/blog.config.ts` → `footerConfig` | 可选页脚文案；空值不回退到任何个人配置 |
| `FOOTER_SINCE` / `FOOTER_ICP` / `FOOTER_ICP_URL` | 可选页脚配置，Actions Variables 或环境变量 |
| `BLOG_ORIGIN` 环境变量 / Actions Variable | 覆盖 `blogSource.origin` |
| `DEPLOY_TOKEN` Actions Secret | 推送构建产物到目标用户站点仓库的 PAT |
| `PAGES_REPOSITORY` Actions Variable | 必填，目标用户站点仓库 |
| `BLOG_API_TOKEN` Actions Secret | 读取后端 API 和下载远端图片的请求头 token |
| `CNAME` Actions Variable | 自定义域名，生成 `dist/CNAME` 并设置 `base=/` |
| `src/data/navigation.ts` | 首页 / 文章 / 友链固定导航 |
| 远端 `/api/site/config` | 站点标题、作者、tagline、头像、banner、站点图标、社交链接和扩展导航 |

站点标题、作者、tagline、头像、banner、站点图标和社交链接都来自远端 Site Config，不在本地硬编码。

## 项目结构

```text
.
├── .github/workflows/deploy.yml   # 构建并同步到用户站点仓库
├── public/                        # 字体、鼠标指针、页脚插画、回到顶部图片等静态资源
├── scripts/
│   └── localize-images.mjs        # 构建后下载并本地化远端图片
├── src/
│   ├── blog.config.ts             # 远端地址和页脚配置
│   ├── components/                # 页面组件与 Vue 搜索岛
│   ├── data/                      # 远端 API、文章、搜索索引数据层
│   ├── scripts/cursor-effects.ts  # Sagiri 点击粒子效果
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
- 图片在构建时下载到 `dist/images/remote`；下载失败的图片会保留远端地址并在构建日志中提示。
- 图片下载同样会带上 `BLOG_API_TOKEN`，需要和读取 API 的 WAF 放行规则一致。

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
