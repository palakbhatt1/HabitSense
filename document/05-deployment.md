# HabitSense — Deployment

## Target
Vercel free tier. Zero cost, native Next.js support, HTTPS by default.

## Steps
1. Push repo to GitHub.
2. Import the repo into Vercel → it auto-detects Next.js, no config needed.
3. Deploy — get a live `*.vercel.app` URL (or attach a custom domain later, still free if you already own one).
4. Verify production build works: onboarding, habit CRUD, sleep logging, analytics, offline reload.

## PWA requirements to verify before calling it done
- Valid `manifest.ts` (or `manifest.json`) — app name, 192px + 512px icons, theme color, `display: "standalone"`.
- Service worker caches the app shell and static assets, works offline after first load, updates safely on redeploy.
- Install prompt appears and works on Chrome/Edge (desktop + Android) and "Add to Home Screen" works on iOS Safari.
- Test on a real phone, not just desktop devtools' device emulation.

## What "done" looks like
- Production URL is live over HTTPS.
- Site works and looks right on both desktop and mobile.
- App installs as a PWA and launches standalone.
- Offline reload works after the first online visit (data already in localStorage still shows).
- No paid services anywhere in the stack.

## Not doing
- Custom server / Docker / VPS — unnecessary for a static Next.js + localStorage app.
- CI/CD pipeline beyond Vercel's built-in git-push-to-deploy — no need to over-engineer this for a solo project.
