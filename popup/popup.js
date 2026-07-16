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
