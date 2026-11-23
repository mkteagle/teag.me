# teag.me web

Vinext runs the App Router on Vite. TanStack Redact renders the browser UI, and React renders the server components. Better Auth uses PostgreSQL for accounts, sessions, and passkeys. Both the web app and the Expo scanner use `/api/auth`.

## Local development

Use Node 22.22+ or Node 24 and install dependencies from the repository root with `pnpm install`. Create `apps/web/.env.local` with `DATABASE_URL`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. Set `BETTER_AUTH_URL` and `NEXT_PUBLIC_BASE_URL` to your local origin, such as `http://localhost:3000`. Use a migrated PostgreSQL database. Configure your social sign-in and PostHog environment variables when testing those integrations.

```sh
pnpm dev
pnpm --filter @teag/web typecheck
pnpm --filter @teag/web exec vinext check
```

## Production build

Run `pnpm build` and `pnpm start` from the repository root to build and serve the Node version. The build runs the existing Drizzle migrations against `DATABASE_URL_UNPOOLED` or `DATABASE_URL` when configured. Point those variables at the intended database before building.

The Vercel project uses `apps/web` as its root directory. Its build command, `pnpm run build --mode vercel`, uses Nitro to generate Vercel Build Output API artifacts. The deployment needs the existing database, auth, storage, billing, and analytics environment variables. Keep `BETTER_AUTH_URL` aligned with the HTTPS origin registered for OAuth callbacks and passkeys.

App Store sandbox transactions can unlock Pro only for the dedicated review account identified by the optional server-only `APP_STORE_SANDBOX_USER_ID`. Set it to the teag.me user ID of the account provided to App Review. Leave it unset to disable sandbox entitlements. Sandbox events cannot replace a production App Store subscription.

[Vinext migration guide](https://vinext.dev/docs/getting-started/migrating) · [TanStack Redact integration](https://tanstack.com/redact/latest/docs/vinext) · [Better Auth integration](https://better-auth.com/docs/integrations/next)
