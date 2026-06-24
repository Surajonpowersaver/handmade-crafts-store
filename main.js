// js/main.js
// Handles nav toggle and add-to-cart button binding for minimal site.

document.addEventListener('DOMContentLoaded', () => {
  // mobile nav toggle
  const toggler = document.getElementById('nav-toggle');
  const nav = document.querySelector('.nav');
  if (toggler) {
    toggler.addEventListener('click', () => {
      if (nav.style.display === 'flex') nav.style.display = 'none';
      else nav.style.display = 'flex';
    });
  }

  // Bind add-to-cart buttons (adds item using cart.js addToCart helper)
  document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = parseFloat(btn.dataset.price || '0');
      // use global addToCart if available
      if (typeof addToCart === 'function') {
        addToCart({ id, name, price, quantity: 1 });
        btn.textContent = 'Added ✓';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = 'Add'; btn.disabled = false; }, 900);
      } else {
        console.warn('cart.js not loaded');
      }
    });
  });

  // Make product images clickable - link to detail page
  document.querySelectorAll('.card-img').forEach(img => {
    img.style.cursor = 'pointer';
    img.addEventListener('click', () => {
      const card = img.closest('.card');
      if (card) {
        const detailsLink = card.querySelector('.link');
        if (detailsLink && detailsLink.href && !detailsLink.href.endsWith('#')) {
          window.location.href = detailsLink.href;
        }
      }
    });
  });
});
