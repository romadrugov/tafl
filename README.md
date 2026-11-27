# TAFL — Games of the North

Offline collection of Brandubh, Tablut, Hnefatafl (Fetlar-inspired) and Copenhagen. Three AI levels, both sides, EN/ES/RU, independent saves, sound, history and undo.

## Architecture

- `www/index.html`: original, unmodified 0.6.5 game (UI, rules, AI and translations).
- `www/icon.svg`: launcher/web icon artwork.
- `capacitor.config.json`: Capacitor 8; application ID `com.tafl.kingescape`.
- `scripts/prepare-android.mjs`: generates the native Android project, copies web assets, adds system-bar safe areas and sets version 0.7.2 / code 16.
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

See [GitHub Actions](https://github.com/romadrugov/tafl/actions) and download the artifact ZIP from a successful run. The debug APK is signed by a debug key, not the legacy APK key. It cannot replace an existing differently signed TAFL installation. A release APK must be signed securely before installation. Do not commit private keys, keystores or passwords. The package ID remains unchanged; legacy `file://` WebView localStorage uses a different origin than Capacitor's `https://localhost`, so old saves are not automatically migrated.

## Limitations

This is a packaging migration, not a Play Store release. Native UI and installation still require device testing. Copenhagen exit forts and historical repetition rules still need validation. Ads, billing and Firebase are not integrated.

## License

No redistribution or modification license has been selected. Public visibility does not itself grant such a license.

## Illustrated guide

The app has a localized About page, in-game illustrated rules and a pre-game How to play button. `npm run screenshots` generates real UI screenshots and tests the guide (install Playwright Chromium first). Run before preparing a release build.

## AI 0.8.0

All levels check immediate wins and every legal opponent reply at the root. Easy uses bounded stochastic choice; Medium and Hard complete a two-ply baseline and then deepen with variant-specific extra work/time budgets. AI tests cover both sides, immediate escape, defensive traps and all three levels across four rule sets. No calibrated Elo rating yet.
