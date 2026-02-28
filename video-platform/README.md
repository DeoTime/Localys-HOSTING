# Localys — Video Platform

The main Next.js application for Localys. See the [root README](../README.md) for full project documentation.

## Quick Start

```bash
npm install
npm run dev
```

## Scripts

| Command         | Description                  |
| --------------- | ---------------------------- |
| `npm run dev`   | Start development server     |
| `npm run build` | Create production build      |
| `npm start`     | Start production server      |
| `npm run lint`  | Run ESLint                   |

## Cloudflare Turnstile

Set these environment variables (see `.env.example`):

- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: site key for production domain
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY_LOCAL`: optional site key for localhost
- `NEXT_PUBLIC_TURNSTILE_ENABLED_IN_DEV`: set `false` to disable Turnstile widget on localhost/dev
- `TURNSTILE_ENABLED_IN_DEV`: set `false` to bypass server verification on localhost/dev
- `TURNSTILE_SECRET_KEY`: secret key for server verification endpoint

In production, Turnstile verification is always enforced server-side.

If you see Turnstile `110200`, the site key is invalid for the current hostname. Add the correct domain(s) in Cloudflare Turnstile and use the matching key.
