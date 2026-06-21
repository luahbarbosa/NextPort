/**
 * NexPort Dashboard - JavaScript Principal
 * Estrutura pronta para integração com API REST
 * 
 * @author Frontend Team
 * @version 1.0.0
 */

// ===== MOCK DATA & ESTADO LOCAL =====
const mockData = {
    user: {
        name: "Laura Meneses",
        role: "Administrador",
        avatar: "LM"
    },
    metrics: {
        totalDevices: 128,
        devicesOnline: 96,
        devicesOffline: 24,
        devicesUnstable: 8,
        onlinePercentage: 75,
        offlinePercentage: 19,
        unstablePercentage: 6
    },
    networkMonitor: {
        latency: 32, // ms
        bandwidth: 68, // %
        uptime: 99.9, // %
        connectionErrors: 12
    },
    notifications: 3,
    timeFilter: "24h",
    statusFilter: "all"
};

/**
 * Classe para gerenciar o estado do Dashboard
 * Centraliza todos os dados e oferece métodos para atualização
 */
class DashboardState {
    constructor(initialData) {
        this.data = initialData;
        this.observers = [];
    }

    /**
     * Atualiza o estado e notifica observadores
     * @param {Object} newData - Dados a serem mesclados com o estado atual
     */
    updateState(newData) {
        this.data = { ...this.data, ...newData };
        this.notifyObservers();
    }

    /**
     * Adiciona um observador que será notificado em mudanças
     * @param {Function} callback - Função chamada quando o estado muda
     */
    subscribe(callback) {
        this.observers.push(callback);
    }

    /**
     * Notifica todos os observadores sobre mudança de estado
     */
    notifyObservers() {
        this.observers.forEach(callback => callback(this.data));
    }

    /**
     * Retorna o estado atual
     */
    getState() {
        return this.data;
    }
}

// Instância global do estado
let dashboardState = new DashboardState(mockData);

// ===== FUNÇÕES DE RENDERIZAÇÃO =====

/**
 * Renderiza as métricas principais na tela
 * @param {Object} metrics - Objeto com dados de métricas
 */
function renderMetrics(metrics) {
    try {
        // Atualizar cards de métricas
        const elements = {
            'total-devices': metrics.totalDevices,
            'devices-online': metrics.devicesOnline,
            'devices-offline': metrics.devicesOffline,
            'devices-unstable': metrics.devicesUnstable
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerText = value;
                // Animação de atualização
                element.classList.add('updating');
                setTimeout(() => element.classList.remove('updating'), 300);
            }
        });

        console.log('✓ Métricas principais renderizadas:', metrics);
    } catch (error) {
        console.error('Erro ao renderizar métricas:', error);
    }
}

/**
 * Renderiza as métricas de rede (Monitor da Rede)
 * @param {Object} networkMonitor - Dados de monitoramento de rede
 */
function renderNetworkMonitor(networkMonitor) {
    try {
        const elements = {
            'latency-value': `${networkMonitor.latency} ms`,
            'bandwidth-value': `${networkMonitor.bandwidth}%`,
            'uptime-value': `${networkMonitor.uptime}%`,
            'connection-errors': networkMonitor.connectionErrors
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.innerText = value;
            }
        });

        console.log('✓ Monitor de rede renderizado:', networkMonitor);
    } catch (error) {
        console.error('Erro ao renderizar monitor de rede:', error);
    }
}

/**
 * Renderiza todo o dashboard com os dados fornecidos
 * @param {Object} data - Dados completos do dashboard
 */
function renderDashboard(data) {
    renderMetrics(data.metrics);
    renderNetworkMonitor(data.networkMonitor);
    updateNotificationBadge(data.notifications);
    console.log('✓ Dashboard renderizado completamente');
}

/**
 * Atualiza o badge de notificações
 * @param {number} count - Número de notificações
 */
function updateNotificationBadge(count) {
    const badge = document.querySelector('.notification-badge');
    if (badge) {
        badge.innerText = count;
        if (count === 0) {
            badge.style.display = 'none';
        } else {
            badge.style.display = 'flex';
        }
    }
}

// ===== FUNÇÕES DE FETCH & API =====

/**
 * Simula uma requisição de API para obter dados do dashboard
 * PRONTO PARA INTEGRAÇÃO: Descomente e configure o endpoint real
 * 
 * @returns {Promise<Object>} Dados do dashboard
 */
async function fetchDashboardData() {
    try {
        console.log('⏳ Buscando dados do dashboard...');
        
        // Simular latência de rede
        await new Promise(resolve => setTimeout(resolve, 800));

        // ===== INTEGRAÇÃO COM API REST =====
        // Descomente e configure o endpoint real quando integrar com backend:
        /*
        const response = await fetch('https://api.nexport.com/v1/dashboard', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            timeout: 10000
        });

        if (!response.ok) {
            throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;
        */

        // Retornar dados mock temporariamente
        console.log('✓ Dados do dashboard carregados (mock)');
        return mockData;

    } catch (error) {
        console.error('❌ Erro ao buscar dados do dashboard:', error);
        // Retornar dados mock em caso de erro
        return mockData;
    }
}

/**
 * Fetch para buscar métricas de rede em tempo real
 */
async function fetchNetworkMetrics() {
    try {
        console.log('⏳ Buscando métricas de rede...');
        
        await new Promise(resolve => setTimeout(resolve, 600));

        // ===== INTEGRAÇÃO COM API REST =====
        /*
        const response = await fetch('https://api.nexport.com/v1/network-metrics', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const data = await response.json();
        return data;
        */

        console.log('✓ Métricas de rede carregadas (mock)');
        return mockData.networkMonitor;

    } catch (error) {
        console.error('❌ Erro ao buscar métricas de rede:', error);
        return mockData.networkMonitor;
    }
}

/**
 * Simula registro de novo dispositivo (POST)
 */
async function registerNewDevice(deviceData) {
    try {
        console.log('⏳ Registrando novo dispositivo...');

        // ===== INTEGRAÇÃO COM API REST =====
        /*
        const response = await fetch('https://api.nexport.com/v1/devices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(deviceData)
        });

        if (!response.ok) {
            throw new Error(`Erro ao registrar dispositivo: ${response.statusText}`);
        }

        const newDevice = await response.json();
        console.log('✓ Dispositivo registrado:', newDevice);
        return newDevice;
        */

        // Simular sucesso com dados mock
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✓ Dispositivo registrado (mock):', deviceData);
        
        // Atualizar estado local incrementando total de dispositivos
        const currentState = dashboardState.getState();
        const updatedMetrics = {
            ...currentState.metrics,
            totalDevices: currentState.metrics.totalDevices + 1
        };
        dashboardState.updateState({ metrics: updatedMetrics });

        return { id: Math.random(), ...deviceData, createdAt: new Date() };

    } catch (error) {
        console.error('❌ Erro ao registrar dispositivo:', error);
        throw error;
    }
}

/**
 * Busca dispositivos com filtros
 */
async function fetchDevices(filters = {}) {
    try {
        console.log('⏳ Buscando dispositivos com filtros:', filters);

        // ===== INTEGRAÇÃO COM API REST =====
        /*
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`https://api.nexport.com/v1/devices?${queryParams}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        const devices = await response.json();
        return devices;
        */

        await new Promise(resolve => setTimeout(resolve, 600));
        console.log('✓ Dispositivos carregados (mock)');
        
        // Simular dispositivos mock
        return [
            { id: 1, name: 'Sensor Sala', type: 'sensor', location: 'Sala Principal', status: 'online' },
            { id: 2, name: 'Luz Quarto', type: 'switch', location: 'Quarto', status: 'online' },
            { id: 3, name: 'Câmera Entrada', type: 'camera', location: 'Entrada', status: 'offline' }
        ];

    } catch (error) {
        console.error('❌ Erro ao buscar dispositivos:', error);
        return [];
    }
}

// ===== EVENT LISTENERS & INICIALIZAÇÃO =====

/**
 * Inicializa o dashboard e seus event listeners
 */
function initializeDashboard() {
    console.log('🚀 Inicializando Dashboard NexPort...');

    // Carregar dados inicialmente
    loadDashboardData();

    // Inscrever renderização automática em mudanças de estado
    dashboardState.subscribe((data) => {
        renderDashboard(data);
    });

    // Event Listeners para a UI
    setupEventListeners();

    // Atualizar dados periodicamente (a cada 30 segundos)
    setInterval(loadDashboardData, 30000);

    console.log('✓ Dashboard inicializado com sucesso');
}

/**
 * Carrega os dados do dashboard
 */
async function loadDashboardData() {
    try {
        const data = await fetchDashboardData();
        dashboardState.updateState(data);
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
    }
}

/**
 * Configura os event listeners da página
 */
function setupEventListeners() {
    // Botão de cadastro de dispositivo
    const btnRegister = document.getElementById('btn-register-device');
    if (btnRegister) {
        btnRegister.addEventListener('click', openRegisterModal);
    }

    // Modal de cadastro
    const modal = document.getElementById('register-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const cancelModalBtn = document.getElementById('cancel-modal');
    const submitModalBtn = document.getElementById('submit-modal');

    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeRegisterModal);
    }

    if (cancelModalBtn) {
        cancelModalBtn.addEventListener('click', closeRegisterModal);
    }

    if (submitModalBtn) {
        submitModalBtn.addEventListener('click', submitRegisterForm);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            // Fechar ao clicar fora do modal
            if (e.target === modal) {
                closeRegisterModal();
            }
        });
    }

    // Event listener para filtro de status
    const statusFilter = document.getElementById('status-filter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            handleStatusFilter(e.target.value);
        });
    }

    // Event listener para busca
    const searchInput = document.getElementById('search-device');
    if (searchInput) {
        searchInput.addEventListener('input', debounce((e) => {
            handleSearch(e.target.value);
        }, 300));
    }

    // Event listener para filtro de tempo
    const timeFilter = document.getElementById('time-filter');
    if (timeFilter) {
        timeFilter.addEventListener('change', (e) => {
            handleTimeFilter(e.target.value);
        });
    }

    // Event listener para menu mobile (toggle sidebar)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const sidebar = document.querySelector('.sidebar');
            if (sidebar && sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
            }
        }
    });

    console.log('✓ Event listeners configurados');
}

// ===== HANDLERS DE EVENTOS =====

/**
 * Abre modal de cadastro de dispositivo
 */
function openRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.remove('modal-hidden');
        document.body.style.overflow = 'hidden';
    }
}

/**
 * Fecha modal de cadastro
 */
function closeRegisterModal() {
    const modal = document.getElementById('register-modal');
    if (modal) {
        modal.classList.add('modal-hidden');
        document.body.style.overflow = 'auto';
        resetForm();
    }
}

/**
 * Reseta o formulário de cadastro
 */
function resetForm() {
    const form = document.getElementById('form-register-device');
    if (form) {
        form.reset();
    }
}

/**
 * Submete o formulário de cadastro de dispositivo
 */
async function submitRegisterForm() {
    try {
        const form = document.getElementById('form-register-device');
        if (!form) return;

        const formData = new FormData(form);
        const deviceData = {
            name: formData.get('device-name') || document.getElementById('device-name').value,
            type: formData.get('device-type') || document.getElementById('device-type').value,
            location: formData.get('device-location') || document.getElementById('device-location').value
        };

        // Validação básica
        if (!deviceData.name || !deviceData.type || !deviceData.location) {
            alert('Por favor, preencha todos os campos');
            return;
        }

        // Chamar API de registro
        const newDevice = await registerNewDevice(deviceData);

        // Sucesso
        alert(`Dispositivo "${deviceData.name}" cadastrado com sucesso!`);
        closeRegisterModal();

        // Recarregar dados
        await loadDashboardData();

    } catch (error) {
        console.error('Erro ao submeter formulário:', error);
        alert('Erro ao cadastrar dispositivo. Tente novamente.');
    }
}

/**
 * Handler para filtro de status
 */
async function handleStatusFilter(status) {
    console.log('Filtro de status alterado:', status);
    const devices = await fetchDevices({ status: status !== 'all' ? status : undefined });
    console.log('Dispositivos filtrados:', devices);
}

/**
 * Handler para busca
 */
async function handleSearch(searchTerm) {
    if (!searchTerm.trim()) {
        console.log('Busca limpa');
        return;
    }
    console.log('Buscando:', searchTerm);
    const devices = await fetchDevices({ search: searchTerm });
    console.log('Resultados da busca:', devices);
}

/**
 * Handler para filtro de tempo
 */
function handleTimeFilter(timeFrame) {
    console.log('Período de tempo alterado:', timeFrame);
    // Aqui você implementaria a lógica para buscar dados do período selecionado
}

// ===== UTILITÁRIOS =====

/**
 * Debounce para evitar requisições excessivas em inputs
 */
function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
    };
}

/**
 * Throttle para limitar chamadas de funções
 */
function throttle(func, limit) {
    let inThrottle;
    return function (...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Formata número para exibição
 */
function formatNumber(num) {
    return new Intl.NumberFormat('pt-BR').format(num);
}

/**
 * Formata percentual
 */
function formatPercentage(value) {
    return `${(value * 100).toFixed(2)}%`;
}

/**
 * Logger com timestamp
 */
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const prefix = `[${timestamp}] Dashboard:`;
    
    switch (type) {
        case 'error':
            console.error(`❌ ${prefix} ${message}`);
            break;
        case 'warning':
            console.warn(`⚠️ ${prefix} ${message}`);
            break;
        case 'success':
            console.log(`✓ ${prefix} ${message}`);
            break;
        default:
            console.log(`ℹ️ ${prefix} ${message}`);
    }
}

// ===== INICIALIZAÇÃO AO CARREGAR PÁGINA =====

// Aguardar o DOM estar completamente carregado
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDashboard);
} else {
    initializeDashboard();
}

// ===== EXPORTAR PARA REUTILIZAÇÃO (CommonJS) =====
// Descomente se estiver usando módulos:
/*
module.exports = {
    DashboardState,
    dashboardState,
    renderDashboard,
    renderMetrics,
    renderNetworkMonitor,
    fetchDashboardData,
    fetchNetworkMetrics,
    fetchDevices,
    registerNewDevice,
    initializeDashboard,
    loadDashboardData
};
*/
