"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { locales } from "@/lib/i18n";

const labels: Record<string, string> = {
  en: "EN",
  zh: "中文",
  es: "ES",
  ko: "한국어",
};

const fullLabels: Record<string, string> = {
  en: "English",
  zh: "中文",
  es: "Español",
  ko: "한국어",
};

export default function LanguageSwitcher({ locale }: { locale: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="text-sm text-muted hover:text-foreground transition px-2 py-1 rounded border border-card-border hover:border-accent flex items-center gap-1"
      >
        {labels[locale] || locale}
        <svg
          className={`h-3 w-3 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 rounded-lg border border-card-border bg-background shadow-lg py-1 z-50 min-w-[120px]">
          {locales.map((loc) => {
            const newPath = pathname.replace(`/${locale}`, `/${loc}`);
            return (
              <Link
                key={loc}
                href={newPath}
                onClick={() => setOpen(false)}
                className={`block px-3 py-1.5 text-sm transition ${
                  loc === locale
                    ? "text-accent font-medium"
                    : "text-muted hover:text-foreground hover:bg-card-bg"
                }`}
              >
                {fullLabels[loc]}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
