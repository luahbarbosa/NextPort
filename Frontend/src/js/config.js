(function () {
  const defaults = {
    authApiUrl: 'http://localhost:3001',
    registroApiUrl: 'http://localhost:3002',
    chamadaApiUrl: 'http://localhost:3003',
    signalingApiUrl: 'http://localhost:3004'
  };

  const envConfig = {
    authApiUrl: import.meta.env?.VITE_AUTH_API_URL || '',
    registroApiUrl: import.meta.env?.VITE_REGISTRO_API_URL || '',
    chamadaApiUrl: import.meta.env?.VITE_CHAMADA_API_URL || '',
    signalingApiUrl: import.meta.env?.VITE_SIGNALING_API_URL || ''
  };

  const config = {
    authApiUrl: envConfig.authApiUrl || defaults.authApiUrl,
    registroApiUrl: envConfig.registroApiUrl || defaults.registroApiUrl,
    chamadaApiUrl: envConfig.chamadaApiUrl || defaults.chamadaApiUrl,
    signalingApiUrl: envConfig.signalingApiUrl || defaults.signalingApiUrl
  };

  function normalizePath(path = '') {
    if (!path) return '';
    return path.startsWith('/') ? path : `/${path}`;
  }

  function buildUrl(serviceKey, path = '') {
    const baseUrl = config[serviceKey] || '';
    if (!baseUrl) return '';
    return `${baseUrl}${normalizePath(path)}`;
  }

  window.NexportConfig = config;
  window.NexportApi = {
    buildUrl,
    auth: (path = '') => buildUrl('authApiUrl', path),
    registro: (path = '') => buildUrl('registroApiUrl', path),
    chamada: (path = '') => buildUrl('chamadaApiUrl', path),
    signaling: (path = '') => buildUrl('signalingApiUrl', path)
  };
})();
