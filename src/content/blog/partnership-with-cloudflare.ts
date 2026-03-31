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
  es: {
    title: "Por qué construimos EasySite sobre Cloudflare — Y nuestra visión para una colaboración más profunda",
    description:
      "EasySite está profundamente integrado con Cloudflare Pages. Compartimos nuestra historia, nuestro compromiso con el ecosistema de Cloudflare y nuestra invitación abierta a socios y colaboradores.",
    keywords: [
      "asociación EasySite Cloudflare",
      "integración Cloudflare Pages",
      "asociación constructor de sitios web IA",
      "ecosistema Cloudflare",
      "JY Tech Cloudflare",
      "colaboración constructor de sitios web",
      "asociación abierta",
    ],
    content: `
## Amamos Cloudflare

Esto no es solo un eslogan — es la base de cómo construimos EasySite.

Cuando nos propusimos crear un constructor de sitios web impulsado por IA, teníamos una filosofía simple: **dar a los usuarios control total sobre sus sitios**. Eso significaba sin dependencia del proveedor, sin alojamiento propietario y sin tarifas ocultas. Necesitábamos una infraestructura alineada con estos valores.

Elegimos **Cloudflare**.

## Por qué Cloudflare es el núcleo de EasySite

EasySite usa IA para generar sitios web estáticos completos con múltiples archivos (HTML, CSS, JavaScript). Cuando un usuario presiona "Publicar", su sitio necesita ir a algún lugar rápido, confiable y accesible globalmente.

Cloudflare Pages es la combinación perfecta:

- **Nivel gratuito que realmente funciona** — 100 proyectos, ancho de banda ilimitado, SSL gratuito y dominios personalizados. Nuestros usuarios no pagan ni un centavo por alojamiento de clase mundial.
- **Red edge global** — más de 300 ubicaciones significan tiempos de carga inferiores a 100ms en todo el mundo.
- **API simple** — Integramos los despliegues de Cloudflare Pages directamente en nuestro flujo de publicación. Un clic, y tu sitio generado con IA está en vivo en el edge.
- **Modelo BYOK** — Los usuarios traen su propia cuenta de Cloudflare. Son dueños de su infraestructura. Pueden irse en cualquier momento y llevarse sus sitios.

Esto es fundamentalmente diferente de otros constructores de sitios web. No te encerramos — la plataforma abierta de Cloudflare lo hace posible.

## Lo que hemos construido hasta ahora

Nuestra integración con Cloudflare ya está activa e incluye:

- **Despliegue con un clic** a Cloudflare Pages desde el editor de EasySite
- **Gestión de proyectos por sitio** — cada sitio se conecta a su propio proyecto de Cloudflare Pages
- **Creación automática de proyectos** — los usuarios pueden crear nuevos proyectos de Cloudflare Pages directamente desde EasySite
- **Detección automática de cuenta** — solo pega un token de API y encontramos la cuenta automáticamente
- **Soporte para dominios personalizados** — los usuarios configuran dominios a través del panel de Cloudflare
- **Exportar como ZIP** — cada sitio se puede descargar como archivos estándar HTML/CSS/JS

Todo esto funciona en el nivel gratuito de Cloudflare. Nuestros usuarios obtienen alojamiento de nivel empresarial sin pagarlo.

## Nuestra visión: ir más profundo

Creemos que apenas estamos rascando la superficie. Aquí es donde nos encantaría llevar esta asociación:

### Para los usuarios
- **Configuración automática de dominios personalizados** — configura dominios sin salir de EasySite
- **Integración de Cloudflare Analytics** — consulta datos de tráfico directamente en el panel de EasySite
- **Integración de Cloudflare Workers** — agrega funciones serverless a sitios generados con IA (formularios de contacto, APIs)
- **Integración de Cloudflare R2** — imágenes y recursos subidos por usuarios almacenados en R2

### Para el ecosistema
- **EasySite como front-end de Cloudflare Pages** — una capa de IA que hace Cloudflare Pages accesible para no desarrolladores
- **Marketplace de plantillas** — plantillas generadas con IA optimizadas para Cloudflare Pages
- **Contenido educativo** — tutoriales que muestran cómo Cloudflare + IA hace la publicación web accesible para todos

### Para empresas
- **Solución de marca blanca** — las agencias usan EasySite + Cloudflare para construir y alojar sitios de clientes
- **Gestión multisitio** — gestiona docenas de proyectos de Cloudflare Pages desde un solo panel

## Quiénes somos

EasySite está construido por **JY Tech** ([jytech.us](https://jytech.us)), una empresa tecnológica enfocada en hacer herramientas de IA accesibles y prácticas. Somos un equipo pequeño y ágil que cree que las grandes herramientas deben ser simples y abiertas.

Nuestro stack tecnológico:
- **Next.js** en Vercel para la aplicación
- **Cloudflare Pages** para el alojamiento de sitios
- **OpenRouter** para acceso a múltiples modelos de IA
- **Neon PostgreSQL** para datos
- **Auth0** para autenticación
- **Stripe** para pagos

Somos rentables en el nivel gratuito porque el generoso plan gratuito de Cloudflare significa que nuestros costos de alojamiento son casi cero. Esto nos permite ofrecer una experiencia genuinamente gratuita a nuestros usuarios.

## Hablemos

Estamos buscando activamente socios, colaboradores y cualquier persona que comparta nuestra visión de hacer la web más accesible a través de IA + computación edge.

Si estás interesado en:

- **Oportunidades de asociación** — integraciones, co-marketing, colaboración tecnológica
- **Programas de revendedor/agencia** — usar EasySite + Cloudflare para tus clientes
- **Integraciones tecnológicas** — conectar tu producto con nuestro constructor de sitios web con IA
- **Inversión** — estamos abiertos a conversaciones sobre crecimiento

Nos encantaría saber de ti.

**Contáctanos:**
- Email: [partnership@jytech.us](mailto:partnership@jytech.us)
- Sitio web: [jytech.us](https://jytech.us)
- EasySite: [site.jytech.us](https://site.jytech.us)

---

## Para Cloudflare

Al equipo de Cloudflare — gracias por construir la infraestructura que hace posible proyectos como el nuestro. Su compromiso con una web libre y abierta se alinea perfectamente con lo que estamos tratando de hacer. Damos la bienvenida a cualquier oportunidad de trabajar más estrechamente juntos.

Si alguien del equipo de Cloudflare está leyendo esto, estamos a solo un correo electrónico de distancia.

---

*EasySite es gratuito. [Crea tu primer sitio web generado con IA](/es/editor) y despliégalo en Cloudflare Pages en menos de 5 minutos.*
`,
  },
  ko: {
    title: "우리가 Cloudflare 위에 EasySite를 구축한 이유 — 그리고 더 깊은 파트너십에 대한 비전",
    description:
      "EasySite는 Cloudflare Pages와 깊이 통합되어 있습니다. 우리의 이야기, Cloudflare 생태계에 대한 헌신, 파트너와 협력자에 대한 열린 초대를 공유합니다.",
    keywords: [
      "EasySite Cloudflare 파트너십",
      "Cloudflare Pages 통합",
      "AI 웹사이트 빌더 파트너십",
      "Cloudflare 생태계",
      "JY Tech Cloudflare",
      "웹사이트 빌더 협업",
      "개방형 파트너십",
    ],
    content: `
## 우리는 Cloudflare를 사랑합니다

이것은 단순한 슬로건이 아닙니다 — EasySite를 구축한 기반입니다.

AI 기반 웹사이트 빌더를 만들기 시작했을 때, 우리에게는 간단한 철학이 있었습니다: **사용자에게 사이트에 대한 완전한 제어권을 제공하는 것**. 이는 벤더 종속 없음, 독점 호스팅 없음, 숨겨진 비용 없음을 의미했습니다. 이러한 가치와 일치하는 인프라가 필요했습니다.

우리는 **Cloudflare**를 선택했습니다.

## 왜 Cloudflare가 EasySite의 핵심인가

EasySite는 AI를 사용하여 완전한 다중 파일 정적 웹사이트(HTML, CSS, JavaScript)를 생성합니다. 사용자가 "게시"를 누르면, 사이트는 빠르고 안정적이며 전 세계적으로 접근 가능한 곳에 있어야 합니다.

Cloudflare Pages는 완벽한 조합입니다:

- **실제로 작동하는 무료 티어** — 100개 프로젝트, 무제한 대역폭, 무료 SSL, 커스텀 도메인. 사용자는 세계 최고 수준의 호스팅에 한 푼도 지불하지 않습니다.
- **글로벌 엣지 네트워크** — 300개 이상의 위치에서 전 세계 100ms 미만의 로딩 시간을 제공합니다.
- **간단한 API** — Cloudflare Pages 배포를 게시 흐름에 직접 통합했습니다. 한 번의 클릭으로 AI 생성 사이트가 엣지에서 라이브됩니다.
- **BYOK 모델** — 사용자가 자신의 Cloudflare 계정을 사용합니다. 자신의 인프라를 소유하며, 언제든지 사이트를 가지고 떠날 수 있습니다.

이것은 다른 웹사이트 빌더와 근본적으로 다릅니다. 우리는 종속시키지 않습니다 — Cloudflare의 개방형 플랫폼이 이를 가능하게 합니다.

## 지금까지 구축한 것

Cloudflare 통합은 이미 라이브 상태이며 다음을 포함합니다:

- EasySite 편집기에서 Cloudflare Pages로 **원클릭 배포**
- **사이트별 프로젝트 관리** — 각 사이트가 자체 Cloudflare Pages 프로젝트에 연결
- **자동 프로젝트 생성** — 사용자가 EasySite에서 직접 새 Cloudflare Pages 프로젝트를 생성 가능
- **계정 자동 감지** — API 토큰을 붙여넣기만 하면 계정을 자동으로 찾습니다
- **커스텀 도메인 지원** — 사용자가 Cloudflare 대시보드를 통해 도메인 구성
- **ZIP으로 내보내기** — 모든 사이트를 표준 HTML/CSS/JS 파일로 다운로드 가능

이 모든 것이 Cloudflare 무료 티어에서 실행됩니다. 사용자는 비용 없이 엔터프라이즈급 호스팅을 받습니다.

## 우리의 비전: 더 깊이 나아가기

우리는 아직 표면만 긁고 있다고 믿습니다. 이 파트너십을 발전시키고 싶은 방향입니다:

### 사용자를 위해
- **자동 커스텀 도메인 설정** — EasySite를 떠나지 않고 도메인 구성
- **Cloudflare Analytics 통합** — EasySite 대시보드에서 직접 트래픽 데이터 확인
- **Cloudflare Workers 통합** — AI 생성 사이트에 서버리스 기능 추가 (문의 양식, API)
- **Cloudflare R2 통합** — 사용자가 업로드한 이미지와 자산을 R2에 저장

### 생태계를 위해
- **Cloudflare Pages의 프론트엔드로서의 EasySite** — 비개발자도 Cloudflare Pages를 쉽게 사용할 수 있게 하는 AI 레이어
- **템플릿 마켓플레이스** — Cloudflare Pages에 최적화된 AI 생성 템플릿
- **교육 콘텐츠** — Cloudflare + AI가 어떻게 웹 게시를 모두에게 접근 가능하게 하는지 보여주는 튜토리얼

### 기업을 위해
- **화이트라벨 솔루션** — 에이전시가 EasySite + Cloudflare를 사용하여 클라이언트 사이트 구축 및 호스팅
- **다중 사이트 관리** — 하나의 대시보드에서 수십 개의 Cloudflare Pages 프로젝트 관리

## 우리에 대해

EasySite는 **JY Tech** ([jytech.us](https://jytech.us))가 구축했습니다. AI 도구를 접근 가능하고 실용적으로 만드는 데 집중하는 기술 회사입니다. 우리는 훌륭한 도구는 간단하고 개방적이어야 한다고 믿는 작고 빠른 팀입니다.

우리의 기술 스택:
- **Next.js** — Vercel에서 애플리케이션 실행
- **Cloudflare Pages** — 사이트 호스팅
- **OpenRouter** — 다중 모델 AI 접근
- **Neon PostgreSQL** — 데이터 저장
- **Auth0** — 인증
- **Stripe** — 결제

Cloudflare의 넉넉한 무료 플랜 덕분에 호스팅 비용이 거의 제로이며, 이를 통해 무료 티어에서도 수익을 내고 사용자에게 진정한 무료 경험을 제공할 수 있습니다.

## 대화합시다

우리는 AI + 엣지 컴퓨팅을 통해 웹을 더 접근 가능하게 만들겠다는 비전을 공유하는 파트너, 협력자, 그리고 모든 분들을 적극적으로 찾고 있습니다.

관심이 있으시면:

- **파트너십 기회** — 통합, 공동 마케팅, 기술 협력
- **리셀러/에이전시 프로그램** — 클라이언트를 위해 EasySite + Cloudflare 사용
- **기술 통합** — 귀사의 제품을 우리 AI 웹사이트 빌더와 연결
- **투자** — 성장에 대한 대화에 열려 있습니다

여러분의 연락을 기다립니다.

**연락처:**
- 이메일: [partnership@jytech.us](mailto:partnership@jytech.us)
- 웹사이트: [jytech.us](https://jytech.us)
- EasySite: [site.jytech.us](https://site.jytech.us)

---

## Cloudflare에게

Cloudflare 팀에게 — 우리 같은 프로젝트를 가능하게 하는 인프라를 구축해 주셔서 감사합니다. 자유롭고 개방적인 웹에 대한 여러분의 헌신은 우리가 하려는 일과 완벽하게 일치합니다. 더 긴밀하게 협력할 기회를 환영합니다.

Cloudflare 팀의 누군가가 이 글을 읽고 계시다면, 이메일 한 통이면 됩니다.

---

*EasySite는 무료입니다. [첫 번째 AI 생성 웹사이트 만들기](/ko/editor)를 하고 5분 안에 Cloudflare Pages에 배포하세요.*
`,
  },
};

export default article;
