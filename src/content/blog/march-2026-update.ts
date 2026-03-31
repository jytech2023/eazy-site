import type { BlogArticle } from "./types";

const article: BlogArticle = {
  slug: "march-2026-update",
  date: "2026-03-31",
  en: {
    title: "March 2026 Update: Gallery, Cloudflare Deploy, GitHub Import, and More",
    description:
      "Our biggest update yet — community gallery with code viewer and fork, Cloudflare Pages BYOK deployment, GitHub OAuth import, 4-language support, smart AI model auto-selection, and much more.",
    keywords: [
      "EasySite update",
      "AI website builder",
      "Cloudflare Pages",
      "GitHub import",
      "community gallery",
      "site builder update",
      "March 2026",
    ],
    content: `
## Our Biggest Update Yet

We've been building fast at JY Tech, and today we're excited to share the biggest EasySite update since launch. This release touches every part of the platform — from how you create sites, to how you deploy them, to how you discover what others have built.

Here's everything that's new.

## Community Gallery

The gallery is live at [/gallery](/en/gallery). Every published site on EasySite is now browsable by the community, with live preview thumbnails.

But we didn't stop at browsing. Every gallery card lets you:

- **View** — open the live site
- **Code** — inspect the full source code (HTML, CSS, JS) in a modal with file tabs
- **Fork** — one click to copy any public site to your account and open it in the editor

This makes EasySite a learning platform, not just a builder. See a design you like? Fork it, tweak it with AI, and publish your own version.

Anonymous users' sites are public by default. No login needed to contribute to the gallery.

## Cloudflare Pages Integration (BYOK)

This is the feature we're most excited about. You can now deploy your AI-generated sites to [Cloudflare Pages](https://pages.cloudflare.com) — Cloudflare's global edge network with 300+ locations worldwide.

How it works:

1. Go to your [Profile](/en/profile) and add your Cloudflare API token
2. In your [Dashboard](/en/dashboard), connect each site to a Cloudflare Pages project (or create one directly)
3. Publish — your site is live on the edge in seconds

What you get for free:
- Global CDN with 300+ edge locations
- Free SSL certificates
- Unlimited bandwidth
- Custom domain support
- DDoS protection

We use a **BYOK (Bring Your Own Key)** model — you own the Cloudflare account, the domains, and the infrastructure. No vendor lock-in. You can leave anytime with your files.

Each site connects to its own Cloudflare Pages project, so you can have different domains for different sites.

## GitHub Import

Connect your GitHub account via OAuth and import any repository as a site. The flow is simple:

1. Click "Import from GitHub" in your dashboard
2. Browse your repos (public and private) with search
3. Click "Import" — we fetch all static files (HTML, CSS, JS) and create a site

Imported sites start as drafts so you can review and enhance them with AI before publishing. This is perfect for bringing existing projects into EasySite for AI-powered iteration.

## 4-Language Support

EasySite now fully supports **English, Chinese, Spanish, and Korean**. Every page, blog article, legal page, and UI element is translated. The language switcher in the nav lets you switch with one click, and URLs are locale-prefixed (\`/en/\`, \`/zh/\`, \`/es/\`, \`/ko/\`).

## Smart AI Model Selection

We added an **"Auto" mode** that's now the default for all users. Instead of choosing a model manually, Auto:

- Picks the best available model for your plan
- Automatically falls back through a chain of alternatives if one is rate-limited
- Pre-checks availability before streaming to avoid broken responses
- Shows which model was actually used in the status bar (e.g. "Auto (Qwen3 Coder)")

Free users get access to 4 powerful open-source models. Pro and Unlimited users get premium models from Anthropic, Google, and OpenAI. You never have to think about model selection unless you want to.

## Interrupt & Resume

You can now **stop a generation mid-stream** without losing your work:

- Click "Stop" to interrupt
- Any partially generated files are parsed and kept in the preview
- Say "continue" to resume from where it left off
- The AI knows it was interrupted and picks up exactly where it stopped

## Export as ZIP

Every site can be downloaded as a ZIP file from the editor or dashboard. Standard HTML/CSS/JS files — host them anywhere. Your content is never locked in.

## Platform Stats

A new [Stats](/en/stats) page shows real-time platform analytics:

- Total AI generations, sites created, and users
- Model usage breakdown (which models are most popular)
- Daily activity chart for the last 30 days

## Dark & Light Mode

A theme toggle in the navigation lets you switch between dark and light mode. Your preference is saved and persists across sessions with no flash on page load.

## Updated Pricing

We've made the free tier much more generous:

| | Free | Pro ($9/mo) | Unlimited ($29/mo) |
|---|---|---|---|
| Sites | 100 | 500 | Unlimited |
| Pages per site | 10 | 50 | Unlimited |
| Cloudflare Pages | ✓ | ✓ | ✓ |
| Custom domains | ✓ | ✓ | ✓ |
| Export as ZIP | ✓ | ✓ | ✓ |

Cloudflare deploy and custom domains are available on **all plans**, including free.

## Built with Claude Code — and Inspired by the Community

This entire update was developed using [Claude Code](https://claude.ai/claude-code). We also got a ton of inspiration from the open [Claude Code event](https://github.com/instructkr/claw-code/pulse) by the community — seeing how others push the boundaries of AI-assisted development motivated us to rethink our own product. We didn't just use Claude Code as a coding tool — we studied how it works and brought those patterns into EasySite.

**Abort & Resume** — Claude Code handles interrupted generations gracefully, keeping partial work instead of throwing it away. We adopted the same pattern: when users stop a generation mid-stream, we parse and keep whatever files were already created. The AI knows it was interrupted and can pick up exactly where it left off when the user says "continue."

**Smart Context Management** — Claude Code is thoughtful about what context it sends to the model. We applied the same thinking: our editor truncates oversized files, summarizes older chat history, and only sends changed files in editing mode. This keeps conversations efficient even for complex multi-file sites.

**Auto Model Fallback** — Inspired by Claude Code's retry-with-backoff approach, we built a fallback chain that pre-checks model availability and silently switches to alternatives. Users never see a cryptic error — just results.

**Self-Review Loop** — Claude Code validates its own output. Our system prompt now includes a self-review step where the AI checks its generated code for broken references, missing responsive styles, and HTML validity before outputting it.

These aren't just technical details — they fundamentally changed how EasySite feels to use. The AI builder is more resilient, more predictable, and more helpful because we learned from one of the best AI-powered tools out there.

## Also Shipped

- **Profile page** with account info and integration settings (Cloudflare + GitHub)
- **Blog system** with SEO-optimized articles in 4 languages, structured data, and sitemap integration
- **Terms of Service** and **Privacy Policy** pages
- **Improved editor nav** — full-screen editor with integrated compact navigation
- **Better AI responses** — improved system prompt with self-review, continuation mode, and smart context management
- **Database-only storage** — all sites stored in PostgreSQL (no more filesystem writes)

## What's Next

We're already working on the next wave of features:

- Marketplace for designers and SEO experts
- Template library from community gallery
- Cloudflare Workers integration for dynamic sites
- Analytics dashboard per site
- Collaboration features

## Try It

Everything in this update is live now. [Start building for free](/en/editor) — no login required.

Have feedback? We'd love to hear from you at support@jytech.us.
`,
  },
  zh: {
    title: "2026 年 3 月更新：社区画廊、Cloudflare 部署、GitHub 导入等",
    description:
      "迄今最大的更新 — 社区画廊支持代码查看和复刻、Cloudflare Pages BYOK 部署、GitHub OAuth 导入、四语言支持、智能 AI 模型自动选择等。",
    keywords: [
      "EasySite 更新",
      "AI 建站工具",
      "Cloudflare Pages",
      "GitHub 导入",
      "社区画廊",
      "建站工具更新",
      "2026 年 3 月",
    ],
    content: `
## 迄今最大的更新

我们在 JY Tech 一直在快速开发，今天我们很高兴分享 EasySite 自发布以来最大的更新。这次发布涵盖了平台的方方面面 — 从网站创建方式，到部署方式，到社区发现功能。

以下是所有新功能。

## 社区画廊

画廊现已上线 [/gallery](/zh/gallery)。EasySite 上所有已发布的网站现在都可以被社区浏览，并带有实时预览缩略图。

但我们不止于浏览。每个画廊卡片都可以：

- **查看** — 打开实时网站
- **代码** — 在带有文件标签的弹窗中查看完整源代码（HTML、CSS、JS）
- **复刻** — 一键将任何公开网站复制到你的账户并在编辑器中打开

这使 EasySite 不仅是一个建站工具，更是一个学习平台。看到喜欢的设计？复刻它，用 AI 修改，然后发布你自己的版本。

匿名用户的网站默认公开。无需登录即可为画廊做贡献。

## Cloudflare Pages 集成（BYOK）

这是我们最兴奋的功能。你现在可以将 AI 生成的网站部署到 [Cloudflare Pages](https://pages.cloudflare.com) — Cloudflare 在全球 300+ 个位置的边缘网络。

使用方法：

1. 在[个人设置](/zh/profile)中添加你的 Cloudflare API 令牌
2. 在[控制面板](/zh/dashboard)中，将每个网站连接到 Cloudflare Pages 项目（或直接创建一个）
3. 发布 — 你的网站在几秒内就在边缘网络上线

免费获得：
- 全球 CDN，300+ 边缘节点
- 免费 SSL 证书
- 无限带宽
- 自定义域名支持
- DDoS 防护

我们采用 **BYOK（自带密钥）** 模式 — 你拥有 Cloudflare 账户、域名和基础设施。没有供应商锁定，随时可以带走你的文件。

每个网站连接到自己的 Cloudflare Pages 项目，因此你可以为不同的网站使用不同的域名。

## GitHub 导入

通过 OAuth 连接你的 GitHub 账户，即可导入任何仓库为网站。流程很简单：

1. 在控制面板中点击"从 GitHub 导入"
2. 浏览你的仓库（公开和私有），支持搜索
3. 点击"导入" — 我们获取所有静态文件（HTML、CSS、JS）并创建网站

导入的网站以草稿形式开始，你可以在发布前用 AI 审查和增强它们。这非常适合将现有项目带入 EasySite 进行 AI 驱动的迭代。

## 四语言支持

EasySite 现已完整支持**英语、中文、西班牙语和韩语**。每个页面、博客文章、法律页面和 UI 元素都已翻译。导航栏中的语言切换器可以一键切换，URL 带有语言前缀（\`/en/\`、\`/zh/\`、\`/es/\`、\`/ko/\`）。

## 智能 AI 模型选择

我们添加了 **"自动"模式**，现在是所有用户的默认选项。自动模式不需要手动选择模型：

- 为你的计划选择最佳可用模型
- 如果某个模型被限速，自动切换到备选模型链
- 在流式传输前预检可用性，避免中断的响应
- 在状态栏中显示实际使用的模型（如"Auto (Qwen3 Coder)"）

免费用户可以使用 4 个强大的开源模型。专业版和无限版用户可以使用 Anthropic、Google 和 OpenAI 的高级模型。

## 中断和恢复

现在你可以**在生成过程中停止**而不会丢失工作：

- 点击"停止"中断
- 任何部分生成的文件都会被解析并保留在预览中
- 说"继续"可从中断处恢复
- AI 知道它被中断了，会准确地从停止的地方继续

## 导出为 ZIP

每个网站都可以从编辑器或控制面板下载为 ZIP 文件。标准的 HTML/CSS/JS 文件 — 可以托管在任何地方。你的内容永远不会被锁定。

## 平台统计

新的[统计](/zh/stats)页面显示实时平台分析：

- AI 生成次数、创建的网站和用户总数
- 模型使用分布（哪些模型最受欢迎）
- 最近 30 天的每日活动图表

## 深色和浅色模式

导航栏中的主题切换可以在深色和浅色模式之间切换。你的偏好会被保存并在页面加载时无闪烁地生效。

## 更新的定价

我们大幅提高了免费版的额度：

| | 免费版 | 专业版 ($9/月) | 无限版 ($29/月) |
|---|---|---|---|
| 网站数 | 100 | 500 | 无限 |
| 每站页面数 | 10 | 50 | 无限 |
| Cloudflare Pages | ✓ | ✓ | ✓ |
| 自定义域名 | ✓ | ✓ | ✓ |
| 导出为 ZIP | ✓ | ✓ | ✓ |

Cloudflare 部署和自定义域名在**所有计划**上都可用，包括免费版。

## 用 Claude Code 构建 — 也从社区获得灵感

整个更新都是使用 [Claude Code](https://claude.ai/claude-code) 开发的。我们还从社区的开放 [Claude Code 活动](https://github.com/instructkr/claw-code/pulse)中获得了大量灵感 — 看到其他人如何突破 AI 辅助开发的边界，促使我们重新思考自己的产品。我们不仅将 Claude Code 作为编码工具 — 我们研究了它的工作方式，并将这些模式引入了 EasySite。

**中断与恢复** — Claude Code 优雅地处理中断的生成，保留部分工作而不是丢弃。我们采用了同样的模式：当用户中途停止生成时，我们解析并保留已经创建的文件。AI 知道它被中断了，当用户说"继续"时可以准确地从停止的地方继续。

**智能上下文管理** — Claude Code 对发送给模型的上下文非常谨慎。我们应用了同样的思路：编辑器截断过大的文件，总结较早的聊天历史，在编辑模式下只发送更改过的文件。即使对于复杂的多文件网站，对话也保持高效。

**自动模型回退** — 受 Claude Code 的重试退避方法启发，我们构建了一个回退链，预检模型可用性并静默切换到备选方案。用户永远不会看到晦涩的错误 — 只有结果。

**自我审查循环** — Claude Code 会验证自己的输出。我们的系统提示现在包含一个自我审查步骤，AI 在输出之前检查生成的代码是否有损坏的引用、缺失的响应式样式和 HTML 有效性。

这些不仅仅是技术细节 — 它们从根本上改变了 EasySite 的使用体验。AI 建站工具更有韧性、更可预测、更有帮助，因为我们向最好的 AI 驱动工具之一学习。

## 下一步

我们已经在开发下一波功能：

- 设计师和 SEO 专家的市场
- 社区画廊的模板库
- Cloudflare Workers 集成，支持动态网站
- 每站分析仪表板
- 协作功能

## 试试看

本次更新的所有功能已经上线。[免费开始创建](/zh/editor) — 无需登录。

有反馈？欢迎联系 support@jytech.us。
`,
  },
  es: {
    title: "Actualización de Marzo 2026: Galería, Despliegue en Cloudflare, Importación desde GitHub y Más",
    description:
      "Nuestra mayor actualización hasta ahora — galería comunitaria con visor de código y bifurcación, despliegue BYOK en Cloudflare Pages, importación OAuth de GitHub, soporte en 4 idiomas, selección automática inteligente de modelos IA y mucho más.",
    keywords: [
      "actualización EasySite",
      "constructor web con IA",
      "Cloudflare Pages",
      "importar desde GitHub",
      "galería comunitaria",
      "actualización constructor de sitios",
      "marzo 2026",
    ],
    content: `
## Nuestra Mayor Actualización Hasta Ahora

Hemos estado construyendo rápido en JY Tech, y hoy nos emociona compartir la mayor actualización de EasySite desde su lanzamiento.

### Novedades Principales

**Galería Comunitaria** — Explora todos los sitios publicados en [/gallery](/es/gallery). Cada tarjeta muestra una vista previa en vivo, y puedes ver el código fuente completo o bifurcar cualquier sitio con un clic.

**Cloudflare Pages (BYOK)** — Despliega en la red edge global de Cloudflare. SSL gratis, ancho de banda ilimitado, dominios personalizados. Usa tu propia cuenta de Cloudflare.

**Importación desde GitHub** — Conecta tu cuenta de GitHub vía OAuth, explora tus repos e importa cualquier sitio estático con un clic.

**4 Idiomas** — Soporte completo para inglés, chino, español y coreano.

**Selección Automática de Modelos** — El nuevo modo "Auto" elige el mejor modelo disponible y cambia automáticamente si uno está limitado.

**Interrumpir y Reanudar** — Detén una generación a mitad de camino, conserva el trabajo parcial y di "continuar" para retomar.

**Exportar como ZIP** — Descarga cualquier sitio como archivo ZIP.

**Estadísticas** — Página de [estadísticas](/es/stats) en tiempo real con uso de modelos y actividad diaria.

**Modo Oscuro/Claro** — Alternador de tema con persistencia.

**100 sitios gratis** — Cloudflare deploy y dominios personalizados en todos los planes.

[Empieza a crear gratis](/es/editor) — sin registro necesario.
`,
  },
  ko: {
    title: "2026년 3월 업데이트: 갤러리, Cloudflare 배포, GitHub 가져오기 등",
    description:
      "역대 최대 업데이트 — 코드 뷰어와 포크가 있는 커뮤니티 갤러리, Cloudflare Pages BYOK 배포, GitHub OAuth 가져오기, 4개 언어 지원, 스마트 AI 모델 자동 선택 등.",
    keywords: [
      "EasySite 업데이트",
      "AI 웹사이트 빌더",
      "Cloudflare Pages",
      "GitHub 가져오기",
      "커뮤니티 갤러리",
      "사이트 빌더 업데이트",
      "2026년 3월",
    ],
    content: `
## 역대 최대 업데이트

JY Tech에서 빠르게 개발해 왔으며, 오늘 EasySite 출시 이후 가장 큰 업데이트를 공유하게 되어 기쁩니다.

### 주요 새 기능

**커뮤니티 갤러리** — [/gallery](/ko/gallery)에서 모든 공개 사이트를 탐색하세요. 각 카드에서 라이브 미리보기, 전체 소스 코드 보기, 원클릭 포크가 가능합니다.

**Cloudflare Pages (BYOK)** — Cloudflare의 글로벌 엣지 네트워크에 배포하세요. 무료 SSL, 무제한 대역폭, 커스텀 도메인. 자체 Cloudflare 계정을 사용합니다.

**GitHub 가져오기** — OAuth로 GitHub 계정을 연결하고 저장소를 탐색하여 정적 사이트를 원클릭으로 가져오세요.

**4개 언어** — 영어, 중국어, 스페인어, 한국어 완전 지원.

**자동 모델 선택** — 새로운 "Auto" 모드가 최적의 모델을 선택하고 속도 제한 시 자동으로 전환합니다.

**중단 및 재개** — 생성 중에 중단하고 부분 결과를 유지한 후 "계속"이라고 말하면 재개됩니다.

**ZIP으로 내보내기** — 모든 사이트를 ZIP 파일로 다운로드.

**통계** — [통계](/ko/stats) 페이지에서 모델 사용량과 일별 활동을 실시간으로 확인.

**다크/라이트 모드** — 테마 전환과 저장.

**무료 100개 사이트** — 모든 요금제에서 Cloudflare 배포와 커스텀 도메인 사용 가능.

[무료로 만들기 시작](/ko/editor) — 가입 필요 없음.
`,
  },
};

export default article;
