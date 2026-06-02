# Item Posting Assistant Roadmap

## Implemented Foundation

- Phone-first item capture, calibration, storage presets, storage-location photos, and recoverable watermarks.
- Compact mobile inventory browser with item editing and draft history.
- Guided inventory accordion with saved checkpoints for photos, details, pricing, storage, and marketplace draft assembly.
- Item-level saved draft-history cleanup and cross-device compressed storage-location previews.
- After `Save Item`, offer to remove older draft-history checkpoints while preserving the current saved item fields and final marketplace draft. Recommend cleanup for items marked `Ready to Post`, `Listed`, or `Sold`. Implemented.
- Final `Save Item` completion feedback stays in the inventory status panel instead of showing a blocking browser alert. Implemented.
- Device roles for full app, photo capture station, and desktop workstation layouts. Capture-station mode hides laptop-only workstation navigation while keeping inventory and backup available.
- Guided workflow checkpoint saves retry without adding another history snapshot when browser storage is tight.
- Inventory rendering remains read-only: opening an item no longer attempts optional shared storage-photo cache writes.
- Google account authorization, Drive root folder creation, one Drive folder per inventory item, best-available photo uploads, Google Sheet index creation, and Sheet row updates.
- Inventory and workstation list highlights for items held by the Google Sync `Needs review` readiness gate.
- Save-time Google sync and local capture cleanup for ready inventory items.
- Optional silent Google reconnect preference that reacquires an in-memory token when Google allows it without storing access tokens.
- Secure OpenAI relay for photo recognition, structured listing suggestions, and listing-draft assistance.
- Pricing research workspace with marketplace search shortcuts, public URL lookup, manually saved comparables, screenshot batch recognition, and quick-sale / fair-market / high-end calculations.

## Current Work

- Stage 11 installable PWA phone test, followed by Android Trusted Web Activity wrapper tooling.

## Next Roadmap Stops

### Stage 9 - Pricing Research Follow-Through

- Marketplace-specific guidance generated from saved comparables. Implemented.
- Saved research summaries and clearer comparable review tools. Implemented.
- AI usage guardrails and optional browser-local spending warnings. Implemented.
- Centralized administrator-facing AI usage view for a future multi-user release.

### Stage 10 - Desktop Workstation Mode

- Core Stage 10 workflow confirmed on phone and laptop.
- Desktop browser workstation for inventory review, draft preview, status updates, and Facebook Marketplace copy controls. Foundation implemented.
- Google-only shared workspace for a single user or small household: lightweight item records sync through Drive while Sheets remains the index and Drive remains media storage. Explicit pull, push, and two-way merge foundation implemented.
- Shared-workspace records include compressed display previews so a second device can show inventory thumbnails while full-resolution originals remain in Drive and on the capture device. Implemented and confirmed on PC.
- Automatic shared-workspace checks after Google sign-in, on tab focus, and at a cautious visible-tab polling interval. Local inventory edits queue a delayed pull-merge-push so phone and laptop records stay aligned without constant manual button taps. Implemented.
- Safe copy-and-paste handoff code for quickly configuring a second device with the same Google workspace. Implemented. Optional QR rendering can build on the same handoff payload later.
- Easier copy and paste into Facebook Marketplace from a laptop, with a per-item posting checklist for Marketplace, title, price, description, and pickup notes. Implemented.

### Stage 11 - Android APK Conversion

- Conservative packaging path chosen: installable PWA first, then an Android Trusted Web Activity wrapper after phone testing and Android tooling setup.
- Installable PWA foundation with app name, icon, manifest, offline shell, and an in-app install control. Implemented; phone test pending.
- Android APK wrapper with Bubblewrap, production PNG icons, signing key, and hosted Digital Asset Links association.
- Better native storage, camera permissions, media permissions, and offline reliability. A Trusted Web Activity wrapper alone does not remove browser storage constraints; evaluate a Capacitor/native Android storage layer with a local database and app-managed media files before treating the APK as the long-term inventory client.
- Evaluate a Play Store distribution path.

### Stage 12 - Multi-Camera Capture

- Pair a second phone by QR code.
- Photo, video, two-angle, and detail-camera modes.
- Synchronized capture sessions.

### Stage 13 - Advanced Inventory Tools

- Storage-location management screen.
- QR or barcode storage labels, bulk item moves, storage maps, and missing-item checks.
- Configurable listing-quality checklist: show every item-creation step as a suggested step, including photos, watermark, item details, AI review, pricing research, storage location, storage photo, marketplace draft, and Google backup.
- User-selectable `Flag for review if missing` rules for checklist steps. Highlight inventory and workstation items when any enabled rule is incomplete, show the missing steps on the item card, and provide a focused `Needs Review` filter.
- Reusable seller/store display-name preference for watermarking. Allow the user to save, edit, and clear the name, prefill it when applying watermarks, and include it in safe second-device setup handoff. Store display text only, never marketplace credentials or account tokens.
- Sold and shipped workflow with profit, fee, and shipping tracking.

## Architecture Principles

- Google Sheets is the inventory and listing index.
- Google Drive is the long-term photo and video backup.
- Browser-local media is temporary working storage and should remain optimized for phone reliability.
- Saved browser inventory records keep only one small embedded display preview per photo. Full-resolution originals and watermarked exports belong in IndexedDB temporarily and Google Drive durably. Implemented.
- Low-storage warnings open an in-context recovery dialog, pause automatic workspace writes for the session, and offer least-disruptive cleanup actions first: old capture sessions, selected-item draft checkpoints, current temporary captures, emergency thumbnail optimization with full copies retained in IndexedDB, then the full Backup cleanup tools. Implemented.
- Paid AI calls must be explicit, visible to the user, and routed through the secure relay. Local tools and public URL lookup should remain free.
