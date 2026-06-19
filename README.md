# mostlikelyto

A social polling and prediction platform built around the question
_"Who is most likely to…?"_ — cast predictions, see the community score.

## Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Auth:** [better-auth](https://better-auth.com) (email + password)
- **Database:** [Neon](https://neon.tech) Postgres via [Drizzle ORM](https://orm.drizzle.team)
- **UI:** [shadcn/ui](https://ui.shadcn.com) + Tailwind CSS v4 (OKLCH dark theme), motion, Recharts

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable             | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| `DATABASE_URL`       | Neon Postgres connection string                                          |
| `BETTER_AUTH_SECRET` | Random secret — generate with `openssl rand -base64 32`                  |
| `BETTER_AUTH_URL`    | App base URL (`http://localhost:3000` in dev)                            |

### 3. Set up the database

Apply the schema (better-auth tables + poll tables) to your Neon database:

```bash
npm run db:migrate   # apply the generated migrations
# or, for quick local iteration:
npm run db:push      # push the schema directly without migration files
```

To regenerate migrations after editing `lib/db/schema.ts`:

```bash
npm run db:generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `lib/db/schema.ts` — Drizzle schema (auth + `polls`/`poll_options`/`poll_votes`)
- `lib/db/index.ts` — Neon serverless pool + Drizzle client
- `lib/auth.ts` / `lib/auth-client.ts` — better-auth server config + React client
- `app/api/auth/[...all]/route.ts` — better-auth request handler
- `proxy.ts` — middleware protecting `/create` and `/dashboard`
- `lib/store.ts` — poll data access (create / vote / delete / list)
- `app/actions.ts` — server actions (session-checked)

## Deploy on Vercel

Add the same environment variables in your Vercel project settings, then deploy.
Run `npm run db:migrate` against your production Neon database before the first
deploy.
