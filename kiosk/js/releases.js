/* ==========================================================
   releases.js - upcoming release calendar (releases.html)
   Grouped by month, filter by format, wishlist toggle
   ========================================================== */

const releaseArea = document.getElementById("release-area");
const releaseChips = document.getElementById("release-chips");
const releaseSummary = document.getElementById("release-summary");

let releaseFormat = "all";
let wishlistOnly = false;

function renderChips() {
  const names = ["all"].concat(RELEASE_FORMATS);

  releaseChips.innerHTML = names.map(function (name) {
    return '<button type="button" class="chip" data-format="' + escapeHtml(name) + '" aria-pressed="' + (!wishlistOnly && name === releaseFormat) + '">' + (name === "all" ? "All formats" : escapeHtml(name)) + '</button>';
  }).join("") +
    '<button type="button" class="chip" data-wishlist="1" aria-pressed="' + wishlistOnly + '">\u2605 My wishlist (' + getWishlist().length + ')</button>';
}

function renderReleases() {
  const wishlist = getWishlist();

  const visible = releases.filter(function (release) {
    return (releaseFormat === "all" || release.format === releaseFormat) &&
      (!wishlistOnly || wishlist.indexOf(release.id) !== -1);
  }).sort(function (a, b) { return a.date.localeCompare(b.date); });

  const next = releases.filter(function (release) { return daysUntil(release.date) >= 0; })[0];
  releaseSummary.textContent = next
    ? "Next release: " + next.title + " (" + daysUntil(next.date) + " days away). Showing " + visible.length + " of " + releases.length + " releases."
    : "Showing " + visible.length + " of " + releases.length + " releases.";

  renderChips();

  if (visible.length === 0) {
    releaseArea.innerHTML =
      '<div class="empty-state"><div class="empty-icon">\uD83D\uDCC5</div>' +
      '<p>' + (wishlistOnly ? "Your wishlist is empty. Tap Wishlist on any release to save it here." : "No releases match this filter.") + '</p></div>';
    return;
  }

  let html = "";
  let month = "";

  visible.forEach(function (release) {
    const label = new Date(release.date + "T00:00:00").toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    if (label !== month) {
      html += '<h2 class="month">' + label + '</h2>';
      month = label;
    }
    html += createReleaseRow(release);
  });

  releaseArea.innerHTML = html;
}

releaseChips.addEventListener("click", function (event) {
  const chip = event.target.closest("button");
  if (!chip) {
    return;
  }

  if (chip.hasAttribute("data-wishlist")) {
    wishlistOnly = !wishlistOnly;
  } else {
    wishlistOnly = false;
    releaseFormat = chip.dataset.format;
  }
  renderReleases();
});

/* Keep the wishlist count and filter in step when a button is toggled */
document.addEventListener("wishlistchange", function () {
  if (wishlistOnly) {
    renderReleases();
  } else {
    renderChips();
  }
});

renderReleases();
