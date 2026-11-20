/* ==========================================================
   cart.js - cart list, quantity buttons, checkout and
   order confirmation
   ========================================================== */

const cartArea = document.getElementById("cart-area");
const cartMessage = document.getElementById("cart-message");

function renderCart() {
  const cart = getCart();

  if (cart.length === 0) {
    cartArea.innerHTML =
      '<div class="empty-state">' +
        '<div class="empty-icon">\uD83D\uDED2</div>' +
        '<h3>Your cart is empty</h3>' +
        '<p>Pick a few comics from the catalog and they will show up here.</p>' +
        '<a class="btn" href="catalog.html">Browse the catalog</a>' +
      '</div>';
    return;
  }

  let rows = "";
  let total = 0;
  let count = 0;

  cart.forEach(function (item) {
    const book = findBook(item.id);
    const grade = item.grade || "";
    const lineTotal = linePrice(item);
    total += lineTotal;
    count += item.qty;

    rows +=
      '<article class="cart-item">' +
        '<a class="thumb" href="' + bookUrl(book) + '">' + createCover(book, false) + '</a>' +
        '<div>' +
          '<h3><a class="title-link" href="' + bookUrl(book) + '">' + escapeHtml(book.title) + '</a></h3>' +
          '<p class="book-meta">' + escapeHtml(book.author) + ' | ' + escapeHtml(book.format) + '</p>' +
          (grade ? '<p class="book-meta"><span class="grade-pill">' + grade + '</span> ' + gradeInfo(grade).name + ' | ' + formatPrice(unitPrice(book, grade)) + ' each</p>' : '<p class="book-meta">' + formatPrice(book.price) + ' each</p>') +
          '<div class="qty-controls">' +
            '<button type="button" data-change="-1" data-id="' + book.id + '" data-grade="' + grade + '" aria-label="Decrease quantity of ' + escapeHtml(book.title) + '">-</button>' +
            '<span aria-live="polite">' + item.qty + '</span>' +
            '<button type="button" data-change="1" data-id="' + book.id + '" data-grade="' + grade + '" aria-label="Increase quantity of ' + escapeHtml(book.title) + '">+</button>' +
          '</div>' +
        '</div>' +
        '<div class="cart-line">' +
          '<p class="price">' + formatPrice(lineTotal) + '</p>' +
          '<button type="button" class="btn btn-outline btn-small" data-remove="' + book.id + '" data-grade="' + grade + '">Remove</button>' +
        '</div>' +
      '</article>';
  });

  cartArea.innerHTML =
    '<div class="cart-layout">' +
      '<div class="cart-list">' + rows + '</div>' +
      '<aside class="summary">' +
        '<h2>Order summary</h2>' +
        '<div class="summary-row"><span>Items</span><span>' + count + '</span></div>' +
        '<div class="summary-row"><span>Subtotal</span><span>' + formatPrice(total) + '</span></div>' +
        '<div class="summary-row"><span>Delivery</span><span>Free</span></div>' +
        '<div class="summary-row total"><span>Total</span><span>' + formatPrice(total) + '</span></div>' +
        '<button type="button" class="btn btn-block" id="checkout-btn">Pay with Razorpay</button>' +
        '<a class="btn btn-outline btn-block" href="catalog.html">Continue shopping</a>' +
        '<p class="pay-note"><strong>Test mode.</strong> No real money is charged. Use card 4111 1111 1111 1111 with any future expiry and any CVV, or UPI id success@razorpay.</p>' +
      '</aside>' +
    '</div>';
}

function sameLine(entry, id, grade) {
  return entry.id === id && (entry.grade || "") === grade;
}

/* Change quantity (0 removes the item) */
function changeQuantity(id, grade, change) {
  const cart = getCart();
  const item = cart.find(function (entry) { return sameLine(entry, id, grade); });

  if (!item) {
    renderCart();
    return;
  }

  item.qty += change;
  saveCart(cart.filter(function (entry) { return entry.qty > 0; }));
  renderCart();
}

function removeItem(id, grade) {
  saveCart(getCart().filter(function (entry) { return !sameLine(entry, id, grade); }));
  renderCart();
}

function showCartMessage(text, type) {
  cartMessage.className = "message " + type;
  cartMessage.textContent = text;
}

/* Order confirmation screen */
function showConfirmation(orderId, paymentId, items, user) {
  let total = 0;
  const lines = items.map(function (item) {
    const book = findBook(item.id);
    const lineTotal = linePrice(item);
    total += lineTotal;
    return '<li><span>' + escapeHtml(book.title) + (item.grade ? ' (grade ' + item.grade + ')' : '') + ' x ' + item.qty + '</span><span>' + formatPrice(lineTotal) + '</span></li>';
  }).join("");

  cartArea.innerHTML =
    '<div class="order-done">' +
      '<div class="check" aria-hidden="true">\u2713</div>' +
      '<h2>Payment successful</h2>' +
      '<p class="muted">Thank you, ' + escapeHtml(user.name) + '. Keep your order number for reference.</p>' +
      '<div class="order-no">' + escapeHtml(orderId) + '</div>' +
      '<ul class="order-lines">' + lines + '</ul>' +
      '<p><strong>Total paid: ' + formatPrice(total) + '</strong></p>' +
      '<p class="muted">Razorpay payment id: ' + escapeHtml(paymentId) + '</p>' +
      '<a class="btn" href="catalog.html">Keep browsing</a>' +
    '</div>';
}

/* Save the order once Razorpay reports a successful payment */
function completeOrder(paymentId, items, user) {
  const orders = readStorage(ORDERS_KEY, []);
  const orderId = "ORD" + Date.now().toString().slice(-6);

  orders.push({
    id: orderId,
    paymentId: paymentId,
    email: user.email,
    items: items,
    date: new Date().toISOString()
  });
  writeStorage(ORDERS_KEY, orders);
  saveCart([]);

  showCartMessage("Payment received. Your order is confirmed.", "success");
  showConfirmation(orderId, paymentId, items, user);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* Checkout: needs a logged-in user, then opens Razorpay (test mode only) */
function checkout() {
  const user = getCurrentUser();
  const items = getCart();
  const button = document.getElementById("checkout-btn");

  if (!user) {
    window.location.href = "login.html?next=cart.html";
    return;
  }
  if (items.length === 0) {
    return;
  }

  if (typeof RAZORPAY_KEY_ID === "undefined" || !/^rzp_test_[A-Za-z0-9]{8,}$/.test(RAZORPAY_KEY_ID) || /X{6,}/.test(RAZORPAY_KEY_ID)) {
    showCartMessage("Payments are not set up yet. Add your Razorpay test Key Id (rzp_test_...) in js/config.js.", "error");
    return;
  }
  if (typeof Razorpay === "undefined") {
    showCartMessage("The payment window could not load. Check your internet connection and try again.", "error");
    return;
  }

  let total = 0;
  let count = 0;
  items.forEach(function (item) {
    total += linePrice(item);
    count += item.qty;
  });

  const checkoutWindow = new Razorpay({
    key: RAZORPAY_KEY_ID,
    amount: total * 100,
    currency: "INR",
    name: STORE_NAME,
    description: count + (count === 1 ? " comic" : " comics"),
    prefill: { name: user.name, email: user.email },
    notes: { customer_email: user.email },
    theme: { color: "#1f3a5f" },
    handler: function (response) {
      completeOrder(response.razorpay_payment_id, items, user);
    },
    modal: {
      ondismiss: function () {
        button.disabled = false;
        showCartMessage("Payment cancelled. Your cart has not changed.", "error");
      }
    }
  });

  checkoutWindow.on("payment.failed", function (response) {
    button.disabled = false;
    showCartMessage("Payment failed: " + response.error.description + ". Try again or use a different method.", "error");
  });

  cartMessage.className = "";
  cartMessage.textContent = "";
  button.disabled = true;
  checkoutWindow.open();
}

cartArea.addEventListener("click", function (event) {
  const target = event.target.closest("button");
  if (!target) {
    return;
  }

  if (target.hasAttribute("data-change")) {
    changeQuantity(Number(target.dataset.id), target.dataset.grade || "", Number(target.dataset.change));
  } else if (target.hasAttribute("data-remove")) {
    removeItem(Number(target.dataset.remove), target.dataset.grade || "");
  } else if (target.id === "checkout-btn") {
    checkout();
  }
});

renderCart();
