/*
 * Windows build-number database + lookup helpers.
 *
 * The Intune "OS version" field reports a string like 10.0.26200.8875 where:
 *   10.0     -> NT kernel family (Windows 10 & 11 both report 10.0)
 *   26200    -> BUILD number.  This is what identifies the feature update (e.g. 25H2).
 *   8875     -> REVISION.       This identifies the monthly cumulative update (patch level).
 *
 * BUILD -> feature-update mapping is the primary, stable translation.
 * REVISION_DATES gives the precise "Month Year" a device was last patched, when known.
 *
 * Data source: Microsoft Learn release-health pages. Update REVISION_DATES periodically
 * to keep patch-month precision current; the BUILD map rarely changes.
 */

const WVE_BUILDS = {
  // ---- Windows 11 ----
  28000: { product: "Windows 11", version: "26H1", name: "2026 Update",          ga: "2026-02-10" },
  26200: { product: "Windows 11", version: "25H2", name: "2025 Update",          ga: "2025-09-30" },
  26100: { product: "Windows 11", version: "24H2", name: "2024 Update",          ga: "2024-10-01" },
  22631: { product: "Windows 11", version: "23H2", name: "2023 Update",          ga: "2023-10-31" },
  22621: { product: "Windows 11", version: "22H2", name: "2022 Update",          ga: "2022-09-20" },
  22000: { product: "Windows 11", version: "21H2", name: "2021 Update",          ga: "2021-10-04" },

  // ---- Windows 10 ----
  19045: { product: "Windows 10", version: "22H2", name: "2022 Update",          ga: "2022-10-18" },
  19044: { product: "Windows 10", version: "21H2", name: "November 2021 Update", ga: "2021-11-16" },
  19043: { product: "Windows 10", version: "21H1", name: "May 2021 Update",      ga: "2021-05-18" },
  19042: { product: "Windows 10", version: "20H2", name: "October 2020 Update",  ga: "2020-10-20" },
  19041: { product: "Windows 10", version: "2004", name: "May 2020 Update",      ga: "2020-05-27" },
  18363: { product: "Windows 10", version: "1909", name: "November 2019 Update", ga: "2019-11-12" },
  18362: { product: "Windows 10", version: "1903", name: "May 2019 Update",      ga: "2019-05-21" },
  17763: { product: "Windows 10", version: "1809", name: "October 2018 Update",  ga: "2018-11-13" },
  17134: { product: "Windows 10", version: "1803", name: "April 2018 Update",    ga: "2018-04-30" },
  16299: { product: "Windows 10", version: "1709", name: "Fall Creators Update", ga: "2017-10-17" },
  15063: { product: "Windows 10", version: "1703", name: "Creators Update",      ga: "2017-04-05" },
  14393: { product: "Windows 10", version: "1607", name: "Anniversary Update",   ga: "2016-08-02" },
  10586: { product: "Windows 10", version: "1511", name: "November Update",      ga: "2015-11-10" },
  10240: { product: "Windows 10", version: "1507", name: "Initial Release",      ga: "2015-07-29" },

  // ---- Windows Server (Intune may surface these too) ----
  // Note: build 26100 is shared with Windows Server 2025 and 17763 with Server 2019 LTSC;
  // the client feature-update label above is kept since Intune device inventory is client-centric.
  20348: { product: "Windows Server", version: "2022", name: "Server 2022",      ga: "2021-08-18" },
};

/*
 * REVISION_DATES: "<build>.<revision>" -> "YYYY-MM" (the month that revision shipped).
 * Populated for currently-serviced builds so the exact patch month can be shown.
 * Sourced from Microsoft Learn Windows 11 release-health "release history" tables.
 */
const WVE_REVISION_DATES = {
  // ----- Windows 11 24H2 / 25H2 share revisions (build 26100 & 26200) -----
  "26200.8875": "2026-07", "26100.8875": "2026-07",
  "26200.8737": "2026-06", "26100.8737": "2026-06",
  "26200.8655": "2026-06", "26100.8655": "2026-06",
  "26200.8524": "2026-05", "26100.8524": "2026-05",
  "26200.8457": "2026-05", "26100.8457": "2026-05",
  "26200.8328": "2026-04", "26100.8328": "2026-04",
  "26200.8246": "2026-04", "26100.8246": "2026-04",
  "26200.8117": "2026-03", "26100.8117": "2026-03",
  "26200.8116": "2026-03", "26100.8116": "2026-03",
  "26200.8037": "2026-03", "26100.8037": "2026-03",
  "26200.7922": "2026-02", "26100.7922": "2026-02",
  "26200.7840": "2026-02", "26100.7840": "2026-02",
  "26200.7705": "2026-01", "26100.7705": "2026-01",
  "26200.7623": "2026-01", "26100.7623": "2026-01",
  "26200.7462": "2025-12", "26100.7462": "2025-12",
  "26200.7309": "2025-11", "26100.7309": "2025-11",
  "26200.7171": "2025-11", "26100.7171": "2025-11",
  "26200.7019": "2025-10", "26100.7019": "2025-10",
  "26200.6899": "2025-10", "26100.6899": "2025-10",
  "26200.6584": "2025-09", "26100.6584": "2025-09",
  "26100.4946": "2025-08", "26100.4770": "2025-07", "26100.4652": "2025-07",
  "26100.4484": "2025-06", "26100.4349": "2025-06", "26100.4202": "2025-05",
  "26100.4061": "2025-05", "26100.3915": "2025-04", "26100.3775": "2025-04",
  "26100.3624": "2025-03", "26100.3476": "2025-03", "26100.3323": "2025-02",
  "26100.3194": "2025-02", "26100.3037": "2025-01", "26100.2894": "2025-01",
  "26100.2605": "2024-12", "26100.2454": "2024-11", "26100.2314": "2024-11",
  "26100.2161": "2024-10", "26100.2033": "2024-10", "26100.1742": "2024-10",

  // ----- Windows 11 26H1 (build 28000) -----
  "28000.2525": "2026-07", "28000.2340": "2026-06", "28000.2269": "2026-06",
  "28000.2179": "2026-05", "28000.2113": "2026-05", "28000.1896": "2026-04",
  "28000.1836": "2026-04", "28000.1764": "2026-03", "28000.1719": "2026-03",
  "28000.1643": "2026-02", "28000.1575": "2026-02",

  // ----- Windows 11 23H2 (build 22631) -----
  "22631.7376": "2026-07", "22631.7219": "2026-06", "22631.7079": "2026-05",
  "22631.6936": "2026-04", "22631.6783": "2026-03", "22631.6649": "2026-02",
  "22631.6491": "2026-01", "22631.6345": "2025-12", "22631.6199": "2025-11",
  "22631.6060": "2025-10", "22631.5909": "2025-09", "22631.5768": "2025-08",
  "22631.5624": "2025-07", "22631.5472": "2025-06", "22631.5335": "2025-05",
  "22631.5189": "2025-04", "22631.5039": "2025-03", "22631.4890": "2025-02",
  "22631.4751": "2025-01", "22631.4602": "2024-12", "22631.4460": "2024-11",
  "22631.4317": "2024-10", "22631.4169": "2024-09",

  // ----- Windows 11 22H2 (build 22621, end of updates) -----
  "22621.6060": "2025-10", "22621.5909": "2025-09", "22621.5768": "2025-08",
  "22621.5624": "2025-07", "22621.5472": "2025-06", "22621.5335": "2025-05",

  // ----- Windows 11 21H2 (build 22000, end of updates) -----
  "22000.3260": "2024-10", "22000.3197": "2024-09", "22000.3147": "2024-08",
};

const WVE_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/** Format "YYYY-MM" or "YYYY-MM-DD" -> "Mon YYYY" (e.g. "Sep 2025"). */
function wveFormatMonthYear(iso) {
  if (!iso) return "";
  const m = /^(\d{4})-(\d{2})/.exec(iso);
  if (!m) return "";
  return `${WVE_MONTHS[parseInt(m[2], 10) - 1]} ${m[1]}`;
}

/*
 * Live data, fetched from Microsoft's release-health pages by the background worker
 * and cached in chrome.storage.local. It is merged OVER the bundled maps above — live
 * wins, bundled is the always-available offline floor. Empty until the first load.
 */
let WVE_LIVE = { builds: {}, revisions: {}, ga: {}, fetchedAt: null };

/**
 * Translate a raw version string into structured info, preferring live data and
 * falling back to the bundled database.
 * Accepts "10.0.26200.8875" or "26200.8875" (or a bare known build "26200").
 * Returns null when the build is unknown to both sources.
 */
function wveLookup(raw) {
  if (!raw) return null;
  const m = /^(?:10\.0\.)?(\d{4,5})(?:\.(\d{1,5}))?$/.exec(String(raw).trim());
  if (!m) return null;

  const build = parseInt(m[1], 10);
  const revision = m[2] !== undefined ? parseInt(m[2], 10) : null;

  const bundled = WVE_BUILDS[build];
  const live = WVE_LIVE.builds[String(build)];

  // Resolve edition/version: prefer a live entry that names a version, else bundled.
  let product = null, version = null;
  if (live && live.version) { product = live.product; version = live.version; }
  else if (bundled) { product = bundled.product; version = bundled.version; }
  if (!version) return null; // unknown to both sources

  const name = bundled ? bundled.name : ""; // feature-update name only exists in bundled data

  const key = revision !== null ? `${build}.${revision}` : null;
  const patchMonth = key ? (WVE_LIVE.revisions[key] || WVE_REVISION_DATES[key] || null) : null;

  const gaISO = (WVE_LIVE.ga && WVE_LIVE.ga[String(build)]) || (bundled && bundled.ga) || null;

  return {
    build,
    revision,
    product,                                        // "Windows 11"
    version,                                         // "25H2"
    name,                                            // "2025 Update" (bundled only)
    gaISO,                                           // "2025-09-30"
    gaMonthYear: wveFormatMonthYear(gaISO),          // "Sep 2025"
    patchMonthYear: wveFormatMonthYear(patchMonth),  // "Jul 2026" or ""
    live: !!(live && live.version),                  // resolved from live data?
  };
}

/** Merge a live-data record (from storage / the worker) and notify listeners. */
function wveApplyLive(rec) {
  if (!rec || typeof rec !== "object") return;
  WVE_LIVE = {
    builds: rec.builds || {},
    revisions: rec.revisions || {},
    ga: rec.ga || {},
    fetchedAt: rec.fetchedAt || null,
  };
  if (typeof document !== "undefined" && typeof CustomEvent !== "undefined" && document.dispatchEvent) {
    document.dispatchEvent(new CustomEvent("wve:updated"));
  }
}

// Expose for the content script (shared isolated world) and popup.
if (typeof window !== "undefined") {
  window.WVE = {
    lookup: wveLookup,
    formatMonthYear: wveFormatMonthYear,
    BUILDS: WVE_BUILDS,
    applyLive: wveApplyLive,
    getLive: () => WVE_LIVE,
  };

  // Load cached live data and stay in sync with background refreshes.
  if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get("wveLive", (res) => {
      if (!chrome.runtime.lastError && res && res.wveLive) wveApplyLive(res.wveLive);
    });
    if (chrome.storage.onChanged) {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area === "local" && changes.wveLive && changes.wveLive.newValue) {
          wveApplyLive(changes.wveLive.newValue);
        }
      });
    }
    // Nudge the worker to refresh if the cache is stale (fire-and-forget).
    if (chrome.runtime && chrome.runtime.sendMessage) {
      try {
        chrome.runtime.sendMessage({ type: "wve:ensureFresh" }, () => void chrome.runtime.lastError);
      } catch (e) { /* worker not available */ }
    }
  }
}
