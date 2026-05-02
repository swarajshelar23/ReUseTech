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

  const purchaseBtn = document.getElementById('btn-request-purchase');
  if (purchaseBtn) {
    purchaseBtn.addEventListener('click', handleRequestPurchase);
  }
});

let currentProduct = null;

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
      currentProduct = data.product;
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

  const statusEl = document.getElementById('product-detail-status');
  if (statusEl) {
    statusEl.textContent = product.status;
    statusEl.className = `product-status status-${product.status}`;
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

  const currentUser = getUser();
  const isOwner = currentUser && product.seller && String(currentUser.id) === String(product.seller._id || product.seller);
  const contactBtn = document.getElementById('btn-contact-seller');
  const purchaseBtn = document.getElementById('btn-request-purchase');
  const composer = document.getElementById('initial-message');

  if (isOwner) {
    if (contactBtn) contactBtn.disabled = true;
    if (purchaseBtn) purchaseBtn.disabled = true;
    if (composer) composer.disabled = true;
  }
}

/**
 * Handle contact seller button click
 */
function handleContactSeller() {
  startConversation(false);
}

/**
 * Handle request purchase button click
 */
function handleRequestPurchase() {
  startConversation(true);
}

async function startConversation(createTransaction) {
  const user = getUser();
  if (!user) {
    window.location.href = '/login';
    return;
  }

  if (!currentProduct) {
    return;
  }

  const sellerId = currentProduct.seller && currentProduct.seller._id ? currentProduct.seller._id : currentProduct.seller;
  if (String(user.id) === String(sellerId)) {
    showMessage('error-message', 'You cannot message or purchase your own product.', 'error');
    return;
  }

  const messageInput = document.getElementById('initial-message');
  const note = messageInput && messageInput.value.trim()
    ? messageInput.value.trim()
    : createTransaction
      ? 'I would like to request this item.'
      : 'Hi, I am interested in this product.';

  const submitButtons = [document.getElementById('btn-contact-seller'), document.getElementById('btn-request-purchase')].filter(Boolean);
  submitButtons.forEach(button => {
    button.disabled = true;
  });

  try {
    if (createTransaction) {
      await apiRequest('/transactions', {
        method: 'POST',
        body: JSON.stringify({
          productId: currentProduct._id,
          note
        })
      });
    }

    await apiRequest('/messages', {
      method: 'POST',
      body: JSON.stringify({
        productId: currentProduct._id,
        text: note
      })
    });

    window.location.href = `/messages?productId=${encodeURIComponent(currentProduct._id)}&buyerId=${encodeURIComponent(user.id)}`;
  } catch (error) {
    showMessage('error-message', error.message, 'error');
  } finally {
    submitButtons.forEach(button => {
      button.disabled = false;
    });
  }
}
