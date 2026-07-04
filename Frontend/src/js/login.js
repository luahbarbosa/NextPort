document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const message = document.getElementById('login-message');
  const admin = window.NexportAdmin;

  function setMessage(text, type = 'success') {
    if (!message) return;
    message.textContent = text;
    message.className = `form-message ${type === 'error' ? 'form-error' : 'form-success'}`;
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
      const result = await admin.login(email, password);

      if (!result.ok) {
        setMessage(result.message, 'error');
        return;
      }

      localStorage.setItem('nexport.lastVisitedPage', 'index.html');
      window.location.href = 'index.html';
    });
  }
});
