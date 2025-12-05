'use strict';

// Main application initialization

// Toggle mobile menu
function toggleMenu() {
  const navMenu = document.getElementById('primaryNav');
  const menuBtn = document.querySelector('.menu-btn');
  
  if (navMenu) {
    navMenu.classList.toggle('open');
    menuBtn.classList.toggle('active');
  }
}

// Close menu when a nav link is clicked
document.addEventListener('DOMContentLoaded', function() {
  const navLinks = document.querySelectorAll('.nav-link');
  const navMenu = document.getElementById('primaryNav');
  const menuBtn = document.querySelector('.menu-btn');
  
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      navMenu.classList.remove('open');
      menuBtn.classList.remove('active');
    });
  });
});

// Initialize
document.addEventListener('DOMContentLoaded', function() {
  updateCartUI();
  loadProducts();
  loadProductDetail();
  setupContactForm();
});

// Setup contact form
function setupContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    // In a real application, you would send this data to a server
    console.log('Contact form submission:', data);

    showToast('Message sent successfully! We will respond shortly.');
    contactForm.reset();
  });
}

// Event listeners
if (cartOverlay) {
  cartOverlay.addEventListener('click', closeCart);
}

// Handle escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    closeCart();
  }
});

// Initialize cart count on all pages
updateCartUI();