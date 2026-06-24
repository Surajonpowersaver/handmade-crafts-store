// cart.js — single localStorage cart used across all pages
(function () {
  const KEY = 'hm_cart_v1';

  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function writeCart(cart) {
    localStorage.setItem(KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cart:change', { detail: cart }));
  }

  function findIndex(cart, id) {
    return cart.findIndex((it) => it.id === id);
  }

  function addToCart(item) {
    const cart = readCart();
    const qty = Number(item.quantity) || 1;
    const idx = findIndex(cart, item.id);
    if (idx >= 0) {
      cart[idx].quantity += qty;
    } else {
      cart.push({
        id: item.id,
        name: item.name,
        price: Number(item.price),
        quantity: qty,
      });
    }
    writeCart(cart);
  }

  function setQuantity(id, qty) {
    const cart = readCart();
    const idx = findIndex(cart, id);
    if (idx < 0) return;
    if (qty <= 0) cart.splice(idx, 1);
    else cart[idx].quantity = qty;
    writeCart(cart);
  }

  function removeFromCart(id) {
    const cart = readCart().filter((it) => it.id !== id);
    writeCart(cart);
  }

  function clearCart() {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent('cart:change', { detail: [] }));
  }

  // Migrate old data from the previous "cart" key once
  try {
    const legacy = localStorage.getItem('cart');
    if (legacy && !localStorage.getItem(KEY)) {
      localStorage.setItem(KEY, legacy);
      localStorage.removeItem('cart');
    }
  } catch (_) {}

  window.cartHelpers = {
    readCart,
    addToCart,
    setQuantity,
    removeFromCart,
    clearCart,
  };
  window.addToCart = addToCart;
})();

function addBraceletToCart(id) {
  const colorEl = document.getElementById('wave-color');
  const color = colorEl ? colorEl.value : 'Default';
  window.addToCart({
    id: id + '-' + color.toLowerCase(),
    name: 'Beaded Bracelet - Wave (' + color + ')',
    price: 119.0,
    quantity: 1,
  });
  alert('Added ' + color + ' Wave Bracelet to cart!');
}
