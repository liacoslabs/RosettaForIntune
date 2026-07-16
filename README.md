# Rosetta for Intune

A Chrome / Edge (Manifest V3) extension that translates the cryptic Windows build numbers
shown in the **Microsoft Intune admin center** into compact, human-readable labels.

> `10.0.26200.8875`  →  **11-25H2-Jul2026**

The label tells you the edition, the feature update, and the month the device was last
patched — at a glance. The original build is available on hover (and optionally inline).

[**▶ Install from the Chrome Web Store**](https://chromewebstore.google.com/detail/rosetta-for-intune/idamhefkokoaljmclafeddaiidpeince)

![Rosetta for Intune turns raw Intune OS version numbers into readable labels](store/screenshots/screenshot-1.png)

---

## What it does

The Intune **OS version** field reports strings like `10.0.26200.8875`:

| Segment | Meaning |
| --- | --- |
| `10.0` | NT kernel family (both Windows 10 & 11 report `10.0`) |
| `26200` | **Build** — identifies the feature update (25H2) |
| `8875` | **Revision** — identifies the monthly cumulative update (patch level) |

Rosetta:

- Maps the **build** to its Windows edition and feature-update version — e.g. `11-25H2`.
- Maps the **revision** to the exact patch **month/year** when it's in the bundled data —
  producing the full label `11-25H2-Jul2026`.
- Rewrites every occurrence anywhere in the console — device lists, device detail blades,
  reports — and keeps up with the SPA as you navigate. It pierces the Shadow DOM and the
  same-origin iframes that the Azure "Ibiza" portal framework renders Intune's grids in.

Everything runs locally. There are no accounts, analytics, trackers, or network calls; the
version database is bundled in the extension.

## Screenshots

**In context — right inside your device lists**

![An Intune device list with the OS version column translated](store/screenshots/screenshot-2.png)

**Configurable — a one-click toolbar popup**

![The toolbar popup with overlay toggles](store/screenshots/screenshot-3.png)

**Hover for the full build details**

![A hover tooltip showing edition, GA date, patch month, and the raw build](store/screenshots/screenshot-4.png)

**Broad coverage — Windows 11, 10, and Server**

![Coverage across Windows 11, Windows 10, and Windows Server 2022](store/screenshots/screenshot-5.png)

## Install

**From the Chrome Web Store (recommended):**
[chromewebstore.google.com/detail/rosetta-for-intune](https://chromewebstore.google.com/detail/rosetta-for-intune/idamhefkokoaljmclafeddaiidpeince)

**Unpacked, for development:**

1. Open `chrome://extensions` in Chrome (or `edge://extensions` in Edge).
2. Enable **Developer mode** (top-right).
3. Click **Load unpacked** and select this repository's root folder (the one containing
   `manifest.json`).
4. Open [intune.microsoft.com](https://intune.microsoft.com) and browse to any page showing
   OS versions.

## Options

Click the toolbar icon to toggle:

- **Enable overlay** — master on/off.
- **Show original build number** — keep the raw `10.0.x.y` next to the friendly label (off by default).
- **Show patch month** — append the exact patch month derived from the revision.

Changes reload the active tab so the page re-renders with the new setting.

## Repository structure

```
manifest.json          MV3 manifest (Intune / Azure portal origins)
src/versions.js        Build & revision database + lookup helpers
src/content.js         DOM scanner + rewriter (Shadow DOM & iframe aware)
src/content.css        Badge styling (light + dark)
popup/                 Toolbar popup (settings + live preview)
icons/                 Extension icons
store/                 Chrome Web Store submission materials (listing copy, privacy, imagery)
```

## Keeping the data current

- **`WVE_BUILDS`** in [`src/versions.js`](src/versions.js) rarely changes — add a row when a
  new Windows feature update ships (a new build number).
- **`WVE_REVISION_DATES`** provides exact patch-month precision. Refresh it periodically from
  Microsoft's release-health pages if you want the latest revisions recognized:
  - Windows 11: <https://learn.microsoft.com/windows/release-health/windows11-release-information>
  - Windows 10: <https://learn.microsoft.com/windows/release-health/release-information>

  Devices on an unlisted revision still get the correct feature-update label (e.g. `10-22H2`);
  only the trailing patch month is omitted.

## Notes

- Covers Windows 11 (21H2–26H1), Windows 10 (1507–22H2), and Windows Server 2022.
- Build `26100` is shared with Windows Server 2025 and `17763` with Server 2019; the client
  feature-update label is used since Intune device inventory is client-centric.
- The bundled data is current through the **July 2026** patch cycle.

## License

Released under the [MIT License](LICENSE). © 2026 Liacos Labs.

Rosetta for Intune is an independent project and is not affiliated with, endorsed by, or
sponsored by Microsoft Corporation. Windows, Microsoft Intune, and related marks are
trademarks of Microsoft Corporation.
