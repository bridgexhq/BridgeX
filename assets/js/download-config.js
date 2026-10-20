// Download links for the current release.
//
// TODO(release): the v0.3.2 GitHub Release has not been published yet, so
// nothing at RELEASE_BASE_URL exists and every link below 404s. Flip
// RELEASE_PUBLISHED to true only after the release is live at that URL.
const RELEASE_PUBLISHED = false;

const RELEASE_VERSION = "0.3.2";
const RELEASE_BASE_URL = `https://github.com/Kipngetich33/FileBird/releases/download/v${RELEASE_VERSION}`;

const RELEASE_FILES = {
  "mac-arm64": "FileBird-0.3.2-mac-arm64.dmg",
  "mac-x64": "FileBird-0.3.2-mac-x64.dmg",
  "win-x64": "FileBird-0.3.2-win-x64-setup.exe",
  "linux-x86_64": "FileBird-0.3.2-linux-x86_64.AppImage",
};

document.addEventListener("DOMContentLoaded", () => {
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
