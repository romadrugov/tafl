# TAFL — Games of the North

Offline collection of Brandubh, Tablut, Hnefatafl (Fetlar-inspired) and Copenhagen. Three AI levels, both sides, EN/ES/RU, independent saves, sound, history and undo.

## Architecture

- `www/index.html`: current game (UI, rules, AI and translations).
- `www/icon.svg`: launcher/web icon artwork.
- `capacitor.config.json`: Capacitor 8; application ID `com.taflclub`.
- `scripts/prepare-android.mjs`: generates the native Android project, copies web assets, adds system-bar safe areas and sets version 0.9.4 / code 24.
- `.github/workflows/android.yml`: builds debug APK, unsigned release APK and AAB on pushes to main or manual dispatch.

The generated `android/` and `dist/` directories are not committed; regenerate them from source. For future native plugins, install dependencies and extend the preparation script or commit the generated native project deliberately.

## Development

Requires Node 22, JDK 21, Android SDK API 36 and build tools.

```sh
npm install
npm test
npm run android:prepare
cd android
./gradlew assembleDebug
```

For unsigned release outputs, run `./gradlew assembleRelease bundleRelease`. For the original web version, run `python3 -m http.server 8000 --directory www`.

## Test builds

See [GitHub Actions](https://github.com/romadrugov/tafl/actions) and download the artifact ZIP from a successful run. The debug APK is signed by a debug key, not the legacy APK key. It cannot replace an existing differently signed TAFL installation. A release APK must be signed securely before installation. Do not commit private keys, keystores or passwords. The package ID changed to com.taflclub in 0.9.3, so older installations have independent data. Legacy `file://` WebView localStorage uses a different origin than Capacitor's `https://localhost`, so old saves are not automatically migrated.

## Limitations

This is a packaging migration, not a Play Store release. Native UI and installation still require device testing. Copenhagen exit forts are recognized using a conservative sufficient-condition proof, not exhaustive search. The threefold repetition policy is not the official Copenhagen perpetual-repetition rule. Ads, billing and Firebase are not integrated.

## License

No redistribution or modification license has been selected. Public visibility does not itself grant such a license.

## Illustrated guide

The app has a localized About page, in-game illustrated rules and a pre-game How to play button. `npm run screenshots` generates real UI screenshots and tests the guide (install Playwright Chromium first). Run before preparing a release build.

## AI 0.8.0

All levels check immediate wins and every legal opponent reply at the root. Easy uses bounded stochastic choice; Medium and Hard complete a two-ply baseline and then deepen with variant-specific extra work/time budgets. AI tests cover both sides, immediate escape, defensive traps and all three levels across four rule sets. No calibrated Elo rating yet.

## 0.8.1

Easy now uses simple local scoring and probabilistic threat awareness (55% of non-winning turns), without deep search. Medium and Hard unchanged. Undo/Redo restores entire human/AI exchanges, persists the future branch in backward-compatible saves, and discards it when making a new move.

Debug builds now use `com.taflclub.test` and label TAFL Test for side-by-side testing without deleting the production installation. From 0.9.3 release builds use com.taflclub and the permanent owner-controlled signing key.

## 0.8.2

System/light/dark themes, saved preferences, live OS theme switching, and optional board movement/capture animations. System reduced-motion preferences are respected. Undo/Redo restore positions instantly. Android system bars follow the selected theme via Capacitor SystemBars; device verification still required.

## 0.9.0

Shared-device local two-player mode. Select opponent before game setup. Fixed board, opposite-facing turn indicators, compact local menus, single-ply undo/redo, and independent local/AI saves for each variant. Local moves never call the AI. All four variants and both themes supported.

## 0.9.1

Compact opponent selector and common top toolbar with undo, conditional redo, and one menu. Built with Gradle; debug APK signature checked using Android apksigner.

## 0.9.2

First permanent signing setup (then using `com.playtufl`), with signed APK and AAB generated through GitHub Actions. Debug builds then used `com.playtufl.test`. Production signing is required, and missing secrets fail the workflow. Keep the same signing key and increment versionCode for future updates.

## 0.9.3

Final domain-based application ID `com.taflclub` (debug: `com.taflclub.test`), matching taflclub.com. Same permanent owner-controlled signing key; game unchanged. Android treats this as a separate app from earlier IDs.

## 0.9.4

Local completed-game statistics, filters, separate AI/local results, idempotent undo/redo accounting, ordered settings, single Back button in guide, and conservative Copenhagen exit-fort detection (official rule: https://aagenielsen.dk/copenhagen_rules.php). Final package `com.taflclub`, existing permanent key.

## 0.9.5

Unified setup card, independently scrolling content and fixed bottom How to play/Start game controls. Local player names and complementary colors, saved per match with backward-compatible defaults; names in game and history. Same com.taflclub package and signing key.

## 0.9.6

Optional per-side chess clocks: off, 5, 10 or 20 minutes, no increment. Active-side thinking only; animations and app background are paused. Save/resume retains remaining time. Timeout is a normal loss recorded in statistics. Undo/redo unavailable in timed games; unchanged without clocks. Both AI and local modes, all four variants.

## 0.9.7

Android Back handled by Capacitor App plugin; in-game pause icon, shared pause state for timed/untimed and AI/local games. Both clocks freeze, pending AI work is cancelled and restarted on resume. History and rules preserve pause; timed positions blurred on pause. Back navigates overlays and setup without exiting the app. Production ID/signing unchanged.

## 0.9.8

One shared pause menu in AI and local matches, ordered Resume, Restart, Game log, Rules, Save and exit, Exit without saving. Restart confirmation preserves pause, and Back from the confirmation returns to the menu. Production ID/signing unchanged.

## 0.9.9

Custom theme and language pickers with equal-sized fields, hidden time control until opponent choice, compact setup header and top-right Rules, simplified pause menu, and removed redundant board-bottom Game log. Existing saves and release signing preserved.

## 0.9.10

Move undo/redo into a bottom toolbar. Game log appears there only when a game ends, alongside Undo (untimed games), New game and Main menu. Timed games still disallow undo/redo; all results expose the log. AI and local modes share controls, with responsive local board sizing.

## 0.9.11

Always-visible Undo and Redo (disabled when unavailable, including timed matches); left-aligned variant title without board dimensions, larger bottom turn/result status in AI matches, aligned player cards with active-side highlight. Local seat turn indicators retained. Production package and signing unchanged.

## 0.9.12

Stronger Medium/Hard and new Impossible level. Exact king-exit fork proof supplements minimax, deeper optional search with variant-scaled budgets, no deliberate errors outside Easy. Impossible is not a solved-game guarantee. Existing level IDs, saves, stats, package and signing preserved. Regression includes actual player-reported game.

## 0.10.0

Adds Historical Hnefatafl (11×11, throne), Ard Rí (7×7, throneless), Tawlbwrdd (11×11 Lewis Cross, throneless), Magpie (7×7 slow king), Berserk (11×11 commanders, knight, optional capture chains). Rules based on https://aagenielsen.dk/tafl_rules.php and https://abstractplay.com/wiki/doku.php?id=games:tafl. For historical and Berserk profiles third repetition is a white loss as digital approximation of perpetual repetition. Old variant IDs and signing unchanged. Berserk full turns are paths, stored as one history entry; draft sequences survive save/resume. Sea Battle deferred.

## 0.10.1

Royal visual system: monochrome pieces with custom SVG crown, sword and axe, double-diamond throne, rotated geometric corner ornaments, parallel perimeter markings, lighter graphite goal/restricted cells (#85867c). Shared symbols across previews, gameplay, animations and guides. No game rule or save schema changes.

## 0.10.2

Remove graphite backgrounds from all special squares. Preserve normal alternating wood colors and dark engraved double-diamond, corner and perimeter marks in gameplay, previews and rules. Temporary selection, last-move and capture highlights remain unchanged in purpose. No changes to rules, AI, storage or signing.

## 0.10.3

Board-first match layout: compact AI row above and human row below the board, independent of side; monochrome color indicator, name/difficulty, small count and optional inline clock. Local face-to-face retains orientation and turn feedback, with compact clocks beside names and piece counts. No changes to rules, AI, save schema or signing.

## 0.10.4

Center the board vertically in AI matches using equal flexible regions above and below it, with player rows adjacent to the board, a fixed compact header and grouped controls. Compact portrait and two-column landscape layouts, stable selection and inline Berserk end-turn action. Local face-to-face orientation preserved. No game engine or save changes.

### Android test releases

Successful Android builds from `main` automatically publish their signed APK and its SHA-256 checksum as a [GitHub pre-release](https://github.com/romadrugov/tafl/releases). Install the APK directly from Assets, without downloading an Actions ZIP. Each version's first release uses `v<version>`; subsequent successful builds of the same version receive a unique CI tag. Existing releases and tags are not overwritten. Unsigned/debug builds and AABs remain in Actions artifacts. Publishing requires all tests, signing and artifact uploads to succeed; the release job has scoped repository contents-write permission.

## 0.10.5

Improve dark-theme black player token contrast, show current turn with a subtle highlighted player row, accent line and dot, and place compact undo/redo buttons beside the human's information in AI matches. Keep the board centered, full result controls, Berserk continuation action, accessible turn announcements and local face-to-face toolbar. No changes to game rules, AI, clocks, save schema or release signing.

## 0.10.6

Padded active player highlight; result title and reason above the board in AI games. Timed games still disallow history navigation during an ordinary live match, but allow undo/redo after the result, restore per-position clocks and permit a new branch. Timeout is reversible; old saves lacking historical clock checkpoints use the saved remaining time as fallback. Result statistics follow undo/redo. No engine changes.

## 0.11.0

Unified interactive tutorial: first optional gallery card, 25 engine-validated exercises, three languages, saved progress and completion, replay, manual hide and settings restore. Training uses separate state and never touches match saves or statistics. Removed redundant gallery descriptions and setup/settings explanatory captions. Existing per-variant rules remain available.

## 0.11.1

Structured tutorial: game premise and annotated board first, then movement, captures, winning, variant differences and separate Magpie, Copenhagen and Berserk chapters. Three reading pages and 25 interactive exercises, with automatic transitions after real game movement/capture animations. Reading pages advance manually; completed courses retain their status and can be replayed. Existing tutorial visibility and progress IDs preserved. No engine-rule changes.
