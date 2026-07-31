# HabitSense Repo Structure

HabitSense uses feature-based folders under `src/`. This map reflects the current repository and identifies the PWA assets that still need to be completed for release.

```
habitsense/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (dashboard)/
│   │   │   ├── analytics/page.tsx
│   │   │   ├── habits/page.tsx
│   │   │   ├── settings/page.tsx
│   │   │   ├── sleep/page.tsx
│   │   │   ├── layout.tsx                # Dashboard shell
│   │   │   └── page.tsx                  # Dashboard home
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx                    # Root layout and providers
│   │   └── manifest.ts                  # Next.js-generated PWA manifest
│   ├── components/
│   │   ├── providers/AppProviders.tsx
│   │   ├── shared/                       # Sidebar, TopBar, onboarding, shared UI
│   │   └── ui/                           # Local UI primitives
│   ├── features/
│   │   ├── habits/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── utils/
│   │   └── sleep/
│   │       ├── components/
│   │       └── hooks/
│   └── lib/storage/
│       ├── types.ts
│       ├── storage-adapter.ts
│       ├── local-storage-adapter.ts
│       ├── migrations.ts
│       └── storage-provider.tsx
├── public/
│   ├── sw.js                            # Verify cache URLs and offline behavior
│   └── icons/                           # Add valid 192px and 512px PWA icons
├── next.config.ts
├── package.json
└── README.md
```

## Notes

- There is no backend, database, auth, `server/`, or `api/` directory in v1. See [04-backend.md](04-backend.md).
- `src/app/(dashboard)/analytics/` contains the analytics page; there is no separate analytics feature directory today.
- `src/lib/storage/storage-adapter.ts` is the persistence interface. Feature hooks use `useStorage()`; UI components should not access `localStorage` directly.
- `public/icons/` and production service-worker behavior are release work. Confirm that the icon files exist and every cached URL resolves before calling the site installable.
- Mascot illustrations and decorative assets from the earlier design direction are out of scope.
