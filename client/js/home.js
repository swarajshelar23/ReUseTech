/**
 * home.js - Home page functionality
 * Handles product display, search, and filtering
 */

let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
  // Load all products
  loadProducts();

  // Setup search functionality
  const searchBtn = document.getElementById('btn-search');
  const searchBar = document.getElementById('search-bar');
  
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch);
  }

  if (searchBar) {
    searchBar.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleSearch();
      }
    });
  }

  // Setup filter functionality
  const applyFilterBtn = document.getElementById('btn-apply-filter');
  const clearFilterBtn = document.getElementById('btn-clear-filter');

  if (applyFilterBtn) {
    applyFilterBtn.addEventListener('click', applyFilters);
  }

  if (clearFilterBtn) {
    clearFilterBtn.addEventListener('click', clearFilters);
  }
});

/**
 * Load all products from API
 */
async function loadProducts() {
  const productsGrid = document.getElementById('products-grid');
  const loadingIndicator = document.getElementById('loading-indicator');

  try {
    const data = await apiRequest('/products');

    if (data.success) {
      allProducts = data.products;
      displayProducts(allProducts);
    }
  } catch (error) {
    if (loadingIndicator) {
      loadingIndicator.textContent = 'Error loading products. Please try again.';
      loadingIndicator.style.color = 'red';
    }
  }
}

/**
 * Display products in grid
 */
function displayProducts(products) {
  const productsGrid = document.getElementById('products-grid');

  if (!productsGrid) return;

  // Clear grid
  productsGrid.innerHTML = '';

  if (products.length === 0) {
    productsGrid.innerHTML = '<p class="no-products">No products found.</p>';
    return;
  }

  // Create product cards
  products.forEach(product => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

/**
 * Create product card element
 */
function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-product-id', product._id);
  card.setAttribute('data-testid', `product-card-${product._id}`);

  card.innerHTML = `
    <img src="${product.imageUrl}" alt="${product.title}" loading="lazy">
    <div class="product-card-body">
      <h3 class="product-card-title">${product.title}</h3>
      <p class="product-card-price">${formatPrice(product.price)}</p>
      <span class="product-card-condition">${product.condition}</span>
      <span class="product-card-category">${product.category}</span>
      <p class="product-seller">Seller: ${product.sellerName}</p>
      <div class="product-card-actions">
        <a href="/product/${product._id}" class="btn btn-primary btn-small" id="btn-view-${product._id}" data-testid="view-product-${product._id}">
          View Details
        </a>
      </div>
    </div>
  `;

  return card;
}

/**
 * Handle search
 */
async function handleSearch() {
  const searchBar = document.getElementById('search-bar');
  const searchTerm = searchBar.value.trim();

  if (!searchTerm) {
    loadProducts();
    return;
  }

  try {
    const data = await apiRequest(`/products?search=${encodeURIComponent(searchTerm)}`);

    if (data.success) {
      displayProducts(data.products);
    }
  } catch (error) {
    console.error('Search error:', error);
  }
}

/**
 * Apply filters
 */
async function applyFilters() {
  const category = document.getElementById('filter-category').value;
  const minPrice = document.getElementById('filter-min-price').value;
  const maxPrice = document.getElementById('filter-max-price').value;

  // Build query string
  let query = '/products?';
  
  if (category && category !== 'All') {
    query += `category=${encodeURIComponent(category)}&`;
  }
  
  if (minPrice) {
    query += `minPrice=${minPrice}&`;
  }
  
  if (maxPrice) {
    query += `maxPrice=${maxPrice}&`;
  }

  try {
    const data = await apiRequest(query);

    if (data.success) {
      displayProducts(data.products);
    }
  } catch (error) {
    console.error('Filter error:', error);
  }
}

/**
 * Clear all filters
 */
function clearFilters() {
  document.getElementById('filter-category').value = 'All';
  document.getElementById('filter-min-price').value = '';
  document.getElementById('filter-max-price').value = '';
  document.getElementById('search-bar').value = '';
  
  loadProducts();
}
