# Privacy Policy — Rosetta for Intune

_Last updated: 2026-07-15_

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

The translation is performed entirely on your device using a version database that is
bundled inside the extension. The extension makes **no network requests** and sends
**no data** anywhere.

## What the extension stores

The extension stores only your display preferences (whether the overlay is enabled,
whether to show the original build number, and whether to show the patch month). These
are saved using Chrome's `storage.sync` API so they follow your Chrome profile. This
data never leaves Google's sync service for your own account and is not accessible to
the developer.

## What the extension does NOT do

- It does not collect, log, or transmit any personal information.
- It does not track your browsing activity.
- It does not read credentials, form inputs, cookies, or page content other than the
  Windows version text it translates.
- It does not use analytics or third-party services.
- It does not sell or share any data.

## Contact

For questions about this policy, contact: **YOUR-EMAIL@YOUR-WEBSITE**

## Changes

Any future changes to this policy will be posted at this URL with an updated date.
