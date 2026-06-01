# Item Posting Assistant Roadmap

## Implemented Foundation

- Phone-first item capture, calibration, storage presets, storage-location photos, and recoverable watermarks.
- Compact mobile inventory browser with item editing and draft history.
- Google account authorization, Drive root folder creation, one Drive folder per inventory item, best-available photo uploads, Google Sheet index creation, and Sheet row updates.
- Inventory and workstation list highlights for items held by the Google Sync `Needs review` readiness gate.
- Save-time Google sync and local capture cleanup for ready inventory items.
- Secure OpenAI relay for photo recognition, structured listing suggestions, and listing-draft assistance.
- Pricing research workspace with marketplace search shortcuts, public URL lookup, manually saved comparables, screenshot batch recognition, and quick-sale / fair-market / high-end calculations.

## Current Work

- Stage 10 desktop workstation mode.

## Next Roadmap Stops

### Stage 9 - Pricing Research Follow-Through

- Marketplace-specific guidance generated from saved comparables. Implemented.
- Saved research summaries and clearer comparable review tools. Implemented.
- AI usage guardrails and optional browser-local spending warnings. Implemented.
- Centralized administrator-facing AI usage view for a future multi-user release.

### Stage 10 - Desktop Workstation Mode

- Desktop browser workstation for inventory review, draft preview, status updates, and Facebook Marketplace copy controls. Foundation implemented.
- Google-only shared workspace for a single user or small household: lightweight item records sync through Drive while Sheets remains the index and Drive remains media storage. Explicit pull, push, and two-way merge foundation implemented.
- Automatic shared-workspace checks after Google sign-in, on tab focus, and at a cautious visible-tab polling interval. Local inventory edits queue a delayed pull-merge-push so phone and laptop records stay aligned without constant manual button taps. Implemented.
- Safe copy-and-paste handoff code for quickly configuring a second device with the same Google workspace. Implemented. Optional QR rendering can build on the same handoff payload later.
- Easier copy and paste into Facebook Marketplace from a laptop, with a per-item posting checklist for Marketplace, title, price, description, and pickup notes. Implemented.

### Stage 11 - Android APK Conversion

- Installable Android version with app icon and name.
- Better native storage, camera permissions, media permissions, and offline reliability.
- Evaluate a Play Store distribution path.

### Stage 12 - Multi-Camera Capture

- Pair a second phone by QR code.
- Photo, video, two-angle, and detail-camera modes.
- Synchronized capture sessions.

### Stage 13 - Advanced Inventory Tools

- Storage-location management screen.
- QR or barcode storage labels, bulk item moves, storage maps, and missing-item checks.
- Sold and shipped workflow with profit, fee, and shipping tracking.

## Architecture Principles

- Google Sheets is the inventory and listing index.
- Google Drive is the long-term photo and video backup.
- Browser-local media is temporary working storage and should remain optimized for phone reliability.
- Paid AI calls must be explicit, visible to the user, and routed through the secure relay. Local tools and public URL lookup should remain free.
