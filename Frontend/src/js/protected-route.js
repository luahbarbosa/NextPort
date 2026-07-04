document.addEventListener('DOMContentLoaded', () => {
  const auth = window.NexportAdmin;
  if (!auth || typeof auth.isAuthenticated !== 'function') return;
  if (!auth.isAuthenticated()) {
    window.location.replace('login.html');
  }
});
