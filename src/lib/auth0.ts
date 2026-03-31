import { Auth0Client } from "@auth0/nextjs-auth0/server";

let _auth0: Auth0Client | null = null;

export function getAuth0() {
  if (!_auth0) {
    _auth0 = new Auth0Client({
      appBaseUrl: process.env.APP_BASE_URL,
      domain: process.env.AUTH0_DOMAIN,
      clientId: process.env.AUTH0_CLIENT_ID,
      clientSecret: process.env.AUTH0_CLIENT_SECRET,
      secret: process.env.AUTH0_SECRET,
    });
  }
  return _auth0;
}

// Convenience re-export
export const auth0 = new Proxy({} as Auth0Client, {
  get(_target, prop) {
    return (getAuth0() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
