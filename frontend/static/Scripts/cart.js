'use strict';

// Cart functionality
let cart = JSON.parse(localStorage.getItem('eleganceCart')) || [];

// DOM Elements for cart
const cartCount = document.querySelector('.cart-count');
const cartOverlay = document.getElementById('cartOverlay');
const cartSidebar = document.getElementById('cartSidebar');
const cartEmpty = document.getElementById('cartEmpty');
const cartItems = document.getElementById('cartItems');
const cartFooter = document.getElementById('cartFooter');
const totalAmount = document.getElementById('totalAmount');

// Add to cart
function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItem = cart.find(item => item.id === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1
    });
  }

  localStorage.setItem('eleganceCart', JSON.stringify(cart));
  updateCartUI();
  showToast(`${product.name} added to cart!`);
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter(item => item.id !== productId);
  localStorage.setItem('eleganceCart', JSON.stringify(cart));
  updateCartUI();
  showToast('Item removed from cart');
}

// Update quantity
function updateQuantity(productId, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(productId);
    return;
  }

  const item = cart.find(item => item.id === productId);
  if (item) {
    item.quantity = newQuantity;
    localStorage.setItem('eleganceCart', JSON.stringify(cart));
    updateCartUI();
  }
}

// Update cart UI
function updateCartUI() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const total = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

  // Update cart count
  if (cartCount) {
    cartCount.textContent = itemCount;
    cartCount.style.display = itemCount > 0 ? 'flex' : 'none';
  }

  // Update cart content
  if (cartItems && cartEmpty && cartFooter && totalAmount) {
    if (cart.length === 0) {
      cartEmpty.style.display = 'flex';
      cartItems.style.display = 'none';
      cartFooter.style.display = 'none';
    } else {
      cartEmpty.style.display = 'none';
      cartItems.style.display = 'flex';
      cartFooter.style.display = 'block';

      cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}" class="cart-item-image">

          <div class="cart-item-details">
            <div class="cart-item-header">
              <div class="cart-item-info">
                <h3 class="cart-item-name">${item.name}</h3>
                <p class="cart-item-size">${item.size}</p>
              </div>
              <button class="cart-item-remove" onclick="removeFromCart('${item.id}')">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <div class="cart-item-footer">
              <div class="cart-item-quantity">
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity - 1})">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                  </svg>
                </button>
                <span class="quantity-display">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity('${item.id}', ${item.quantity + 1})">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                  </svg>
                </button>
              </div>
              <span class="cart-item-price">₹${(item.price * item.quantity).toLocaleString()}</span>
            </div>
          </div>
        </div>
      `).join('');

      totalAmount.textContent = `₹${total.toLocaleString()}`;
    }
  }
}

// Toggle cart
function toggleCart() {
  if (cartOverlay && cartSidebar) {
    cartOverlay.classList.toggle('active');
    cartSidebar.classList.toggle('active');
    document.body.style.overflow = cartSidebar.classList.contains('active') ? 'hidden' : '';
  }
}

// Close cart
function closeCart() {
  if (cartOverlay && cartSidebar) {
    cartOverlay.classList.remove('active');
    cartSidebar.classList.remove('active');
    document.body.style.overflow = '';
  }
}

// Checkout
function checkout() {
  if (cart.length === 0) return;

  alert('Thank you for your interest! Payment integration requires a backend service. This is a demo version.');
  closeCart();
}