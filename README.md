# Still Strong

Still Strong is a joint-aware exercise, meal support, and progress-tracking PWA for people rebuilding consistency with limited mobility or osteoarthritis pain.

## Current MVP

- Static PWA hosted by GitHub Pages
- Supabase Auth for accounts
- Supabase `user_progress` table for cross-device progress sync
- Supabase Storage bucket for private progress photos
- Local-first fallback with `localStorage`
- Offline shell through a service worker

## Local Files

- `index.html` - application shell and screen markup
- `styles.css` - responsive UI system
- `app.js` - client application logic
- `manifest.webmanifest` - PWA metadata
- `sw.js` - offline cache/service worker
- `supabase-config.js` - public Supabase URL and publishable/anon key
- `supabase-schema.sql` - user progress table and RLS policies
- `supabase-storage-policies.sql` - private photo storage policies
- `icons/` - PWA icons

## Deploy

```powershell
git add index.html styles.css app.js sw.js manifest.webmanifest supabase-config.js supabase-schema.sql supabase-storage-policies.sql README.md docs
git commit -m "Production readiness pass"
git push
```

GitHub Pages URL:

```text
https://2higherlrning.github.io/still-strong/
```

## Important Security Notes

- The `sb_publishable...` or anon key is safe for frontend use.
- Never put a Supabase service role key in this repo.
- Keep `progress-photos` private.
- RLS must stay enabled on `user_progress`.
- Storage policies must restrict users to their own folder.
