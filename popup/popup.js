/* Popup logic: read/write settings and show a live preview. */

const DEFAULTS = { enabled: true, showOriginal: false, showPatch: true };
const IDS = ["enabled", "showOriginal", "showPatch"];

function updatePreview(settings) {
  const info = window.WVE.lookup("10.0.26200.8875");
  let text = `${info.product.replace(/^Windows\s+/, "")}-${info.version}`;
  if (settings.showPatch && info.patchMonthYear) text += `-${info.patchMonthYear.replace(/\s+/g, "")}`;
  if (settings.showOriginal) text += " (10.0.26200.8875)";
  const el = document.getElementById("preview");
  el.textContent = settings.enabled ? text : "10.0.26200.8875 (overlay off)";
  document.querySelector(".ex-raw").style.display = settings.showOriginal ? "" : "none";
}

function currentSettings() {
  const s = {};
  for (const id of IDS) s[id] = document.getElementById(id).checked;
  return s;
}

const hasStorage = typeof chrome !== "undefined" && chrome.storage && chrome.storage.sync;

if (hasStorage) {
  chrome.storage.sync.get(DEFAULTS, (stored) => {
    const settings = { ...DEFAULTS, ...stored };
    for (const id of IDS) document.getElementById(id).checked = settings[id];
    updatePreview(settings);
  });
} else {
  // Standalone preview (opened outside the extension) — use defaults.
  for (const id of IDS) document.getElementById(id).checked = DEFAULTS[id];
  updatePreview(DEFAULTS);
}

for (const id of IDS) {
  document.getElementById(id).addEventListener("change", () => {
    const settings = currentSettings();
    if (hasStorage) chrome.storage.sync.set(settings);
    updatePreview(settings);
  });
}

/* ---- Live build-data status + manual refresh ---- */
const hasRuntime = typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.sendMessage;

function timeAgo(ms) {
  if (!ms) return "never";
  const s = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (s < 90) return "just now";
  const m = Math.floor(s / 60);
  if (m < 90) return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 36) return `${h} hr ago`;
  return `${Math.floor(h / 24)} days ago`;
}

function renderStatus(rec) {
  const statusEl = document.getElementById("dataStatus");
  const subEl = document.getElementById("dataSub");
  if (!rec || !rec.fetchedAt) {
    statusEl.textContent = "Bundled";
    subEl.textContent = "No live update yet — using built-in data";
    return;
  }
  statusEl.textContent = `Updated ${timeAgo(rec.fetchedAt)}`;
  const builds = rec.buildCount || 0;
  const revs = rec.revisionCount || 0;
  subEl.textContent = `${builds} builds · ${revs} revisions · live from Microsoft`;
}

if (hasRuntime) {
  const btn = document.getElementById("refreshBtn");
  chrome.runtime.sendMessage({ type: "wve:getStatus" }, (rec) => {
    if (chrome.runtime.lastError) { renderStatus(null); return; }
    renderStatus(rec);
  });
  btn.addEventListener("click", () => {
    btn.disabled = true;
    const orig = btn.textContent;
    btn.textContent = "Refreshing…";
    chrome.runtime.sendMessage({ type: "wve:refresh" }, (rec) => {
      btn.disabled = false;
      btn.textContent = orig;
      if (chrome.runtime.lastError) { renderStatus(null); return; }
      renderStatus(rec);
    });
  });
} else {
  const dataEl = document.querySelector(".data");
  if (dataEl) dataEl.style.display = "none";
}
