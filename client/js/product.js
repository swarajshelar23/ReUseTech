/**
 * product.js - Add product functionality
 * Handles product creation form
 */

document.addEventListener('DOMContentLoaded', () => {
  // Protect page - require login
  protectPage();

  // Setup add product form
  const addProductForm = document.getElementById('add-product-form');
  if (addProductForm) {
    addProductForm.addEventListener('submit', handleAddProduct);
  }
});

/**
 * Handle add product form submission
 */
async function handleAddProduct(e) {
  e.preventDefault();

  const title = document.getElementById('product-title').value;
  const description = document.getElementById('product-description').value;
  const category = document.getElementById('product-category').value;
  const condition = document.getElementById('product-condition').value;
  const price = document.getElementById('product-price').value;
  const imageUrl = document.getElementById('product-image').value;

  const submitBtn = document.getElementById('btn-submit-product');

  // Validate inputs
  if (!title || !description || !category || !condition || !price) {
    showMessage('add-product-message', 'Please fill in all required fields', 'error');
    return;
  }

  if (parseFloat(price) < 0) {
    showMessage('add-product-message', 'Price cannot be negative', 'error');
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Adding Product...';

  try {
    const productData = {
      title,
      description,
      category,
      condition,
      price: parseFloat(price)
    };

    // Add image URL if provided
    if (imageUrl) {
      productData.imageUrl = imageUrl;
    }

    const data = await apiRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });

    if (data.success) {
      showMessage('add-product-message', data.message, 'success');

      // Reset form
      document.getElementById('add-product-form').reset();

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);
    }
  } catch (error) {
    showMessage('add-product-message', error.message, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Add Product';
  }
}
