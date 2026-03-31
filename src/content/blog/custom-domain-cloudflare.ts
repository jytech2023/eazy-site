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
  es: {
    title: "Cómo apuntar un dominio personalizado a tu sitio web de EasySite usando Cloudflare",
    description:
      "Guía paso a paso para conectar tu propio nombre de dominio a tu sitio web generado con IA en EasySite usando Cloudflare DNS. SSL gratuito incluido.",
    keywords: [
      "dominio personalizado",
      "Cloudflare DNS",
      "dominio personalizado EasySite",
      "conectar dominio a sitio web",
      "SSL gratuito",
      "constructor de sitios web con IA",
      "guía de configuración de dominio",
    ],
    content: `
## ¿Por qué usar un dominio personalizado?

Cuando publicas un sitio en EasySite, obtienes una URL como \`easysite.jytech.us/s/yourname/my-site\`. Esto funciona bien para compartir, pero si estás construyendo un negocio, portafolio o marca, tener tu propio dominio (como \`www.minegocio.com\`) hace una gran diferencia:

- **Apariencia profesional** — un dominio personalizado genera confianza en los visitantes
- **Mejor SEO** — los motores de búsqueda favorecen los sitios con su propio dominio
- **Identidad de marca** — tu dominio es parte de tu marca
- **Portabilidad** — eres dueño del dominio sin importar la plataforma de alojamiento

## Lo que necesitarás

Antes de comenzar, asegúrate de tener:

1. **Un sitio publicado en EasySite** — [crea uno gratis](/es/editor) si aún no lo has hecho
2. **Un nombre de dominio** — puedes comprar uno en registradores como Namecheap, Google Domains, GoDaddy o Cloudflare Registrar
3. **Una cuenta de Cloudflare** — [regístrate gratis en cloudflare.com](https://cloudflare.com)

## Paso 1: Agrega tu dominio a Cloudflare

Si tu dominio aún no está en Cloudflare, necesitarás agregarlo:

1. Inicia sesión en tu [panel de Cloudflare](https://dash.cloudflare.com)
2. Haz clic en **"Agregar un sitio"** e ingresa tu nombre de dominio (por ejemplo, \`minegocio.com\`)
3. Selecciona el **plan gratuito** — incluye todo lo que necesitas
4. Cloudflare escaneará tus registros DNS existentes. Revísalos y haz clic en **Continuar**
5. Cloudflare te dará dos **servidores de nombres** (por ejemplo, \`anna.ns.cloudflare.com\`)
6. Ve a tu registrador de dominios y **actualiza los servidores de nombres** a los que proporcionó Cloudflare
7. Espera la propagación — generalmente toma unos minutos, pero puede tardar hasta 24 horas

Una vez que tu dominio aparezca como **"Activo"** en Cloudflare, estás listo para el siguiente paso.

## Paso 2: Configura los registros DNS

Ahora necesitas apuntar tu dominio a tu EasySite. En el panel de Cloudflare:

1. Ve a **DNS > Registros** de tu dominio
2. Haz clic en **Agregar registro**
3. Agrega el siguiente registro:

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| CNAME | \`www\` | \`easysite.jytech.us\` | Proxied (nube naranja) |

Si quieres que el dominio raíz (\`minegocio.com\` sin \`www\`) también funcione:

| Tipo | Nombre | Contenido | Proxy |
|------|--------|-----------|-------|
| CNAME | \`@\` | \`easysite.jytech.us\` | Proxied (nube naranja) |

> **Consejo:** La función de "aplanamiento de CNAME" de Cloudflare te permite usar un registro CNAME en el dominio raíz, lo cual normalmente no está permitido por los estándares DNS. Esta es una característica específica de Cloudflare y funciona automáticamente.

## Paso 3: Habilita SSL/TLS gratuito

Uno de los mayores beneficios de usar Cloudflare es el **certificado SSL gratuito**. Tus visitantes verán el ícono de candado seguro en su navegador.

1. En tu panel de Cloudflare, ve a **SSL/TLS > Descripción general**
2. Establece el modo de encriptación en **"Completo"** o **"Completo (Estricto)"**
3. Eso es todo — Cloudflare aprovisiona y renueva automáticamente los certificados SSL para tu dominio

Tu sitio será accesible a través de \`https://\` automáticamente. No se requiere gestión de certificados.

## Paso 4: Conecta tu dominio en EasySite

Una vez que tu DNS esté configurado:

1. Inicia sesión en tu [panel de EasySite](/es/dashboard)
2. Encuentra el sitio que deseas conectar
3. Ve a **Configuración del sitio > Dominio personalizado**
4. Ingresa tu nombre de dominio (por ejemplo, \`www.minegocio.com\`)
5. Haz clic en **Verificar y conectar**

EasySite verificará que tus registros DNS apunten correctamente a nuestros servidores y activará el dominio personalizado.

## Paso 5: Configura redirecciones (opcional pero recomendado)

Probablemente querrás que tanto \`minegocio.com\` como \`www.minegocio.com\` funcionen. Puedes configurar una redirección para que uno siempre apunte al otro:

1. En Cloudflare, ve a **Reglas > Reglas de redirección**
2. Crea una nueva regla:
   - **Si** el nombre de host es igual a \`minegocio.com\`
   - **Entonces** redirigir a \`https://www.minegocio.com\` con código de estado **301**

Esto asegura que los visitantes siempre lleguen a la misma URL, lo cual también es mejor para el SEO.

## Solución de problemas comunes

### "DNS aún no propagado"
Los cambios de DNS pueden tardar hasta 24 horas en propagarse a nivel mundial. Si tu dominio no funciona inmediatamente, espera unas horas e intenta de nuevo.

### "Certificado SSL pendiente"
Cloudflare generalmente aprovisiona certificados SSL en minutos, pero puede tardar hasta 24 horas. Asegúrate de que tu dominio aparezca como **"Activo"** en Cloudflare.

### "Demasiadas redirecciones"
Esto generalmente ocurre cuando el modo SSL está configurado en "Flexible" en lugar de "Completo". Ve a **SSL/TLS > Descripción general** y configúralo en **"Completo"** o **"Completo (Estricto)"**.

### "El sitio no carga en el dominio personalizado"
Verifica que:
- Tu registro CNAME apunte a \`easysite.jytech.us\`
- El estado del proxy sea **"Proxied"** (nube naranja), no "Solo DNS"
- Hayas conectado el dominio en tu panel de EasySite

## Beneficios de usar Cloudflare

Más allá del DNS, Cloudflare te ofrece varias funciones gratuitas:

- **CDN** — tu sitio se almacena en caché en más de 300 centros de datos en todo el mundo, haciéndolo más rápido para visitantes de cualquier lugar
- **Protección DDoS** — protección automática contra ataques
- **Analítica web** — análisis básico de tráfico sin scripts de seguimiento
- **Reglas de página** — redirecciones de URL, reglas de caché y más
- **Protección contra bots** — bloquea bots maliciosos de tu sitio

## Resumen

Configurar un dominio personalizado con Cloudflare es sencillo:

1. Agrega tu dominio a Cloudflare
2. Apunta tu DNS (CNAME) a EasySite
3. SSL es automático y gratuito
4. Conecta el dominio en tu panel de EasySite
5. Opcionalmente configura redirecciones www/sin www

Todo el proceso toma aproximadamente 10 minutos de trabajo activo, más algo de tiempo de espera para la propagación DNS. Una vez configurado, tu sitio web generado con IA estará en vivo en tu propio dominio profesional — con SSL gratuito, CDN y protección DDoS incluidos.

---

¿Listo para crear tu sitio web? [Comienza a crear con IA gratis](/es/editor) y conecta tu dominio personalizado hoy.
`,
  },
  ko: {
    title: "Cloudflare를 사용하여 EasySite 웹사이트에 커스텀 도메인을 연결하는 방법",
    description:
      "Cloudflare DNS를 사용하여 EasySite의 AI 생성 웹사이트에 자신만의 도메인 이름을 연결하는 단계별 가이드. 무료 SSL 포함.",
    keywords: [
      "커스텀 도메인",
      "Cloudflare DNS",
      "EasySite 커스텀 도메인",
      "도메인 웹사이트 연결",
      "무료 SSL",
      "AI 웹사이트 빌더",
      "도메인 설정 가이드",
    ],
    content: `
## 왜 커스텀 도메인을 사용해야 할까요?

EasySite에서 사이트를 게시하면 \`easysite.jytech.us/s/yourname/my-site\`와 같은 URL을 받게 됩니다. 공유하기에는 충분하지만, 비즈니스, 포트폴리오 또는 브랜드를 구축하는 경우 자신만의 도메인(예: \`www.mybusiness.com\`)을 갖는 것이 큰 차이를 만듭니다:

- **전문적인 외관** — 커스텀 도메인은 방문자의 신뢰를 구축합니다
- **더 나은 SEO** — 검색 엔진은 자체 도메인을 가진 사이트를 선호합니다
- **브랜드 아이덴티티** — 도메인은 브랜드의 일부입니다
- **이식성** — 호스팅 플랫폼에 관계없이 도메인을 소유합니다

## 준비물

시작하기 전에 다음을 준비하세요:

1. **EasySite에 게시된 사이트** — 아직 없다면 [무료로 만들기](/ko/editor)
2. **도메인 이름** — Namecheap, Google Domains, GoDaddy 또는 Cloudflare Registrar 등의 등록기관에서 구매할 수 있습니다
3. **Cloudflare 계정** — [cloudflare.com에서 무료 가입](https://cloudflare.com)

## 1단계: Cloudflare에 도메인 추가

도메인이 아직 Cloudflare에 없다면 추가해야 합니다:

1. [Cloudflare 대시보드](https://dash.cloudflare.com)에 로그인합니다
2. **"사이트 추가"**를 클릭하고 도메인 이름을 입력합니다 (예: \`mybusiness.com\`)
3. **무료 플랜**을 선택합니다 — 필요한 모든 것이 포함되어 있습니다
4. Cloudflare가 기존 DNS 레코드를 스캔합니다. 확인 후 **계속**을 클릭합니다
5. Cloudflare가 두 개의 **네임서버**를 제공합니다 (예: \`anna.ns.cloudflare.com\`)
6. 도메인 등록기관으로 가서 Cloudflare가 제공한 네임서버로 **네임서버를 업데이트**합니다
7. 전파를 기다립니다 — 보통 몇 분이면 되지만 최대 24시간이 걸릴 수 있습니다

도메인이 Cloudflare에서 **"활성"**으로 표시되면 다음 단계를 진행할 수 있습니다.

## 2단계: DNS 레코드 구성

이제 도메인을 EasySite로 연결해야 합니다. Cloudflare 대시보드에서:

1. 도메인의 **DNS > 레코드**로 이동합니다
2. **레코드 추가**를 클릭합니다
3. 다음 레코드를 추가합니다:

| 유형 | 이름 | 내용 | 프록시 |
|------|------|------|--------|
| CNAME | \`www\` | \`easysite.jytech.us\` | 프록시됨 (주황색 구름) |

루트 도메인(\`www\` 없이 \`mybusiness.com\`)도 작동하게 하려면:

| 유형 | 이름 | 내용 | 프록시 |
|------|------|------|--------|
| CNAME | \`@\` | \`easysite.jytech.us\` | 프록시됨 (주황색 구름) |

> **팁:** Cloudflare의 "CNAME 플래트닝" 기능을 사용하면 루트 도메인에 CNAME 레코드를 사용할 수 있습니다. 이는 일반적으로 DNS 표준에서 허용되지 않지만 Cloudflare 고유의 기능으로 자동으로 작동합니다.

## 3단계: 무료 SSL/TLS 활성화

Cloudflare를 사용하는 가장 큰 이점 중 하나는 **무료 SSL 인증서**입니다. 방문자는 브라우저에서 보안 잠금 아이콘을 볼 수 있습니다.

1. Cloudflare 대시보드에서 **SSL/TLS > 개요**로 이동합니다
2. 암호화 모드를 **"전체"** 또는 **"전체 (엄격)"**으로 설정합니다
3. 끝입니다 — Cloudflare가 도메인의 SSL 인증서를 자동으로 프로비저닝하고 갱신합니다

사이트는 자동으로 \`https://\`를 통해 접근할 수 있습니다. 인증서 관리가 필요 없습니다.

## 4단계: EasySite에서 도메인 연결

DNS 설정이 완료되면:

1. [EasySite 대시보드](/ko/dashboard)에 로그인합니다
2. 연결하려는 사이트를 찾습니다
3. **사이트 설정 > 커스텀 도메인**으로 이동합니다
4. 도메인 이름을 입력합니다 (예: \`www.mybusiness.com\`)
5. **확인 및 연결**을 클릭합니다

EasySite가 DNS 레코드가 올바르게 서버를 가리키고 있는지 확인하고 커스텀 도메인을 활성화합니다.

## 5단계: 리디렉션 설정 (선택 사항이지만 권장)

\`mybusiness.com\`과 \`www.mybusiness.com\` 모두 작동하기를 원할 것입니다. 하나가 항상 다른 하나로 연결되도록 리디렉션을 설정할 수 있습니다:

1. Cloudflare에서 **규칙 > 리디렉션 규칙**으로 이동합니다
2. 새 규칙을 만듭니다:
   - **만약** 호스트 이름이 \`mybusiness.com\`과 같으면
   - **그러면** 상태 코드 **301**로 \`https://www.mybusiness.com\`으로 리디렉션

이렇게 하면 방문자가 항상 동일한 URL에 도달하게 되며, SEO에도 더 좋습니다.

## 일반적인 문제 해결

### "DNS가 아직 전파되지 않음"
DNS 변경 사항이 전 세계적으로 전파되는 데 최대 24시간이 걸릴 수 있습니다. 도메인이 즉시 작동하지 않으면 몇 시간 기다린 후 다시 시도하세요.

### "SSL 인증서 대기 중"
Cloudflare는 보통 몇 분 이내에 SSL 인증서를 프로비저닝하지만 최대 24시간이 걸릴 수 있습니다. 도메인이 Cloudflare에서 **"활성"**으로 표시되는지 확인하세요.

### "너무 많은 리디렉션"
이는 보통 SSL 모드가 "전체" 대신 "유연"으로 설정되어 있을 때 발생합니다. **SSL/TLS > 개요**로 이동하여 **"전체"** 또는 **"전체 (엄격)"**으로 설정하세요.

### "커스텀 도메인에서 사이트가 로드되지 않음"
다음을 확인하세요:
- CNAME 레코드가 \`easysite.jytech.us\`를 가리키는지
- 프록시 상태가 "DNS만"이 아닌 **"프록시됨"** (주황색 구름)인지
- EasySite 대시보드에서 도메인을 연결했는지

## Cloudflare 사용의 이점

DNS 외에도 Cloudflare는 여러 무료 기능을 제공합니다:

- **CDN** — 사이트가 전 세계 300개 이상의 데이터 센터에 캐시되어 어디서든 빠르게 로드됩니다
- **DDoS 보호** — 공격에 대한 자동 보호
- **웹 분석** — 추적 스크립트 없이 기본 트래픽 분석
- **페이지 규칙** — URL 리디렉션, 캐싱 규칙 등
- **봇 보호** — 악성 봇이 사이트에 접근하는 것을 차단

## 요약

Cloudflare로 커스텀 도메인을 설정하는 것은 간단합니다:

1. Cloudflare에 도메인 추가
2. DNS (CNAME)를 EasySite로 연결
3. SSL은 자동이며 무료
4. EasySite 대시보드에서 도메인 연결
5. 선택적으로 www/비www 리디렉션 설정

전체 과정은 약 10분의 작업 시간과 DNS 전파를 위한 약간의 대기 시간이 필요합니다. 설정이 완료되면, AI로 생성된 웹사이트가 자신만의 전문 도메인에서 운영됩니다 — 무료 SSL, CDN, DDoS 보호가 포함됩니다.

---

웹사이트를 만들 준비가 되셨나요? [무료로 AI 만들기 시작](/ko/editor)하고 오늘 커스텀 도메인을 연결하세요.
`,
  },
};

export default article;
