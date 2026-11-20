/* ==========================================================
   catalog.js - search, format and category chips, publisher
   filter and sort on catalog.html
   ========================================================== */

const searchInput = document.getElementById("search");
const sortSelect = document.getElementById("sort");
const publisherSelect = document.getElementById("publisher");
const formatBox = document.getElementById("format-chips");
const chipBox = document.getElementById("chips");
const bookList = document.getElementById("book-list");
const resultCount = document.getElementById("result-count");

let activeFormat = "all";
let activeCategory = "all";

function fillPublishers() {
  const names = [];
  books.forEach(function (book) {
    if (names.indexOf(book.publisher) === -1) {
      names.push(book.publisher);
    }
  });

  names.sort().forEach(function (name) {
    const option = document.createElement("option");
    option.value = name;
    option.textContent = name;
    publisherSelect.appendChild(option);
  });
}

/* Read ?format=, ?category=, ?search= and ?publisher= from other pages */
function readUrl() {
  const params = new URLSearchParams(window.location.search);

  if (FORMATS.indexOf(params.get("format")) !== -1) {
    activeFormat = params.get("format");
  }
  if (params.get("category") && categoryColors[params.get("category")]) {
    activeCategory = params.get("category");
  }
  if (params.get("search")) {
    searchInput.value = params.get("search");
  }
}

function chip(label, attribute, value, active) {
  return '<button type="button" class="chip" ' + attribute + '="' + escapeHtml(value) + '" aria-pressed="' + active + '">' + escapeHtml(label) + '</button>';
}

function renderChips() {
  const filtersOn = activeFormat !== "all" || activeCategory !== "all" || publisherSelect.value !== "all" || searchInput.value.trim() !== "";

  formatBox.innerHTML =
    chip("All formats", "data-format", "all", activeFormat === "all") +
    FORMATS.map(function (name) { return chip(name, "data-format", name, name === activeFormat); }).join("");

  chipBox.innerHTML =
    chip("All genres", "data-category", "all", activeCategory === "all") +
    Object.keys(categoryColors).map(function (name) { return chip(name, "data-category", name, name === activeCategory); }).join("") +
    (filtersOn ? '<button type="button" class="chip chip-clear" data-clear="1">Clear filters</button>' : "");
}

/* Apply search text, filters and sort order */
function getVisibleBooks() {
  const text = searchInput.value.trim().toLowerCase();

  const result = books.filter(function (book) {
    const matchesText =
      book.title.toLowerCase().includes(text) ||
      book.author.toLowerCase().includes(text);
    return matchesText &&
      (activeFormat === "all" || book.format === activeFormat) &&
      (activeCategory === "all" || book.category === activeCategory) &&
      (publisherSelect.value === "all" || book.publisher === publisherSelect.value);
  });

  if (sortSelect.value === "price-low") {
    result.sort(function (a, b) { return a.price - b.price; });
  } else if (sortSelect.value === "price-high") {
    result.sort(function (a, b) { return b.price - a.price; });
  } else {
    result.sort(function (a, b) { return a.title.localeCompare(b.title, undefined, { numeric: true }); });
  }

  return result;
}

function renderBooks() {
  const visible = getVisibleBooks();
  resultCount.textContent = "Showing " + visible.length + " of " + books.length + " titles";
  renderChips();

  if (visible.length === 0) {
    bookList.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon">\uD83D\uDCDA</div>' +
        '<p>No titles match your search. Try a different keyword or filter.</p>' +
        '<button type="button" class="btn btn-small" data-clear="1">Clear filters</button>' +
      '</div>';
    return;
  }

  bookList.innerHTML = visible.map(createBookCard).join("");
}

function clearFilters() {
  activeFormat = "all";
  activeCategory = "all";
  publisherSelect.value = "all";
  searchInput.value = "";
  renderBooks();
}

document.querySelector(".filters").addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }
  if (button.dataset.clear) {
    clearFilters();
    return;
  }
  if (button.hasAttribute("data-format")) {
    activeFormat = button.dataset.format;
  } else if (button.hasAttribute("data-category")) {
    activeCategory = button.dataset.category;
  }
  renderBooks();
});

bookList.addEventListener("click", function (event) {
  if (event.target.closest("[data-clear]")) {
    clearFilters();
  }
});

fillPublishers();
readUrl();
renderBooks();

searchInput.addEventListener("input", renderBooks);
sortSelect.addEventListener("change", renderBooks);
publisherSelect.addEventListener("change", renderBooks);
