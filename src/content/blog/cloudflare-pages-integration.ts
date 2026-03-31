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
  es: {
    title: "EasySite ahora se integra con Cloudflare Pages — Despliega tus sitios generados con IA en la red edge",
    description:
      "Anunciamos nuestra integración con Cloudflare Pages. Despliega tus sitios web creados con IA en la red edge global de Cloudflare con un solo clic. SSL gratuito, ancho de banda ilimitado y dominios personalizados incluidos.",
    keywords: [
      "Cloudflare Pages",
      "EasySite Cloudflare",
      "desplegar sitio web en edge",
      "constructor de sitios web IA Cloudflare",
      "alojamiento web gratuito",
      "sitio web CDN global",
      "BYOK Cloudflare",
      "alojamiento de sitios estáticos",
    ],
    content: `
## Anunciamos la integración con Cloudflare Pages

Estamos emocionados de anunciar que EasySite ahora se integra directamente con **Cloudflare Pages** — dándote el poder de desplegar tus sitios web generados con IA en la red edge global de Cloudflare con solo unos clics.

Esto significa que tus sitios cargan más rápido, son más confiables y pueden usar dominios personalizados — todo gratis.

## ¿Por qué Cloudflare Pages?

Cuando publicas un sitio en EasySite, se almacena en nuestra base de datos y se sirve a través de nuestra infraestructura. Eso funciona muy bien, pero Cloudflare Pages lo lleva a otro nivel:

- **Red Edge Global** — tu sitio se almacena en caché en más de 300 centros de datos en todo el mundo, para que los visitantes obtengan tiempos de carga ultrarrápidos sin importar dónde estén
- **SSL gratuito** — HTTPS es automático, sin necesidad de gestionar certificados
- **Ancho de banda ilimitado** — sin límites de tráfico, incluso en el plan gratuito
- **Dominios personalizados** — vincula tu propio nombre de dominio directamente a través de Cloudflare
- **99.99% de disponibilidad** — la infraestructura de Cloudflare está probada en batalla

Lo mejor de todo es que Cloudflare Pages es **gratuito** para la mayoría de los casos de uso. Tú aportas tu propia cuenta de Cloudflare y nosotros nos encargamos del despliegue.

## Cómo funciona

### 1. Conecta tu cuenta de Cloudflare

Ve a tu página de [Perfil](/es/profile) y agrega tu token de API de Cloudflare. Solo necesitas hacer esto una vez.

**Crear un token toma 2 minutos:**
1. Ve a [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Crea un token personalizado con estos permisos:
   - Account → **Cloudflare Pages** → Edit
   - Account → **Account Settings** → Read
3. Pega el token en tu perfil de EasySite

EasySite detecta automáticamente tu cuenta — no se necesita Account ID.

### 2. Conecta cada sitio a un proyecto

En tu [Panel de control](/es/dashboard), cada sitio tiene una opción **"Conectar a Cloudflare Pages"**. Puedes:

- **Seleccionar un proyecto existente** de tu cuenta de Cloudflare
- **Crear un nuevo proyecto** directamente desde EasySite — sin necesidad de visitar el panel de Cloudflare

Cada sitio tiene su propio proyecto de Cloudflare Pages, por lo que pueden tener dominios y configuraciones separadas.

### 3. Publica como siempre

Cuando publicas un sitio, EasySite automáticamente:
1. Guarda el sitio en nuestra base de datos (como respaldo)
2. Despliega todos los archivos en tu proyecto de Cloudflare Pages
3. Devuelve tanto la URL de EasySite como la URL de Cloudflare Pages

Tu sitio está en vivo en la red edge de Cloudflare en segundos.

## Trae tu propia clave (BYOK)

Creemos en darte control total. La integración con Cloudflare Pages usa un modelo **BYOK (Trae tu propia clave)**:

- **Tú eres dueño de la cuenta de Cloudflare** — tus sitios viven en tu infraestructura
- **Tú eres dueño de los dominios** — configura dominios personalizados directamente en Cloudflare
- **Puedes irte en cualquier momento** — tus sitios son archivos estándar HTML/CSS/JS en tu cuenta de Cloudflare, sin dependencia del proveedor
- **Cero costo de alojamiento de nuestra parte** — el nivel gratuito de Cloudflare es suficientemente generoso para la mayoría de los sitios

Esto es fundamentalmente diferente de otros constructores de sitios web que te encierran en su alojamiento. Con EasySite + Cloudflare, obtienes lo mejor de ambos mundos: creación de sitios impulsada por IA con infraestructura que tú controlas.

## Lo que obtienes con el plan gratuito de Cloudflare

| Característica | Plan gratuito |
|----------------|---------------|
| Proyectos | Hasta 100 |
| Despliegues | Ilimitados |
| Ancho de banda | Ilimitado |
| Certificados SSL | Gratuitos, automáticos |
| Dominios personalizados | Incluidos |
| Protección DDoS | Incluida |
| Archivos por proyecto | 20,000 |

Eso es más que suficiente para la mayoría de los sitios web.

## Flexibilidad por sitio

A diferencia de un enfoque único para todos, nuestra integración funciona a **nivel de sitio**:

- **Sitio A** → Conectado al proyecto \`my-portfolio\` → \`portfolio.example.com\`
- **Sitio B** → Conectado al proyecto \`my-blog\` → \`blog.example.com\`
- **Sitio C** → Sin conexión a Cloudflare → servido directamente desde EasySite

Tú eliges qué sitios desplegar en Cloudflare y cuáles mantener en nuestra plataforma. Mezcla y combina como quieras.

## Exporta tus sitios

¿Quieres alojar tu sitio en otro lugar? Cada sitio en EasySite puede **exportarse como un archivo ZIP** que contiene todos los archivos HTML, CSS y JavaScript. Tu contenido nunca está encerrado.

## Cómo empezar

1. [Crea una cuenta gratuita de Cloudflare](https://cloudflare.com) si no tienes una
2. [Conecta tu token de API](/es/profile) en tu perfil de EasySite
3. Ve a tu [Panel de control](/es/dashboard) y conecta tus sitios a Cloudflare Pages
4. Publica — y observa cómo tu sitio se activa en la red edge global

Todo el proceso de configuración toma menos de 5 minutos.

## Próximos pasos

Seguimos mejorando la integración con Cloudflare:

- **Configuración automática de dominios personalizados** — configura dominios sin salir de EasySite
- **Vistas previas de despliegue** — previsualiza cambios antes de publicar
- **Integración de analíticas** — consulta tus analíticas de Cloudflare en el panel de EasySite
- **Importar desde Cloudflare** — trae sitios existentes de Cloudflare Pages a EasySite para edición con IA

---

¿Listo para desplegar tu sitio web generado con IA en la red edge? [Ve a tu perfil](/es/profile) para conectar Cloudflare, o [crea un nuevo sitio](/es/editor) para empezar.
`,
  },
  ko: {
    title: "EasySite가 Cloudflare Pages와 통합되었습니다 — AI 생성 사이트를 엣지에 배포하세요",
    description:
      "Cloudflare Pages 통합을 발표합니다. AI로 만든 웹사이트를 Cloudflare의 글로벌 엣지 네트워크에 한 번의 클릭으로 배포하세요. 무료 SSL, 무제한 대역폭, 커스텀 도메인 포함.",
    keywords: [
      "Cloudflare Pages",
      "EasySite Cloudflare",
      "엣지에 웹사이트 배포",
      "AI 웹사이트 빌더 Cloudflare",
      "무료 웹사이트 호스팅",
      "글로벌 CDN 웹사이트",
      "BYOK Cloudflare",
      "정적 사이트 호스팅",
    ],
    content: `
## Cloudflare Pages 통합 발표

EasySite가 이제 **Cloudflare Pages**와 직접 통합되었음을 기쁘게 알려드립니다 — 몇 번의 클릭만으로 AI로 생성한 웹사이트를 Cloudflare의 글로벌 엣지 네트워크에 배포할 수 있습니다.

이는 사이트가 더 빠르게 로드되고, 더 안정적이며, 커스텀 도메인을 사용할 수 있다는 것을 의미합니다 — 모두 무료입니다.

## 왜 Cloudflare Pages인가?

EasySite에서 사이트를 게시하면 데이터베이스에 저장되고 우리 인프라를 통해 제공됩니다. 이것도 잘 작동하지만, Cloudflare Pages는 한 단계 더 나아갑니다:

- **글로벌 엣지 네트워크** — 전 세계 300개 이상의 데이터 센터에 사이트가 캐시되어 방문자가 어디에 있든 빠른 로딩 시간을 제공합니다
- **무료 SSL** — HTTPS가 자동으로 활성화되며, 인증서 관리가 필요 없습니다
- **무제한 대역폭** — 무료 플랜에서도 트래픽 제한이 없습니다
- **커스텀 도메인** — Cloudflare를 통해 직접 자신만의 도메인 이름을 연결합니다
- **99.99% 가동률** — Cloudflare의 인프라는 실전에서 검증되었습니다

가장 좋은 점은 Cloudflare Pages가 대부분의 사용 사례에서 **무료**라는 것입니다. 자신의 Cloudflare 계정을 사용하고, 우리가 배포를 처리합니다.

## 사용 방법

### 1. Cloudflare 계정 연결

[프로필](/ko/profile) 페이지에서 Cloudflare API 토큰을 추가합니다. 한 번만 설정하면 됩니다.

**토큰 생성은 2분이면 됩니다:**
1. [Cloudflare API 토큰](https://dash.cloudflare.com/profile/api-tokens)으로 이동합니다
2. 다음 권한으로 커스텀 토큰을 생성합니다:
   - Account → **Cloudflare Pages** → Edit
   - Account → **Account Settings** → Read
3. 토큰을 EasySite 프로필에 붙여넣습니다

EasySite가 자동으로 계정을 감지합니다 — Account ID가 필요 없습니다.

### 2. 각 사이트를 프로젝트에 연결

[대시보드](/ko/dashboard)에서 각 사이트에 **"Cloudflare Pages에 연결"** 옵션이 있습니다. 다음을 할 수 있습니다:

- **기존 프로젝트 선택** — Cloudflare 계정에서 선택
- **새 프로젝트 생성** — EasySite에서 직접 생성, Cloudflare 대시보드를 방문할 필요 없음

각 사이트는 자체 Cloudflare Pages 프로젝트를 가지므로 별도의 도메인과 설정을 가질 수 있습니다.

### 3. 평소처럼 게시

사이트를 게시하면 EasySite가 자동으로:
1. 사이트를 데이터베이스에 저장합니다 (백업용)
2. 모든 파일을 Cloudflare Pages 프로젝트에 배포합니다
3. EasySite URL과 Cloudflare Pages URL을 모두 반환합니다

사이트가 몇 초 만에 Cloudflare의 엣지 네트워크에서 라이브됩니다.

## 자체 키 사용 (BYOK)

우리는 완전한 제어권을 드리는 것을 믿습니다. Cloudflare Pages 통합은 **BYOK (자체 키 사용)** 모델을 사용합니다:

- **Cloudflare 계정을 소유합니다** — 사이트가 자신의 인프라에 존재합니다
- **도메인을 소유합니다** — Cloudflare에서 직접 커스텀 도메인을 구성합니다
- **언제든지 떠날 수 있습니다** — 사이트는 Cloudflare 계정의 표준 HTML/CSS/JS 파일이며, 벤더 종속이 없습니다
- **우리 측에서 호스팅 비용 없음** — Cloudflare의 무료 티어는 대부분의 사이트에 충분히 넉넉합니다

이것은 자체 호스팅에 종속시키는 다른 웹사이트 빌더와 근본적으로 다릅니다. EasySite + Cloudflare를 사용하면 양쪽의 장점을 모두 얻을 수 있습니다: AI 기반 사이트 생성 + 자신이 제어하는 인프라.

## Cloudflare 무료 플랜에 포함된 내용

| 기능 | 무료 플랜 |
|------|-----------|
| 프로젝트 | 최대 100개 |
| 배포 | 무제한 |
| 대역폭 | 무제한 |
| SSL 인증서 | 무료, 자동 |
| 커스텀 도메인 | 포함 |
| DDoS 보호 | 포함 |
| 프로젝트당 파일 | 20,000 |

대부분의 웹사이트에 충분하고도 남습니다.

## 사이트별 유연성

일괄 적용 방식과 달리, 우리의 통합은 **사이트 수준**에서 작동합니다:

- **사이트 A** → \`my-portfolio\` 프로젝트에 연결 → \`portfolio.example.com\`
- **사이트 B** → \`my-blog\` 프로젝트에 연결 → \`blog.example.com\`
- **사이트 C** → Cloudflare 연결 없음 → EasySite에서 직접 제공

어떤 사이트를 Cloudflare에 배포하고 어떤 사이트를 플랫폼에 유지할지 선택합니다. 자유롭게 조합하세요.

## 사이트 내보내기

사이트를 다른 곳에서 호스팅하고 싶으신가요? EasySite의 모든 사이트는 HTML, CSS, JavaScript 파일이 모두 포함된 **ZIP 파일로 내보내기**할 수 있습니다. 콘텐츠가 절대 종속되지 않습니다.

## 시작하기

1. Cloudflare 계정이 없다면 [무료 계정 만들기](https://cloudflare.com)
2. EasySite 프로필에서 [API 토큰 연결](/ko/profile)
3. [대시보드](/ko/dashboard)로 가서 사이트를 Cloudflare Pages에 연결
4. 게시 — 사이트가 글로벌 엣지에서 라이브되는 것을 확인하세요

전체 설정 과정은 5분도 걸리지 않습니다.

## 다음 계획

Cloudflare 통합을 계속 개선하고 있습니다:

- **자동 커스텀 도메인 설정** — EasySite를 떠나지 않고 도메인 구성
- **배포 미리보기** — 라이브 전에 변경 사항 미리보기
- **분석 통합** — EasySite 대시보드에서 Cloudflare 분석 확인
- **Cloudflare에서 가져오기** — 기존 Cloudflare Pages 사이트를 EasySite로 가져와 AI로 편집

---

AI로 생성한 웹사이트를 엣지에 배포할 준비가 되셨나요? [프로필로 이동](/ko/profile)하여 Cloudflare를 연결하거나, [새 사이트 만들기](/ko/editor)로 시작하세요.
`,
  },
};

export default article;
