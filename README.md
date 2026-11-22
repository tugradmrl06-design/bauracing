## BAU Racing Platform

Formula Team Management Platform built with Next.js, TypeScript and Tailwind CSS.

## Local setup

1. Copy the environment template:

   ```bash
   cp .env.example .env.local
   ```

2. Add the Supabase project URL and public anon/publishable key to `.env.local`.
3. Run `supabase/migrations/20261122000000_initial_schema.sql` in the Supabase SQL editor or through the Supabase CLI.
4. Start the development server:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

## Supabase CLI

```bash
supabase link --project-ref <project-ref>
supabase db push
```

Never place a service-role key in `.env.local`, browser code or a `NEXT_PUBLIC_*` variable.
