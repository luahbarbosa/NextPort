/**
 * NexPort Dashboard - JavaScript Principal
 * Estrutura pronta para integração com API REST
 * 
 * @author Frontend Team
 * @version 1.0.0
 */

// ===== DADOS INICIAIS E ESTADO LOCAL =====
const initialDashboardData = {
    user: {
        name: "Laura Meneses",
        role: "Administrador",
        avatar: "LM"
    },
    metrics: {
        totalDevices: 0,
        devicesOnline: 0,
        devicesOffline: 0,
        devicesUnstable: 0,
        onlinePercentage: 0,
        offlinePercentage: 0,
        unstablePercentage: 0
    },
    networkMonitor: {
        latency: 0,
        bandwidth: 0,
        uptime: 0,
        connectionErrors: 0
    },
    notifications: 0,
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
let dashboardState = new DashboardState(initialDashboardData);

// ===== FUNÇÕES DE RENDERIZAÇÃO =====

/**
 * Renderiza as métricas principais na tela
 * @param {Object} metrics - Objeto com dados de métricas
 */
function normalizeDeviceType(tipo) {
    if (!tipo) return '';
    const valor = String(tipo).trim().toLowerCase();
    if (valor === 'portaria') return 'portaria';
    if (valor === 'residencia' || valor === 'residencial') return 'residencia';
    return valor;
}

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

function setDashboardLoading() {
    const elements = ['total-devices', 'devices-online', 'devices-offline', 'devices-unstable'];
    elements.forEach((id) => {
        const element = document.getElementById(id);
        if (element) {
            element.innerText = 'Carregando...';
        }
    });
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
        const [dispositivosResponse, statusResponse] = await Promise.all([
            fetch(window.NexportApi?.registro('/dispositivos') || 'http://localhost:3002/dispositivos'),
            fetch(window.NexportApi?.signaling('/status') || 'http://localhost:3004/status').catch(() => null)
        ]);

        if (!dispositivosResponse.ok) {
            throw new Error(`Erro na API: ${dispositivosResponse.status} ${dispositivosResponse.statusText}`);
        }

        const dispositivos = await dispositivosResponse.json();
        const statusList = statusResponse && statusResponse.ok ? await statusResponse.json() : [];
        const connectedIds = new Set(
            Array.isArray(statusList)
                ? statusList.map((item) => (typeof item === 'string' ? item : item.androidId || item.id))
                : []
        );

        const totalDevices = dispositivos.length;
        const devicesOnline = dispositivos.filter((item) => connectedIds.has(item.androidId)).length;
        const devicesOffline = Math.max(totalDevices - devicesOnline, 0);
        const devicesUnstable = 0;

        const data = {
            ...initialDashboardData,
            metrics: {
                totalDevices,
                devicesOnline,
                devicesOffline,
                devicesUnstable,
                onlinePercentage: totalDevices ? Math.round((devicesOnline / totalDevices) * 100) : 0,
                offlinePercentage: totalDevices ? Math.round((devicesOffline / totalDevices) * 100) : 0,
                unstablePercentage: totalDevices ? Math.round((devicesUnstable / totalDevices) * 100) : 0
            },
            networkMonitor: {
                latency: 0,
                bandwidth: 0,
                uptime: 100,
                connectionErrors: 0
            },
            notifications: 0
        };

        return data;

    } catch (error) {
        console.error('❌ Erro ao buscar dados do dashboard:', error);
        return initialDashboardData;
    }
}

/**
 * Simula registro de novo dispositivo (POST)
 */
async function registerNewDevice(deviceData) {
    try {
        const response = await fetch(window.NexportApi?.registro('/dispositivos') || 'http://localhost:3002/dispositivos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nomeDispositivo: deviceData.name,
                androidId: deviceData.androidId || `${Date.now()}`,
                tipo: normalizeDeviceType(deviceData.type),
                residenciaId: deviceData.residenciaId || null
            })
        });

        if (!response.ok) {
            throw new Error(`Erro ao registrar dispositivo: ${response.statusText}`);
        }

        const newDevice = await response.json();
        return newDevice;

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
        const queryParams = new URLSearchParams();
        if (filters.status && filters.status !== 'all') {
            queryParams.set('status', filters.status);
        }
        if (filters.search) {
            queryParams.set('search', filters.search);
        }

        const [dispositivosResponse, statusResponse] = await Promise.all([
            fetch(`${window.NexportApi?.registro('/dispositivos') || 'http://localhost:3002/dispositivos'}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`),
            fetch(window.NexportApi?.signaling('/status') || 'http://localhost:3004/status').catch(() => null)
        ]);

        if (!dispositivosResponse.ok) {
            throw new Error(`Erro na API: ${dispositivosResponse.status} ${dispositivosResponse.statusText}`);
        }

        const devices = await dispositivosResponse.json();
        const statusList = statusResponse && statusResponse.ok ? await statusResponse.json() : [];
        const connectedIds = new Set(
            Array.isArray(statusList)
                ? statusList.map((item) => (typeof item === 'string' ? item : item.androidId || item.id))
                : []
        );

        return devices.map((item) => ({
            id: item.id,
            name: item.nomeDispositivo,
            type: item.tipo,
            location: item.residencia?.identificador || 'Sem residência',
            status: connectedIds.has(item.androidId) ? 'online' : 'offline'
        }));

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
    // Carregar dados inicialmente
    carregarResidenciasDashboard();
    loadDashboardData();

    // Inscrever renderização automática em mudanças de estado
    dashboardState.subscribe((data) => {
        renderDashboard(data);
    });

    // Event Listeners para a UI
    setupEventListeners();

    // Atualizar dados periodicamente (a cada 30 segundos)
    setInterval(loadDashboardData, 30000);

}

/**
 * Carrega os dados do dashboard
 */
async function loadDashboardData() {
    try {
        setDashboardLoading();
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
async function carregarResidenciasDashboard() {
    try {
        const response = await fetch(window.NexportApi?.registro('/residencias') || 'http://localhost:3002/residencias');
        if (!response.ok) {
            throw new Error(`Erro ao buscar residências: ${response.statusText}`);
        }

        const residencias = await response.json();
        const selectResidencia = document.getElementById('device-location');
        if (!selectResidencia) return;

        selectResidencia.innerHTML = '<option value="">Selecione a residência</option>';
        residencias.forEach((residencia) => {
            const option = document.createElement('option');
            option.value = residencia.id;
            option.textContent = residencia.identificador;
            selectResidencia.appendChild(option);
        });
    } catch (error) {
        console.error('Erro ao carregar residências:', error);
    }
}

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
            residenciaId: formData.get('device-location') || document.getElementById('device-location').value
        };

        // Validação básica
        if (!deviceData.name || !deviceData.type || !deviceData.residenciaId) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        if (deviceData.name.trim().length < 3) {
            alert('O nome do dispositivo deve ter pelo menos 3 caracteres.');
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
    await fetchDevices({ status: status !== 'all' ? status : undefined });
}

/**
 * Handler para busca
 */
async function handleSearch(searchTerm) {
    if (!searchTerm.trim()) {
        return;
    }

    await fetchDevices({ search: searchTerm });
}

/**
 * Handler para filtro de tempo
 */
function handleTimeFilter() {
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