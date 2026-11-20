/* ==========================================================
   series.js - collection checklists (series.html)
   series.html                   -> all shelves (one per genre)
   series.html?id=Manga          -> one shelf with its checklist
   ========================================================== */

const seriesArea = document.getElementById("series-area");
const shelfParam = new URLSearchParams(window.location.search).get("id");
const shelf = categoryColors[shelfParam] ? shelfParam : null;

function guestNote() {
  return getCurrentUser() ? "" :
    '<p class="note-box">You are using a guest checklist saved in this browser. <a href="login.html?next=series.html">Log in</a> to keep it under your account.</p>';
}

function renderList() {
  let owned = 0;
  let total = 0;

  Object.keys(categoryColors).forEach(function (category) {
    const progress = shelfProgress(category);
    owned += progress.owned;
    total += progress.total;
  });

  seriesArea.innerHTML =
    '<p class="muted lead">Open a shelf, tick the titles you already own and note the condition of your copy. You own <strong>' + owned + ' of ' + total + '</strong> titles.</p>' +
    guestNote() +
    '<div class="grid">' + Object.keys(categoryColors).map(createCollectionCard).join("") + '</div>';
}

function renderDetail(focusId) {
  const items = shelfBooks(shelf);
  const owned = getChecklist(shelf);
  const missing = items.filter(function (book) { return !owned[book.id]; });
  const progress = shelfProgress(shelf);
  const cost = missing.reduce(function (sum, book) { return sum + unitPrice(book, DEFAULT_GRADE); }, 0);

  const rows = items.map(function (book) {
    const mine = owned[book.id];
    return (
      '<tr class="' + (mine ? "is-owned" : "") + '">' +
        '<td><input type="checkbox" class="own-box" data-book="' + book.id + '"' + (mine ? " checked" : "") + ' aria-label="I own ' + escapeHtml(book.title) + '"></td>' +
        '<td><a href="' + bookUrl(book) + '">' + escapeHtml(book.title) + '</a><br><span class="muted small">' + escapeHtml(book.author) + ' | ' + escapeHtml(book.format) + '</span></td>' +
        '<td>' + formatPrice(unitPrice(book, DEFAULT_GRADE)) + '</td>' +
        '<td><select class="grade-select" data-book="' + book.id + '"' + (mine ? "" : " disabled") + ' aria-label="Grade of your copy of ' + escapeHtml(book.title) + '">' +
          '<option value="raw"' + (mine === "raw" ? " selected" : "") + '>Raw / ungraded</option>' +
          GRADES.map(function (g) {
            return '<option value="' + g.grade + '"' + (mine === g.grade ? " selected" : "") + '>' + g.grade + ' ' + g.name + '</option>';
          }).join("") +
        '</select></td>' +
        '<td>' + (mine ? '<span class="verified">In collection</span>' : '<button type="button" class="btn btn-small" data-addbook="' + book.id + '">Add to cart</button>') + '</td>' +
      '</tr>'
    );
  }).join("");

  document.title = shelf + " shelf checklist | Comic Kiosk";

  seriesArea.innerHTML =
    '<nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Home</a> &rsaquo; <a href="series.html">Checklist</a> &rsaquo; <span>' + escapeHtml(shelf) + '</span></nav>' +
    '<h1>' + escapeHtml(shelf) + ' shelf</h1>' +
    '<p class="muted">' + items.length + ' titles in this genre. Tick what you own and grade your copy.</p>' +
    guestNote() +

    '<div class="panel tracker">' +
      '<div><strong class="tracker-count">' + progress.owned + ' of ' + progress.total + ' titles owned</strong>' +
        progressBar(progress.percent, shelf + " checklist progress") +
        '<p class="muted small">' + (missing.length ? missing.length + ' missing. Cost to complete at grade ' + DEFAULT_GRADE + ': <strong>' + formatPrice(cost) + '</strong>' : 'Shelf complete. Nice work!') + '</p>' +
      '</div>' +
      '<div class="tracker-actions">' +
        '<button type="button" class="btn" id="add-missing"' + (missing.length ? "" : " disabled") + '>Add all missing to cart</button>' +
        '<button type="button" class="btn btn-outline" id="mark-all">Mark all owned</button>' +
        '<button type="button" class="btn btn-outline" id="clear-all">Clear</button>' +
      '</div>' +
    '</div>' +

    '<div class="table-wrap"><table class="issue-table">' +
      '<thead><tr><th>Own</th><th>Title</th><th>Price at ' + DEFAULT_GRADE + '</th><th>Your copy grade</th><th></th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';

  if (focusId) {
    const box = seriesArea.querySelector('.own-box[data-book="' + focusId + '"]');
    if (box) {
      box.focus();
    }
  }
}

function render(focusId) {
  const title = document.getElementById("series-title");
  if (title && shelfParam) {
    title.remove();
  }

  if (shelfParam && !shelf) {
    seriesArea.innerHTML = '<div class="empty-state"><h3>Shelf not found</h3><a class="btn" href="series.html">See all shelves</a></div>';
  } else if (shelf) {
    renderDetail(focusId);
  } else {
    renderList();
  }
}

seriesArea.addEventListener("change", function (event) {
  const target = event.target;
  if (!shelf || !target.dataset.book) {
    return;
  }

  const owned = getChecklist(shelf);

  if (target.classList.contains("own-box")) {
    if (target.checked) {
      owned[target.dataset.book] = "raw";
    } else {
      delete owned[target.dataset.book];
    }
    saveChecklist(shelf, owned);
    render(target.dataset.book);
  } else if (target.classList.contains("grade-select")) {
    owned[target.dataset.book] = target.value;
    saveChecklist(shelf, owned);
  }
});

seriesArea.addEventListener("click", function (event) {
  const button = event.target.closest("button");
  if (!button || !shelf) {
    return;
  }

  const items = shelfBooks(shelf);
  const owned = getChecklist(shelf);

  if (button.id === "add-missing") {
    const missing = items.filter(function (book) { return !owned[book.id]; });
    missing.forEach(function (book) { addToCart(book.id, 1, DEFAULT_GRADE, true); });
    showToast(missing.length + " missing titles added to cart");
  } else if (button.id === "mark-all") {
    items.forEach(function (book) { owned[book.id] = owned[book.id] || "raw"; });
    saveChecklist(shelf, owned);
    render();
  } else if (button.id === "clear-all") {
    if (window.confirm("Clear the checklist for the " + shelf + " shelf?")) {
      saveChecklist(shelf, {});
      render();
    }
  } else if (button.hasAttribute("data-addbook")) {
    addToCart(Number(button.dataset.addbook), 1, DEFAULT_GRADE);
  }
});

render();
