"use client";

import Link from "next/link";
import { useState } from "react";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeToggle from "./ThemeToggle";

type Dict = {
  nav: {
    home: string;
    dashboard: string;
    pricing: string;
    editor: string;
    blog: string;
    profile: string;
    login: string;
    logout: string;
  };
};

type User = {
  name?: string | null;
  picture?: string | null;
  email?: string | null;
} | null;

export default function Navbar({
  locale,
  dict,
  user,
}: {
  locale: string;
  dict: Dict;
  user: User;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href={`/${locale}`}
            className="text-xl font-bold gradient-text"
          >
            EasySite
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href={`/${locale}`}
              className="text-sm text-muted hover:text-foreground transition"
            >
              {dict.nav.home}
            </Link>
            <Link
              href={`/${locale}/editor`}
              className="text-sm text-muted hover:text-foreground transition"
            >
              {dict.nav.editor}
            </Link>
            {user && (
              <>
                <Link
                  href={`/${locale}/dashboard`}
                  className="text-sm text-muted hover:text-foreground transition"
                >
                  {dict.nav.dashboard}
                </Link>
                <Link
                  href={`/${locale}/profile`}
                  className="text-sm text-muted hover:text-foreground transition"
                >
                  {dict.nav.profile}
                </Link>
              </>
            )}
            <Link
              href={`/${locale}/pricing`}
              className="text-sm text-muted hover:text-foreground transition"
            >
              {dict.nav.pricing}
            </Link>
            <Link
              href={`/${locale}/blog`}
              className="text-sm text-muted hover:text-foreground transition"
            >
              {dict.nav.blog}
            </Link>
            <LanguageSwitcher locale={locale} />
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/profile`}
                  className="flex items-center gap-2 hover:opacity-80 transition"
                >
                  {user.picture ? (
                    <img
                      src={user.picture}
                      alt=""
                      referrerPolicy={"no-referrer"}
                      className="h-8 w-8 rounded-full"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-sm font-medium text-accent">
                      {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
                    </div>
                  )}
                </Link>
                <a
                  href="/auth/logout"
                  className="text-sm text-muted hover:text-foreground transition"
                >
                  {dict.nav.logout}
                </a>
              </div>
            ) : (
              <a
                href="/auth/login"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition"
              >
                {dict.nav.login}
              </a>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-muted hover:text-foreground"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-card-border bg-background px-4 py-4 space-y-3">
          <Link
            href={`/${locale}`}
            className="block text-sm text-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            {dict.nav.home}
          </Link>
          <Link
            href={`/${locale}/editor`}
            className="block text-sm text-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            {dict.nav.editor}
          </Link>
          {user && (
            <>
              <Link
                href={`/${locale}/dashboard`}
                className="block text-sm text-muted hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {dict.nav.dashboard}
              </Link>
              <Link
                href={`/${locale}/profile`}
                className="block text-sm text-muted hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                {dict.nav.profile}
              </Link>
            </>
          )}
          <Link
            href={`/${locale}/pricing`}
            className="block text-sm text-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            {dict.nav.pricing}
          </Link>
          <Link
            href={`/${locale}/blog`}
            className="block text-sm text-muted hover:text-foreground"
            onClick={() => setMenuOpen(false)}
          >
            {dict.nav.blog}
          </Link>
          <div className="flex items-center gap-2">
            <LanguageSwitcher locale={locale} />
            <ThemeToggle />
          </div>
          {user ? (
            <a
              href="/auth/logout"
              className="block text-sm text-muted hover:text-foreground"
            >
              {dict.nav.logout}
            </a>
          ) : (
            <a
              href="/auth/login"
              className="block w-full rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white text-center"
            >
              {dict.nav.login}
            </a>
          )}
        </div>
      )}
    </nav>
  );
}
