// cart.js - a simple shopping cart that lives in the browser's localStorage.
//
// The cart is saved as a list of { id, qty } objects, for example:
//   [ { "id": "1", "qty": 2 }, { "id": "4", "qty": 1 } ]
// Only ids and quantities are stored. Names, prices and images are looked
// up from /api/products, so they always match products.json.
//
// You do NOT need to change this file to style your cart.
// To change how a cart row looks, edit cartItemHTML() and cartSummaryHTML()
// below, or just style the class names they use in your CSS.

const CART_KEY = 'cart';

// ---------- HTML templates: change these to restyle the cart page ----------

// HTML for one row in the cart. "product" comes from products.json.
function cartItemHTML(product, qty) {
  return `
    <li class="cart-item">
      <img src="${product.image}" alt="" width="80" height="80">
      <div class="cart-item-details">
        <a href="/product/${product.id}">${product.name}</a>
        <p class="price">${euro(product.price)} each</p>
      </div>
      <label for="qty-${product.id}">Quantity</label>
      <input type="number" id="qty-${product.id}" min="1" max="99"
             value="${qty}" data-qty="${product.id}">
      <p class="line-total">${euro(product.price * qty)}</p>
      <button type="button" data-remove="${product.id}">Remove item</button>
    </li>`;
}

// HTML for the total at the bottom of the cart
function cartSummaryHTML(total) {
  return `
    <div class="cart-summary">
      <p>Total: <strong>${euro(total)}</strong></p>
      <a href="/checkout" class="checkout-link">Go to checkout</a>
    </div>`;
}

// HTML shown when the cart has nothing in it
function emptyCartHTML() {
  return `<p>Your cart is empty. <a href="/shop">Visit the shop</a></p>`;
}

// ---------- reading and saving the cart ----------

// get the cart from localStorage (an empty list if nothing is saved yet)
function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (error) {
    // the saved data was broken, so start again with an empty cart
    return [];
  }
}

// save the cart to localStorage and update the count in the nav
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

// add one of a product (or more, if qty is given)
function addToCart(id, qty = 1) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.qty += qty; // already in the cart: increase the quantity
  } else {
    cart.push({ id: id, qty: qty }); // not in the cart yet: add it
  }
  saveCart(cart);
}

// change the quantity of a product that is already in the cart
function setQuantity(id, qty) {
  const cart = getCart();
  const item = cart.find((i) => i.id === id);
  if (item) {
    item.qty = qty;
    saveCart(cart);
  }
}

// take a product out of the cart completely
function removeFromCart(id) {
  const cart = getCart().filter((i) => i.id !== id);
  saveCart(cart);
}

// empty the whole cart (useful after checkout)
function clearCart() {
  saveCart([]);
}

// total number of items, e.g. 2 coffees + 1 mug = 3
function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

// ---------- updating the page ----------

// format a number as euro, e.g. 12.5 -> "€12.50"
function euro(amount) {
  return '€' + Number(amount).toFixed(2);
}

// put the item count into every element with data-cart-count
function updateCartCount() {
  document.querySelectorAll('[data-cart-count]').forEach((el) => {
    el.textContent = cartCount();
  });
}

// build the cart page from what is in localStorage
async function renderCart() {
  const container = document.getElementById('cart-items');
  const cart = getCart();

  if (cart.length === 0) {
    container.innerHTML = emptyCartHTML();
    return;
  }

  // get the full product details from the server
  const response = await fetch('/api/products');
  const products = await response.json();

  let rows = '';
  let total = 0;
  cart.forEach((item) => {
    const product = products.find((p) => p.id === item.id);
    if (product) {
      rows += cartItemHTML(product, item.qty);
      total += product.price * item.qty;
    }
  });

  container.innerHTML = `<ul class="cart-list">${rows}</ul>` + cartSummaryHTML(total);
}

// ---------- listening for clicks and changes ----------

// one click listener for the whole page. It checks what was clicked.
document.addEventListener('click', (event) => {
  // an "Add to cart" button
  const addButton = event.target.closest('[data-add-to-cart]');
  if (addButton) {
    const id = addButton.dataset.addToCart;
    addToCart(id);
    // show a message near the button (screen readers read it out too)
    const message = addButton.parentElement.querySelector('[data-cart-message]')
                 || document.querySelector('[data-cart-message]');
    if (message) {
      const card = addButton.closest('article');
      const name = card ? card.querySelector('h1, h2').textContent : 'Item';
      message.textContent = `Added ${name} to your cart.`;
    }
  }

  // a "Remove" button on the cart page
  const removeButton = event.target.closest('[data-remove]');
  if (removeButton) {
    removeFromCart(removeButton.dataset.remove);
    renderCart();
  }
});

// a quantity box on the cart page was changed
document.addEventListener('change', async (event) => {
  if (event.target.matches('[data-qty]')) {
    const id = event.target.dataset.qty;
    const qty = parseInt(event.target.value, 10);
    if (qty > 0) {
      setQuantity(id, qty);
    } else {
      removeFromCart(id);
    }
    await renderCart();
    // redrawing the cart replaces the box, so put keyboard focus back on it
    const box = document.getElementById('qty-' + id);
    if (box) box.focus();
  }
});

// when the page first loads
updateCartCount();
if (document.getElementById('cart-items')) {
  renderCart();
}