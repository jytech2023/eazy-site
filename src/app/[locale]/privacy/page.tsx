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
  es: {
    title: "Política de Privacidad",
    lastUpdated: "Última actualización: 31 de marzo de 2026",
    sections: [
      {
        heading: "1. Introducción",
        body: "JY Tech LLC (\"nosotros\", \"nuestro\") opera EasySite. Esta Política de Privacidad explica cómo recopilamos, usamos y protegemos su información personal cuando utiliza nuestro Servicio.",
      },
      {
        heading: "2. Información que Recopilamos",
        body: "Recopilamos la información que usted proporciona directamente: información de cuenta (nombre, correo electrónico, foto de perfil) a través de la autenticación de Auth0; contenido del sitio web que usted crea; e información de pago procesada por Stripe. También recopilamos datos de uso automáticamente: dirección IP, tipo de navegador, páginas visitadas y patrones de interacción para mejorar el Servicio.",
      },
      {
        heading: "3. Cómo Usamos Su Información",
        body: "Usamos su información para: proporcionar y mantener el Servicio; procesar pagos y administrar suscripciones; enviar notificaciones importantes del servicio; mejorar y personalizar su experiencia; cumplir con obligaciones legales; y prevenir el abuso del Servicio.",
      },
      {
        heading: "4. Procesamiento de IA",
        body: "Cuando utiliza el constructor de sitios con IA, sus indicaciones se envían a proveedores de IA de terceros (a través de OpenRouter) para generar contenido del sitio web. No utilizamos sus indicaciones ni el contenido generado para entrenar modelos de IA. Los proveedores de IA pueden procesar sus datos de acuerdo con sus propias políticas de privacidad.",
      },
      {
        heading: "5. Servicios de Terceros",
        body: "Utilizamos los siguientes servicios de terceros que pueden procesar sus datos: Auth0 para autenticación; Stripe para procesamiento de pagos; Cloudflare para alojamiento web y CDN (cuando conecta su cuenta de Cloudflare); OpenRouter para acceso a modelos de IA; y Neon para alojamiento de bases de datos. Cada servicio tiene su propia política de privacidad que rige el procesamiento de datos.",
      },
      {
        heading: "6. BYOK (Traiga Su Propia Clave)",
        body: "Cuando proporciona su propio token de API de Cloudflare, se almacena cifrado en nuestra base de datos. Solo lo usamos para implementar sus sitios en su cuenta de Cloudflare. Puede desconectar y eliminar sus credenciales en cualquier momento desde la configuración de su perfil.",
      },
      {
        heading: "7. Almacenamiento y Seguridad de Datos",
        body: "Sus datos se almacenan en bases de datos en la nube seguras (Neon PostgreSQL). Usamos cifrado HTTPS para toda la transmisión de datos. El contenido del sitio web se almacena en nuestra base de datos y opcionalmente se implementa en su cuenta de Cloudflare. Implementamos medidas de seguridad estándar de la industria para proteger sus datos.",
      },
      {
        heading: "8. Retención de Datos",
        body: "Conservamos los datos de su cuenta y el contenido del sitio web mientras su cuenta esté activa. Puede eliminar sus sitios en cualquier momento desde el panel de control. Si elimina su cuenta, eliminaremos sus datos personales dentro de 30 días, excepto cuando la ley requiera su retención.",
      },
      {
        heading: "9. Sus Derechos",
        body: "Usted tiene derecho a: acceder a sus datos personales; exportar el contenido de su sitio web como archivos ZIP; corregir datos inexactos; eliminar su cuenta y datos; y optar por no recibir comunicaciones no esenciales. Para ejercer estos derechos, contáctenos en support@jytech.us.",
      },
      {
        heading: "10. Cookies",
        body: "Usamos cookies esenciales para autenticación y gestión de sesiones. No usamos cookies de seguimiento de terceros ni cookies publicitarias. Cloudflare puede establecer cookies con fines de seguridad y rendimiento cuando sus sitios se implementan allí.",
      },
      {
        heading: "11. Privacidad de los Niños",
        body: "El Servicio no está destinado a niños menores de 13 años. No recopilamos conscientemente información personal de niños menores de 13 años. Si descubrimos que un niño menor de 13 años nos ha proporcionado información personal, la eliminaremos de inmediato.",
      },
      {
        heading: "12. Transferencias Internacionales de Datos",
        body: "Sus datos pueden ser transferidos y procesados en Estados Unidos y otros países donde operan nuestros proveedores de servicios. Al usar el Servicio, usted consiente dichas transferencias.",
      },
      {
        heading: "13. Cambios en Esta Política",
        body: "Podemos actualizar esta Política de Privacidad de vez en cuando. Le notificaremos sobre cambios importantes por correo electrónico o a través del Servicio. La política actualizada entrará en vigor una vez publicada.",
      },
      {
        heading: "14. Contáctenos",
        body: "Para preguntas sobre esta Política de Privacidad o para ejercer sus derechos sobre sus datos, contáctenos en support@jytech.us.",
      },
    ],
  },
  ko: {
    title: "개인정보 처리방침",
    lastUpdated: "최종 업데이트: 2026년 3월 31일",
    sections: [
      {
        heading: "1. 소개",
        body: "JY Tech LLC(\"당사\")는 EasySite를 운영합니다. 본 개인정보 처리방침은 귀하가 당사 서비스를 사용할 때 개인정보를 어떻게 수집, 사용 및 보호하는지 설명합니다.",
      },
      {
        heading: "2. 수집하는 정보",
        body: "당사는 귀하가 직접 제공하는 정보를 수집합니다: Auth0 인증을 통한 계정 정보(이름, 이메일, 프로필 사진); 귀하가 만든 웹사이트 콘텐츠; Stripe에서 처리하는 결제 정보. 또한 서비스 개선을 위해 사용 데이터를 자동으로 수집합니다: IP 주소, 브라우저 유형, 방문 페이지 및 상호 작용 패턴.",
      },
      {
        heading: "3. 정보 사용 방법",
        body: "당사는 귀하의 정보를 다음 목적으로 사용합니다: 서비스 제공 및 유지; 결제 처리 및 구독 관리; 중요한 서비스 알림 전송; 경험 개선 및 개인화; 법적 의무 준수; 서비스 남용 방지.",
      },
      {
        heading: "4. AI 처리",
        body: "AI 사이트 빌더를 사용할 때 귀하의 프롬프트는 웹사이트 콘텐츠를 생성하기 위해 제3자 AI 제공업체(OpenRouter를 통해)로 전송됩니다. 당사는 귀하의 프롬프트나 생성된 콘텐츠를 AI 모델 훈련에 사용하지 않습니다. AI 제공업체는 자체 개인정보 처리방침에 따라 귀하의 데이터를 처리할 수 있습니다.",
      },
      {
        heading: "5. 제3자 서비스",
        body: "당사는 귀하의 데이터를 처리할 수 있는 다음 제3자 서비스를 사용합니다: 인증을 위한 Auth0; 결제 처리를 위한 Stripe; 웹사이트 호스팅 및 CDN을 위한 Cloudflare(Cloudflare 계정 연결 시); AI 모델 접근을 위한 OpenRouter; 데이터베이스 호스팅을 위한 Neon. 각 서비스에는 데이터 처리를 관리하는 자체 개인정보 처리방침이 있습니다.",
      },
      {
        heading: "6. BYOK(자체 키 사용)",
        body: "자체 Cloudflare API 토큰을 제공하면 당사 데이터베이스에 암호화되어 저장됩니다. 귀하의 Cloudflare 계정에 사이트를 배포하는 데만 사용합니다. 프로필 설정에서 언제든지 연결을 해제하고 자격 증명을 삭제할 수 있습니다.",
      },
      {
        heading: "7. 데이터 저장 및 보안",
        body: "귀하의 데이터는 안전한 클라우드 데이터베이스(Neon PostgreSQL)에 저장됩니다. 모든 데이터 전송에 HTTPS 암호화를 사용합니다. 웹사이트 콘텐츠는 당사 데이터베이스에 저장되며 선택적으로 귀하의 Cloudflare 계정에 배포됩니다. 당사는 귀하의 데이터를 보호하기 위해 업계 표준 보안 조치를 시행합니다.",
      },
      {
        heading: "8. 데이터 보유",
        body: "계정이 활성 상태인 동안 계정 데이터와 웹사이트 콘텐츠를 보유합니다. 대시보드에서 언제든지 사이트를 삭제할 수 있습니다. 계정을 삭제하면 법률에 의해 보유가 요구되는 경우를 제외하고 30일 이내에 개인 데이터를 삭제합니다.",
      },
      {
        heading: "9. 귀하의 권리",
        body: "귀하는 다음과 같은 권리가 있습니다: 개인 데이터에 접근; 웹사이트 콘텐츠를 ZIP 파일로 내보내기; 부정확한 데이터 수정; 계정 및 데이터 삭제; 비필수 커뮤니케이션 수신 거부. 이러한 권리를 행사하려면 support@jytech.us로 문의하십시오.",
      },
      {
        heading: "10. 쿠키",
        body: "당사는 인증 및 세션 관리를 위한 필수 쿠키를 사용합니다. 제3자 추적 쿠키나 광고 쿠키는 사용하지 않습니다. 사이트가 Cloudflare에 배포된 경우 Cloudflare는 보안 및 성능 목적으로 쿠키를 설정할 수 있습니다.",
      },
      {
        heading: "11. 아동 개인정보",
        body: "본 서비스는 13세 미만 아동을 대상으로 하지 않습니다. 당사는 13세 미만 아동의 개인정보를 고의로 수집하지 않습니다. 13세 미만 아동이 개인정보를 제공한 사실을 발견하면 즉시 삭제합니다.",
      },
      {
        heading: "12. 국제 데이터 전송",
        body: "귀하의 데이터는 미국 및 서비스 제공업체가 운영하는 기타 국가로 전송되어 처리될 수 있습니다. 서비스를 사용함으로써 귀하는 이러한 전송에 동의합니다.",
      },
      {
        heading: "13. 정책 변경",
        body: "당사는 수시로 본 개인정보 처리방침을 업데이트할 수 있습니다. 중요한 변경 사항은 이메일 또는 서비스를 통해 통지합니다. 업데이트된 정책은 게시 후 효력이 발생합니다.",
      },
      {
        heading: "14. 문의하기",
        body: "본 개인정보 처리방침에 관한 질문이나 데이터 권리 행사는 support@jytech.us로 문의하십시오.",
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
