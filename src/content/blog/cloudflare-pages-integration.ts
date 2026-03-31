import type { BlogArticle } from "./types";

const article: BlogArticle = {
  slug: "cloudflare-pages-integration",
  date: "2026-03-31",
  en: {
    title: "EasySite Now Integrates with Cloudflare Pages — Deploy Your AI-Generated Sites to the Edge",
    description:
      "Announcing our Cloudflare Pages integration. Deploy your AI-built websites to Cloudflare's global edge network with one click. Free SSL, unlimited bandwidth, and custom domains included.",
    keywords: [
      "Cloudflare Pages",
      "EasySite Cloudflare",
      "deploy website to edge",
      "AI website builder Cloudflare",
      "free website hosting",
      "global CDN website",
      "BYOK Cloudflare",
      "static site hosting",
    ],
    content: `
## Announcing Cloudflare Pages Integration

We're excited to announce that EasySite now integrates directly with **Cloudflare Pages** — giving you the power to deploy your AI-generated websites to Cloudflare's global edge network with just a few clicks.

This means your sites load faster, are more reliable, and can use custom domains — all for free.

## Why Cloudflare Pages?

When you publish a site on EasySite, it's stored in our database and served through our infrastructure. That works great, but Cloudflare Pages takes it to another level:

- **Global Edge Network** — your site is cached at 300+ data centers worldwide, so visitors get blazing-fast load times no matter where they are
- **Free SSL** — HTTPS is automatic, no certificate management needed
- **Unlimited Bandwidth** — no traffic limits, even on the free plan
- **Custom Domains** — attach your own domain name directly through Cloudflare
- **99.99% Uptime** — Cloudflare's infrastructure is battle-tested

Best of all, Cloudflare Pages is **free** for most use cases. You bring your own Cloudflare account, and we handle the deployment.

## How It Works

### 1. Connect Your Cloudflare Account

Go to your [Profile](/en/profile) page and add your Cloudflare API token. You only need to do this once.

**Creating a token takes 2 minutes:**
1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create a Custom Token with these permissions:
   - Account → **Cloudflare Pages** → Edit
   - Account → **Account Settings** → Read
3. Paste the token in your EasySite profile

EasySite automatically detects your account — no Account ID needed.

### 2. Connect Each Site to a Project

In your [Dashboard](/en/dashboard), each site has a **"Connect to Cloudflare Pages"** option. You can:

- **Select an existing project** from your Cloudflare account
- **Create a new project** directly from EasySite — no need to visit the Cloudflare dashboard

Each site gets its own Cloudflare Pages project, so they can have separate domains and settings.

### 3. Publish as Usual

When you publish a site, EasySite automatically:
1. Saves the site to our database (as backup)
2. Deploys all files to your Cloudflare Pages project
3. Returns both the EasySite URL and the Cloudflare Pages URL

Your site is live on Cloudflare's edge network within seconds.

## Bring Your Own Key (BYOK)

We believe in giving you full control. The Cloudflare Pages integration uses a **BYOK (Bring Your Own Key)** model:

- **You own the Cloudflare account** — your sites live in your infrastructure
- **You own the domains** — configure custom domains directly in Cloudflare
- **You can leave anytime** — your sites are standard HTML/CSS/JS files on your Cloudflare account, no vendor lock-in
- **Zero hosting cost from us** — Cloudflare's free tier is generous enough for most sites

This is fundamentally different from other website builders that lock you into their hosting. With EasySite + Cloudflare, you get the best of both worlds: AI-powered site creation with infrastructure you control.

## What You Get with Cloudflare's Free Plan

| Feature | Free Plan |
|---------|-----------|
| Projects | Up to 100 |
| Deployments | Unlimited |
| Bandwidth | Unlimited |
| SSL certificates | Free, automatic |
| Custom domains | Included |
| DDoS protection | Included |
| Files per project | 20,000 |

That's more than enough for most websites.

## Per-Site Flexibility

Unlike a one-size-fits-all approach, our integration works at the **site level**:

- **Site A** → Connected to \`my-portfolio\` project → \`portfolio.example.com\`
- **Site B** → Connected to \`my-blog\` project → \`blog.example.com\`
- **Site C** → No Cloudflare connection → served from EasySite directly

You choose which sites to deploy to Cloudflare and which to keep on our platform. Mix and match as you like.

## Export Your Sites

Want to host your site somewhere else? Every site on EasySite can be **exported as a ZIP file** containing all HTML, CSS, and JavaScript files. Your content is never locked in.

## Getting Started

1. [Create a free Cloudflare account](https://cloudflare.com) if you don't have one
2. [Connect your API token](/en/profile) in your EasySite profile
3. Go to your [Dashboard](/en/dashboard) and connect your sites to Cloudflare Pages
4. Publish — and watch your site go live on the global edge

The entire setup takes less than 5 minutes.

## What's Next

We're continuing to improve the Cloudflare integration:

- **Automatic custom domain setup** — configure domains without leaving EasySite
- **Deploy previews** — preview changes before going live
- **Analytics integration** — see your Cloudflare analytics in the EasySite dashboard
- **Import from Cloudflare** — bring existing Cloudflare Pages sites into EasySite for AI-powered editing

---

Ready to deploy your AI-generated website to the edge? [Go to your profile](/en/profile) to connect Cloudflare, or [create a new site](/en/editor) to get started.
`,
  },
  zh: {
    title: "EasySite 现已集成 Cloudflare Pages — 将 AI 生成的网站部署到全球边缘网络",
    description:
      "宣布 Cloudflare Pages 集成。一键将 AI 构建的网站部署到 Cloudflare 全球边缘网络。免费 SSL、无限带宽和自定义域名。",
    keywords: [
      "Cloudflare Pages",
      "EasySite Cloudflare",
      "部署网站到边缘网络",
      "AI 建站 Cloudflare",
      "免费网站托管",
      "全球 CDN 网站",
      "BYOK Cloudflare",
      "静态网站托管",
    ],
    content: `
## 宣布集成 Cloudflare Pages

我们很高兴地宣布，EasySite 现已直接集成 **Cloudflare Pages** — 只需几次点击，即可将 AI 生成的网站部署到 Cloudflare 全球边缘网络。

这意味着你的网站加载更快、更稳定，还可以使用自定义域名 — 而且全部免费。

## 为什么选择 Cloudflare Pages？

当你在 EasySite 上发布网站时，它会存储在我们的数据库中并通过我们的基础设施提供服务。这已经很好了，但 Cloudflare Pages 让它更上一层楼：

- **全球边缘网络** — 你的网站缓存在全球 300+ 个数据中心，无论访客在哪里都能获得极速加载
- **免费 SSL** — HTTPS 自动启用，无需管理证书
- **无限带宽** — 即使是免费计划也没有流量限制
- **自定义域名** — 直接通过 Cloudflare 绑定你自己的域名
- **99.99% 正常运行时间** — Cloudflare 的基础设施经过实战检验

最棒的是，Cloudflare Pages 对大多数使用场景来说是**完全免费**的。你使用自己的 Cloudflare 账户，我们负责部署。

## 如何使用

### 1. 连接你的 Cloudflare 账户

进入[个人设置](/zh/profile)页面，添加你的 Cloudflare API 令牌。只需设置一次。

**创建令牌只需 2 分钟：**
1. 前往 [Cloudflare API 令牌](https://dash.cloudflare.com/profile/api-tokens)
2. 创建自定义令牌，添加以下权限：
   - Account → **Cloudflare Pages** → Edit
   - Account → **Account Settings** → Read
3. 将令牌粘贴到 EasySite 个人设置中

EasySite 会自动检测你的账户 — 无需输入 Account ID。

### 2. 为每个网站连接项目

在[控制面板](/zh/dashboard)中，每个网站都有 **"连接到 Cloudflare Pages"** 选项。你可以：

- **选择已有项目** — 从你的 Cloudflare 账户中选择
- **创建新项目** — 直接在 EasySite 中创建，无需访问 Cloudflare 控制面板

每个网站对应一个独立的 Cloudflare Pages 项目，可以有各自的域名和设置。

### 3. 照常发布

当你发布网站时，EasySite 会自动：
1. 将网站保存到我们的数据库（作为备份）
2. 将所有文件部署到你的 Cloudflare Pages 项目
3. 返回 EasySite URL 和 Cloudflare Pages URL

你的网站在几秒内就能在 Cloudflare 边缘网络上线。

## 自带密钥（BYOK）

我们相信应该给你完全的控制权。Cloudflare Pages 集成采用 **BYOK（自带密钥）** 模式：

- **你拥有 Cloudflare 账户** — 网站存在你自己的基础设施中
- **你拥有域名** — 直接在 Cloudflare 中配置自定义域名
- **你可以随时离开** — 你的网站是标准的 HTML/CSS/JS 文件，没有供应商锁定
- **我们零托管成本** — Cloudflare 免费计划对大多数网站来说绰绰有余

这与其他将你锁定在其托管服务中的网站构建器根本不同。使用 EasySite + Cloudflare，你可以兼得两全：AI 驱动的建站能力 + 你自己控制的基础设施。

## Cloudflare 免费计划包含什么

| 功能 | 免费计划 |
|------|---------|
| 项目数 | 最多 100 个 |
| 部署次数 | 无限 |
| 带宽 | 无限 |
| SSL 证书 | 免费，自动配置 |
| 自定义域名 | 包含 |
| DDoS 防护 | 包含 |
| 每个项目文件数 | 20,000 |

这对大多数网站来说绰绰有余。

## 按站点灵活配置

不同于一刀切的方式，我们的集成在**站点级别**工作：

- **站点 A** → 连接到 \`my-portfolio\` 项目 → \`portfolio.example.com\`
- **站点 B** → 连接到 \`my-blog\` 项目 → \`blog.example.com\`
- **站点 C** → 不连接 Cloudflare → 直接从 EasySite 提供服务

你可以选择哪些网站部署到 Cloudflare，哪些保留在我们的平台上。随意搭配。

## 导出你的网站

想把网站托管在其他地方？EasySite 上的每个网站都可以**导出为 ZIP 文件**，包含所有 HTML、CSS 和 JavaScript 文件。你的内容永远不会被锁定。

## 开始使用

1. 如果还没有 Cloudflare 账户，[免费注册一个](https://cloudflare.com)
2. 在[个人设置](/zh/profile)中连接你的 API 令牌
3. 进入[控制面板](/zh/dashboard)，将网站连接到 Cloudflare Pages
4. 发布 — 看着你的网站在全球边缘网络上线

整个设置过程不到 5 分钟。

## 下一步计划

我们将持续改进 Cloudflare 集成：

- **自动自定义域名设置** — 无需离开 EasySite 即可配置域名
- **部署预览** — 上线前预览更改
- **分析集成** — 在 EasySite 控制面板中查看 Cloudflare 分析数据
- **从 Cloudflare 导入** — 将现有 Cloudflare Pages 网站导入 EasySite 进行 AI 编辑

---

准备好将 AI 生成的网站部署到全球边缘网络了吗？[前往个人设置](/zh/profile)连接 Cloudflare，或[创建新网站](/zh/editor)开始体验。
`,
  },
};

export default article;
