import { hasLocale, type Locale } from "@/lib/i18n";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const content = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: March 31, 2026",
    sections: [
      {
        heading: "1. Introduction",
        body: "JY Tech LLC (\"we\", \"us\", \"our\") operates EasySite. This Privacy Policy explains how we collect, use, and protect your personal information when you use our Service.",
      },
      {
        heading: "2. Information We Collect",
        body: "We collect information you provide directly: account information (name, email, profile picture) via Auth0 authentication; website content you create; and payment information processed by Stripe. We also collect usage data automatically: IP address, browser type, pages visited, and interaction patterns to improve the Service.",
      },
      {
        heading: "3. How We Use Your Information",
        body: "We use your information to: provide and maintain the Service; process payments and manage subscriptions; send important service notifications; improve and personalize your experience; comply with legal obligations; and prevent abuse of the Service.",
      },
      {
        heading: "4. AI Processing",
        body: "When you use the AI site builder, your prompts are sent to third-party AI providers (via OpenRouter) to generate website content. We do not use your prompts or generated content to train AI models. The AI providers may process your data according to their own privacy policies.",
      },
      {
        heading: "5. Third-Party Services",
        body: "We use the following third-party services that may process your data: Auth0 for authentication; Stripe for payment processing; Cloudflare for website hosting and CDN (when you connect your Cloudflare account); OpenRouter for AI model access; and Neon for database hosting. Each service has its own privacy policy governing data processing.",
      },
      {
        heading: "6. BYOK (Bring Your Own Key)",
        body: "When you provide your own Cloudflare API token, it is stored encrypted in our database. We only use it to deploy your sites to your Cloudflare account. You can disconnect and delete your credentials at any time from your profile settings.",
      },
      {
        heading: "7. Data Storage and Security",
        body: "Your data is stored in secure cloud databases (Neon PostgreSQL). We use HTTPS encryption for all data transmission. Website content is stored in our database and optionally deployed to your Cloudflare account. We implement industry-standard security measures to protect your data.",
      },
      {
        heading: "8. Data Retention",
        body: "We retain your account data and website content for as long as your account is active. You can delete your sites at any time from the dashboard. If you delete your account, we will remove your personal data within 30 days, except where retention is required by law.",
      },
      {
        heading: "9. Your Rights",
        body: "You have the right to: access your personal data; export your website content as ZIP files; correct inaccurate data; delete your account and data; and opt out of non-essential communications. To exercise these rights, contact us at support@jytech.us.",
      },
      {
        heading: "10. Cookies",
        body: "We use essential cookies for authentication and session management. We do not use third-party tracking cookies or advertising cookies. Cloudflare may set cookies for security and performance purposes when your sites are deployed there.",
      },
      {
        heading: "11. Children's Privacy",
        body: "The Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will promptly delete it.",
      },
      {
        heading: "12. International Data Transfers",
        body: "Your data may be transferred to and processed in the United States and other countries where our service providers operate. By using the Service, you consent to such transfers.",
      },
      {
        heading: "13. Changes to This Policy",
        body: "We may update this Privacy Policy from time to time. We will notify you of material changes via email or through the Service. The updated policy will be effective upon posting.",
      },
      {
        heading: "14. Contact Us",
        body: "For questions about this Privacy Policy or to exercise your data rights, contact us at support@jytech.us.",
      },
    ],
  },
  zh: {
    title: "隐私政策",
    lastUpdated: "最后更新：2026 年 3 月 31 日",
    sections: [
      {
        heading: "1. 引言",
        body: "JY Tech LLC（\"我们\"）运营 EasySite。本隐私政策说明了我们在你使用服务时如何收集、使用和保护你的个人信息。",
      },
      {
        heading: "2. 我们收集的信息",
        body: "我们收集你直接提供的信息：通过 Auth0 认证的账户信息（姓名、邮箱、头像）；你创建的网站内容；由 Stripe 处理的支付信息。我们还自动收集使用数据：IP 地址、浏览器类型、访问页面和交互模式，以改进服务。",
      },
      {
        heading: "3. 我们如何使用你的信息",
        body: "我们使用你的信息来：提供和维护服务；处理付款和管理订阅；发送重要的服务通知；改进和个性化你的体验；遵守法律义务；防止服务被滥用。",
      },
      {
        heading: "4. AI 处理",
        body: "当你使用 AI 建站工具时，你的提示词会被发送到第三方 AI 提供商（通过 OpenRouter）以生成网站内容。我们不使用你的提示词或生成的内容来训练 AI 模型。AI 提供商可能根据其自身的隐私政策处理你的数据。",
      },
      {
        heading: "5. 第三方服务",
        body: "我们使用以下可能处理你数据的第三方服务：Auth0 用于身份认证；Stripe 用于支付处理；Cloudflare 用于网站托管和 CDN（当你连接 Cloudflare 账户时）；OpenRouter 用于 AI 模型访问；Neon 用于数据库托管。每项服务都有其自身的隐私政策来管理数据处理。",
      },
      {
        heading: "6. BYOK（自带密钥）",
        body: "当你提供自己的 Cloudflare API 令牌时，它会加密存储在我们的数据库中。我们仅使用它将你的网站部署到你的 Cloudflare 账户。你可以随时在个人设置中断开连接并删除你的凭证。",
      },
      {
        heading: "7. 数据存储和安全",
        body: "你的数据存储在安全的云数据库（Neon PostgreSQL）中。我们对所有数据传输使用 HTTPS 加密。网站内容存储在我们的数据库中，并可选择性地部署到你的 Cloudflare 账户。我们实施行业标准的安全措施来保护你的数据。",
      },
      {
        heading: "8. 数据保留",
        body: "只要你的账户处于活跃状态，我们就会保留你的账户数据和网站内容。你可以随时从控制面板删除你的网站。如果你删除账户，我们将在 30 天内删除你的个人数据，法律要求保留的除外。",
      },
      {
        heading: "9. 你的权利",
        body: "你有权：访问你的个人数据；将网站内容导出为 ZIP 文件；更正不准确的数据；删除你的账户和数据；退出非必要的通信。如需行使这些权利，请联系 support@jytech.us。",
      },
      {
        heading: "10. Cookie",
        body: "我们使用必要的 Cookie 进行身份认证和会话管理。我们不使用第三方追踪 Cookie 或广告 Cookie。当你的网站部署在 Cloudflare 上时，Cloudflare 可能会出于安全和性能目的设置 Cookie。",
      },
      {
        heading: "11. 儿童隐私",
        body: "本服务不面向 13 岁以下的儿童。我们不会故意收集 13 岁以下儿童的个人信息。如果我们发现 13 岁以下的儿童向我们提供了个人信息，我们将立即删除。",
      },
      {
        heading: "12. 国际数据传输",
        body: "你的数据可能被传输到美国和我们服务提供商运营的其他国家进行处理。使用本服务即表示你同意此类传输。",
      },
      {
        heading: "13. 政策变更",
        body: "我们可能会不时更新本隐私政策。重大变更将通过电子邮件或服务通知你。更新后的政策在发布后生效。",
      },
      {
        heading: "14. 联系我们",
        body: "如有关于本隐私政策的问题或行使数据权利，请联系 support@jytech.us。",
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(locale)) return {};
  const loc = locale as Locale;
  return {
    title: content[loc].title,
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();
  const loc = locale as Locale;
  const t = content[loc];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-24">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">{t.title}</h1>
      <p className="text-sm text-muted mb-10">{t.lastUpdated}</p>
      <div className="space-y-8">
        {t.sections.map((s) => (
          <section key={s.heading}>
            <h2 className="text-lg font-semibold mb-2">{s.heading}</h2>
            <p className="text-muted leading-relaxed">{s.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
