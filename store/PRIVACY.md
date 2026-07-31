# Privacy Policy — Rosetta for Intune

_Last updated: 2026-07-31_

Rosetta for Intune ("the extension") is designed to be privacy-preserving. This policy
explains what the extension does and does not do with your information.

## Summary

**The extension does not collect, store, transmit, or sell any personal or browsing
data.** All processing happens locally in your browser.

## What the extension accesses

To do its job, the extension's content script runs on the Microsoft Intune admin
center and the Microsoft-owned origins that host its content (for example
`intune.microsoft.com`, `*.hosting.portal.azure.net`, and related `*.microsoft.com`
pages). On those pages it reads the visible Windows build-number text (e.g.
`10.0.26200.8875`) and rewrites it into a human-readable label (e.g. `11-25H2-Jul2026`).

The translation is performed entirely on your device.

To keep the translations current, a background service worker periodically fetches
Microsoft's public Windows **release-health** pages on `learn.microsoft.com`, parses the
build/version tables, and caches them locally. These are ordinary anonymous requests for
public web pages: **no personal or browsing data, credentials, or identifiers are sent**
(requests are made without credentials), and nothing about you or your devices leaves your
browser.

## What the extension stores

- **Preferences** — your display settings (overlay on/off, show original build, show patch
  month), saved via Chrome's `storage.sync` API so they follow your browser profile. This
  never leaves your own account and is not accessible to the developer.
- **Cached build data** — the parsed Windows release-health database, saved via `storage.local`
  so the overlay works quickly and offline between refreshes.

## What the extension does NOT do

- It does not collect, log, or transmit any personal information.
- It does not track your browsing activity.
- It does not read credentials, form inputs, cookies, or page content other than the
  Windows version text it translates.
- It does not use analytics, advertising, or tracking services.
- It does not sell or share any data.
- Its only outbound request is to Microsoft's public release-health pages, and it sends no
  data with it.

## Contact

For questions about this policy, contact: **help@liacoslabs.com**

## Changes

Any future changes to this policy will be posted at this URL with an updated date.
