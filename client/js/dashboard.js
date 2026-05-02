/**
 * dashboard.js - User dashboard functionality
 * Displays user's products with edit and delete options
 */

let userProducts = [];
let editingProductId = null;
let userTransactions = [];

document.addEventListener('DOMContentLoaded', () => {
  // Protect page - require login
  protectPage();

  // Load user's products
  loadUserProducts();

  // Load user's transactions
  loadUserTransactions();

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
 * Load user's transactions
 */
async function loadUserTransactions() {
  const transactionsGrid = document.getElementById('user-transactions-grid');
  const loadingIndicator = document.getElementById('transactions-loading-indicator');

  try {
    const data = await apiRequest('/transactions/me');

    if (loadingIndicator) {
      loadingIndicator.style.display = 'none';
    }

    if (data.success) {
      userTransactions = data.transactions;
      displayTransactions(userTransactions);
    }
  } catch (error) {
    console.error('Error loading transactions:', error);
    if (loadingIndicator) {
      loadingIndicator.textContent = 'Error loading transactions.';
      loadingIndicator.style.color = 'red';
    }
  }
}

function displayTransactions(transactions) {
  const transactionsGrid = document.getElementById('user-transactions-grid');

  if (!transactionsGrid) return;

  transactionsGrid.innerHTML = '';

  if (transactions.length === 0) {
    transactionsGrid.innerHTML = '<p class="no-products">No transactions yet.</p>';
    return;
  }

  transactions.forEach(transaction => {
    transactionsGrid.appendChild(createTransactionCard(transaction));
  });
}

function createTransactionCard(transaction) {
  const card = document.createElement('div');
  card.className = 'transaction-card';
  card.setAttribute('data-transaction-id', transaction._id);

  const currentUser = getUser();
  const isSeller = currentUser && transaction.seller && String(currentUser.id) === String(transaction.seller._id);
  const statusClass = `status-${transaction.status}`;

  card.innerHTML = `
    <div class="transaction-card-header">
      <div>
        <h3>${transaction.product.title}</h3>
        <p>${formatPrice(transaction.amount)} · ${isSeller ? 'Seller view' : 'Buyer view'}</p>
      </div>
      <span class="status-pill ${statusClass}">${transaction.status}</span>
    </div>
    <div class="transaction-card-body">
      <p><strong>Buyer:</strong> ${transaction.buyer.name}</p>
      <p><strong>Seller:</strong> ${transaction.seller.name}</p>
      ${transaction.note ? `<p><strong>Note:</strong> ${transaction.note}</p>` : ''}
    </div>
    <div class="transaction-card-actions">
      <a href="/product/${transaction.product._id}" class="btn btn-outline btn-small">View Product</a>
      ${renderTransactionButtons(transaction, isSeller)}
    </div>
  `;

  return card;
}

function renderTransactionButtons(transaction, isSeller) {
  if (isSeller) {
    return `
      <button class="btn btn-secondary btn-small" onclick="updateTransaction('${transaction._id}', 'reserved')">Reserve</button>
      <button class="btn btn-primary btn-small" onclick="updateTransaction('${transaction._id}', 'sold')">Mark Sold</button>
      <button class="btn btn-danger btn-small" onclick="updateTransaction('${transaction._id}', 'cancelled')">Cancel</button>
    `;
  }

  if (transaction.status === 'pending' || transaction.status === 'reserved') {
    return `<button class="btn btn-danger btn-small" onclick="updateTransaction('${transaction._id}', 'cancelled')">Cancel Request</button>`;
  }

  return '';
}

async function updateTransaction(transactionId, status) {
  try {
    const data = await apiRequest(`/transactions/${transactionId}`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });

    if (data.success) {
      showMessage('transactions-message', data.message, 'success');
      loadUserTransactions();
      loadUserProducts();
    }
  } catch (error) {
    showMessage('transactions-message', error.message, 'error');
  }
}

window.updateTransaction = updateTransaction;

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
