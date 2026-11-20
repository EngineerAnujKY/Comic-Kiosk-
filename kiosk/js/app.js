/* ==========================================================
   app.js - helpers used on every page
   Storage, cart, login session, navigation, book cards
   ========================================================== */

const CART_KEY = "kiosk_cart";
const USERS_KEY = "kiosk_users";
const SESSION_KEY = "kiosk_session";
const ORDERS_KEY = "kiosk_orders";
const REVIEWS_KEY = "kiosk_reviews";
const CHECK_KEY = "kiosk_checklists";
const WISH_KEY = "kiosk_wishlist";

/* ---------- Storage helpers ---------- */
function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    /* storage full or blocked: the page keeps working, data is not saved */
  }
}

/* ---------- Formatting and safety ---------- */
function formatPrice(amount) {
  return "\u20B9" + amount.toLocaleString("en-IN");
}

/* Escape text before it is placed inside innerHTML */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* Only allow redirects to local pages such as cart.html or book.html?id=3 */
function safeNext(value) {
  return /^[a-z0-9_-]+\.html(\?[a-z0-9=&_-]*)?$/i.test(value || "") ? value : "index.html";
}

function findBook(id) {
  return books.find(function (book) {
    return book.id === id;
  });
}

/* ---------- Grades and prices ---------- */
/* Every title is sold in a chosen condition grade */
function isGradable(book) {
  return true;
}

function gradeInfo(grade) {
  return GRADES.find(function (entry) { return entry.grade === grade; }) || GRADES[0];
}

/* Price of one copy at a grade (book.price is the grade 9.8 price) */
function unitPrice(book, grade) {
  if (!isGradable(book)) {
    return book.price;
  }
  return Math.round(book.price * gradeInfo(grade || DEFAULT_GRADE).mult);
}

function linePrice(item) {
  return unitPrice(findBook(item.id), item.grade) * item.qty;
}

/* ---------- Cart (a line is a book plus a grade) ---------- */
function getCart() {
  return readStorage(CART_KEY, []).filter(function (item) {
    return findBook(item.id);
  });
}

function saveCart(cart) {
  writeStorage(CART_KEY, cart);
  updateNav();
}

function addToCart(id, qty, grade, silent) {
  const book = findBook(id);
  if (!book) {
    return;
  }

  qty = qty || 1;
  const gradeUsed = isGradable(book) ? (grade || DEFAULT_GRADE) : null;
  const cart = getCart();
  const item = cart.find(function (entry) {
    return entry.id === id && (entry.grade || null) === gradeUsed;
  });

  if (item) {
    item.qty += qty;
  } else {
    cart.push({ id: id, qty: qty, grade: gradeUsed });
  }

  saveCart(cart);
  if (!silent) {
    showToast(book.title + (gradeUsed ? " (grade " + gradeUsed + ")" : "") + " added to cart");
  }
}

function cartCount() {
  return getCart().reduce(function (sum, item) {
    return sum + item.qty;
  }, 0);
}

/* ---------- Login session ---------- */
function getCurrentUser() {
  return readStorage(SESSION_KEY, null);
}

function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    /* ignore */
  }
  window.location.href = "index.html";
}

/* ---------- Password hashing (demo): SHA-256 with the email as salt ---------- */
async function hashPassword(email, password) {
  if (window.crypto && window.crypto.subtle) {
    const data = new TextEncoder().encode(email + ":" + password);
    const digest = await window.crypto.subtle.digest("SHA-256", data);
    const hex = Array.from(new Uint8Array(digest)).map(function (b) {
      return b.toString(16).padStart(2, "0");
    }).join("");
    return "sha256:" + hex;
  }
  return "plain:" + password;
}

/* ---------- Navigation state ---------- */
let lastCount = null;

function updateNav() {
  const countElement = document.getElementById("cart-count");
  const authLink = document.getElementById("auth-link");
  const user = getCurrentUser();

  if (countElement) {
    const count = cartCount();
    countElement.textContent = count;

    if (lastCount !== null && count > lastCount) {
      countElement.classList.remove("bump");
      void countElement.offsetWidth;
      countElement.classList.add("bump");
    }
    lastCount = count;
  }

  if (authLink && user) {
    authLink.textContent = "Logout (" + user.name.split(" ")[0] + ")";
    authLink.href = "#";
    authLink.classList.remove("active");
    authLink.onclick = function (event) {
      event.preventDefault();
      logout();
    };
  }
}

/* ---------- Toast message ---------- */
function showToast(text) {
  let toast = document.getElementById("toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    toast.setAttribute("role", "status");
    document.body.appendChild(toast);
  }

  toast.textContent = text;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    toast.classList.remove("show");
  }, 1800);
}

/* ---------- Book markup ---------- */
function coverUrl(book) {
  return book.image || "https://covers.openlibrary.org/b/isbn/" + book.isbn + "-M.jpg?default=false";
}

/* The title block sits behind the image and shows only if the image fails */
function createCover(book, withTag) {
  return (
    '<div class="cover" style="background:' + categoryColors[book.category] + '">' +
      '<span>' + escapeHtml(book.title) + '</span>' +
      '<img src="' + coverUrl(book) + '" alt="Cover of ' + escapeHtml(book.title) + '" width="200" height="300" loading="lazy" onerror="this.remove()">' +
      (withTag ? '<span class="cat-tag">' + escapeHtml(book.category) + '</span>' : '') +
    '</div>'
  );
}

/* ---------- Ratings and reviews ---------- */
const SAMPLE_REVIEWS = {
  "Superhero": ["A genre classic. The art and storytelling still feel fresh, and I finished it in one sitting.", "Great print quality and fast delivery. A must-have for any superhero collection.", "Darker than I expected, but I loved it. Easy to see why people recommend it."],
  "Manga": ["A great start to the series. The pacing is quick and I immediately wanted the next volume.", "Clean print and sharp artwork. Perfect for getting into manga.", "My whole friend group is reading this. Good price for the quality."],
  "Graphic Novel": ["Powerful and personal. The drawings add so much to the story.", "One of those books that stays with you. I recommend it to non-comic readers too.", "Beautiful edition, and it arrived well packed."],
  "Sci-Fi & Fantasy": ["Imaginative world and great art. I could not put it down.", "A strong first volume that makes you want to read on.", "The story and artwork work together perfectly. Worth the price."],
  "Indie": ["Charming, funny and full of personality. I enjoyed every page.", "A great pick if you want something different from the big publishers.", "Lovely edition and a quick, fun read."]
};
const SAMPLE_NAMES = ["Aarav S.", "Priya M.", "Rohan K.", "Neha T.", "Kabir D.", "Ananya R."];
const SAMPLE_TITLES = ["A must-read", "Worth every rupee", "Great read"];
const SAMPLE_DATES = ["12 Aug 2026", "3 Sep 2026", "21 Oct 2026"];
const SAMPLE_RATINGS = [[5, 4, 5], [4, 5, 4], [5, 5, 4], [4, 4, 5]];

/* Placeholder reviews so every book has some (demo data, not real customers) */
function seedReviews(book) {
  return SAMPLE_REVIEWS[book.category].map(function (text, i) {
    return {
      name: SAMPLE_NAMES[(book.id + i) % SAMPLE_NAMES.length],
      rating: SAMPLE_RATINGS[book.id % 4][i],
      title: SAMPLE_TITLES[i],
      text: text,
      date: SAMPLE_DATES[i],
      sample: true
    };
  });
}

function getUserReviews(id) {
  return readStorage(REVIEWS_KEY, {})[id] || [];
}

function getReviews(book) {
  return getUserReviews(book.id).concat(seedReviews(book));
}

function ratingSummary(book) {
  const reviews = getReviews(book);
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;

  reviews.forEach(function (review) {
    counts[review.rating] += 1;
    sum += review.rating;
  });

  return { average: sum / reviews.length, count: reviews.length, counts: counts, reviews: reviews };
}

function starsHtml(value) {
  const percent = Math.round((value / 5) * 100);
  return (
    '<span class="stars" role="img" aria-label="' + value.toFixed(1) + ' out of 5 stars">' +
      '<span class="stars-fill" style="width:' + percent + '%" aria-hidden="true">\u2605\u2605\u2605\u2605\u2605</span>' +
    '</span>'
  );
}

function bookUrl(book) {
  return "book.html?id=" + book.id;
}

function createBookCard(book) {
  const summary = ratingSummary(book);

  return (
    '<article class="card">' +
      '<a class="cover-link" href="' + bookUrl(book) + '" aria-label="View details of ' + escapeHtml(book.title) + '">' + createCover(book, true) + '</a>' +
      '<div class="card-body">' +
        '<h3><a class="title-link" href="' + bookUrl(book) + '">' + escapeHtml(book.title) + '</a></h3>' +
        '<p class="book-meta">' + escapeHtml(book.author) + '</p>' +
        '<div class="rating">' + starsHtml(summary.average) + '<span class="rating-count">' + summary.count + '</span></div>' +
        '<div class="card-foot">' +
          '<span class="price">' + formatPrice(book.price) + '' + '</span>' +
          '<button class="btn btn-small" type="button" data-add="' + book.id + '">Add to cart</button>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

/* Small cover that links to the book page (used by the home page shelf) */
function createShelfItem(book) {
  return (
    '<a class="shelf-item" href="' + bookUrl(book) + '" title="' + escapeHtml(book.title) + '">' +
      createCover(book, false) +
    '</a>'
  );
}

/* ---------- Issue checklists (saved per user, or as a guest) ---------- */
function checklistUser() {
  const user = getCurrentUser();
  return user ? user.email : "guest";
}

/* Returns { issueNumber: "raw" | "9.8" | ... } for the issues the user owns */
function getChecklist(seriesId) {
  const all = readStorage(CHECK_KEY, {});
  return (all[checklistUser()] || {})[seriesId] || {};
}

function saveChecklist(seriesId, owned) {
  const all = readStorage(CHECK_KEY, {});
  const key = checklistUser();
  all[key] = all[key] || {};
  all[key][seriesId] = owned;
  writeStorage(CHECK_KEY, all);
}

/* A shelf is one genre. The checklist stores { bookId: "raw" | "9.8" | ... } */
function shelfBooks(category) {
  return books.filter(function (book) { return book.category === category; });
}

function shelfProgress(category) {
  const owned = getChecklist(category);
  const total = shelfBooks(category).length;
  const count = shelfBooks(category).filter(function (book) { return owned[book.id]; }).length;
  return { owned: count, total: total, percent: Math.round((count / total) * 100) };
}

function progressBar(percent, label) {
  return (
    '<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + percent + '" aria-label="' + escapeHtml(label) + '">' +
      '<div class="progress-fill" style="width:' + percent + '%"></div>' +
    '</div>'
  );
}

function createCollectionCard(category) {
  const progress = shelfProgress(category);
  return (
    '<a class="card category-card series-card" href="series.html?id=' + encodeURIComponent(category) + '">' +
      '<h3>' + escapeHtml(category) + ' shelf</h3>' +
      '<p class="book-meta">' + progress.total + ' titles</p>' +
      progressBar(progress.percent, category + " checklist progress") +
      '<p class="muted small">' + progress.owned + ' of ' + progress.total + ' owned</p>' +
    '</a>'
  );
}

/* ---------- Wishlist and release rows ---------- */
function getWishlist() {
  return readStorage(WISH_KEY, []);
}

function daysUntil(dateText) {
  const day = new Date(dateText + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((day - today) / 86400000);
}

function wishLabel(on) {
  return on ? "\u2605 On wishlist" : "\u2606 Wishlist";
}

function createReleaseRow(release) {
  const day = new Date(release.date + "T00:00:00");
  const days = daysUntil(release.date);
  const when = days > 1 ? "in " + days + " days" : days === 1 ? "tomorrow" : days === 0 ? "out today" : "released";
  const on = getWishlist().indexOf(release.id) !== -1;

  return (
    '<article class="release">' +
      '<div class="date-badge"><strong>' + day.getDate() + '</strong>' + day.toLocaleDateString("en-IN", { month: "short" }) + '</div>' +
      '<div class="release-main">' +
        '<h3>' + escapeHtml(release.title) + '</h3>' +
        '<p class="book-meta">' + escapeHtml(release.format) + ' | ' + escapeHtml(release.publisher) + ' | ' + when + '</p>' +
        '<p class="muted small">' + escapeHtml(release.note) + '</p>' +
      '</div>' +
      '<div class="release-side">' +
        '<span class="price">' + formatPrice(release.price) + '</span>' +
        '<button type="button" class="btn btn-outline btn-small" data-wish="' + release.id + '" aria-pressed="' + on + '">' + wishLabel(on) + '</button>' +
      '</div>' +
    '</article>'
  );
}

document.addEventListener("click", function (event) {
  const button = event.target.closest ? event.target.closest("[data-wish]") : null;
  if (!button) {
    return;
  }

  const id = button.getAttribute("data-wish");
  let list = getWishlist();
  const on = list.indexOf(id) === -1;

  list = on ? list.concat(id) : list.filter(function (entry) { return entry !== id; });
  writeStorage(WISH_KEY, list);
  button.textContent = wishLabel(on);
  button.setAttribute("aria-pressed", on);
  document.dispatchEvent(new CustomEvent("wishlistchange"));
});

/* ---------- Page start-up ---------- */
document.addEventListener("click", function (event) {
  const button = event.target.closest ? event.target.closest("[data-add]") : null;
  if (!button) {
    return;
  }

  addToCart(Number(button.getAttribute("data-add")));

  /* Show feedback on the button itself */
  button.classList.add("added");
  button.textContent = "Added \u2713";
  setTimeout(function () {
    button.classList.remove("added");
    button.textContent = "Add to cart";
  }, 1200);
});

document.addEventListener("DOMContentLoaded", updateNav);

/* ---------- Mobile menu ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("site-nav");

  if (!toggle || !nav) {
    return;
  }

  function setOpen(open) {
    nav.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open);
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  toggle.addEventListener("click", function () {
    setOpen(!nav.classList.contains("open"));
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });
});
