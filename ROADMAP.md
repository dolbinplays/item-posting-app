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
- IndexedDB inventory safety checkpoints mirror item-list saves outside regular app settings storage and can restore the local inventory list if browser quota blocks normal saves. Implemented.
- Safe storage housekeeping trims older guided workflow checkpoints and old saved capture sessions while preserving manual draft versions, inventory items, item photos, and the IndexedDB safety checkpoint. Implemented.
- Storage architecture readiness report classifies the current data shape as healthy/watch/at-risk, summarizes local storage, media-library records, checkpoint freshness, photo readiness, Google sync review needs, and top item-level photo/sync risks, and exports a JSON diagnostic for future native-storage migration planning. Top-risk items can now open directly into the Inventory editor, focus the most relevant guided repair section, and show the reason the item was flagged. Implemented.
- Archive-readiness signal identifies which items already have enough Google Drive/Sheet coverage to become candidates for future lighter local records or native-storage archival. It reports counts, top ready/not-ready items, and archive blocker drilldowns with links into the most relevant guided repair section; it does not delete or compact item records yet. Implemented.
- Archive dry-run summary and export produce a reviewable, no-data-changes plan showing which items would be eligible for future local media compaction, what would be kept, what could be removed or shrunk, and which blockers prevent archiving. Implemented.
- Future archive safety checklist documents required safeguards and keeps the archive-local-media action visibly disabled until the backup, dry-run review, and explicit-confirmation workflow is ready. Implemented.
- Guarded archive-local-media compaction trims heavy embedded browser photo fields only for archive-ready items after the user checks backup review, dry-run review, and explicit local-record confirmation. It keeps item records, thumbnails, Drive/Sheet links, and media-library references while holding not-ready items unchanged. Implemented.
- IndexedDB item-record store mirrors each inventory item as its own browser database record, reports parity against the current local inventory, restores from those records, and includes the store in the storage architecture readiness report. This is the next measurable bridge toward a native/Capacitor database. Implemented.
- Storage-location manager summarizes bins, shelves, totes, and unassigned items with item counts, status mix, storage-photo coverage, review counts, quick preset saving, and Focus Inventory actions. Implemented.
- Bulk storage-location moves let the user move every item from one location to another after preview/confirmation, save the new destination as a preset, queue workspace sync, and preserve each item's prior location in move history. Implemented.
- Printable storage labels assign stable short label codes to named storage locations and export a printer-friendly HTML label sheet as the foundation for future QR/barcode scanning. Implemented.
- Printable missing-item check sheets export per storage location with expected item counts, Found/Missing columns, last-updated data, and app review notes for physical inventory audits. Implemented.
- Google Sheets/CSV exports include each item's stable storage label code so the Sheet index, printable labels, and future scan lookup use the same storage identifier. Implemented.
- Printable storage map export lists every storage location, label code, status mix, storage-photo coverage, review counts, and assigned items for physical inventory planning. Implemented.
- Sale tracking foundation records sold date, sold marketplace, sold price, original item cost, fees, shipping cost, sale notes, and calculated net profit in item records, workstation review, JSON/media manifests, and CSV/Sheets exports. Implemented.
- Dedicated sales/profit CSV export gives a compact accounting handoff with item IDs, status, storage label codes, asking price, sold price, original cost, fees, shipping, net profit, and sale notes. Implemented.
- Fulfillment tracking adds pickup/shipping status, shipped or pickup date, carrier, and tracking/receipt number to sold-item records, workstation review, and CSV/Sheets exports. Implemented.
- Google account authorization, Drive root folder creation, one Drive folder per inventory item, best-available photo uploads, Google Sheet index creation, and Sheet row updates.
- Inventory and workstation list highlights for items held by the Google Sync `Needs review` readiness gate.
- Configurable listing-quality review rules: every listing step remains suggested, users choose which missing steps trigger highlights, and Inventory or Workstation can filter directly to items needing review. Implemented.
- Reusable seller/store display-name preference for watermarking, including safe second-device setup handoff and JSON backup restore. Implemented.
- Save-time Google sync and local capture cleanup for ready inventory items.
- Optional silent Google reconnect preference that reacquires an in-memory token when Google allows it without storing access tokens.
- Secure OpenAI relay for photo recognition, structured listing suggestions, and listing-draft assistance.
- Pricing research workspace with marketplace search shortcuts, public URL lookup, manually saved comparables, screenshot batch recognition, and quick-sale / fair-market / high-end calculations.

## Current Work

- Stage 11 installable PWA phone test, followed by Android Trusted Web Activity wrapper tooling. Repository-side TWA setup guidance and Digital Asset Links template implemented; interactive Android dependency installation is the next checkpoint.

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
- Offline launch guard for the installed PWA/TWA: Google Identity, silent reconnect, Drive, and Sheets sync remain paused while offline so the app shell stays open instead of navigating to Google auth. Implemented.
- Android APK wrapper with Bubblewrap, production PNG icons, signing key, and hosted Digital Asset Links association. First signed APK and App Bundle generated locally; domain-root association verified live. Phone test remains.
- Repository-side Bubblewrap setup guide, generated-wrapper ignore rule, Digital Asset Links template, and GitHub Pages domain-root hosting constraint documentation. Implemented.
- Better native storage, camera permissions, media permissions, and offline reliability. A Trusted Web Activity wrapper alone does not remove browser storage constraints; evaluate a Capacitor/native Android storage layer with a local database and app-managed media files before treating the APK as the long-term inventory client.
- Browser-native storage bridge: item records now mirror to IndexedDB as an inventory safety checkpoint while the app keeps the compatible localStorage live path. Use this as the measured stepping stone toward Capacitor/native database storage. Implemented.
- Per-item IndexedDB record mirror added after the safety checkpoint bridge so future native database migration can move item records one at a time instead of relying only on one large localStorage blob. Implemented.
- Safe storage housekeeping and storage-health reporting added before a full native database migration so phone limits are visible and low-impact cleanup happens automatically. Implemented.
- Storage architecture readiness report added as a measurable gate before a Capacitor/native database migration. It should show whether inventory records, media-library photos, Google Drive backups, and recovery checkpoints are healthy enough to move storage responsibility out of regular browser app data. Implemented.
- Evaluate a Play Store distribution path.

### Stage 12 - Multi-Camera Capture

- Pair a second phone by QR code.
- Photo, video, two-angle, and detail-camera modes.
- Synchronized capture sessions.

### Stage 13 - Advanced Inventory Tools

- Storage-location management screen. Foundation implemented in Backup/Restore review tools with location summaries and quick inventory focus.
- Bulk move items between storage locations from the storage-location manager. Implemented.
- QR or barcode storage labels, bulk item moves, storage maps, and missing-item checks.
- Printable storage label foundation with stable per-location codes. Implemented. Future scan lookup can attach QR/barcode capture to these codes.
- Storage label codes now flow into Google Sheets/CSV and media manifest exports. Implemented.
- Printable storage map foundation groups locations and items for offline physical review. Implemented.
- Missing-item check sheet foundation exports physical audit worksheets from each storage-location card. Implemented. Future scan lookup can mark items found or missing directly in the app.
- Configurable listing-quality checklist: show every item-creation step as a suggested step, including photos, watermark, item details, AI review, pricing research, storage location, storage photo, marketplace draft, and Google backup. Implemented.
- User-selectable `Flag for review if missing` rules for checklist steps. Highlight inventory and workstation items when any enabled rule is incomplete, show the missing steps on the item card, and provide a focused `Needs Review` filter. Implemented.
- Reusable seller/store display-name preference for watermarking. Allow the user to save, edit, and clear the name, prefill it when applying watermarks, and include it in safe second-device setup handoff. Store display text only, never marketplace credentials or account tokens. Implemented.
- Sold and shipped workflow with profit, fee, and shipping tracking. Sale/profit tracking foundation, fulfillment fields, and dedicated sales CSV export implemented; future work can add receipt exports and richer profit dashboards.

## Architecture Principles

- Google Sheets is the inventory and listing index.
- Google Drive is the long-term photo and video backup.
- Browser-local media is temporary working storage and should remain optimized for phone reliability.
- Saved browser inventory records keep only one small embedded display preview per photo. Full-resolution originals and watermarked exports belong in IndexedDB temporarily and Google Drive durably. Implemented.
- Low-storage warnings open an in-context recovery dialog, pause automatic workspace writes for the session, and offer least-disruptive cleanup actions first: old capture sessions, selected-item draft checkpoints, current temporary captures, emergency thumbnail optimization with full copies retained in IndexedDB, then the full Backup cleanup tools. Implemented.
- Native-storage migration should be gated by a readable architecture report, not guesswork: item records must have a fresh IndexedDB safety checkpoint, photos should be media-backed or uploaded to Drive, and Google sync review holds should be visible before moving to Capacitor/local database storage.
- Paid AI calls must be explicit, visible to the user, and routed through the secure relay. Local tools and public URL lookup should remain free.
