import type { BlogArticle } from "./types";

const article: BlogArticle = {
  slug: "custom-domain-cloudflare",
  date: "2026-03-30",
  en: {
    title: "How to Point a Custom Domain to Your EasySite Website Using Cloudflare",
    description:
      "Step-by-step guide to connecting your own domain name to your AI-generated website on EasySite using Cloudflare DNS. Free SSL included.",
    keywords: [
      "custom domain",
      "Cloudflare DNS",
      "EasySite custom domain",
      "connect domain to website",
      "free SSL",
      "AI website builder",
      "domain setup guide",
    ],
    content: `
## Why Use a Custom Domain?

When you publish a site on EasySite, you get a URL like \`easysite.jytech.us/s/yourname/my-site\`. That works great for sharing, but if you're building a business, portfolio, or brand, having your own domain (like \`www.mybusiness.com\`) makes a huge difference:

- **Professional appearance** — a custom domain builds trust with visitors
- **Better SEO** — search engines favor sites on their own domain
- **Brand identity** — your domain is part of your brand
- **Portability** — you own the domain regardless of the hosting platform

## What You'll Need

Before you start, make sure you have:

1. **A published site on EasySite** — [create one for free](/en/editor) if you haven't already
2. **A domain name** — you can buy one from registrars like Namecheap, Google Domains, GoDaddy, or Cloudflare Registrar
3. **A Cloudflare account** — [sign up for free at cloudflare.com](https://cloudflare.com)

## Step 1: Add Your Domain to Cloudflare

If your domain isn't already on Cloudflare, you'll need to add it:

1. Log in to your [Cloudflare dashboard](https://dash.cloudflare.com)
2. Click **"Add a Site"** and enter your domain name (e.g. \`mybusiness.com\`)
3. Select the **Free plan** — it includes everything you need
4. Cloudflare will scan your existing DNS records. Review them and click **Continue**
5. Cloudflare will give you two **nameservers** (e.g. \`anna.ns.cloudflare.com\`)
6. Go to your domain registrar and **update the nameservers** to the ones Cloudflare provided
7. Wait for propagation — this usually takes a few minutes, but can take up to 24 hours

Once your domain shows as **"Active"** in Cloudflare, you're ready for the next step.

## Step 2: Configure DNS Records

Now you need to point your domain to your EasySite. In the Cloudflare dashboard:

1. Go to **DNS > Records** for your domain
2. Click **Add Record**
3. Add the following record:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | \`www\` | \`easysite.jytech.us\` | Proxied (orange cloud) |

If you want the root domain (\`mybusiness.com\` without \`www\`) to also work:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | \`@\` | \`easysite.jytech.us\` | Proxied (orange cloud) |

> **Tip:** Cloudflare's "CNAME flattening" feature allows you to use a CNAME record on the root domain, which normally isn't allowed by DNS standards. This is a Cloudflare-specific feature and works automatically.

## Step 3: Enable Free SSL/TLS

One of the biggest benefits of using Cloudflare is **free SSL certificates**. Your visitors will see the secure padlock icon in their browser.

1. In your Cloudflare dashboard, go to **SSL/TLS > Overview**
2. Set the encryption mode to **"Full"** or **"Full (Strict)"**
3. That's it — Cloudflare automatically provisions and renews SSL certificates for your domain

Your site will be accessible via \`https://\` automatically. No certificate management required.

## Step 4: Connect Your Domain in EasySite

Once your DNS is set up:

1. Log in to your [EasySite dashboard](/en/dashboard)
2. Find the site you want to connect
3. Go to **Site Settings > Custom Domain**
4. Enter your domain name (e.g. \`www.mybusiness.com\`)
5. Click **Verify & Connect**

EasySite will check that your DNS records are correctly pointing to our servers and activate the custom domain.

## Step 5: Set Up Redirects (Optional but Recommended)

You'll probably want both \`mybusiness.com\` and \`www.mybusiness.com\` to work. You can set up a redirect so one always points to the other:

1. In Cloudflare, go to **Rules > Redirect Rules**
2. Create a new rule:
   - **If** the hostname equals \`mybusiness.com\`
   - **Then** redirect to \`https://www.mybusiness.com\` with status code **301**

This ensures visitors always end up on the same URL, which is also better for SEO.

## Troubleshooting Common Issues

### "DNS not yet propagated"
DNS changes can take up to 24 hours to propagate worldwide. If your domain doesn't work immediately, wait a few hours and try again.

### "SSL certificate pending"
Cloudflare usually provisions SSL certificates within minutes, but it can take up to 24 hours. Make sure your domain is showing as **"Active"** in Cloudflare.

### "Too many redirects"
This usually happens when SSL mode is set to "Flexible" instead of "Full". Go to **SSL/TLS > Overview** and set it to **"Full"** or **"Full (Strict)"**.

### "Site not loading on custom domain"
Double-check that:
- Your CNAME record points to \`easysite.jytech.us\`
- The proxy status is **"Proxied"** (orange cloud), not "DNS only"
- You've connected the domain in your EasySite dashboard

## Benefits of Using Cloudflare

Beyond just DNS, Cloudflare gives you several free features:

- **CDN** — your site is cached at 300+ data centers worldwide, making it faster for visitors everywhere
- **DDoS protection** — automatic protection against attacks
- **Web Analytics** — basic traffic analytics without any tracking scripts
- **Page Rules** — URL redirects, caching rules, and more
- **Bot Protection** — blocks malicious bots from your site

## Summary

Setting up a custom domain with Cloudflare is straightforward:

1. Add your domain to Cloudflare
2. Point your DNS (CNAME) to EasySite
3. SSL is automatic and free
4. Connect the domain in your EasySite dashboard
5. Optionally set up www/non-www redirects

The whole process takes about 10 minutes of active work, plus some waiting time for DNS propagation. Once set up, your AI-generated website will be live on your own professional domain — with free SSL, CDN, and DDoS protection included.

---

Ready to build your website? [Start creating with AI for free](/en/editor) and connect your custom domain today.
`,
  },
  zh: {
    title: "如何使用 Cloudflare 将自定义域名指向你的 EasySite 网站",
    description:
      "手把手教你使用 Cloudflare DNS 将自己的域名连接到 EasySite 上的 AI 生成网站。免费 SSL 证书。",
    keywords: [
      "自定义域名",
      "Cloudflare DNS",
      "EasySite 自定义域名",
      "域名绑定网站",
      "免费 SSL",
      "AI 建站工具",
      "域名设置教程",
    ],
    content: `
## 为什么要使用自定义域名？

当你在 EasySite 上发布网站时，你会得到类似 \`easysite.jytech.us/s/yourname/my-site\` 的链接。这对于分享来说已经够用了，但如果你在建立品牌、商业网站或个人作品集，拥有自己的域名（如 \`www.mybusiness.com\`）会带来很大的不同：

- **专业形象** — 自定义域名可以建立访客的信任
- **更好的 SEO** — 搜索引擎更看重拥有独立域名的网站
- **品牌标识** — 域名是品牌的一部分
- **可迁移性** — 无论托管在哪里，域名都属于你

## 你需要准备的东西

开始之前，请确保你有：

1. **一个已发布的 EasySite 网站** — 如果还没有，[免费创建一个](/zh/editor)
2. **一个域名** — 可以从 Namecheap、GoDaddy、阿里云或 Cloudflare Registrar 等注册商购买
3. **一个 Cloudflare 账户** — [在 cloudflare.com 免费注册](https://cloudflare.com)

## 第一步：将域名添加到 Cloudflare

如果你的域名还不在 Cloudflare 上，需要先添加：

1. 登录 [Cloudflare 控制面板](https://dash.cloudflare.com)
2. 点击 **"添加站点"**，输入你的域名（如 \`mybusiness.com\`）
3. 选择 **免费计划** — 包含你需要的所有功能
4. Cloudflare 会扫描你现有的 DNS 记录，检查后点击 **继续**
5. Cloudflare 会给你两个 **域名服务器**（如 \`anna.ns.cloudflare.com\`）
6. 去你的域名注册商，将 **域名服务器更新** 为 Cloudflare 提供的地址
7. 等待生效 — 通常几分钟内完成，但最多可能需要 24 小时

当你的域名在 Cloudflare 中显示为 **"活跃"** 状态时，就可以进行下一步了。

## 第二步：配置 DNS 记录

现在需要将域名指向你的 EasySite 网站。在 Cloudflare 控制面板中：

1. 进入域名的 **DNS > 记录** 页面
2. 点击 **添加记录**
3. 添加以下记录：

| 类型 | 名称 | 内容 | 代理 |
|------|------|------|------|
| CNAME | \`www\` | \`easysite.jytech.us\` | 已代理（橙色云朵） |

如果你希望根域名（不带 \`www\` 的 \`mybusiness.com\`）也能访问：

| 类型 | 名称 | 内容 | 代理 |
|------|------|------|------|
| CNAME | \`@\` | \`easysite.jytech.us\` | 已代理（橙色云朵） |

> **提示：** Cloudflare 的 "CNAME 拉平" 功能允许你在根域名上使用 CNAME 记录，这在标准 DNS 中通常是不允许的。这是 Cloudflare 特有的功能，会自动生效。

## 第三步：启用免费 SSL/TLS

使用 Cloudflare 最大的好处之一是 **免费 SSL 证书**。你的访客会在浏览器中看到安全锁图标。

1. 在 Cloudflare 控制面板中，进入 **SSL/TLS > 概述**
2. 将加密模式设置为 **"完全"** 或 **"完全（严格）"**
3. 完成了 — Cloudflare 会自动为你的域名配置和续期 SSL 证书

你的网站将自动通过 \`https://\` 访问。无需管理证书。

## 第四步：在 EasySite 中连接域名

DNS 设置完成后：

1. 登录你的 [EasySite 控制面板](/zh/dashboard)
2. 找到要连接的网站
3. 进入 **网站设置 > 自定义域名**
4. 输入你的域名（如 \`www.mybusiness.com\`）
5. 点击 **验证并连接**

EasySite 会检查你的 DNS 记录是否正确指向我们的服务器，并激活自定义域名。

## 第五步：设置重定向（可选但推荐）

你可能希望 \`mybusiness.com\` 和 \`www.mybusiness.com\` 都能访问。可以设置重定向让其中一个始终跳转到另一个：

1. 在 Cloudflare 中，进入 **规则 > 重定向规则**
2. 创建新规则：
   - **如果** 主机名等于 \`mybusiness.com\`
   - **则** 重定向到 \`https://www.mybusiness.com\`，状态码 **301**

这确保访客始终访问同一个 URL，这对 SEO 也更有利。

## 常见问题排查

### "DNS 尚未生效"
DNS 更改可能需要最多 24 小时才能在全球生效。如果域名没有立即生效，等几个小时再试。

### "SSL 证书等待中"
Cloudflare 通常在几分钟内就能配置好 SSL 证书，但最多可能需要 24 小时。确保你的域名在 Cloudflare 中显示为 **"活跃"** 状态。

### "重定向次数过多"
这通常是因为 SSL 模式设置为 "灵活" 而不是 "完全"。进入 **SSL/TLS > 概述**，设置为 **"完全"** 或 **"完全（严格）"**。

### "自定义域名无法加载网站"
请检查：
- CNAME 记录是否指向 \`easysite.jytech.us\`
- 代理状态是否为 **"已代理"**（橙色云朵），而不是 "仅 DNS"
- 是否已在 EasySite 控制面板中连接了域名

## 使用 Cloudflare 的额外好处

除了 DNS 之外，Cloudflare 还免费提供多项功能：

- **CDN** — 你的网站缓存在全球 300+ 个数据中心，让各地访客都能快速访问
- **DDoS 防护** — 自动防御网络攻击
- **网站分析** — 无需添加追踪脚本的基础流量分析
- **页面规则** — URL 重定向、缓存规则等
- **机器人防护** — 阻止恶意机器人访问你的网站

## 总结

使用 Cloudflare 设置自定义域名非常简单：

1. 将域名添加到 Cloudflare
2. 将 DNS（CNAME）指向 EasySite
3. SSL 自动且免费
4. 在 EasySite 控制面板中连接域名
5. 可选设置 www/非 www 重定向

整个过程大约需要 10 分钟的操作时间，再加上一些等待 DNS 生效的时间。设置完成后，你的 AI 生成网站将在你自己的专业域名上运行 — 并附带免费的 SSL、CDN 和 DDoS 防护。

---

准备好建立你的网站了吗？[立即免费使用 AI 创建](/zh/editor)，连接你的自定义域名。
`,
  },
};

export default article;
