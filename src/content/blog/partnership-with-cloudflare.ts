import type { BlogArticle } from "./types";

const article: BlogArticle = {
  slug: "partnership-with-cloudflare",
  date: "2026-03-31",
  en: {
    title: "Why We Built EasySite on Cloudflare — And Our Vision for Deeper Partnership",
    description:
      "EasySite is deeply integrated with Cloudflare Pages. We share our story, our commitment to the Cloudflare ecosystem, and our open invitation to partners and collaborators.",
    keywords: [
      "EasySite Cloudflare partnership",
      "Cloudflare Pages integration",
      "AI website builder partnership",
      "Cloudflare ecosystem",
      "JY Tech Cloudflare",
      "website builder collaboration",
      "open partnership",
    ],
    content: `
## We Love Cloudflare

This isn't just a tagline — it's the foundation of how we built EasySite.

When we set out to create an AI-powered website builder, we had a simple philosophy: **give users full control over their sites**. That meant no vendor lock-in, no proprietary hosting, and no hidden fees. We needed infrastructure that aligned with these values.

We chose **Cloudflare**.

## Why Cloudflare Is Core to EasySite

EasySite uses AI to generate complete, multi-file static websites (HTML, CSS, JavaScript). When a user hits "Publish," their site needs to go somewhere fast, reliable, and globally accessible.

Cloudflare Pages is the perfect match:

- **Free tier that actually works** — 100 projects, unlimited bandwidth, free SSL, and custom domains. Our users don't pay a cent for world-class hosting.
- **Global edge network** — 300+ locations mean sub-100ms load times worldwide.
- **Simple API** — We integrated Cloudflare Pages deployments directly into our publish flow. One click, and your AI-generated site is live on the edge.
- **BYOK model** — Users bring their own Cloudflare account. They own their infrastructure. They can leave anytime and take their sites with them.

This is fundamentally different from other website builders. We don't lock you in — Cloudflare's open platform makes that possible.

## What We've Built So Far

Our Cloudflare integration is already live and includes:

- **One-click deployment** to Cloudflare Pages from the EasySite editor
- **Per-site project management** — each site connects to its own Cloudflare Pages project
- **Automatic project creation** — users can create new Cloudflare Pages projects directly from EasySite
- **Account auto-detection** — just paste an API token, and we find the account automatically
- **Custom domain support** — users configure domains through Cloudflare's dashboard
- **Export as ZIP** — every site can be downloaded as standard HTML/CSS/JS files

All of this runs on Cloudflare's free tier. Our users get enterprise-grade hosting without paying for it.

## Our Vision: Going Deeper

We believe we're just scratching the surface. Here's where we'd love to take this partnership:

### For Users
- **Automatic custom domain setup** — configure domains without leaving EasySite
- **Cloudflare Analytics integration** — view traffic data directly in the EasySite dashboard
- **Cloudflare Workers integration** — add serverless functions to AI-generated sites (contact forms, APIs)
- **Cloudflare R2 integration** — user-uploaded images and assets stored on R2

### For the Ecosystem
- **EasySite as a Cloudflare Pages front-end** — an AI layer that makes Cloudflare Pages accessible to non-developers
- **Template marketplace** — AI-generated templates optimized for Cloudflare Pages
- **Education content** — tutorials showing how Cloudflare + AI makes web publishing accessible to everyone

### For Businesses
- **White-label solution** — agencies use EasySite + Cloudflare to build and host client sites
- **Multi-site management** — manage dozens of Cloudflare Pages projects from one dashboard

## Who We Are

EasySite is built by **JY Tech** ([jytech.us](https://jytech.us)), a technology company focused on making AI tools accessible and practical. We're a small, fast-moving team that believes great tools should be simple and open.

Our stack:
- **Next.js** on Vercel for the application
- **Cloudflare Pages** for site hosting
- **OpenRouter** for multi-model AI access
- **Neon PostgreSQL** for data
- **Auth0** for authentication
- **Stripe** for payments

We're profitable on the free tier because Cloudflare's generous free plan means our hosting costs are near zero. This lets us offer a genuinely free experience to our users.

## Let's Talk

We're actively looking for partners, collaborators, and anyone who shares our vision of making the web more accessible through AI + edge computing.

If you're interested in:

- **Partnership opportunities** — integrations, co-marketing, technology collaboration
- **Reseller/agency programs** — using EasySite + Cloudflare for your clients
- **Technology integrations** — connecting your product with our AI website builder
- **Investment** — we're open to conversations about growth

We'd love to hear from you.

**Contact us:**
- Email: [partnership@jytech.us](mailto:partnership@jytech.us)
- Website: [jytech.us](https://jytech.us)
- EasySite: [site.jytech.us](https://site.jytech.us)

---

## To Cloudflare

To the team at Cloudflare — thank you for building infrastructure that makes projects like ours possible. Your commitment to a free and open web aligns perfectly with what we're trying to do. We'd welcome any opportunity to work more closely together.

If anyone from the Cloudflare team is reading this, we're just an email away.

---

*EasySite is free to use. [Create your first AI-generated website](/en/editor) and deploy it to Cloudflare Pages in under 5 minutes.*
`,
  },
  zh: {
    title: "为什么我们选择在 Cloudflare 上构建 EasySite — 以及我们对深度合作的愿景",
    description:
      "EasySite 深度集成了 Cloudflare Pages。我们分享我们的故事、对 Cloudflare 生态系统的承诺，以及对合作伙伴的开放邀请。",
    keywords: [
      "EasySite Cloudflare 合作",
      "Cloudflare Pages 集成",
      "AI 建站合作",
      "Cloudflare 生态",
      "JY Tech Cloudflare",
      "建站工具合作",
      "开放合作",
    ],
    content: `
## 我们热爱 Cloudflare

这不仅仅是一句口号 — 它是我们构建 EasySite 的基础。

当我们着手创建一个 AI 驱动的建站工具时，我们有一个简单的理念：**让用户完全掌控自己的网站**。这意味着没有供应商锁定、没有专有托管、没有隐藏费用。我们需要与这些价值观一致的基础设施。

我们选择了 **Cloudflare**。

## 为什么 Cloudflare 是 EasySite 的核心

EasySite 使用 AI 生成完整的多文件静态网站（HTML、CSS、JavaScript）。当用户点击"发布"时，他们的网站需要一个快速、可靠、全球可访问的去处。

Cloudflare Pages 完美契合：

- **真正可用的免费计划** — 100 个项目、无限带宽、免费 SSL 和自定义域名。我们的用户无需为世界级托管支付一分钱。
- **全球边缘网络** — 300+ 个节点意味着全球范围内低于 100 毫秒的加载时间。
- **简洁的 API** — 我们将 Cloudflare Pages 部署直接集成到发布流程中。一键操作，AI 生成的网站即刻在边缘网络上线。
- **BYOK 模式** — 用户使用自己的 Cloudflare 账户。他们拥有自己的基础设施，可以随时离开并带走自己的网站。

这与其他建站工具有着根本的不同。我们不会锁定你 — Cloudflare 的开放平台让这一切成为可能。

## 我们已经构建了什么

我们的 Cloudflare 集成已经上线，包括：

- 从 EasySite 编辑器**一键部署**到 Cloudflare Pages
- **按站点项目管理** — 每个网站连接到自己的 Cloudflare Pages 项目
- **自动创建项目** — 用户可以直接在 EasySite 中创建新的 Cloudflare Pages 项目
- **账户自动检测** — 只需粘贴 API 令牌，我们自动识别账户
- **自定义域名支持** — 用户通过 Cloudflare 控制面板配置域名
- **导出为 ZIP** — 每个网站都可以下载为标准 HTML/CSS/JS 文件

所有这些都在 Cloudflare 免费计划上运行。我们的用户无需付费即可获得企业级托管。

## 我们的愿景：更深入的合作

我们相信这只是冰山一角。以下是我们希望推进合作的方向：

### 面向用户
- **自动自定义域名设置** — 无需离开 EasySite 即可配置域名
- **Cloudflare Analytics 集成** — 直接在 EasySite 控制面板中查看流量数据
- **Cloudflare Workers 集成** — 为 AI 生成的网站添加无服务器功能（联系表单、API）
- **Cloudflare R2 集成** — 用户上传的图片和资源存储在 R2 上

### 面向生态系统
- **EasySite 作为 Cloudflare Pages 的前端** — 一个 AI 层，让非开发者也能轻松使用 Cloudflare Pages
- **模板市场** — 为 Cloudflare Pages 优化的 AI 生成模板
- **教育内容** — 展示 Cloudflare + AI 如何让网页发布人人可及的教程

### 面向企业
- **白标解决方案** — 代理商使用 EasySite + Cloudflare 为客户建站和托管
- **多站点管理** — 从一个控制面板管理数十个 Cloudflare Pages 项目

## 关于我们

EasySite 由 **JY Tech**（[jytech.us](https://jytech.us)）构建，这是一家专注于让 AI 工具更易用、更实用的科技公司。我们是一个小而快的团队，相信优秀的工具应该简单而开放。

我们的技术栈：
- **Next.js** 在 Vercel 上运行应用
- **Cloudflare Pages** 托管网站
- **OpenRouter** 提供多模型 AI 访问
- **Neon PostgreSQL** 存储数据
- **Auth0** 处理身份认证
- **Stripe** 处理支付

由于 Cloudflare 慷慨的免费计划，我们的托管成本接近零，这让我们能够在免费层级上实现盈利，为用户提供真正免费的体验。

## 联系我们

我们正在积极寻找合作伙伴、协作者以及所有与我们分享"通过 AI + 边缘计算让网络更加开放"这一愿景的人。

如果你对以下方面感兴趣：

- **合作机会** — 集成、联合营销、技术协作
- **经销商/代理商计划** — 使用 EasySite + Cloudflare 为你的客户服务
- **技术集成** — 将你的产品与我们的 AI 建站工具连接
- **投资** — 我们对成长相关的对话持开放态度

我们很乐意与你交流。

**联系方式：**
- 邮箱：[partnership@jytech.us](mailto:partnership@jytech.us)
- 网站：[jytech.us](https://jytech.us)
- EasySite：[site.jytech.us](https://site.jytech.us)

---

## 致 Cloudflare

致 Cloudflare 团队 — 感谢你们构建了让我们这样的项目成为可能的基础设施。你们对自由开放网络的承诺与我们的目标完全一致。我们欢迎任何更紧密合作的机会。

如果 Cloudflare 团队的任何人正在阅读这篇文章，我们就在一封邮件之外。

---

*EasySite 免费使用。[创建你的第一个 AI 生成网站](/zh/editor)，并在 5 分钟内部署到 Cloudflare Pages。*
`,
  },
};

export default article;
