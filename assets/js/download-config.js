// Download links for the current release.
//
// TODO(release): the v0.3.2 GitHub Release has not been published yet, so
// nothing at RELEASE_BASE_URL exists and every link below 404s. Flip
// RELEASE_PUBLISHED to true only after the release is live at that URL.
const RELEASE_PUBLISHED = false;

const RELEASE_VERSION = "0.3.2";
const RELEASE_REPO = "Kipngetich33/FileBird";
const RELEASE_BASE_URL = `https://github.com/${RELEASE_REPO}/releases/download/v${RELEASE_VERSION}`;

const RELEASE_FILES = {
  "mac-arm64": "FileBird-0.3.2-mac-arm64.dmg",
  "mac-x64": "FileBird-0.3.2-mac-x64.dmg",
  "win-x64": "FileBird-0.3.2-win-x64-setup.exe",
  "linux-x86_64": "FileBird-0.3.2-linux-x86_64.AppImage",
};

// Download counts come straight from GitHub's own per-asset counter via its
// public REST API — no tracker, no cookies, nothing collected about the
// visitor. Cached in sessionStorage for 10 minutes so repeat page views in
// the same visit don't refetch.
const DOWNLOAD_COUNT_CACHE_KEY = "filebird-download-counts-v1";
const DOWNLOAD_COUNT_CACHE_TTL_MS = 10 * 60 * 1000;

async function fetchDownloadCounts() {
  try {
    const cached = sessionStorage.getItem(DOWNLOAD_COUNT_CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.fetchedAt < DOWNLOAD_COUNT_CACHE_TTL_MS) {
        return parsed.counts;
      }
    }
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — just refetch.
  }

  const response = await fetch(
    `https://api.github.com/repos/${RELEASE_REPO}/releases/tags/v${RELEASE_VERSION}`,
    { headers: { Accept: "application/vnd.github+json" } },
  );
  if (!response.ok) return null;
  const release = await response.json();

  const counts = {};
  for (const [key, filename] of Object.entries(RELEASE_FILES)) {
    const asset = (release.assets || []).find((a) => a.name === filename);
    counts[key] = asset ? asset.download_count : 0;
  }

  try {
    sessionStorage.setItem(
      DOWNLOAD_COUNT_CACHE_KEY,
      JSON.stringify({ fetchedAt: Date.now(), counts }),
    );
  } catch {
    // Ignore storage failures — the count still renders for this page view.
  }

  return counts;
}

function renderDownloadCounts(counts) {
  if (!counts) return;
  const total = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const formatted = { ...counts, total };

  document.querySelectorAll("[data-download-count]").forEach((el) => {
    const key = el.getAttribute("data-download-count");
    const count = formatted[key];
    if (count === undefined) return;
    el.textContent = el.textContent.replace(
      "—",
      `${count.toLocaleString()}`,
    );
    el.hidden = false;
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (RELEASE_PUBLISHED && document.querySelector("[data-download-count]")) {
    fetchDownloadCounts()
      .then(renderDownloadCounts)
      .catch(() => {
        // No network, API down, or rate-limited — counters just stay hidden.
      });
  }
  const banner = document.querySelector("[data-release-banner]");
  if (banner) {
    banner.classList.toggle("visible", !RELEASE_PUBLISHED);
  }

  document.querySelectorAll("[data-download]").forEach((el) => {
    const key = el.getAttribute("data-download");
    const file = key && RELEASE_FILES[key];
    if (!file) return;

    if (RELEASE_PUBLISHED) {
      el.setAttribute("href", `${RELEASE_BASE_URL}/${file}`);
      el.removeAttribute("aria-disabled");
      el.classList.remove("is-disabled");
    } else {
      el.setAttribute("href", "#");
      el.setAttribute("aria-disabled", "true");
      el.classList.add("is-disabled");
      el.addEventListener("click", (event) => event.preventDefault());
      el.textContent = "Not released yet";
    }
  });
});
