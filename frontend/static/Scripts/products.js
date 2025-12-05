'use strict';

let homeProducts = [];

function sortHomeProducts(sortType) {
  let sorted = [...homeProducts];

  switch (sortType) {
    case 'newest':
      sorted = sorted.slice().reverse();
      break;
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'name-asc':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'rating':
      sorted.sort((a, b) => b.rating - a.rating);
      break;
    default:
      break;
  }

  renderProducts(sorted);
}

function renderProducts(productsList) {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;

  productsGrid.innerHTML = productsList
    .map(
      (product) => `
    <div class="product-card" onclick="viewProduct('${product.id}')">
      <div class="product-image-container">
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-overlay"></div>
        <button class="product-view-btn" onclick="event.stopPropagation(); viewProduct('${product.id}')">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7 -1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          View Details
        </button>
      </div>

      <div class="product-content">
        <h3 class="product-name">${product.name}</h3>
        <p class="product-description">${product.description}</p>

        <div class="product-notes">
          ${product.notes.slice(0, 3).map((note) => `<span class="product-note">${note}</span>`).join('')}
        </div>

        <div class="product-footer">
          <div class="product-price-info">
            <p class="product-price">₹${product.price.toLocaleString()}</p>
            <p class="product-size">${product.size}</p>
          </div>

          <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart('${product.id}')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13 m0 0l-1.8 5.2M7 13l-1.8 5.2m0 0h9.6 m-9.6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm9.6 0 a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>`
    )
    .join('');
}

function loadProducts() {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;

  homeProducts = products;
  renderProducts(homeProducts);

  const homeSortSelect = document.getElementById('homeSortSelect');
  if (homeSortSelect) {
    homeSortSelect.addEventListener('change', (e) => {
      sortHomeProducts(e.target.value);
    });
  }
}

function loadProductDetail() {
  const productDetails = document.getElementById('productDetails');
  if (!productDetails) return;

  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = '/';
    return;
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    window.location.href = '/collection';
    return;
  }

  const breadcrumb = document.getElementById('productBreadcrumb');
  if (breadcrumb) breadcrumb.textContent = product.name;

  document.title = `${product.name} - Elegance Perfumery`;
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.content = `${product.description} Price: ₹${product.price.toLocaleString()} for ${product.size}.`;
  }

  productDetails.innerHTML = `
    <div class="product-detail-container">
      <div class="product-detail-image">
        <img src="${product.image}" alt="${product.name}">
      </div>

      <div class="product-detail-info">
        <h1 class="product-detail-title">${product.name}</h1>
        <p class="product-detail-price">₹${product.price.toLocaleString()}</p>

        <div class="product-rating">
          <div class="rating-stars">${generateStars(product.rating)}</div>
          <span class="rating-text">${product.rating} (${product.reviews} reviews)</span>
        </div>

        <p class="product-detail-description">${product.description}</p>

        <div class="product-detail-notes">
          <h3 class="notes-title">Fragrance Notes</h3>
          <div class="notes-list">
            ${product.notes.map((note) => `<span class="note-tag">${note}</span>`).join('')}
          </div>
        </div>

        <div class="product-detail-info-grid">
          <div class="info-item"><h4>Size</h4><p>${product.size}</p></div>
          <div class="info-item"><h4>Concentration</h4><p>Eau de Parfum</p></div>
          <div class="info-item"><h4>Longevity</h4><p>6–8 hours</p></div>
          <div class="info-item"><h4>Sillage</h4><p>Moderate</p></div>
        </div>

        <div class="product-detail-actions">
          <button class="detail-add-to-cart" onclick="addToCart('${product.id}')">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4 m0 0L7 13m0 0l-1.8 5.2M7 13l-1.8 5.2 m0 0h9.6m-9.6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm9.6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"></path>
            </svg>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

function viewProduct(productId) {
  window.location.href = `/product?id=${productId}`;
}

function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = '★'.repeat(fullStars);
  if (hasHalfStar) stars += '⯨';
  stars += '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0));
  return stars;
}
