"use client";

import { useEffect, useState } from "react";
import CloudflareSettings from "./CloudflareSettings";

type Dict = {
  profile: {
    title: string;
    account: string;
    email: string;
    plan: string;
    integrations: string;
  };
  cloudflare: {
    title: string;
    description: string;
    apiToken: string;
    apiTokenHint: string;
    pagesProject: string;
    pagesProjectHint: string;
    save: string;
    saving: string;
    disconnect: string;
    connected: string;
    notConnected: string;
    testSuccess: string;
    guide: string;
    step1: string;
    step2: string;
  };
  nav: { login: string };
};

export default function ProfileClient({
  locale,
  dict,
}: {
  locale: string;
  dict: Dict;
}) {
  const [user, setUser] = useState<{
    name?: string;
    email?: string;
    picture?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userPlan, setUserPlan] = useState("free");

  useEffect(() => {
    fetch("/auth/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) setUser(data);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!user) return;
    fetch("/api/sites")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.plan) setUserPlan(data.plan);
      })
      .catch(() => {});
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin h-8 w-8 border-2 border-accent border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted text-lg">Please log in to view your profile.</p>
        <a
          href="/auth/login"
          className="rounded-lg bg-accent px-6 py-3 text-white font-medium hover:bg-accent-dark transition"
        >
          {dict.nav.login}
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{dict.profile.title}</h1>

      {/* Account Info */}
      <div className="rounded-xl border border-card-border p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{dict.profile.account}</h2>
        <div className="flex items-center gap-4 mb-4">
          {user.picture && (
            <img
              src={user.picture}
              alt=""
              className="h-16 w-16 rounded-full"
            />
          )}
          <div>
            {user.name && (
              <p className="text-lg font-medium">{user.name}</p>
            )}
            {user.email && (
              <p className="text-sm text-muted">{user.email}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted">{dict.profile.plan}:</span>
          <span className="capitalize font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
            {userPlan}
          </span>
        </div>
      </div>

      {/* Integrations */}
      <h2 className="text-lg font-semibold mb-4">{dict.profile.integrations}</h2>
      <CloudflareSettings dict={dict} />
    </div>
  );
}
