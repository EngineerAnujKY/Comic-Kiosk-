/* ==========================================================
   home.js - everything on index.html
   Hero, shelf, formats, run trackers, upcoming releases,
   categories, featured titles and "Find your next read"
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const prices = books.map(function (book) { return book.price; });

  /* Hero: three covers fanned out */
  document.getElementById("hero-art").innerHTML = [1, 9, 5].map(function (id) {
    return createCover(findBook(id), false);
  }).join("");

  /* Hero numbers */
  document.getElementById("stat-titles").textContent = books.length;
  document.getElementById("stat-series").textContent = Object.keys(categoryColors).length;
  document.getElementById("stat-from").textContent = formatPrice(Math.min.apply(null, prices));

  /* Bookshelf strip */
  document.getElementById("shelf").innerHTML = books.map(createShelfItem).join("");

  /* Shop by format */
  document.getElementById("format-list").innerHTML = FORMATS.map(function (format) {
    const total = books.filter(function (book) { return book.format === format; }).length;
    return (
      '<a class="card category-card" href="catalog.html?format=' + encodeURIComponent(format) + '">' +
        '<h3>' + format + '</h3>' +
        '<p class="muted">' + FORMAT_INFO[format] + '</p>' +
        '<p class="small"><strong>' + total + ' titles</strong></p>' +
      '</a>'
    );
  }).join("");

  /* Collection checklists, one shelf per genre */
  document.getElementById("series-list").innerHTML = Object.keys(categoryColors).map(createCollectionCard).join("");

  /* Next three releases */
  const upcoming = releases.filter(function (release) { return daysUntil(release.date) >= 0; });
  document.getElementById("release-list").innerHTML = (upcoming.length ? upcoming : releases).slice(0, 3).map(createReleaseRow).join("");

  /* Genres */
  document.getElementById("category-list").innerHTML = Object.keys(categoryColors).map(function (category) {
    const total = books.filter(function (book) { return book.category === category; }).length;
    return (
      '<a class="card category-card" href="catalog.html?category=' + encodeURIComponent(category) + '">' +
        '<h3>' + escapeHtml(category) + '</h3>' +
        '<p class="muted">' + total + ' titles</p>' +
      '</a>'
    );
  }).join("");

  /* Featured: first four books of the catalog */
  document.getElementById("featured-list").innerHTML = books.slice(0, 4).map(createBookCard).join("");
});

/* ==========================================================
   Special feature: "Find your next read"
   Picks a random title from the chosen category and avoids
   showing the same title twice in a row.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const categorySelect = document.getElementById("suggest-category");
  const suggestButton = document.getElementById("suggest-btn");
  const suggestionBox = document.getElementById("suggestion");
  let lastSuggestedId = null;

  Object.keys(categoryColors).forEach(function (category) {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categorySelect.appendChild(option);
  });

  suggestButton.addEventListener("click", function () {
    const category = categorySelect.value;

    const choices = books.filter(function (book) {
      return (category === "all" || book.category === category) && book.id !== lastSuggestedId;
    });

    if (choices.length === 0) {
      return;
    }

    const pick = choices[Math.floor(Math.random() * choices.length)];
    lastSuggestedId = pick.id;
    suggestionBox.innerHTML = createBookCard(pick);
  });
});
