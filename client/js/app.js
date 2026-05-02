/**
 * app.js - Common utilities and functions
 * Shared across all pages
 */

// API Base URL
const API_URL = '/api';

/**
 * Get token from localStorage
 */
function getToken() {
  return localStorage.getItem('token');
}

/**
 * Get user data from localStorage
 */
function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/**
 * Save auth data to localStorage
 */
function saveAuthData(token, user) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Clear auth data from localStorage
 */
function clearAuthData() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!getToken();
}

/**
 * Display message to user
 * @param {string} elementId - ID of the message element
 * @param {string} message - Message text
 * @param {string} type - Message type (success, error, info)
 */
function showMessage(elementId, message, type = 'info') {
  const messageEl = document.getElementById(elementId);
  if (messageEl) {
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }
}

/**
 * Make API request with authentication
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 */
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  // Add authorization header if token exists
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    console.error('API Request Error:', error);
    throw error;
  }
}

/**
 * Format price to currency
 */
function formatPrice(price) {
  return `$${parseFloat(price).toFixed(2)}`;
}

/**
 * Format date to readable string
 */
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Update navigation based on login status
 */
function updateNavigation() {
  const authLinks = document.getElementById('nav-auth-links');
  const userLinks = document.getElementById('nav-user-links');
  const usernameEl = document.getElementById('nav-username');

  if (isLoggedIn()) {
    const user = getUser();
    
    if (authLinks) authLinks.style.display = 'none';
    if (userLinks) userLinks.style.display = 'flex';
    if (usernameEl) usernameEl.textContent = user.name;
  } else {
    if (authLinks) authLinks.style.display = 'flex';
    if (userLinks) userLinks.style.display = 'none';
  }
}

/**
 * Update notification badges in shared navigation
 */
async function updateNotificationBadges() {
  if (!isLoggedIn()) {
    return;
  }

  try {
    const data = await apiRequest('/notifications/summary');

    const messageBadge = document.getElementById('nav-message-badge');
    const dashboardBadge = document.getElementById('nav-transaction-badge');
    const dashboardSectionBadge = document.getElementById('dashboard-transaction-badge');

    if (messageBadge) {
      messageBadge.textContent = data.unreadMessages;
      messageBadge.style.display = data.unreadMessages > 0 ? 'inline-flex' : 'none';
    }

    if (dashboardBadge) {
      dashboardBadge.textContent = data.openTransactions;
      dashboardBadge.style.display = data.openTransactions > 0 ? 'inline-flex' : 'none';
    }

    if (dashboardSectionBadge) {
      dashboardSectionBadge.textContent = data.openTransactions;
      dashboardSectionBadge.style.display = data.openTransactions > 0 ? 'inline-flex' : 'none';
    }
  } catch (error) {
    console.error('Notification badge update failed:', error);
  }
}

/**
 * Handle logout
 */
function handleLogout() {
  clearAuthData();
  window.location.href = '/login';
}

/**
 * Protect page - redirect to login if not authenticated
 */
function protectPage() {
  if (!isLoggedIn()) {
    window.location.href = '/login';
  }
}

/**
 * Initialize common functionality on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Update navigation
  updateNavigation();
  updateNotificationBadges();

  // Setup logout button
  const logoutBtn = document.getElementById('nav-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      handleLogout();
    });
  }
});
