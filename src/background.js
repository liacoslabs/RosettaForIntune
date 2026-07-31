/*
 * Rosetta for Intune — background service worker.
 *
 * Keeps the build/revision database fresh by fetching Microsoft's official Windows
 * release-health pages, parsing them, and caching the result in chrome.storage.local.
 * The content script merges this live data over the bundled fallback so newly shipped
 * Windows builds and patch months are recognized without an extension update.
 *
 * Cadence: on install, on browser startup, once daily (chrome.alarms), and on demand
 * (popup "Refresh now", or when a serviced tab loads and the cache is stale).
 *
 * Only DATA is fetched and parsed here — never remote code.
 */

const STORAGE_KEY = "wveLive";
const ALARM_NAME = "wve-refresh";
const REFRESH_IF_OLDER_THAN_MS = 12 * 60 * 60 * 1000; // 12h
const SCHEMA = 1;

const SOURCES = [
  { url: "https://learn.microsoft.com/en-us/windows/release-health/windows11-release-information", product: "Windows 11" },
  { url: "https://learn.microsoft.com/en-us/windows/release-health/release-information",           product: "Windows 10" },
];

/* ------------------------------------------------------------------ *
 * Parsing  (regex-based — service workers have no DOMParser)
 * ------------------------------------------------------------------ */
function parseReleaseHealth(html, product) {
  const builds = {};      // "26200" -> { product, version }
  const revisions = {};   // "26200.8875" -> "YYYY-MM"
  const gaByVersion = {}; // "25H2" -> "YYYY-MM-DD"
  let m;

  // Version headers:  Version 25H2 (OS build 26200)
  const headerRe = /Version\s+([0-9]{2}H[0-9]|[0-9]{4})\s*\(OS build\s*(\d{4,5})\)/g;
  while ((m = headerRe.exec(html)) !== null) {
    builds[m[2]] = { product, version: m[1] };
  }

  // Revision -> month: an availability-date <td> immediately followed by a build <td>.
  const rowRe = /(\d{4})-(\d{2})-\d{2}<\/td>\s*<td[^>]*>\s*(\d{5})\.(\d{1,5})\s*<\/td>/g;
  while ((m = rowRe.exec(html)) !== null) {
    const build = m[3];
    revisions[`${build}.${m[4]}`] = `${m[1]}-${m[2]}`;
    if (!builds[build]) builds[build] = { product, version: null };
  }

  // GA date per version from the current-versions tables.
  const gaRe = /<tr[^>]*>\s*<td>([0-9]{2}H[0-9]|[0-9]{4})<\/td>\s*<td[^>]*>[^<]*<\/td>\s*<td[^>]*>(\d{4}-\d{2}-\d{2})<\/td>/g;
  while ((m = gaRe.exec(html)) !== null) {
    if (!gaByVersion[m[1]]) gaByVersion[m[1]] = m[2];
  }

  const ga = {};
  for (const b in builds) {
    const v = builds[b].version;
    if (v && gaByVersion[v]) ga[b] = gaByVersion[v];
  }

  return { builds, revisions, ga };
}

/* ------------------------------------------------------------------ *
 * Fetch + cache
 * ------------------------------------------------------------------ */
async function fetchSource(src) {
  const res = await fetch(src.url, { credentials: "omit", cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const parsed = parseReleaseHealth(html, src.product);
  // Sanity guard against markup changes silently producing empty data.
  if (Object.keys(parsed.builds).length < 3 || Object.keys(parsed.revisions).length < 20) {
    throw new Error("parsed data below sanity threshold");
  }
  return parsed;
}

let refreshInFlight = null;

async function refresh() {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const merged = { builds: {}, revisions: {}, ga: {} };
    const sources = {};
    let anyOk = false;

    for (const src of SOURCES) {
      try {
        const p = await fetchSource(src);
        Object.assign(merged.builds, p.builds);
        Object.assign(merged.revisions, p.revisions);
        Object.assign(merged.ga, p.ga);
        sources[src.product] = { ok: true, builds: Object.keys(p.builds).length, revisions: Object.keys(p.revisions).length };
        anyOk = true;
      } catch (e) {
        sources[src.product] = { ok: false, error: String(e && e.message || e) };
      }
    }

    if (!anyOk) {
      // Keep whatever we had; just record the failure timestamp.
      const prev = (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY] || {};
      prev.lastAttempt = nowMs();
      prev.lastError = "all sources failed";
      prev.sources = sources;
      await chrome.storage.local.set({ [STORAGE_KEY]: prev });
      return prev;
    }

    const record = {
      schema: SCHEMA,
      builds: merged.builds,
      revisions: merged.revisions,
      ga: merged.ga,
      fetchedAt: nowMs(),
      lastAttempt: nowMs(),
      buildCount: Object.keys(merged.builds).length,
      revisionCount: Object.keys(merged.revisions).length,
      sources,
      lastError: null,
    };
    await chrome.storage.local.set({ [STORAGE_KEY]: record });
    return record;
  })();

  try {
    return await refreshInFlight;
  } finally {
    refreshInFlight = null;
  }
}

// Date.now() is fine in a service worker (unlike workflow scripts).
function nowMs() { return Date.now(); }

async function getStatus() {
  return (await chrome.storage.local.get(STORAGE_KEY))[STORAGE_KEY] || null;
}

async function refreshIfStale() {
  const cur = await getStatus();
  if (!cur || !cur.fetchedAt || (nowMs() - cur.fetchedAt) > REFRESH_IF_OLDER_THAN_MS) {
    return refresh();
  }
  return cur;
}

/* ------------------------------------------------------------------ *
 * Lifecycle
 * ------------------------------------------------------------------ */
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1440 });
  refresh();
});

chrome.runtime.onStartup.addListener(() => {
  refreshIfStale();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) refresh();
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (!msg || !msg.type) return;
  if (msg.type === "wve:getStatus") {
    getStatus().then(sendResponse);
    return true;
  }
  if (msg.type === "wve:refresh") {
    refresh().then(sendResponse);
    return true;
  }
  if (msg.type === "wve:ensureFresh") {
    refreshIfStale().then(sendResponse);
    return true;
  }
});
