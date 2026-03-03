/**
 * dashboard.js - User dashboard functionality
 * Displays user's products with edit and delete options
 */

let userProducts = [];
let editingProductId = null;

document.addEventListener('DOMContentLoaded', () => {
  // Protect page - require login
  protectPage();

  // Load user's products
  loadUserProducts();

  // Setup modal
  setupModal();

  // Setup edit form
  const editForm = document.getElementById('edit-form');
  if (editForm) {
    editForm.addEventListener('submit', handleUpdateProduct);
  }
});

/**
 * Load user's products
 */
async function loadUserProducts() {
  const user = getUser();
  const productsGrid = document.getElementById('user-products-grid');
  const loadingIndicator = document.getElementById('loading-indicator');
  const noProductsMessage = document.getElementById('no-products-message');

  if (!user) {
    window.location.href = '/login';
    return;
  }

  try {
    const data = await apiRequest(`/products/user/${user.id}`);

    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    if (data.success) {
      userProducts = data.products;

      if (userProducts.length === 0) {
        if (noProductsMessage) {
          noProductsMessage.style.display = 'block';
        }
      } else {
        displayUserProducts(userProducts);
      }
    }
  } catch (error) {
    console.error('Error loading products:', error);
    if (loadingIndicator) {
      loadingIndicator.textContent = 'Error loading products.';
      loadingIndicator.style.color = 'red';
    }
  }
}

/**
 * Display user products
 */
function displayUserProducts(products) {
  const productsGrid = document.getElementById('user-products-grid');

  if (!productsGrid) return;

  productsGrid.innerHTML = '';

  products.forEach(product => {
    const productCard = createDashboardProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

/**
 * Create product card for dashboard
 */
function createDashboardProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.setAttribute('data-product-id', product._id);
  card.setAttribute('data-testid', `user-product-${product._id}`);

  card.innerHTML = `
    <img src="${product.imageUrl}" alt="${product.title}">
    <div class="product-card-body">
      <h3 class="product-card-title">${product.title}</h3>
      <p class="product-card-price">${formatPrice(product.price)}</p>
      <span class="product-card-condition">${product.condition}</span>
      <span class="product-card-category">${product.category}</span>
      <div class="product-card-actions">
        <button class="btn btn-primary btn-small" id="btn-edit-${product._id}" onclick="openEditModal('${product._id}')" data-testid="edit-product-${product._id}">
          Edit
        </button>
        <button class="btn btn-danger btn-small" id="btn-delete-${product._id}" onclick="deleteProduct('${product._id}')" data-testid="delete-product-${product._id}">
          Delete
        </button>
      </div>
    </div>
  `;

  return card;
}

/**
 * Setup modal functionality
 */
function setupModal() {
  const modal = document.getElementById('edit-modal');
  const closeBtn = document.getElementById('modal-close');

  if (closeBtn) {
    closeBtn.onclick = function() {
      modal.style.display = 'none';
    };
  }

  // Close modal when clicking outside
  window.onclick = function(event) {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };
}

/**
 * Open edit modal with product data
 */
function openEditModal(productId) {
  const product = userProducts.find(p => p._id === productId);
  
  if (!product) return;

  editingProductId = productId;

  // Fill form with product data
  document.getElementById('edit-product-id').value = product._id;
  document.getElementById('edit-title').value = product.title;
  document.getElementById('edit-description').value = product.description;
  document.getElementById('edit-category').value = product.category;
  document.getElementById('edit-condition').value = product.condition;
  document.getElementById('edit-price').value = product.price;
  document.getElementById('edit-image').value = product.imageUrl;

  // Show modal
  document.getElementById('edit-modal').style.display = 'block';
}

/**
 * Handle update product
 */
async function handleUpdateProduct(e) {
  e.preventDefault();

  const productId = editingProductId;
  const title = document.getElementById('edit-title').value;
  const description = document.getElementById('edit-description').value;
  const category = document.getElementById('edit-category').value;
  const condition = document.getElementById('edit-condition').value;
  const price = document.getElementById('edit-price').value;
  const imageUrl = document.getElementById('edit-image').value;

  const submitBtn = document.getElementById('btn-update-product');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Updating...';

  try {
    const data = await apiRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({
        title,
        description,
        category,
        condition,
        price: parseFloat(price),
        imageUrl
      })
    });

    if (data.success) {
      showMessage('dashboard-message', data.message, 'success');
      
      // Close modal
      document.getElementById('edit-modal').style.display = 'none';
      
      // Reload products
      loadUserProducts();
    }
  } catch (error) {
    showMessage('edit-message', error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Update Product';
  }
}

/**
 * Delete product
 */
async function deleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product?')) {
    return;
  }

  try {
    const data = await apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    });

    if (data.success) {
      showMessage('dashboard-message', data.message, 'success');
      
      // Reload products
      loadUserProducts();
    }
  } catch (error) {
    showMessage('dashboard-message', error.message, 'error');
  }
}
