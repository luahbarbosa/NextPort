document.addEventListener('DOMContentLoaded', () => {
  const profileMenu = document.querySelector('.profile-menu');
  const logoutLinks = document.querySelectorAll('#logout-link');

  const auth = window.NexportAdmin;
  if (auth && typeof auth.isAuthenticated === 'function' && !auth.isAuthenticated()) {
    window.location.replace('login.html');
    return;
  }

  if (auth && typeof auth.getStoredProfile === 'function') {
    const profile = auth.getStoredProfile();
    if (profile) {
      const avatarEl = document.querySelector('.profile-trigger .profile-avatar');
      const nameEl = document.querySelector('.profile-trigger .profile-text strong');
      const roleEl = document.querySelector('.profile-trigger .profile-text small');

      if (nameEl) nameEl.textContent = profile.nome || 'Administrador';
      if (roleEl) roleEl.textContent = profile.cargo || 'Administrador';
      if (avatarEl && profile.nome) {
        const initials = profile.nome
          .split(' ')
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word[0])
          .join('')
          .toUpperCase();
        avatarEl.textContent = initials || 'A';
      }
    }
  }

  if (profileMenu) {
    profileMenu.classList.remove('profile-loading');
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
