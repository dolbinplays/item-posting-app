# Android development progress

## Baseline

Checkpoint: `audit-baseline-2026-11-21` at `08c2fe2`. The tracked project is a hosted PWA with a Cloudflare relay and a local, ignored Bubblewrap Trusted Web Activity project. The wrapper runs the hosted app on its existing HTTPS origin, which owns browser storage, camera permissions, and Google OAuth.

## Confirmed findings

| Severity | Finding | Status |
| --- | --- | --- |
| High | An interrupted automatic capture could leave the UI locked; failed storage writes could appear successful. | Capture checks for stream replacement and disconnection, reports failure, and always clears the countdown and busy state. |
| High | Backup readiness interpolated an imported item title and status into HTML. | Both values are escaped before rendering. Similar templates still need a broader review. |
| High | Navigation could poison the offline shell with an HTTP error or unrelated page. Activation could delete another app's caches on the same origin. | Use the install-time shell, scope fetch handling, and remove only app-owned older caches. |
| Medium | Workstation loaded and searched the whole inventory once per visible item. | Read and index the inventory once per render. This removes repeated reads and scans; device timing is pending. |

## Verification

- Run `node --test tests/stability.test.cjs` from the repository root. Covers successful four-shot capture, interruption, failed storage write, offline navigation, HTTP 503 fallback, and unrelated cache preservation with mocked browser APIs.
- Android Studio's bundled Java failed to configure Gradle's unit-test task. The existing Bubblewrap JDK 17 and SDK are the compatible local toolchain.
- Clean debug assembly and separate release assembly succeeded with one Gradle worker and a 1.5 GB JVM heap. Android lint succeeded after resolving its dependencies online. The native unit-test task reported `NO-SOURCE`.
- The existing signed APK passed signature verification and matched the documented SHA-256 fingerprint. This wrapper launches the hosted version. The local PWA changes require a hosted test environment for end-to-end acceptance through the wrapper.

## Release checklist

- Verify Android build, lint, signing identity, and install of the existing TWA package.
- Exercise cold launch, offline relaunch, update, capture interruption, and storage pressure on Android.
- Verify Google sign-in, media upload, Sheets writes, and two-device recovery against an authorized test workspace.
- Review remaining import, relay, media recovery, and inventory persistence paths. Benchmark a representative large inventory on Android before proposing a native storage migration.
- Validate the established manual marketplace handoff, including copy, retry, and listing status. Direct publishing requires a supported platform integration and authorization.
- Preserve the signing key and keep deployment and public distribution pending explicit authorization.
