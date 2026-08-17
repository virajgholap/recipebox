# Deploying Recipe Box

Everything in the codebase is done. What is left needs accounts, and those are yours.

Work through this in order — steps 2 and 3 must both be finished before Google sign-in will work, and step 6 is the one people forget.

Rough time: 25–35 minutes, most of it waiting on Google's console.

---

## 1. Create the Supabase project

1. Sign up at [supabase.com](https://supabase.com) and create a new project.
2. Pick a region near your users and set a database password (save it in your password manager — you will not need it for this app, but you will want it later).
3. Wait for provisioning, then go to **Project Settings → API** and copy:
   - **Project URL** — looks like `https://abcdefghijkl.supabase.co`
   - **anon / public** key — a long JWT

**Send me those two values.** They are safe to share and safe to commit to a public bundle: the anon key identifies the project but grants nothing on its own, because row-level security decides what it can reach.

**Do not send me the `service_role` key.** It bypasses row-level security entirely. It has no place in this app.

## 2. Create the tables

In the Supabase dashboard, open **SQL Editor → New query**.

1. Paste the whole of [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) and click **Run**.
2. New query again. Paste the whole of [`supabase/seed.sql`](supabase/seed.sql) and **Run**.

Check it worked: **Table Editor → recipes** should show 20 rows.

The seed is idempotent — re-running it updates rows rather than erroring, so it is safe to run again after editing recipes.

## 3. Set up Google sign-in

This is two consoles talking to each other, which is why it is the fiddly part.

**In Google Cloud Console** ([console.cloud.google.com](https://console.cloud.google.com)):

1. Create a project (or reuse one).
2. **APIs & Services → OAuth consent screen**. Choose **External**, fill in the app name, your support email, and developer email. Save. You can leave it in Testing mode while you are the only user; publish it before other people sign in.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
4. Application type: **Web application**.
5. Under **Authorised redirect URIs**, add exactly one entry:

   ```
   https://<your-project-ref>.supabase.co/auth/v1/callback
   ```

   Replace `<your-project-ref>` with the subdomain from your Supabase project URL. This points at Supabase, not at your app — that trips most people up.
6. Create, then copy the **Client ID** and **Client secret**.

**In Supabase** → **Authentication → Providers → Google**:

1. Toggle it on.
2. Paste the Client ID and Client secret.
3. Save.

The client secret goes into the Supabase dashboard and nowhere else. It never enters this repo.

## 4. Configure auth URLs

**Authentication → URL Configuration**:

- **Site URL**: `http://localhost:5173` for now. Change it to your Vercel URL after step 6.
- **Redirect URLs**: add both, one per line —

  ```
  http://localhost:5173/auth/callback
  https://<your-vercel-domain>/auth/callback
  ```

Add the Vercel one now even though the domain does not exist yet; it saves a round trip later.

## 5. Turn off email confirmation (for now)

**Authentication → Sign In / Providers → Email** → turn **Confirm email** off.

You asked for this so we can test signup end to end without a real inbox. **Turn it back on before anyone else uses the app** — without it, anyone can register an address they do not control.

### Run it locally

```bash
cp .env.example .env.local
```

Fill in the two values, then:

```bash
npm install
```

```bash
npm run dev
```

Without `.env.local` the app still runs — it falls back to the bundled seed data and hides the account UI. That is the intended behaviour, not a bug.

## 6. Push to GitHub

The repo is committed locally with no remote. Either install the GitHub CLI:

```bash
winget install GitHub.cli
```

then authenticate and let me create and push the repo:

```bash
gh auth login
```

Or create an empty repo named `recipe-box` at [github.com/new](https://github.com/new) — no README, no .gitignore, no licence, since the repo already has all three — and send me the URL.

Either way I will push `main` (the spec-clean version) and `feature/recipe-detail` (this one).

## 7. Deploy on Vercel

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project**, import the repo.
3. Framework preset should auto-detect **Vite**. `vercel.json` already sets the build command, output directory, and the SPA rewrite that makes `/recipe/:id` and `/auth/callback` work on a hard refresh.
4. Under **Environment Variables**, add both:

   | Name | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | your project URL |
   | `VITE_SUPABASE_ANON_KEY` | your anon key |

   Add them to Production, Preview, and Development.
5. Deploy.

**Then go back to Supabase** (step 4) and set **Site URL** to your real Vercel domain. Google sign-in will redirect to the wrong place until you do.

---

## Checking it actually works

In production, in order:

1. Load the site signed out — 20 recipes, photos, filters all work.
2. Open a recipe, tick two ingredients, complete a step. Reload. Progress is still there (localStorage).
3. Sign up with email and password. You should land back on the grid with an avatar in the top right.
4. Open that same recipe. Your local progress should have followed you up — the toolbar now reads **Synced**.
5. Sign out, sign in with Google. Different account, so progress starts clean.
6. Open a recipe, check something, then load the same `/recipe/<id>` URL in a private window signed into the same account. The state should match.
7. Hard-refresh on `/recipe/dal-makhani`. It should load the recipe, not a 404. If it 404s, the Vercel rewrite is not applied.

## Things worth knowing

**Recipes are read-only from the browser.** There is deliberately no insert/update/delete policy on the `recipes` table, so the anon key cannot modify the catalogue even if someone extracts it. Edit recipes in `src/data/recipes.js`, run `npm run seed:generate`, and re-run the seed SQL.

**Progress is per user and enforced in the database.** The `recipe_progress` policies check `auth.uid() = user_id`, so one account cannot read another's rows regardless of what the client asks for.

**Cost.** Supabase free tier and Vercel Hobby cover this comfortably. The photos are served from Vercel's CDN as part of the bundle, not from Supabase Storage, so there is no image egress on the database side.

**Free-tier pausing.** Supabase pauses free projects after a week of inactivity. The app keeps working — it falls back to seed data — but sign-in will fail until you unpause it from the dashboard.
