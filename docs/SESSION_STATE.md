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
- **On-device verify (2026-07-26):** Android fixes CONFIRMED on device
  (`tmp/shot_android.png`): magenta gone; cyan gone (mountain
  `mixBlendMode:'multiply'` on Android — `luminosity` only on iOS); Settings
  glass 10px-border gone (settings now has the full cinematic `BlurTargetView`
  bg + passes `blurTarget` to its `GlassCard`). iOS glass cards + top scene
  good (`tmp/shot_ios.png`). **Seam STILL present on both** (iOS = pale system
  plate under the bar; Android = the navy `contentStyle` filler we set).
- **Native layer traced:** `NativeTabs` renders react-native-screens
  `Tabs.Host`/`Tabs.Screen`; `unstable_nativeProps` is spread VERBATIM into the
  native host (`expo-router/build/native-tabs/NativeTabsView.ios.js:19,46` and
  `NativeTabsView.android.js:14,23`) → any prop screens' host accepts is
  reachable with zero install. `contentStyle` (incl
  `experimental_backgroundImage`) is the OFFICIAL expo screen-bg knob (PR #41068
  e2e) but does NOT extend under the bar (open #44932).
- **Seam web research:** expo#39969 fixed by PR #41068 (white *flash* on nav
  only); **expo#44932 OPEN, no fix** ("opaque native layer blocks the global
  background", iOS+Android); screens#3573 = safe-area flash (tangential). No
  published patch-package patch for screens tab translucency (gh_grep over
  `patches/` empty). Full-bleed behind a *native* bar is proven ONLY via
  callstack `react-native-bottom-tabs` — it sets
  `tabBar.isTranslucent = props.translucent`
  (`packages/react-native-bottom-tabs/ios/TabViewImpl.swift`) + exposes
  `sceneStyle`/`tabBarStyle`, wired into expo-router via `withLayoutContext`
  (streamyfin, SparkyFitness, `one`). `websearch_cited` = HTTP 402 (no credits);
  fell back to `webfetch` + `gh_grep`; no puppeteer/playwright MCP connected;
  remote images can't be rendered here.

## Pending / next
- **STATUS (2026-07-26):** on-device verify + web research DONE; the seam is now
  a 4-step plan (the 'SEAM — 4-step plan' bullet at the end of this section).
  The long 'OPEN BUG — bottom seam' hypotheses below are largely SUPERSEDED —
  keep from them only the VERIFY workflow + the fact that on iOS the screen's
  plain `View` is inset above the native bar (so `absoluteFill` stops at the
  bar's top).
- **REBUILD REQUIRED** to view the colorful glass: Phase 1 added the native
  module `expo-linear-gradient`, which the running dev client lacks. A bg
  `expo run:ios` (PID **22231**, log `tmp/ios-run.log`) was launched to
  incrementally rebuild + serve; tail the log to confirm launch. Until that
  native rebuild finishes, the simulator will red-screen on reload.
- **Map view** = owner's chosen first feature. Needs `react-native-maps`
  (approve install + native rebuild) + a per-city weather fetch; reuse the
  cinematic theme tints on markers/regions for brand cohesion.
- **Glass blend = `luminosity`** (mountain reads as a tinted landscape;
  cloudy/rain palettes blue-cast — confirmed ON DEVICE, looks good in the top
  ~75%). **OPEN BUG — bottom seam:** hard seam at ~75% height; below it a flat
  slate strip JS can't paint (the native tab-bar region; the screen content is
  inset above it). Tried & FAILED: (a) bg `Dimensions` full-screen overflow
  (an ancestor clips it); (b) `disableAutomaticContentInsets` on both
  `NativeTabs.Trigger` (cold-restarted the app to apply — did NOT extend the
  frame on iOS; that prop only governs scroll-view / SafeArea insets). The flat
  strip sits OUTSIDE the (clipped) JS tree. NEXT HYPOTHESES, untested: (i)
  react-native-screens edge-to-edge via `unstable_nativeProps` on the trigger /
  host — look for `edgesForExtendedLayout` or an overlay/translucent tab bar in
  `TabsScreenProps` / `TabsHostProps`; (ii) NativeTabs `backgroundColor=
  "transparent"` + a `blurEffect` (may only recolour the strip, not bring the
  scene under it); (iii) MOST RELIABLE: hide the native bar (`hidden`) and build
  a CUSTOM JS floating glass pill over a full-bleed screen (full control of
  glass-over-scene, on-brand; loses native liquid-glass); (iv) move the
  cinematic bg into the root layout behind NativeTabs (theme lifted to a
  context; native screens must be transparent).
- **VERIFY workflow:** non-root JS edits → Fast Refresh auto-applies. **Root
  `_layout.tsx` edits do NOT hot-reload** → cold-restart the app to apply them:
  `xcrun simctl terminate booted com.global.weather && xcrun simctl launch booted com.global.weather`
  then `xcrun simctl io booted screenshot tmp/x.png` + Read. Works while the
  owner runs `expo` (does not touch their process/port). A cold launch pops an
  UNRELATED "Apple Account Verification" simulator alert — dismiss with Not Now.
- **Business model = profitable freemium SaaS** (CHANGED, see AGENTS.md): add
  **login + paid tiers** — paid members unlock more features; revenue from
  subscriptions; ad-free is the differentiator. The old "no login / privacy-only"
  stance is GONE.
- Other backlog (priority order): favorite locations (≤5, on-device quick-tap),
  free hourly + 7-day forecast, details grid (feels-like/UV/wind), iOS 26 Live
  Activity + widget, phase-2 particles (RN Animated, no lib), optional mood line.
- **Ongoing competitor/product research is a core habit** every session — cite
  findings, surface cheap + unique + profitable ideas. See AGENTS.md Project goal.
- **SEAM — 4-step plan (2026-07-26; supersedes the 'OPEN BUG' notes above). Stop
  at the first step that shows the scene behind the native bar (screenshot
  each):** (1) read screens `TabsHostProps` ios/android; if an overlay /
  translucent prop exists, pass it via
  `unstable_nativeProps={{ ios:{...}, android:{...} }}` on `<NativeTabs>` (zero
  install); (2) else patch-package the screens tab-bar controller — iOS
  `tabBar.isTranslucent = true` + clear its view bg, Android make the bar
  overlay + transparent (FIRST confirm `ios/bottom-tabs/*.mm` exists in this
  install — the expo src links `RNSBottomTabsScreenComponentView.mm`; use
  callstack `TabViewImpl.swift` + #41068 as the line reference); (3)
  **RECOMMENDED** install callstack `react-native-bottom-tabs` +
  `withLayoutContext` (copy streamyfin's wiring),
  `tabBarStyle={{ translucent:true, backgroundColor:'transparent' }}` +
  `sceneStyle`, keep the scene `absoluteFill` (needs install + native rebuild);
  (4) fallback = hide native bar + the already-written custom JS glass bar
  `components/GlassTabBar.tsx` over a full-bleed scene. **Keepers regardless:**
  Android `multiply` blend + Settings cinematic bg. **Cleanup when fixed:** drop
  the `contentStyle backgroundColor:'#0e1622'` filler (it only hid the seam).

## Gotchas / how-to
- `websearch_cited` returned HTTP 402 (out of credits) this session → use
  `websearch` / `webfetch` / `gh_grep` instead.
- Plan mode (read-only) blocks edits / commits / push AND device screenshots
  (they write files); the `tmp/shot_*.png` were captured before plan mode was
  switched on.
- Commit hygiene: `tmp/` (screenshots, run logs, `*.bak`) is untracked and
  should stay out of git — add `tmp/` to `.gitignore` when convenient.
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
- `components/GlassTabBar.tsx`: custom floating JS glass tab bar — currently
  UNUSED (Route B was reverted) but kept as the seam plan step-4 fallback.

## Platform + glass-option notes (committed 2026-07-26)
- **expo-glass-effect** (v57.0.1) is a REAL official pkg = a native iOS glass
  view (iOS 26 Liquid Glass as a component). It's in node_modules (transitive)
  but NOT in package.json and NOT imported. iOS-only. A genuine OPTION for true
  native-glass cards / tab bar on iOS (Android would fall back to expo-blur).
- **iOS seam decision STILL OPEN.** Options on the table: (1) custom JS glass
  pill via expo-router JS `Tabs` + custom `tabBar` (full-bleed; recreates the
  old working look — the deleted `navigation/TabNavigator.tsx` is the template);
  (2) keep NativeTabs liquid-glass + a cosmetic dark bar to hide the seam;
  (3) use `expo-glass-effect` for the bar/cards (iOS-only). Verified in
  react-native-screens types: NativeTabs has NO iOS edge-to-edge prop, so the
  scene can't go behind the native bar via a prop.
- **Android:** `npx expo run:android` BUILDS + BUNDLES fine on AVD
  `Medium_Phone_API_36.0` (API 36). The EMULATOR then crashed on a **gfxstream
  GPU "Failed to restore previous context"** error — emulator graphics, NOT our
  app. Retry with software GPU:
  `emulator -avd Medium_Phone_API_36.0 -gpu swiftshader_indirect`. Run the
  android metro on `--port 8082` so it doesn't clobber the iOS metro on 8081.
- **Expo Go:** our app IS compatible — every dep is Go-bundled, no custom
  native modules. Caveats: phone's Expo Go must be SDK 57; the native splash
  config plugin is ignored (Go shows its own loader); platform visual gaps are
  identical (iOS seam; Android gray `luminosity` blend + Material non-glass
  bar). Serve with plain `npx expo start` (NOT `--dev-client`); use a free port
  (`--port 8083`) if 8081 is held by a dev-client metro.
- **Android screenshot:** `adb -s emulator-5554 exec-out screencap -p > tmp/android.png` then Read.
