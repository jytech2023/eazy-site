import Link from "next/link";

type Dict = {
  footer: { copyright: string; tagline: string; terms: string; privacy: string };
  nav: { home: string; editor: string; pricing: string; blog: string };
};

export default function Footer({ dict, locale }: { dict: Dict; locale: string }) {
  return (
    <footer className="mt-auto border-t border-card-border">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href={`/${locale}`} className="text-lg font-bold gradient-text">
              EasySite
            </Link>
            <p className="mt-2 text-sm text-muted">{dict.footer.tagline}</p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href={`/${locale}/editor`} className="hover:text-foreground transition">
                  {dict.nav.editor}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/pricing`} className="hover:text-foreground transition">
                  {dict.nav.pricing}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/stats`} className="hover:text-foreground transition">
                  Stats
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Resources</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href={`/${locale}/blog`} className="hover:text-foreground transition">
                  {dict.nav.blog}
                </Link>
              </li>
              <li>
                <a
                  href="https://cloudflare.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-foreground transition"
                >
                  Cloudflare
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href={`/${locale}/terms`} className="hover:text-foreground transition">
                  {dict.footer.terms}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/privacy`} className="hover:text-foreground transition">
                  {dict.footer.privacy}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-card-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <p>&copy; {new Date().getFullYear()} {dict.footer.copyright}. All rights reserved.</p>
          <p>
            A{" "}
            <a
              href="https://jytech.us"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              JY Tech
            </a>
            {" "}product
          </p>
        </div>
      </div>
    </footer>
  );
}
