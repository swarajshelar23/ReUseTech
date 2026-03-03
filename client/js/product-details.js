/**
 * product-details.js - Product details page functionality
 * Displays single product information
 */

document.addEventListener('DOMContentLoaded', () => {
  // Get product ID from URL
  const pathParts = window.location.pathname.split('/');
  const productId = pathParts[pathParts.length - 1];

  if (productId) {
    loadProductDetails(productId);
  }

  // Setup contact seller button
  const contactBtn = document.getElementById('btn-contact-seller');
  if (contactBtn) {
    contactBtn.addEventListener('click', handleContactSeller);
  }
});

/**
 * Load product details from API
 */
async function loadProductDetails(productId) {
  const loadingIndicator = document.getElementById('loading-indicator');
  const contentDiv = document.getElementById('product-details-content');
  const errorDiv = document.getElementById('error-message');

  try {
    const data = await apiRequest(`/products/${productId}`);

    if (data.success) {
      displayProductDetails(data.product);
      
      if (loadingIndicator) loadingIndicator.style.display = 'none';
      if (contentDiv) contentDiv.style.display = 'grid';
    }
  } catch (error) {
    console.error('Error loading product:', error);
    
    if (loadingIndicator) loadingIndicator.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'block';
  }
}

/**
 * Display product details
 */
function displayProductDetails(product) {
  // Update product image
  const imageEl = document.getElementById('product-detail-image');
  if (imageEl) {
    imageEl.src = product.imageUrl;
    imageEl.alt = product.title;
  }

  // Update product title
  const titleEl = document.getElementById('product-detail-title');
  if (titleEl) {
    titleEl.textContent = product.title;
    document.title = `${product.title} - ReUseTech`;
  }

  // Update price
  const priceEl = document.getElementById('product-detail-price');
  if (priceEl) {
    priceEl.textContent = formatPrice(product.price);
  }

  // Update condition
  const conditionEl = document.getElementById('product-detail-condition');
  if (conditionEl) {
    conditionEl.textContent = product.condition;
  }

  // Update category
  const categoryEl = document.getElementById('product-detail-category');
  if (categoryEl) {
    categoryEl.textContent = product.category;
  }

  // Update description
  const descriptionEl = document.getElementById('product-detail-description');
  if (descriptionEl) {
    descriptionEl.textContent = product.description;
  }

  // Update seller name
  const sellerEl = document.getElementById('product-detail-seller');
  if (sellerEl) {
    sellerEl.textContent = product.sellerName;
  }

  // Update date
  const dateEl = document.getElementById('product-detail-date');
  if (dateEl) {
    dateEl.textContent = formatDate(product.createdAt);
  }
}

/**
 * Handle contact seller button click
 */
function handleContactSeller() {
  const sellerName = document.getElementById('product-detail-seller').textContent;
  const productTitle = document.getElementById('product-detail-title').textContent;

  alert(`Contact feature coming soon!\n\nYou would contact ${sellerName} about "${productTitle}"`);
}
