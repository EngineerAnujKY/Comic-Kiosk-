/* ==========================================================
   book.js - product page (book.html?id=3)
   Description, buy box, ratings, reviews and similar titles
   ========================================================== */

const area = document.getElementById("book-area");
const book = findBook(Number(new URLSearchParams(window.location.search).get("id")));
let pickedRating = 0;
let pickedGrade = DEFAULT_GRADE;

function formatDate(date) {
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

/* True if the logged-in user has ordered this book before */
function hasBought(user) {
  return user && readStorage(ORDERS_KEY, []).some(function (order) {
    return order.email === user.email && order.items.some(function (item) { return item.id === book.id; });
  });
}

function renderReviews() {
  const summary = ratingSummary(book);
  const user = getCurrentUser();
  const mine = user ? getUserReviews(book.id).find(function (r) { return r.email === user.email; }) : null;
  let bars = "";

  for (let star = 5; star >= 1; star--) {
    const percent = Math.round((summary.counts[star] / summary.count) * 100);
    bars +=
      '<div class="bar-row"><span>' + star + ' star</span>' +
        '<div class="bar"><div class="bar-fill" style="width:' + percent + '%"></div></div>' +
      '<span>' + percent + '%</span></div>';
  }

  let form;
  if (user) {
    form =
      '<form id="review-form" class="review-form">' +
        '<h3>' + (mine ? "Edit your review" : "Write a review") + '</h3>' +
        '<div id="review-message" class="message" role="status"></div>' +
        '<div class="form-group"><label id="rate-label">Your rating</label>' +
          '<div class="star-picker" role="group" aria-labelledby="rate-label">' +
            [1, 2, 3, 4, 5].map(function (n) {
              return '<button type="button" class="star-pick" data-star="' + n + '" aria-label="' + n + ' star' + (n > 1 ? "s" : "") + '" aria-pressed="false">\u2605</button>';
            }).join("") +
          '</div></div>' +
        '<div class="form-group"><label for="r-title">Headline</label><input type="text" id="r-title" maxlength="80" value="' + (mine ? escapeHtml(mine.title) : "") + '" required></div>' +
        '<div class="form-group"><label for="r-text">Your review</label><textarea id="r-text" rows="4" maxlength="800" required>' + (mine ? escapeHtml(mine.text) : "") + '</textarea></div>' +
        '<button class="btn" type="submit">' + (mine ? "Update review" : "Submit review") + '</button>' +
      '</form>';
    pickedRating = mine ? mine.rating : 0;
  } else {
    form =
      '<div class="review-form"><h3>Write a review</h3>' +
      '<p class="muted">Share what you thought of this book with other readers.</p>' +
      '<a class="btn" href="login.html?next=' + encodeURIComponent(bookUrl(book)) + '">Log in to write a review</a></div>';
  }

  const list = summary.reviews.map(function (review) {
    const verified = review.email && hasBought({ email: review.email });
    return (
      '<article class="review">' +
        '<div class="review-head"><span class="avatar" aria-hidden="true">' + escapeHtml(review.name.charAt(0)) + '</span><strong>' + escapeHtml(review.name) + '</strong></div>' +
        '<div class="review-stars">' + starsHtml(review.rating) + ' <strong>' + escapeHtml(review.title) + '</strong></div>' +
        '<p class="muted small">Reviewed on ' + escapeHtml(review.date) + (verified ? ' | <span class="verified">Verified purchase</span>' : '') + '</p>' +
        '<p>' + escapeHtml(review.text) + '</p>' +
      '</article>'
    );
  }).join("");

  document.getElementById("reviews-area").innerHTML =
    '<div class="reviews-layout">' +
      '<div>' +
        '<div class="big-rating"><span class="big-number">' + summary.average.toFixed(1) + '</span><div>' + starsHtml(summary.average) + '<br><span class="muted">' + summary.count + ' ratings</span></div></div>' +
        bars +
        '<div class="spacer"></div>' + form +
      '</div>' +
      '<div><h3>Customer reviews</h3>' + list +
        '<p class="note">Sample reviews are placeholders for this demo project. Reviews you write are saved in your browser.</p></div>' +
    '</div>';

  highlightStars();
}

function highlightStars() {
  document.querySelectorAll(".star-pick").forEach(function (button) {
    const on = Number(button.dataset.star) <= pickedRating;
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", on);
  });
}

function render() {
  if (!book) {
    area.innerHTML =
      '<div class="empty-state"><div class="empty-icon">\uD83D\uDCD6</div><h3>We could not find that book</h3>' +
      '<p>The link may be old or incorrect.</p><a class="btn" href="catalog.html">Browse the catalog</a></div>';
    return;
  }

  document.title = book.title + " | Comic Kiosk";

  const summary = ratingSummary(book);
  const similar = books.filter(function (b) { return b.id !== book.id && (book.series ? b.series === book.series : b.category === book.category); })
    .concat(books.filter(function (b) { return b.category !== book.category; }))
    .slice(0, 4);

  const gradeBlock =
    '<h2 class="mini">Condition (CGC-style grade)</h2>' +
    '<div class="grade-options" role="group" aria-label="Choose a condition grade">' +
      GRADES.map(function (g) {
        return (
          '<button type="button" class="grade-opt' + (g.grade === pickedGrade ? ' on' : '') + '" data-grade="' + g.grade + '" aria-pressed="' + (g.grade === pickedGrade) + '">' +
            '<strong>' + g.grade + '</strong><span>' + g.name + '</span><em>' + formatPrice(unitPrice(book, g.grade)) + '</em>' +
          '</button>'
        );
      }).join("") +
    '</div>' +
    '<p class="muted small"><a href="grading.html">What do these grades mean?</a> Sample listings on a CGC-style scale, not CGC-certified copies.</p>';

  const extraSpecs =
    '<tr><th>Format</th><td>' + escapeHtml(book.format) + '</td></tr>' +
    '<tr><th>Checklist</th><td><a href="series.html?id=' + encodeURIComponent(book.category) + '">Track the ' + escapeHtml(book.category) + ' shelf</a></td></tr>';

  let options = "";
  for (let n = 1; n <= 10; n++) {
    options += '<option value="' + n + '">' + n + '</option>';
  }

  area.innerHTML =
    '<nav class="crumbs" aria-label="Breadcrumb">' +
      '<a href="index.html">Home</a> &rsaquo; <a href="catalog.html">Catalog</a> &rsaquo; ' +
      '<a href="catalog.html?category=' + encodeURIComponent(book.category) + '">' + escapeHtml(book.category) + '</a> &rsaquo; ' +
      '<span>' + escapeHtml(book.title) + '</span>' +
    '</nav>' +

    '<div class="product">' +
      '<div class="product-cover">' + createCover(book, false) + '</div>' +

      '<div class="product-info">' +
        '<h1 class="product-title">' + escapeHtml(book.title) + '</h1>' +
        '<p>by <strong>' + escapeHtml(book.author) + '</strong></p>' +
        '<a class="rating" href="#reviews">' + starsHtml(summary.average) + '<span class="rating-count">' + summary.average.toFixed(1) + ' (' + summary.count + ' ratings)</span></a>' +
        '<p class="price big" data-live-price>' + formatPrice(unitPrice(book, pickedGrade)) + '</p>' +
        gradeBlock +
        '<h2 class="mini">About this book</h2>' +
        '<p>' + escapeHtml(book.desc) + '</p>' +
        '<h2 class="mini">Product details</h2>' +
        '<table class="specs">' +
          '<tr><th>Author</th><td>' + escapeHtml(book.author) + '</td></tr>' +
          '<tr><th>Category</th><td>' + escapeHtml(book.category) + '</td></tr>' +
          extraSpecs +
          '<tr><th>Publisher</th><td>' + escapeHtml(book.publisher) + '</td></tr>' +
          '<tr><th>First published</th><td>' + book.year + '</td></tr>' +
          '<tr><th>Language</th><td>English</td></tr>' +
          (book.isbn ? '<tr><th>ISBN-13</th><td>' + escapeHtml(book.isbn) + '</td></tr>' : '') +
        '</table>' +
      '</div>' +

      '<aside class="buy-box">' +
        '<p class="price big" data-live-price>' + formatPrice(unitPrice(book, pickedGrade)) + '</p>' +
        '<p class="muted small">Grade <strong data-live-grade>' + pickedGrade + '</strong> selected</p>' +
        '<p class="muted small">Free delivery on every order</p>' +
        '<p class="in-stock">In stock</p>' +
        '<label for="qty">Quantity</label>' +
        '<select id="qty">' + options + '</select>' +
        '<button type="button" class="btn btn-block" id="add-btn">Add to cart</button>' +
        '<button type="button" class="btn btn-buy btn-block" id="buy-btn">Buy now</button>' +
        '<p class="muted small">Sold by Comic Kiosk. Secure payment with Razorpay.</p>' +
      '</aside>' +
    '</div>' +

    '<section class="section" id="reviews"><h2>Ratings and reviews</h2><div id="reviews-area"></div></section>' +
    '<section class="section"><h2>Similar books</h2><div class="grid">' + similar.map(createBookCard).join("") + '</div></section>';

  renderReviews();
}

area.addEventListener("click", function (event) {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  const qty = Number(document.getElementById("qty") ? document.getElementById("qty").value : 1);

  if (target.id === "add-btn") {
    addToCart(book.id, qty, pickedGrade);
  } else if (target.id === "buy-btn") {
    addToCart(book.id, qty, pickedGrade);
    window.location.href = "cart.html";
  } else if (target.classList.contains("grade-opt")) {
    pickedGrade = target.dataset.grade;
    document.querySelectorAll(".grade-opt").forEach(function (button) {
      const on = button.dataset.grade === pickedGrade;
      button.classList.toggle("on", on);
      button.setAttribute("aria-pressed", on);
    });
    document.querySelectorAll("[data-live-price]").forEach(function (node) {
      node.textContent = formatPrice(unitPrice(book, pickedGrade));
    });
    document.querySelectorAll("[data-live-grade]").forEach(function (node) {
      node.textContent = pickedGrade;
    });
  } else if (target.classList.contains("star-pick")) {
    pickedRating = Number(target.dataset.star);
    highlightStars();
  }
});

area.addEventListener("submit", function (event) {
  event.preventDefault();

  const user = getCurrentUser();
  const message = document.getElementById("review-message");

  if (!user) {
    return;
  }
  if (pickedRating === 0) {
    message.className = "message error";
    message.textContent = "Choose a star rating before you submit.";
    return;
  }

  const all = readStorage(REVIEWS_KEY, {});
  const others = (all[book.id] || []).filter(function (r) { return r.email !== user.email; });

  others.unshift({
    email: user.email,
    name: user.name,
    rating: pickedRating,
    title: document.getElementById("r-title").value.trim(),
    text: document.getElementById("r-text").value.trim(),
    date: formatDate(new Date())
  });
  all[book.id] = others;
  writeStorage(REVIEWS_KEY, all);

  renderReviews();
  const done = document.getElementById("review-message");
  done.className = "message success";
  done.textContent = "Thank you. Your review has been saved.";
});

render();
