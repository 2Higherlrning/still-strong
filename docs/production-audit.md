# Production Audit

## Critical Problem Areas

### P0: Health and photo privacy

Progress photos, pain logs, mobility notes, and meal data are sensitive. The app must keep private buckets, RLS, HTTPS, and a privacy policy before real users.

### P1: Single large client file

`app.js` currently owns state, rendering, auth, storage, recipes, exercises, timers, and persistence. This is acceptable for prototype speed but will slow feature work.

Refactor path:

- Extract data constants.
- Extract Supabase access into services.
- Extract feature renderers and event handlers.
- Keep a single app state module until usage proves a need for a larger framework.

### P1: JSON document persistence

One `jsonb` progress document is simple but hard to query, audit, and partially update at scale.

Refactor path:

- Keep JSON for MVP.
- Normalize high-volume data after validation: sessions, photos, pain logs, and meals.

### P1: CDN dependency

Supabase JS loads from CDN. That is fine for a fast MVP, but production should pin integrity or bundle dependencies.

### P2: Offline conflict handling

The app currently uses last-write behavior. Multi-device concurrent edits could overwrite changes.

Refactor path:

- Track per-record timestamps.
- Merge arrays by ID.
- Store sessions/photos as separate rows.

### P2: Photo metadata in progress JSON

The image bytes are uploaded to Storage when signed in, but photo metadata still lives in one progress document.

Refactor path:

- Add `progress_photos` table.
- Store caption, path, timestamps, and deleted state.

## Performance Bottlenecks

- Full re-render of many sections after small state changes.
- Large `localStorage` payloads if unsigned users save many photos.
- Signed URL hydration can render twice.

## Security Checklist

- RLS enabled on every user-owned table.
- Private Storage bucket.
- No service role key in frontend.
- Strong privacy policy.
- Account/data deletion workflow.
- Avoid medical claims beyond educational guidance.

## Minimal Production Roadmap

1. Finish Supabase config and policies.
2. Test account sign-up/sign-in.
3. Test photo upload after sign-in.
4. Add privacy policy and terms pages.
5. Refactor JS into modules.
6. Normalize high-volume tables.
7. Add telemetry/error reporting.
