document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('password-form');
  const message = document.getElementById('password-message');
  const currentPasswordInput = document.getElementById('current-password');
  const newPasswordInput = document.getElementById('new-password');
  const confirmPasswordInput = document.getElementById('confirm-password');

  const admin = window.NexportAdmin;

  function setMessage(text, type = 'success') {
    if (!message) return;
    message.textContent = text;
    message.className = `form-message ${type === 'error' ? 'form-error' : 'form-success'}`;
  }

  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const currentPassword = currentPasswordInput.value;
      const newPassword = newPasswordInput.value;
      const confirmPassword = confirmPasswordInput.value;

      if (!currentPassword || !newPassword || !confirmPassword) {
        setMessage('Preencha todos os campos para alterar a senha.', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        setMessage('A confirmação da nova senha não confere.', 'error');
        return;
      }

      try {
        setMessage('Enviando alteração de senha...', 'success');
        const result = await admin.changePasswordToApi({
          currentPassword,
          newPassword
        });
        form.reset();
        setMessage(result.message || 'Senha alterada com sucesso.', 'success');
      } catch (error) {
        setMessage(error.message, 'error');
      }
    });
  }
});
