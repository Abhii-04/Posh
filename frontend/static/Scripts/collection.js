'use strict';

let allProducts = [];
let currentViewMode = 'grid';

async function loadCollectionProducts() {
  try {
    const productsGrid = document.getElementById('productsGrid');
    const productsCount = document.getElementById('productsCount');
    const noProducts = document.getElementById('noProducts');

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        allProducts = data && data.length > 0 ? data : products;
        displayProducts(allProducts);
        productsCount.textContent = allProducts.length;
      })
      .catch(err => {
        console.warn('API failed, using local data:', err);
        allProducts = products;
        displayProducts(allProducts);
        productsCount.textContent = allProducts.length;
      });
  } catch (err) {
    console.error('Error loading products:', err);
    allProducts = products;
    displayProducts(allProducts);
  }
}

function displayProducts(productsList) {
  const productsGrid = document.getElementById('productsGrid');
  const noProducts = document.getElementById('noProducts');

  if (!productsList || productsList.length === 0) {
    productsGrid.innerHTML = '';
    noProducts.style.display = 'block';
    return;
  }

  noProducts.style.display = 'none';

  productsGrid.innerHTML = productsList
    .map(product => {
      const displayImage = product.image || 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=600&fit=crop';
      const displayPrice = product.price || 0;
      const displaySize = product.size || '50ml';
      const displayName = product.name || 'Product';
      const displayDesc = product.description || 'Premium fragrance';
      const displayNotes = product.notes || [];
      const displayRating = product.rating || 0;
      const displayReviews = product.reviews || 0;

      return `
        <div class="product-card">
          <div class="product-image-container">
            <img src="${displayImage}" alt="${displayName}" class="product-image" onerror="this.src='https://via.placeholder.com/400x600?text=${encodeURIComponent(displayName)}'">
            <div class="product-overlay"></div>
            <button class="product-view-btn" onclick="event.stopPropagation(); viewProduct('${product.id}')">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
              </svg>
              View Details
            </button>
          </div>

          <div class="product-content">
            <h3 class="product-name">${displayName}</h3>
            <p class="product-description">${displayDesc}</p>

            <div class="product-notes">
              ${displayNotes.slice(0, 3).map(note => `<span class="product-note">${note}</span>`).join('')}
            </div>

            <div class="product-footer">
              <div class="product-price-info">
                <p class="product-price">₹${typeof displayPrice === 'number' ? displayPrice.toLocaleString() : displayPrice}</p>
                <p class="product-size">${displaySize}</p>
              </div>

              <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 5.2M7 13l-1.8 5.2m0 0h9.6m-9.6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm9.6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
                </svg>
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function sortProducts(sortType) {
  let sorted = [...allProducts];

  switch (sortType) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      break;
    case 'price-low':
      sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      break;
    case 'price-high':
      sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      break;
    case 'name-asc':
      sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      break;
    case 'name-desc':
      sorted.sort((a, b) => (b.name || '').localeCompare(a.name || ''));
      break;
    case 'rating':
      sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      break;
    case 'reviews':
      sorted.sort((a, b) => (b.reviews || 0) - (a.reviews || 0));
      break;
    default:
      break;
  }

  displayProducts(sorted);
}

function toggleViewMode(mode) {
  currentViewMode = mode;
  const productsGrid = document.getElementById('productsGrid');
  const gridBtn = document.getElementById('gridViewBtn');
  const listBtn = document.getElementById('listViewBtn');

  if (mode === 'grid') {
    productsGrid.classList.remove('list-view');
    gridBtn.classList.add('active');
    listBtn.classList.remove('active');
  } else {
    productsGrid.classList.add('list-view');
    listBtn.classList.add('active');
    gridBtn.classList.remove('active');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadCollectionProducts();

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortProducts(e.target.value);
    });
  }

  const gridViewBtn = document.getElementById('gridViewBtn');
  const listViewBtn = document.getElementById('listViewBtn');

  if (gridViewBtn) {
    gridViewBtn.addEventListener('click', () => toggleViewMode('grid'));
  }

  if (listViewBtn) {
    listViewBtn.addEventListener('click', () => toggleViewMode('list'));
  }
});
