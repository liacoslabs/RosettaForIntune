/*
 * Windows Version Overlay for Intune  —  content script.
 *
 * Scans the Intune console DOM for Windows OS version strings (e.g. 10.0.26200.8875)
 * and rewrites them into a human-readable form (e.g. "Windows 11 25H2 (Sep 2025)"),
 * keeping the raw build available on hover.
 *
 * The Intune admin center is built on the Azure "Ibiza" framework, which renders content
 * inside Shadow DOM and (same-origin) iframes and virtualizes long grids. This scanner
 * therefore pierces open shadow roots and same-origin iframes, and observes each of them
 * so translations survive scrolling and navigation.
 */

(() => {
  "use strict";

  const PROCESSED_ATTR = "data-wve";
  const BADGE_CLASS = "wve-badge";

  const FULL_RE = /\b10\.0\.(\d{4,5})\.(\d{1,5})\b/;   // 10.0.26200.8875 (canonical Intune form)
  const SHORT_RE = /\b(\d{5})\.(\d{1,5})\b/;            // 26200.8875 (known builds only)

  let settings = { enabled: true, showOriginal: false, showPatch: true };
  const observedRoots = new WeakSet();  // roots (document / shadowRoot) we've attached observers to

  /* ------------------------------------------------------------------ *
   * Settings
   * ------------------------------------------------------------------ */
  function loadSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(settings, (stored) => {
          if (!chrome.runtime.lastError && stored) settings = { ...settings, ...stored };
          resolve();
        });
      } catch (_) {
        resolve();
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Rendering
   * ------------------------------------------------------------------ */
  // "Windows 11" -> "11", "Windows 10" -> "10", "Windows Server" -> "Server"
  function shortProduct(product) {
    return product.replace(/^Windows\s+/, "");
  }

  // Compact label, e.g. "11-25H2-Jul2026" (or "11-25H2" when patch month unknown/off).
  function friendlyText(info) {
    let label = `${shortProduct(info.product)}-${info.version}`;
    if (settings.showPatch && info.patchMonthYear) {
      label += `-${info.patchMonthYear.replace(/\s+/g, "")}`;
    }
    return label;
  }

  function tooltipText(info, rawFull) {
    const lines = [
      `${info.product}, version ${info.version} — ${info.name}`,
      `Feature update GA: ${info.gaMonthYear}`,
    ];
    if (info.patchMonthYear) lines.push(`Installed patch: ${info.patchMonthYear}`);
    lines.push(`Build: ${rawFull}`);
    return lines.join("\n");
  }

  function makeBadge(raw, info) {
    const span = document.createElement("span");
    span.className = BADGE_CLASS;
    span.setAttribute(PROCESSED_ATTR, "1");
    span.title = tooltipText(info, raw);

    const label = document.createElement("span");
    label.className = "wve-label";
    label.textContent = friendlyText(info);
    span.appendChild(label);

    if (settings.showOriginal) {
      const rawEl = document.createElement("span");
      rawEl.className = "wve-raw";
      rawEl.textContent = raw;
      span.appendChild(document.createTextNode(" "));
      span.appendChild(rawEl);
    }
    return span;
  }

  /* ------------------------------------------------------------------ *
   * Text handling
   * ------------------------------------------------------------------ */
  const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "TEXTAREA", "INPUT", "SELECT", "OPTION"]);

  function shouldSkip(node) {
    let el = node.parentElement || (node.getRootNode && node.getRootNode().host);
    while (el) {
      if (SKIP_TAGS.has(el.tagName)) return true;
      if (el.classList && el.classList.contains(BADGE_CLASS)) return true;
      if (el.isContentEditable) return true;
      el = el.parentElement;
    }
    return false;
  }

  function segmentText(text) {
    const combined = new RegExp(`${FULL_RE.source}|${SHORT_RE.source}`, "g");
    let match, last = 0, found = false;
    const segments = [];
    while ((match = combined.exec(text)) !== null) {
      const raw = match[0];
      const info = window.WVE && window.WVE.lookup(raw);
      if (!info) continue;
      found = true;
      if (match.index > last) segments.push({ text: text.slice(last, match.index) });
      segments.push({ raw, info });
      last = match.index + raw.length;
    }
    if (!found) return null;
    if (last < text.length) segments.push({ text: text.slice(last) });
    return segments;
  }

  function processTextNode(node) {
    const text = node.nodeValue;
    if (!text || (text.indexOf("10.0.") === -1 && !/\d{5}\.\d/.test(text))) return;
    if (shouldSkip(node)) return;

    const segments = segmentText(text);
    if (!segments) return;

    const frag = document.createDocumentFragment();
    for (const seg of segments) {
      if (seg.text !== undefined) frag.appendChild(document.createTextNode(seg.text));
      else frag.appendChild(makeBadge(seg.raw, seg.info));
    }
    if (node.parentNode) node.parentNode.replaceChild(frag, node);
  }

  /* ------------------------------------------------------------------ *
   * Recursive scan (pierces shadow roots + same-origin iframes)
   * ------------------------------------------------------------------ */
  function scanRoot(root) {
    if (!root) return;

    // 1) Rewrite text nodes within THIS root (TreeWalker does not cross shadow/iframe boundaries).
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        return n.nodeValue && n.nodeValue.length > 6
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_REJECT;
      },
    });
    const nodes = [];
    let n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (const node of nodes) processTextNode(node);

    // 2) Descend into open shadow roots and (same-origin) iframes.
    const host = root.host ? root : root; // root may be document or shadowRoot
    const scope = root.querySelectorAll ? root : (root.body ? root : null);
    if (!scope || !scope.querySelectorAll) return;

    const els = scope.querySelectorAll("*");
    for (const el of els) {
      if (el.shadowRoot) {
        observeRoot(el.shadowRoot);
        scanRoot(el.shadowRoot);
      }
      if (el.tagName === "IFRAME") {
        let doc = null;
        try { doc = el.contentDocument; } catch (_) { doc = null; } // cross-origin -> skip
        if (doc && doc.body) {
          observeRoot(doc);
          scanRoot(doc);
        }
      }
    }
  }

  function scanAll() {
    if (!settings.enabled || !window.WVE) return;
    scanRoot(document);
  }

  /* ------------------------------------------------------------------ *
   * Observe roots for SPA re-renders / virtualized scrolling
   * ------------------------------------------------------------------ */
  let scanQueued = false;
  function queueScan() {
    if (scanQueued) return;
    scanQueued = true;
    (window.requestAnimationFrame || setTimeout)(() => {
      scanQueued = false;
      scanAll();
    }, 16);
  }

  function observeRoot(root) {
    if (!root || observedRoots.has(root)) return;
    const target = root.body || root; // document -> body; shadowRoot -> itself
    if (!target || !target.nodeType) return;
    observedRoots.add(root);
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes.length || m.type === "characterData") { queueScan(); break; }
      }
    });
    try {
      observer.observe(target, { childList: true, subtree: true, characterData: true });
    } catch (_) { /* detached root */ }
  }

  /* ------------------------------------------------------------------ *
   * Boot
   * ------------------------------------------------------------------ */
  function start() {
    if (!settings.enabled) return;
    observeRoot(document);
    scanAll();
    // Re-sweep periodically to catch shadow roots/iframes attached without a mutation we saw.
    setInterval(scanAll, 2000);
  }

  try {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area !== "sync") return;
      for (const k of Object.keys(changes)) settings[k] = changes[k].newValue;
      location.reload();
    });
  } catch (_) { /* storage listener unavailable */ }

  loadSettings().then(() => {
    if (document.body) start();
    else document.addEventListener("DOMContentLoaded", start, { once: true });
  });
})();
