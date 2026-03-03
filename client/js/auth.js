/**
 * auth.js - Authentication functionality
 * Handles login and registration
 */

document.addEventListener('DOMContentLoaded', () => {
  // Handle Login Form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Handle Register Form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }

  // Redirect if already logged in
  if (isLoggedIn()) {
    window.location.href = '/dashboard';
  }
});

/**
 * Handle user login
 */
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const submitBtn = document.getElementById('btn-login');

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Logging in...';

  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (data.success) {
      // Save token and user data
      saveAuthData(data.token, data.user);

      // Show success message
      showMessage('login-message', data.message, 'success');

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  } catch (error) {
    showMessage('login-message', error.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Login';
  }
}

/**
 * Handle user registration
 */
async function handleRegister(e) {
  e.preventDefault();

  const name = document.getElementById('register-name').value;
  const email = document.getElementById('register-email').value;
  const password = document.getElementById('register-password').value;
  const role = document.getElementById('register-role').value;
  const submitBtn = document.getElementById('btn-register');

  // Validate password length
  if (password.length < 6) {
    showMessage('register-message', 'Password must be at least 6 characters', 'error');
    return;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.textContent = 'Registering...';

  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role })
    });

    if (data.success) {
      // Save token and user data
      saveAuthData(data.token, data.user);

      // Show success message
      showMessage('register-message', data.message, 'success');

      // Redirect to dashboard after 1 second
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  } catch (error) {
    showMessage('register-message', error.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = 'Register';
  }
}
