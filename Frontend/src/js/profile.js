document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('profile-form');
  const message = document.getElementById('profile-message');
  const name = document.getElementById('profile-name');
  const role = document.getElementById('profile-role');
  const email = document.getElementById('profile-email');
  const fullNameInput = document.getElementById('profile-full-name');
  const emailInput = document.getElementById('profile-email-input');
  const phoneInput = document.getElementById('profile-phone');
  const departmentInput = document.getElementById('profile-department');
  const addressInput = document.getElementById('profile-address');
  const avatar = document.querySelector('.profile-avatar-large');

  const admin = window.NexportAdmin;

  function setMessage(text, type = 'success') {
    if (!message) return;
    message.textContent = text;
    message.className = `form-message ${type === 'error' ? 'form-error' : 'form-success'}`;
  }

  function populateForm(profile) {
    if (!profile) return;
    if (fullNameInput) fullNameInput.value = profile.nome || '';
    if (emailInput) emailInput.value = profile.email || '';
    if (phoneInput) phoneInput.value = profile.telefone || '';
    if (departmentInput) departmentInput.value = profile.departamento || '';
    if (addressInput) addressInput.value = profile.endereco || '';
    if (name) name.textContent = profile.nome || 'Administrador';
    if (role) role.textContent = profile.cargo || 'Administrador';
    if (email) email.textContent = profile.email || '';
    if (avatar) avatar.textContent = (profile.nome || 'A').split(' ').slice(0, 2).map((item) => item[0]).join('').toUpperCase();

    // Also update the header user card dynamically
    const headerAvatar = document.querySelector('.profile-trigger .profile-avatar');
    const headerName = document.querySelector('.profile-trigger .profile-text strong');
    const headerRole = document.querySelector('.profile-trigger .profile-text small');
    if (headerName) headerName.textContent = profile.nome || 'Administrador';
    if (headerRole) headerRole.textContent = profile.cargo || 'Administrador';
    if (headerAvatar && profile.nome) {
      const initials = profile.nome
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();
      headerAvatar.textContent = initials || 'A';
    }
  }

  async function loadProfile() {
    try {
      const profile = await admin.loadProfileFromApi();
      admin.saveStoredProfile(profile);
      populateForm(profile);
    } catch (error) {
      setMessage(error.message, 'error');
      populateForm(admin.getStoredProfile());
    }
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const profile = {
        nome: fullNameInput.value.trim(),
        email: emailInput.value.trim(),
        telefone: phoneInput.value.trim(),
        departamento: departmentInput.value.trim(),
        endereco: addressInput.value.trim(),
        cargo: 'Administrador'
      };

      if (!profile.nome || !profile.email) {
        setMessage('Preencha nome e e-mail para continuar.', 'error');
        return;
      }

      try {
        setMessage('Salvando alterações...', 'success');
        const result = await admin.saveProfileToApi(profile);
        populateForm(result.profile);
        setMessage('Dados pessoais atualizados com sucesso.', 'success');
      } catch (error) {
        setMessage(error.message, 'error');
      }
    });
  }

  loadProfile();
});
