(function () {
  const STORAGE_KEYS = {
    authToken: 'nexport.adminAuthToken',
    adminProfile: 'nexport.adminProfile',
    lastPage: 'nexport.lastVisitedPage'
  };

  const DEFAULT_PROFILE = {
    nome: 'Administrador',
    email: 'admin@interfacil.com',
    cargo: 'Administrador',
    telefone: '',
    departamento: '',
    endereco: ''
  };

  const DEMO_ADMIN = {
    email: 'admin@interfacil.com',
    password: 'admin123',
    nome: 'Administrador',
    cargo: 'Administrador'
  };

  const PROFILE_API_URL = window.NexportApi?.auth('/auth/perfil') || 'http://localhost:3001/auth/perfil';
  const PASSWORD_API_URL = window.NexportApi?.auth('/auth/alterar-senha') || 'http://localhost:3001/auth/alterar-senha';

  function getStoredProfile() {
    const stored = localStorage.getItem(STORAGE_KEYS.adminProfile) || sessionStorage.getItem(STORAGE_KEYS.adminProfile);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        return { ...DEFAULT_PROFILE };
      }
    }
    return { ...DEFAULT_PROFILE };
  }

  function saveStoredProfile(profile) {
    const payload = JSON.stringify(profile);
    localStorage.setItem(STORAGE_KEYS.adminProfile, payload);
    sessionStorage.setItem(STORAGE_KEYS.adminProfile, payload);
  }

  function getAuthToken() {
    return localStorage.getItem(STORAGE_KEYS.authToken) || sessionStorage.getItem(STORAGE_KEYS.authToken) || '';
  }

  function setAuthToken(token) {
    localStorage.setItem(STORAGE_KEYS.authToken, token);
    sessionStorage.setItem(STORAGE_KEYS.authToken, token);
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.authToken);
    sessionStorage.removeItem(STORAGE_KEYS.authToken);
    localStorage.removeItem(STORAGE_KEYS.adminProfile);
    sessionStorage.removeItem(STORAGE_KEYS.adminProfile);
    localStorage.removeItem(STORAGE_KEYS.lastPage);
    sessionStorage.removeItem(STORAGE_KEYS.lastPage);

    const cookies = document.cookie.split(';');
    cookies.forEach((cookie) => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  }

  async function loadProfileFromApi() {
    if (!PROFILE_API_URL) {
      return getStoredProfile();
    }

    const response = await fetch(PROFILE_API_URL, {
      headers: {
        Authorization: `Bearer ${getAuthToken()}`
      }
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar o perfil no momento.');
    }

    return response.json();
  }

  async function saveProfileToApi(profile) {
    if (!PROFILE_API_URL) {
      saveStoredProfile(profile);
      return { ok: true, profile };
    }

    const response = await fetch(PROFILE_API_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(profile)
    });

    if (!response.ok) {
      throw new Error('Erro ao salvar as alterações do perfil.');
    }

    const updatedProfile = await response.json();
    saveStoredProfile(updatedProfile);
    return { ok: true, profile: updatedProfile };
  }

  async function changePasswordToApi(payload) {
    if (!PASSWORD_API_URL) {
      return { ok: true, message: 'Senha atualizada localmente. Configure a URL do backend para persistir.' };
    }

    const response = await fetch(PASSWORD_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getAuthToken()}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Não foi possível alterar a senha no momento.');
    }

    return { ok: true, message: 'Senha alterada com sucesso.' };
  }

  function isDemoAdminCredentials(email, password) {
    return String(email || '').trim().toLowerCase() === DEMO_ADMIN.email && String(password || '').trim() === DEMO_ADMIN.password;
  }

  function buildDemoAdminProfile(email) {
    const profile = getStoredProfile();
    profile.email = email;
    profile.nome = DEMO_ADMIN.nome;
    profile.cargo = DEMO_ADMIN.cargo;
    saveStoredProfile(profile);
    return profile;
  }

  async function login(email, password) {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();

    if (!normalizedEmail || !normalizedPassword) {
      return { ok: false, message: 'Informe e-mail e senha para continuar.' };
    }


    try {
      const response = await fetch(window.NexportApi?.auth('/auth/login') || 'http://localhost:3001/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: normalizedEmail, senha: normalizedPassword })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return { ok: false, message: errorData.erro || 'E-mail ou senha incorretos' };
      }

      const { token, nome } = await response.json();
      setAuthToken(token);

      const profile = getStoredProfile();
      profile.email = normalizedEmail;
      profile.nome = nome;
      saveStoredProfile(profile);

      return { ok: true, profile };
    } catch (error) {
      console.error('Erro de login:', error);
      return { ok: false, message: 'Erro ao conectar com o servidor' };
    }
  }

  function logout() {
    clearSession();
    if (window.socket && typeof window.socket.disconnect === 'function') {
      window.socket.disconnect();
    }
    return true;
  }

  function isAuthenticated() {
    return Boolean(getAuthToken());
  }

  window.NexportAdmin = {
    DEFAULT_PROFILE,
    getStoredProfile,
    saveStoredProfile,
    getAuthToken,
    loadProfileFromApi,
    saveProfileToApi,
    changePasswordToApi,
    login,
    logout,
    isAuthenticated,
    STORAGE_KEYS
  };
})();
