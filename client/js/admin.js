/**
 * admin.js - Admin panel functionality
 * Displays all products with admin controls
 */

document.addEventListener('DOMContentLoaded', () => {
  // Protect page and check admin role
  protectAdminPage();

  // Load all products for admin
  loadAllProductsAdmin();
});

/**
 * Protect admin page - require admin role
 */
function protectAdminPage() {
  if (!isLoggedIn()) {
    window.location.href = '/login';
    return;
  }

  const user = getUser();
  if (user.role !== 'admin') {
    alert('Access denied. Admin privileges required.');
    window.location.href = '/dashboard';
  }
}

/**
 * Load all products for admin panel
 */
async function loadAllProductsAdmin() {
  const loadingIndicator = document.getElementById('loading-indicator');
  const tableEl = document.getElementById('admin-products-table');

  try {
    const data = await apiRequest('/products');

    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    if (data.success) {
      // Update statistics
      updateStatistics(data.products);

      // Display products in table
      displayProductsTable(data.products);

      if (tableEl) {
        tableEl.style.display = 'table';
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
 * Update statistics cards
 */
function updateStatistics(products) {
  const totalProductsEl = document.getElementById('stat-total-products');
  const availableProductsEl = document.getElementById('stat-available-products');

  if (totalProductsEl) {
    totalProductsEl.textContent = products.length;
  }

  if (availableProductsEl) {
    const available = products.filter(p => p.status === 'available').length;
    availableProductsEl.textContent = available;
  }
}

/**
 * Display products in admin table
 */
function displayProductsTable(products) {
  const tbody = document.getElementById('admin-products-tbody');

  if (!tbody) return;

  tbody.innerHTML = '';

  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">No products found</td></tr>';
    return;
  }

  products.forEach(product => {
    const row = createProductRow(product);
    tbody.appendChild(row);
  });
}

/**
 * Create table row for product
 */
function createProductRow(product) {
  const row = document.createElement('tr');
  row.setAttribute('data-product-id', product._id);
  row.setAttribute('data-testid', `admin-product-row-${product._id}`);

  // Truncate ID for display
  const shortId = product._id.substring(0, 8) + '...';

  row.innerHTML = `
    <td title="${product._id}">${shortId}</td>
    <td>${product.title}</td>
    <td>${product.category}</td>
    <td>${formatPrice(product.price)}</td>
    <td>${product.sellerName}</td>
    <td><span class="product-card-condition">${product.status}</span></td>
    <td>
      <button class="btn btn-primary btn-small" id="btn-admin-view-${product._id}" onclick="window.location.href='/product/${product._id}'" data-testid="admin-view-${product._id}">
        View
      </button>
      <button class="btn btn-danger btn-small" id="btn-admin-delete-${product._id}" onclick="adminDeleteProduct('${product._id}')" data-testid="admin-delete-${product._id}">
        Delete
      </button>
    </td>
  `;

  return row;
}

/**
 * Admin delete product
 */
async function adminDeleteProduct(productId) {
  if (!confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
    return;
  }

  try {
    const data = await apiRequest(`/products/${productId}`, {
      method: 'DELETE'
    });

    if (data.success) {
      showMessage('admin-message', data.message, 'success');
      
      // Reload products
      loadAllProductsAdmin();
    }
  } catch (error) {
    showMessage('admin-message', error.message, 'error');
  }
}
