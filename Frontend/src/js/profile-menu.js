document.addEventListener('DOMContentLoaded', () => {
  const profileMenu = document.querySelector('.profile-menu');
  const logoutLinks = document.querySelectorAll('#logout-link');

  if (profileMenu) {
    profileMenu.addEventListener('toggle', () => {
      if (!profileMenu.open) {
        return;
      }
      document.querySelectorAll('.profile-menu').forEach((menu) => {
        if (menu !== profileMenu) {
          menu.removeAttribute('open');
        }
      });
    });
  }

  document.addEventListener('click', (event) => {
    if (!profileMenu) return;
    if (profileMenu.contains(event.target)) return;
    profileMenu.removeAttribute('open');
  });

  logoutLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const auth = window.NexportAdmin;
      if (auth && typeof auth.logout === 'function') {
        auth.logout();
      }
      window.location.href = 'login.html';
    });
  });
});
