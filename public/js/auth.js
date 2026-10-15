/**
 * RoomRento • Authentication Controller (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  setupAuthForm();
});

function setupAuthForm() {
  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('login-email');
  const passwordInput = document.getElementById('login-password');

  // 1-Click Demo Logins
  document.querySelectorAll('[data-demo-role]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const role = btn.dataset.demoRole;
      let email = 'tenant@roomrento.in';
      if (role === 'owner') email = 'priya.sharma@host.in';
      if (role === 'admin') email = 'admin@roomrento.in';

      if (emailInput) emailInput.value = email;
      if (passwordInput) passwordInput.value = 'Password123!';

      showToast(`Logging in as ${role}...`, 'login');
      const res = await RoomRentoAPI.login(email, 'Password123!');
      if (res && res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'check_circle');
        setTimeout(() => {
          if (role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 600);
      }
    });
  });

  // Standard Login Form
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = emailInput ? emailInput.value.trim() : '';
      const pass = passwordInput ? passwordInput.value : '';

      if (!email || !pass) {
        showToast('Please enter both email and password', 'warning');
        return;
      }

      showToast('Authenticating...', 'sync');
      const res = await RoomRentoAPI.login(email, pass);
      if (res && res.success) {
        showToast(`Welcome back, ${res.user.name}!`, 'check_circle');
        setTimeout(() => {
          if (res.user.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 600);
      }
    });
  }
}
