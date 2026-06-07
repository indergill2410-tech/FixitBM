# Demo Seed

The demo seed creates realistic development/staging data only.

It refuses to run in production unless `ALLOW_DEMO_SEED=true`.

## Requirements

Set these in `.env.local` or your shell:

```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SECRET_KEY=
ALLOW_DEMO_SEED=false
```

## Run

```bash
npm run seed:demo
```

Demo user password:

```text
Fixit247Demo!2026
```

Seeded demo accounts include:

```text
Customer: maya.chen.demo@fixit247.test
Fixer: harbour.plumbing.demo@fixit247.test
Agency: harbour.agency.demo@fixit247.test
```

Never expose demo credentials on production UI.
