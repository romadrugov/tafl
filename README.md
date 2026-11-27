# TAFL — Games of the North

Offline collection of Brandubh, Tablut, Hnefatafl (Fetlar-inspired) and Copenhagen. Three AI levels, both sides, EN/ES/RU, independent saves, sound, history and undo.

## Architecture

- `www/index.html`: current game (UI, rules, AI and translations).
- `www/icon.svg`: launcher/web icon artwork.
- `capacitor.config.json`: Capacitor 8; application ID `com.taflclub`.
- `scripts/prepare-android.mjs`: generates the native Android project, copies web assets, adds system-bar safe areas and sets version 0.9.3 / code 23.
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

This is a packaging migration, not a Play Store release. Native UI and installation still require device testing. Copenhagen exit forts and historical repetition rules still need validation. Ads, billing and Firebase are not integrated.

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
