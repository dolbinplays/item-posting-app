# Android Packaging Plan

## Chosen Path

Start with the installable Progressive Web App served from the existing GitHub Pages HTTPS origin. After that PWA is tested on the phone, generate an Android Trusted Web Activity wrapper with Bubblewrap.

This is deliberately conservative:

- Camera capture continues to use the tested secure-origin browser APIs.
- Google OAuth continues to run on the existing authorized GitHub Pages origin.
- Browser-local `localStorage` and IndexedDB behavior does not change during the first install test.
- Drive and Sheets remain the cross-device data layer.
- The browser app remains deployable without waiting for Android build tools.

## Current Checkpoint

The repository now includes:

- `manifest.webmanifest`
- `sw.js`
- `icons/app-icon.svg`
- `icons/app-icon-192.png`
- `icons/app-icon-512.png`
- An in-app PWA install status panel and install button

The service worker uses network-first navigation so a new deployment can refresh `index.html` while preserving an offline app-shell fallback.

## APK Follow-Up

The development PC currently has Node.js, but still needs Java, Android SDK tooling, and Bubblewrap-managed dependencies before it can build an APK. Run Bubblewrap interactively from PowerShell when ready:

```powershell
cd "H:\Backup project files\ListingApp\New folder\item-posting-app"
npx @bubblewrap/cli init --manifest="https://dolbinplays.github.io/item-posting-app/manifest.webmanifest" --directory="android/twa-project"
```

On its first run, Bubblewrap offers to install a JDK and Android SDK dependencies. Accepting that prompt is the intended next setup step. Keep the generated wrapper project under `android/twa-project/`.

The Trusted Web Activity step also needs:

1. A generated Android wrapper project.
2. An Android signing key kept outside Git.
3. A generated signing-certificate SHA-256 fingerprint.
4. A hosted `/.well-known/assetlinks.json` association for full-screen verified app mode.
5. Phone testing for camera, Google sign-in, Drive sync, offline launch, and update behavior.

Do not replace the PWA with a local WebView bundle unless a specific native feature requires it. A local WebView origin would change the already-tested Google OAuth and storage assumptions.

## GitHub Pages Hosting Constraint

The app is currently served from the project path:

```text
https://dolbinplays.github.io/item-posting-app/
```

Android Digital Asset Links verification does not look under that project path. It fetches:

```text
https://dolbinplays.github.io/.well-known/assetlinks.json
```

That file must be published from the `dolbinplays.github.io` user-site repository or from a custom domain that the project controls. The current `item-posting-app` project repository cannot publish the required domain-root path by itself.

After Bubblewrap generates a package name and signing fingerprint:

1. Copy `android/assetlinks.template.json`.
2. Replace the placeholder package name and SHA-256 fingerprint.
3. Publish the completed file as `.well-known/assetlinks.json` in the domain-root site repository.
4. Confirm that opening `https://dolbinplays.github.io/.well-known/assetlinks.json` returns the JSON file directly.

## Build And Test

After the interactive setup and `assetlinks.json` publication:

```powershell
cd "H:\Backup project files\ListingApp\New folder\item-posting-app\android\twa-project"
npx @bubblewrap/cli build
```

The first APK test should verify:

1. The app launches without browser chrome after Digital Asset Links verification.
2. Camera capture still works.
3. Google sign-in still works.
4. Drive and Sheets sync still work.
5. Closing and reopening the app preserves browser-local working data.
6. The offline shell opens when the phone temporarily has no network connection.

## Storage Reality Check

A Trusted Web Activity is an installable Android shell around the hosted PWA. It does not move photos into a native Android database or app-managed files. It is useful for installation and a cleaner launch experience, but it does not remove browser storage limits.

For a durable larger inventory, the next architecture evaluation should compare a Capacitor/native Android client with:

- SQLite or another local database for inventory records.
- App-managed media files for photos.
- Google Drive as durable photo backup.
- Google Sheets as the listing index.
- The existing hosted web app as the laptop workstation.
