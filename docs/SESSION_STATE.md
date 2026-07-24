# SESSION_STATE.md

Concise checkpoint for the next AI session. Read this first.
Supermemory key was NOT set this session (no memory MCP either), so this
file is the continuity fallback per AGENTS.md.

## Done
- Upgraded to **Expo SDK 57 latest**: expo@57.0.8, expo-router@57.0.8,
  react-native-screens@4.26, etc. (ran via `NPM_CONFIG_LEGACY_PEER_DEPS=true`).
- Removed unused deps: `@react-navigation/bottom-tabs`, `@react-navigation/native`,
  `expo-linear-gradient`, `prop-types`.
- Added `expo-splash-screen@57.0.5` as a config plugin (SDK 57 dropped the
  `splash` / `ios.splash` app.json keys); removed those keys from app.json.
- Navigation = **expo-router NativeTabs** (Weather + Settings) in `app/_layout.tsx`.
  (iOS 26 gives native tab bars Liquid Glass for free.)
- Deleted dead code: `App.tsx`, `index.js`, `navigation/TabNavigator.tsx`,
  `components/SearchInput.js` (converted → `SearchInput.tsx`).
- TS simplified: single `WeatherResult | null` state; external data stays loose
  (`unknown`/`Record`) and narrowed at the boundary. Rules added to AGENTS.md.
- **Glass fix (partial)**: `SearchInput` is now its OWN glass pill (internal
  `BlurView` + `blurTarget` + sheen) so frost matches its bounds. Weather
  `GlassCard`s bumped to `intensity={90}`. SearchInput unwrapped from GlassCard.
- **Cinematic Tinted Landscape — Phase 1 (done; needs rebuild to view)**: picked
  an original concept instead of copying Apple/Overdrop — keep the moody
  grayscale mountain as a *texture* layer (`mixBlendMode: 'overlay'` on a
  wrapping View) over a per-condition color **gradient sky** + a per-time-of-day
  **overlay** (dawn/day/dusk/night). One PNG + math = colorful cinematic scenes
  with real depth behind the glass. Competition scan (Breeze / Weatherly /
  SkyOS): consensus = mood gradients + particles + glass; the premium 3D/video
  route is too costly for a SaaS. New file `utils/getThemeForWeather.ts`;
  `WeatherResult` gained a derived city-local `hour`. Reinstalled
  `expo-linear-gradient@57.0.1`. White-text legibility via text shadow (no dark
  scrim, so color stays vivid). `tsc` clean.
- Verified clean: `npx tsc --noEmit` = 0 errors; `npx expo-doctor` = 20/20.
- `npx expo run:ios` launched in background (PID **11638** at write time; may
  have finished or errored — check before trusting). Log: `tmp/ios-run.log`.
  Prebuild + CocoaPods succeeded; was compiling native modules.

## Pending / next
- **REBUILD REQUIRED** to view the colorful glass: Phase 1 added the native
  module `expo-linear-gradient`, which the running dev client lacks. A bg
  `expo run:ios` (PID **22231**, log `tmp/ios-run.log`) was launched to
  incrementally rebuild + serve; tail the log to confirm launch. Until that
  native rebuild finishes, the simulator will red-screen on reload.
- **Map view** = owner's chosen first feature. Needs `react-native-maps`
  (approve install + native rebuild) + a per-city weather fetch; reuse the
  cinematic theme tints on markers/regions for brand cohesion.
- **Glass blend fixed → `luminosity`** (mountain now reads as a tinted
  landscape; cloudy/rain palettes given a blue cast). **Open bug:** a hard seam
  at the bottom ~25% — NativeTabs **clips the screen root** above the native
  tab bar, and that strip shows a flat color JS can't paint. Forcing the bg to
  full-screen via `Dimensions` did NOT fix it (an ancestor `overflow:hidden`
  clips the layer). NEXT: make NativeTabs content edge-to-edge / tab bar
  translucent, OR move the cinematic bg to the root layout behind the tabs.
  Verify visually with `xcrun simctl io booted screenshot tmp/x.png` + Read
  (works while the owner runs expo; Fast Refresh hot-reloads JS-only edits).
- **Business model = profitable freemium SaaS** (CHANGED, see AGENTS.md): add
  **login + paid tiers** — paid members unlock more features; revenue from
  subscriptions; ad-free is the differentiator. The old "no login / privacy-only"
  stance is GONE.
- Other backlog (priority order): favorite locations (≤5, on-device quick-tap),
  free hourly + 7-day forecast, details grid (feels-like/UV/wind), iOS 26 Live
  Activity + widget, phase-2 particles (RN Animated, no lib), optional mood line.
- **Ongoing competitor/product research is a core habit** every session — cite
  findings, surface cheap + unique + profitable ideas. See AGENTS.md Project goal.

## Gotchas / how-to
- npm peer conflict: transitive `react-dom@19.2.7` wants `react@^19.2.7` but expo
  pins `react@19.2.3`. Prefix any `npm`/`npx expo install` with
  `NPM_CONFIG_LEGACY_PEER_DEPS=true` until react/react-dom align.
- RN 0.86 types: `StyleSheet.absoluteFillObject` does NOT exist → use
  `StyleSheet.absoluteFill` in a style array.
- expo-router `DarkTheme` is a `NativeTheme`; `ThemeProvider` cast to `as any`.

## Key files
- Screens/tabs: `app/_layout.tsx`, `app/index.tsx`, `app/settings.tsx`
- Glass UI: `components/GlassCard.tsx`, `components/SearchInput.tsx`
- Data/contracts: `utils/api.ts` (`WeatherResult`), `utils/getCityName.ts`,
  `utils/getIconForWeather.ts`, `utils/getImageForWeather.ts` (unused),
  `utils/getThemeForWeather.ts` (cinematic background theme)
