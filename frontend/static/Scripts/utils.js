'use strict';

// Utility functions

// Generate star rating HTML
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '';

  for (let i = 0; i < fullStars; i++) {
    stars += '<span class="star filled">★</span>';
  }

  if (hasHalfStar) {
    stars += '<span class="star half">★</span>';
  }

  const emptyStars = 5 - Math.ceil(rating);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<span class="star empty">★</span>';
  }

  return stars;
}

// Show toast notification
function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  if (toast && toastMessage) {
    toastMessage.textContent = message;
    toast.classList.add('show');

    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  }
}

// Scroll to products section
function scrollToProducts() {
  const productsSection = document.getElementById('products');
  if (productsSection) {
    productsSection.scrollIntoView({ behavior: 'smooth' });
  }
}

// Toggle mobile menu
function toggleMenu() {
  const nav = document.querySelector('.nav');
  const menuBtn = document.querySelector('.menu-btn');
  if (nav && menuBtn) {
    nav.classList.toggle('active');
    menuBtn.setAttribute('aria-expanded', nav.classList.contains('active'));
  }
}