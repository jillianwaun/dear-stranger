# Dear Stranger

Anonymous happy stories, written like love letters.

- **Homepage:** a pile of letters (envelopes, airmail, postcards, ribbon-tied bundles, taped notes, torn notebook pages). Each letter gets its own look automatically.
- **Click a letter:** it unfolds onto lined notebook paper in the writer's handwriting, with readers' notes underneath as sticky notes.
- **Write page:** notebook paper form, five handwriting "pens", five sign-offs, and a kraft envelope for the email and checkboxes.
- **Moderation:** instant rule checks, then Claude decides publish / hold / decline. Held items wait for you at `/admin`.
- **Emails:** writers get an email when their letter goes up and whenever someone leaves a note. Every email has an unsubscribe link.
- **Marketing list:** only people who tick "Send me occasional updates". Download them as a CSV from `/admin`.

---

## Setup (about an hour, all free tiers)

You need four free accounts: **GitHub**, **Vercel**, **Supabase**, **Resend**, plus an **Anthropic API** account (pay-as-you-go; moderation costs a fraction of a cent per letter).

### 1. Put the code on GitHub
1. Create a new repository on github.com (private is fine).
2. Upload everything in this folder (drag and drop works on the "Add file → Upload files" page).

### 2. Create the database (Supabase)
1. supabase.com → New project. Save the database password somewhere.
2. Left menu → **SQL Editor** → New query → paste all of `supabase/schema.sql` → **Run**.
3. Left menu → **Project Settings → API**. Copy the **Project URL** and the **service_role** key (the secret one, not "anon").

### 3. Get an Anthropic API key
console.anthropic.com → API Keys → Create key. Add a few dollars of credit.

### 4. Set up email (Resend)
1. resend.com → add and verify your domain (it walks you through DNS records). You can't send to strangers from an unverified domain.
2. API Keys → Create key.

### 5. Deploy (Vercel)
1. vercel.com → Add New → Project → import your GitHub repo. Framework preset: **Other**. Leave build settings empty.
2. Before clicking Deploy, open **Environment Variables** and add each line from `.env.example` with your real values.
3. Deploy. Your site is live at the address Vercel gives you. Put that address in `SITE_URL` and redeploy.
4. Optional: Settings → Domains to add your own domain.

### 6. Try it
- Write a letter at `/write`. A clearly happy one should go straight up.
- Visit `/admin` and enter your `ADMIN_PASSWORD` to see anything held.

---

## Changing things

| I want to… | Edit |
|---|---|
| Change what gets published, held, or declined | `lib/criteria.js` (plain English) |
| Block specific words, change length limits | `lib/rules.js` |
| Change the site name or wording | `public/index.html`, `public/write.html` |
| Change colors, paper, fonts | top of `public/styles.css` |
| Add or swap handwriting fonts | `FONTS` in `public/common.js` and `lib/util.js`, the Google Fonts link in the HTML files, and a `.hand-…` line in `styles.css` |
| Change sign-off options | `SIGNOFFS` in `public/common.js` **and** `lib/util.js` (keep them identical) |
| Change email wording | `lib/email.js` |
| Swap in your own letter images (PNGs) | put them in `public/img/` and set them as the `background` of the `.v-…` styles in `styles.css` |

## Before you launch
- Fill in the privacy page (`public/privacy.html`): your date, your contact email. Have someone check it if you expect visitors from the EU.
- Add your mailing address to marketing emails you send from your email tool (CAN-SPAM requires it).
- Read through `lib/criteria.js` and make it yours.

## How it fits together
```
public/          the website (plain HTML/CSS/JS, no build step)
api/stories.js   list letters, or one letter with its notes
api/submit.js    new letter → rules → Claude → saved (+ email if published)
api/comment.js   new note  → rules → Claude → saved (+ email the writer)
api/admin.js     held queue, publish/decline, subscriber CSV
api/unsubscribe.js
lib/             database, moderation, email helpers
supabase/schema.sql
```
Emails are only ever read by the server. The database blocks public access entirely (row-level security with no public policies).
