# Permanent Android signing

The original prototype key was lost. Do not remove the old app until you are ready to lose or independently back up its local saves. TAFL Test has a separate application ID. Production still uses `com.tafl.kingescape`.

## One-time owner setup (macOS)

Install GitHub CLI and JDK 21 if needed: `brew install gh openjdk@21`. Run `gh auth login` and sign in as the repository owner. Generate a new key outside the repository. The example uses the Homebrew JDK directly:

```sh
mkdir -p "$HOME/.tafl-signing"
chmod 700 "$HOME/.tafl-signing"
KEY="$HOME/.tafl-signing/tafl-release.p12"
"$(brew --prefix openjdk@21)/bin/keytool" -genkeypair -storetype PKCS12 -keystore "$KEY" -alias tafl -keyalg RSA -keysize 3072 -validity 10000 -dname "CN=TAFL"
chmod 600 "$KEY"
```

Do not run key generation again if the file already exists. Choose a strong unique password and store it in a password manager. Save a separate encrypted/offline backup of the keystore.

```sh
base64 < "$HOME/.tafl-signing/tafl-release.p12" | tr -d '\n' | gh secret set TAFL_KEYSTORE_BASE64 --repo romadrugov/tafl
gh secret set TAFL_KEYSTORE_PASSWORD --repo romadrugov/tafl
gh secret list --repo romadrugov/tafl
```

The second command prompts for the same password without storing it in the command line. Never paste the key or password into chat, commit them or attach them to an issue. Base64 is not encryption; GitHub CLI encrypts the secret for storage.

Run the existing Android workflow manually on main after setting both secrets. The `TAFL-<version>-signed` artifact contains the production APK and signed AAB. The ordinary artifact contains the separate test APK and unsigned production outputs. If both secrets are missing, signing is skipped; if only one is missing, the workflow fails. The signing step checks APK signatures and AAB signature verification. Keep main protected and only authorize trusted workflow changes; anyone able to change a privileged workflow can potentially misuse the signing key.

## Google Play

The signed AAB is suitable for the next upload-preparation steps, not a guarantee of Play acceptance. Play App Signing distinguishes the app signing key (used for installed Play APKs) from the upload key. Decide whether to import the existing app signing key when enrolling, or accept a separate Google-generated app signing key (which may prevent in-place updates from sideloaded builds). Keep backups and do not rotate the key casually.
