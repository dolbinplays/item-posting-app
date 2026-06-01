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

The development PC still needs Java, Android SDK tooling, and Bubblewrap before it can build an APK. The Trusted Web Activity step will also need:

1. A generated Android wrapper project.
2. An Android signing key.
3. A hosted `/.well-known/assetlinks.json` association for full-screen verified app mode.
4. Phone testing for camera, Google sign-in, Drive sync, offline launch, and update behavior.

Do not replace the PWA with a local WebView bundle unless a specific native feature requires it. A local WebView origin would change the already-tested Google OAuth and storage assumptions.
