# HabitSense v1 Build Methodology

## Product and delivery decision

HabitSense v1 is a responsive habit and sleep tracking website that users can install as a Progressive Web App (PWA) through a supported browser. The website is the product; PWA installation adds an app-like launch experience and offline behavior. There is no separate desktop application.

The goal is to finish the existing application, deploy it on Vercel's free tier, and present the verified result as a portfolio project. Habit and sleep records stay in the current browser profile through `localStorage`. There is no backend, database, login, account, or cross-device sync in v1.

This file is the execution plan. Product scope and detailed decisions live in the linked documents below.

## Source documents

- [Problem and idea](01-problem-idea.md)
- [Tech stack](02-tech-stack.md)
- [Frontend specification](03-frontend.md)
- [Backend and data storage](04-backend.md)
- [Repository map](00-repo-structure.md)
- [Deployment checklist](05-deployment.md)

## Current project position

The repository already contains the main product flows: habit tracking, sleep logging, analytics, settings, local storage, onboarding, and focused tests for streak and storage behavior. The next work is release hardening and alignment with the new product direction, not a new desktop build or a new backend.

The PWA setup is not yet release-ready. The manifest refers to icon files that are not present in `public/`, and the service worker's precache URLs need to be checked against the routes and assets produced by the production build. The current interface also contains decorative and animated elements that the new minimal design direction removes.

## Build sequence

### 1. Audit the existing product

- Walk through onboarding, habit create/edit/archive, daily completion, date navigation, sleep logging/history, analytics, settings, import/export, and data reset.
- Compare each screen with [03-frontend.md](03-frontend.md). Remove or simplify mascot-style art, gradient banners, decorative cards, and rotating motivational text.
- Keep the layout responsive: monthly grid on larger screens and the single-day list with a seven-day strip on phones.
- Confirm every data read and write goes through the storage adapter, and explain browser-local storage clearly in the UI or README where users make decisions about their data.
- Record defects and release gaps before adding features.

### 2. Stabilize core flows and data

- Fix any functional or visual issues found in the audit.
- Verify habit limits, archive behavior, missed/done states, streak rules, sleep values, charts, and date boundaries.
- Confirm export and restore round-trip correctly. Make destructive reset behavior clear.
- Keep the v1 data model local. Do not add authentication, a cloud database, sync, or new tracker categories.
- Keep animation dependencies and interactions only where they serve a concrete need; do not add new motion by default.

### 3. Complete the PWA

- Provide valid 192px and 512px icons and make the Next.js manifest reference those exact paths.
- Check the service worker against the production output. Cache only URLs that exist, provide an offline navigation fallback, and allow a deployed update to replace stale cached assets safely.
- Verify that the app can be installed and launched standalone in supported browsers over HTTPS.
- Test a first online visit followed by offline launch, navigation, habit and sleep edits, refresh, and return to online use. State clearly that offline records remain on that browser and device.

### 4. Verify and deploy

- Run the production build and the project's configured checks; resolve release-blocking failures.
- Manually review the main journeys on a desktop browser and a real phone-sized device, including an installed PWA session.
- Push the release-ready repository to GitHub and deploy it through Vercel. Use the public HTTPS URL as the demo link.
- Recheck the deployed URL, manifest, icons, service worker, offline behavior, and data export/restore after deployment.
- Confirm that the hosting and product stack use no paid services for v1.

### 5. Prepare portfolio and resume materials

- Replace the starter README with the product goal, feature list, architecture, local setup steps, live demo URL, screenshots, and the browser-local storage limitation.
- Capture clear desktop and mobile screenshots of the deployed product.
- Describe only behavior verified in the production release. Resume claims may mention the responsive website, installable PWA, offline support, local-first storage, feature set, and deployment when those details have passed the release checks.
- Do not imply user accounts, cloud sync, multi-device persistence, or a desktop application.

## Release acceptance criteria

The v1 release is complete when:

- The site is live at a stable HTTPS URL and renders well on desktop and mobile.
- Users can create, edit, archive, and track up to 10 habits; log sleep; and review the stated analytics.
- Habit and sleep data persist after refresh in the same browser profile, and users can export and restore a backup.
- The PWA manifest and icons resolve, installation works in supported browsers, and offline launch and data entry behave as documented.
- No core flow depends on a backend, account, or paid service.
- The repository README and resume description match the deployed product and its local-storage limitation.

## Out of scope for v1

- Accounts, authentication, hosted storage, cloud backup, and cross-device sync.
- A Windows, macOS, or Linux desktop application.
- Mood tracking, journaling, browser extensions, and additional tracker types.
- A custom server, database, Docker/VPS hosting, or a separate CI/CD system beyond the host's built-in deployment flow.

## Immediate next step

Start with the audit in step 1. Prioritize the PWA asset and service-worker gaps, then simplify the existing UI to match the new frontend direction before deploying.
