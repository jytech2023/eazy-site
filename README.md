# EasySite

AI-powered website builder by [JY Tech](https://jytech.us). Describe what you want, and AI creates a beautiful static website for you. No coding required.

## Features

- **AI Site Builder** — Generate multi-file HTML/CSS/JS websites from natural language prompts
- **Live Preview & Code Editor** — Preview your site in real-time and edit the code directly
- **Cloudflare Pages Integration** — Deploy sites to Cloudflare's global edge network (BYOK)
- **GitHub Import** — Import existing repos as sites via OAuth, then enhance with AI
- **Export as ZIP** — Download your site files anytime, no vendor lock-in
- **Custom Domains** — Attach your own domain via Cloudflare Pages
- **Multi-language** — English and Chinese (i18n with URL-based locale switching)
- **Dark/Light Mode** — Theme toggle with localStorage persistence
- **Blog** — SEO-optimized blog with markdown rendering and structured data
- **Subscription Plans** — Free (100 sites), Pro, Unlimited via Stripe

## Tech Stack

- **Framework**: Next.js 16 (App Router, React 19)
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Auth**: Auth0
- **AI**: OpenRouter (Claude, GPT-4o, Gemini, Llama, etc.)
- **Payments**: Stripe
- **Styling**: Tailwind CSS v4
- **Hosting**: Cloudflare Pages (user sites) + deployment platform of choice (app)

## Getting Started

### Prerequisites

- Node.js 20+
- A Neon PostgreSQL database
- Auth0 application
- OpenRouter API key

### Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
# Database
DATABASE_URL=postgresql://...
DATABASE_URL_UNPOOLED=postgresql://...

# Auth0
AUTH0_SECRET=
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=

# AI
OPENROUTER_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# GitHub OAuth (optional)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# App
APP_BASE_URL=http://localhost:3000
```

### Install & Run

```bash
npm install

# Push database schema
npx dotenv-cli -e .env.local -- npx drizzle-kit push --force

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Management

```bash
# Push schema changes
npx dotenv-cli -e .env.local -- npx drizzle-kit push --force

# Open Drizzle Studio
npx dotenv-cli -e .env.local -- npx drizzle-kit studio

# Migrate filesystem sites to database
npx tsx scripts/migrate-fs-to-db.ts
```

## Project Structure

```text
src/
  app/
    [locale]/           # i18n routes (en, zh)
      blog/             # Blog index + articles
      dashboard/        # User's sites management
      editor/           # AI site builder + code editor
      pricing/          # Subscription plans
      profile/          # User settings, integrations
      privacy/          # Privacy policy
      terms/            # Terms of service
      stats/            # Platform usage statistics
    api/
      chat/             # AI streaming (OpenRouter)
      publish/          # Save to DB + deploy to Cloudflare Pages
      sites/            # CRUD for user sites
      cloudflare/       # Cloudflare token + project management
      github/           # GitHub OAuth + repo listing
      import/github/    # Import repo as site
      stats/            # Usage statistics
      stripe/           # Checkout + webhooks
  components/           # React components
  content/blog/         # Blog articles (TypeScript, EN + ZH)
  lib/
    schema.ts           # Drizzle ORM schema
    db.ts               # Database connection
    i18n.ts             # Locale config
    dictionaries/       # Translation files
    stripe.ts           # Plans + Stripe config
    cloudflare-pages.ts # Cloudflare Pages deploy
    export-site.ts      # ZIP export utility
    models.ts           # AI model definitions
```

## Integrations

### Cloudflare Pages (BYOK)

Users bring their own Cloudflare API token. Per-site project connection — each site can deploy to its own Cloudflare Pages project with custom domains.

**Required token permissions**: Account > Cloudflare Pages: Edit, Account > Account Settings: Read

### GitHub Import

OAuth-based GitHub connection. Users authorize EasySite to read repos, browse their repositories, and import static files (HTML, CSS, JS) as sites.

**Setup**: Create a GitHub OAuth App at github.com/settings/developers with callback URL `{APP_BASE_URL}/api/github/callback`.

## License

Proprietary - JY Tech LLC
