# Chrome Web Store — Listing & Submission Details

Everything below is ready to paste into the Chrome Web Store **Developer Dashboard**
(https://chrome.google.com/webstore/devconsole) when creating the item.

---

## Product name
```
Rosetta for Intune
```

## Summary (short description — max 132 chars)
```
Translate cryptic Windows build numbers in the Intune admin center into clear labels like 11-25H2-Jul2026.
```

## Category
```
Developer Tools
```
(Alternate: **Productivity** — either is acceptable; Developer Tools fits the IT-admin audience.)

## Language
```
English (United States)
```

---

## Detailed description
```
Rosetta for Intune makes the Microsoft Intune admin center readable at a glance.

Intune reports the Windows "OS version" as an opaque string like 10.0.26200.8875.
Rosetta translates every one of those into a compact, human-readable label:

    10.0.26200.8875   →   11-25H2-Jul2026
    10.0.26100.4652   →   11-24H2-Jul2025
    10.0.19045.6456   →   10-22H2

The label tells you, at a glance:
 • Which Windows edition (10 or 11)
 • Which feature update / version (e.g. 25H2, 24H2, 22H2)
 • The month and year of the installed cumulative update (from the build revision)

Hover any label to see the full details — edition, feature-update name, GA date,
installed patch month, and the original build number.

WHERE IT WORKS
 • intune.microsoft.com (Microsoft Intune admin center)
 • The device blades, device lists, and reports rendered inside the portal

FEATURES
 • Automatic — translates as you browse; keeps up with the portal's dynamic tables
   and virtualized grids.
 • Compact — designed so the OS version column never needs widening.
 • Configurable — toolbar popup lets you toggle the overlay, show/hide the original
   build number, and show/hide the patch month.
 • Covers Windows 11 (21H2–26H1) and Windows 10 (1507–22H2), plus Windows Server 2022.

PRIVACY
 • No data collection. No tracking. No external network calls.
 • The build database is bundled in the extension; all translation happens locally.
 • The only stored data is your display preferences (via Chrome sync storage).

Rosetta for Intune is an independent tool and is not affiliated with, endorsed by,
or sponsored by Microsoft. "Windows", "Intune", and "Microsoft" are trademarks of
Microsoft Corporation.
```

---

## Single purpose (required field)
```
Rosetta for Intune has a single purpose: to translate the Windows OS build numbers
shown in the Microsoft Intune admin center into human-readable version labels.
```

## Permission justifications (required for review)

**storage**
```
Used only to save the user's display preferences (overlay on/off, show original
build number, show patch month) so they persist across sessions. No browsing or
personal data is stored.
```

**Host permissions** (`intune.microsoft.com`, `endpoint.microsoft.com`,
`portal.azure.com`, `*.hosting.portal.azure.net`, `*.portal.azure.net`,
`*.msftcloudes.com`, `*.microsoft.com`)
```
The extension reads and rewrites the visible Windows build-number text on the Intune
admin center pages. Intune is built on the Azure "Ibiza" framework and renders its
device grids inside iframes served from these Microsoft-owned origins, so the content
script must run on them to locate and translate the version strings. The extension
does not read credentials, form data, or any content other than the version text it
rewrites, and it makes no network requests.
```

## Data usage disclosures (Privacy practices tab)
Check these answers in the dashboard:
 • Does this item collect user data? — **No**
 • The item does not sell/transfer data, does not use data for unrelated purposes,
   and does not use data to determine creditworthiness / lending.
 • Certify compliance with the Developer Program Policies. ✅

## Privacy policy URL
Host `store/PRIVACY.md` (as HTML or Markdown) on your website and paste the URL here,
e.g.:
```
https://YOUR-WEBSITE/rosetta-for-intune/privacy
```
(A privacy policy URL is required because the extension declares host permissions.)

---

## Assets checklist

| Asset | Requirement | Status |
| --- | --- | --- |
| Store icon | 128×128 PNG | ✅ `icons/icon128.png` |
| Screenshots | 1280×800 or 640×400 PNG/JPEG, at least 1 (up to 5) | ✅ `store/screenshots/screenshot-1..5.png` (all 1280×800) |
| Small promo tile | 440×280 PNG (optional) | ✅ `store/promo-440x280.png` |
| Marquee promo | 1400×560 PNG (optional) | ✅ `store/marquee-1400x560.png` |

## Packaging
Upload the ZIP produced at `dist/rosetta-for-intune-v1.0.0.zip`
(contains `manifest.json` at the root — the format Chrome expects).

## Before you submit
1. Add a **Privacy policy URL** (host `PRIVACY.md`).
2. Capture at least one **1280×800 screenshot** (`store/screenshot.html`).
3. Optionally add `"homepage_url": "https://YOUR-WEBSITE"` to `manifest.json`
   pointing to your site, then re-zip.
4. Note the trademark disclaimer above is included in the description to reduce the
   chance of a "misleading affiliation" rejection for using "Intune" in the name.
