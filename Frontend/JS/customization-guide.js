/**
 * GUIA DE CUSTOMIZAÇÃO & PADRÕES AVANÇADOS
 * 
 * Este arquivo contém exemplos de como customizar, estender e padrões
 * avançados para o Dashboard NexPort.
 */

// ===== 1. ADICIONAR NOVO CARD DE MÉTRICA =====

/**
 * Exemplo: Adicionar métrica "Taxa de Erro"
 * 
 * Passo 1: Adicionar ao HTML
 * <div class="metric-card">
 *     <div class="card-header">
 *         <h3 class="card-title">Taxa de Erro</h3>
 *         <span class="metric-badge negative" id="error-rate-badge">+5%</span>
 *     </div>
 *     <div class="card-body">
 *         <p class="metric-subtitle">últimas 24 horas</p>
 *         <p class="metric-value" id="error-rate-value">2.3%</p>
 *     </div>
 *     <p class="card-comparison">vs. dia anterior</p>
 * </div>
 * 
 * Passo 2: Adicionar à mock data
 * mockData.metrics.errorRate = 2.3;
 * mockData.metrics.errorRateChange = 5;
 * 
 * Passo 3: Adicionar à renderização
 */

function renderErrorRateMetric(metrics) {
    const element = document.getElementById('error-rate-value');
    const badge = document.getElementById('error-rate-badge');
    
    if (element) {
        element.innerText = `${metrics.errorRate}%`;
    }
    
    if (badge) {
        badge.innerText = `${metrics.errorRateChange > 0 ? '+' : ''}${metrics.errorRateChange}%`;
        badge.className = metrics.errorRateChange > 0 ? 'metric-badge negative' : 'metric-badge positive';
    }
}

// Integrar à função principal
function renderDashboard(data) {
    renderMetrics(data.metrics);
    renderErrorRateMetric(data.metrics);
    renderNetworkMonitor(data.networkMonitor);
    updateNotificationBadge(data.notifications);
}

// ===== 2. ADICIONAR NOVO ITEM DE MENU =====

/**
 * Dinamicamente adicionar menu item
 */
function addMenuItemDynamically(label, icon, active = false) {
    const menuList = document.querySelector('.menu-list');
    const li = document.createElement('li');
    li.className = `menu-item ${active ? 'active' : ''}`;
    
    li.innerHTML = `
        <a href="#" class="menu-link">
            <i class="ph ${icon}"></i>
            <span>${label}</span>
        </a>
    `;
    
    li.querySelector('a').addEventListener('click', (e) => {
        e.preventDefault();
        handleMenuClick(label);
    });
    
    menuList.appendChild(li);
}

function handleMenuClick(label) {
    console.log('Menu item clicado:', label);
    // Implementar navegação aqui
}

// Usar:
// addMenuItemDynamically('Dashboard Avançado', 'ph-chart-bar', false);

// ===== 3. TEMA DARK MODE =====

/**
 * Sistema de temas (Dark/Light)
 */
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('theme') || 'light';
        this.applyTheme(this.currentTheme);
    }

    themes = {
        light: {
            '--color-primary-dark': '#0A196F',
            '--color-bg-light': '#F4F6FA',
            '--color-white': '#FFFFFF',
            '--color-text-dark': '#1F2937',
            '--color-text-light': '#6B7280'
        },
        dark: {
            '--color-primary-dark': '#051244',
            '--color-bg-light': '#1F2937',
            '--color-white': '#111827',
            '--color-text-dark': '#F3F4F6',
            '--color-text-light': '#D1D5DB'
        }
    };

    applyTheme(theme) {
        if (!this.themes[theme]) return;
        
        const root = document.documentElement;
        Object.entries(this.themes[theme]).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        
        this.currentTheme = theme;
        localStorage.setItem('theme', theme);
        console.log(`✓ Tema ${theme} aplicado`);
    }

    toggle() {
        const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        this.applyTheme(newTheme);
    }
}

// Usar:
// const themeManager = new ThemeManager();
// themeManager.toggle(); // Alterna entre light e dark

// ===== 4. GRÁFICOS AVANÇADOS (Com Chart.js) =====

/**
 * Integração com Chart.js para gráficos mais complexos
 * Primeiro: npm install chart.js
 * Script: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
 */

function initAdvancedCharts() {
    // Gráfico de dispositivos por status
    const statusCtx = document.getElementById('chart-status');
    if (statusCtx) {
        new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['Online', 'Offline', 'Instável'],
                datasets: [{
                    data: [96, 24, 8],
                    backgroundColor: ['#10B981', '#EF4444', '#F59E0B'],
                    borderRadius: 8,
                    spacing: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // Gráfico de latência ao longo do tempo
    const latencyCtx = document.getElementById('chart-latency');
    if (latencyCtx) {
        new Chart(latencyCtx, {
            type: 'line',
            data: {
                labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
                datasets: [{
                    label: 'Latência (ms)',
                    data: [28, 32, 25, 35, 30, 28],
                    borderColor: '#3B82F6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 50
                    }
                }
            }
        });
    }
}

// ===== 5. NOTIFICAÇÕES & TOASTS =====

/**
 * Sistema de notificações (Toasts)
 */
class NotificationManager {
    constructor() {
        this.toastContainer = this.createContainer();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 1.5rem;
            right: 1.5rem;
            z-index: 2000;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        `;
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 4000) {
        const toast = document.createElement('div');
        const colors = {
            success: '#10B981',
            error: '#EF4444',
            warning: '#F59E0B',
            info: '#3B82F6'
        };

        toast.style.cssText = `
            background-color: ${colors[type]};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 10px 15px rgba(0, 0, 0, 0.2);
            animation: slideIn 0.3s ease-out;
            font-size: 0.875rem;
            font-weight: 500;
            max-width: 400px;
        `;

        toast.innerText = message;
        this.toastContainer.appendChild(toast);

        if (duration > 0) {
            setTimeout(() => {
                toast.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => toast.remove(), 300);
            }, duration);
        }
    }
}

// Usar:
// const notifications = new NotificationManager();
// notifications.show('Dispositivo cadastrado com sucesso!', 'success');

// ===== 6. PAGINAÇÃO E LAZY LOADING =====

/**
 * Gerenciador de paginação para listas de dispositivos
 */
class PaginationManager {
    constructor(pageSize = 10) {
        this.pageSize = pageSize;
        this.currentPage = 1;
        this.totalItems = 0;
        this.items = [];
    }

    setItems(items) {
        this.items = items;
        this.totalItems = items.length;
    }

    getCurrentPage() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.items.slice(start, end);
    }

    getTotalPages() {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    next() {
        if (this.currentPage < this.getTotalPages()) {
            this.currentPage++;
            return this.getCurrentPage();
        }
    }

    previous() {
        if (this.currentPage > 1) {
            this.currentPage--;
            return this.getCurrentPage();
        }
    }

    goToPage(page) {
        if (page >= 1 && page <= this.getTotalPages()) {
            this.currentPage = page;
            return this.getCurrentPage();
        }
    }
}

// ===== 7. EXPORTAR DADOS =====

/**
 * Exportar dados para CSV
 */
function exportToCSV(data, filename = 'export.csv') {
    const csv = convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function convertToCSV(data) {
    if (!Array.isArray(data) || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csv = [headers.join(',')];
    
    data.forEach(row => {
        const values = headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') 
                ? `"${value}"` 
                : value;
        });
        csv.push(values.join(','));
    });
    
    return csv.join('\n');
}

// Usar:
// exportToCSV(devices, 'dispositivos.csv');

/**
 * Exportar para PDF (requer PDF.js ou similar)
 */
function exportToPDF(title, data) {
    console.log('Exportando para PDF:', title);
    // Implementar com library como html2pdf
}

// ===== 8. FILTROS AVANÇADOS =====

/**
 * Classe para gerenciar filtros complexos
 */
class AdvancedFilter {
    constructor() {
        this.filters = {};
    }

    add(key, value, operator = 'equals') {
        if (!this.filters[key]) {
            this.filters[key] = [];
        }
        this.filters[key].push({ value, operator });
    }

    remove(key, value) {
        if (this.filters[key]) {
            this.filters[key] = this.filters[key].filter(f => f.value !== value);
        }
    }

    clear(key) {
        if (key) {
            delete this.filters[key];
        } else {
            this.filters = {};
        }
    }

    getQueryParams() {
        const params = new URLSearchParams();
        
        Object.entries(this.filters).forEach(([key, values]) => {
            values.forEach(({ value, operator }) => {
                params.append(`filter[${key}][${operator}]`, value);
            });
        });
        
        return params.toString();
    }

    apply(items) {
        return items.filter(item => {
            return Object.entries(this.filters).every(([key, filters]) => {
                return filters.some(({ value, operator }) => {
                    return this.compare(item[key], value, operator);
                });
            });
        });
    }

    compare(a, b, operator) {
        switch (operator) {
            case 'equals': return a === b;
            case 'contains': return String(a).includes(String(b));
            case 'gt': return a > b;
            case 'lt': return a < b;
            case 'gte': return a >= b;
            case 'lte': return a <= b;
            default: return true;
        }
    }
}

// Usar:
// const filter = new AdvancedFilter();
// filter.add('status', 'online');
// filter.add('name', 'sensor', 'contains');
// const filtered = filter.apply(devices);

// ===== 9. CACHE E SINCRONIZAÇÃO =====

/**
 * Gerenciador de cache com expiração
 */
class CacheManager {
    constructor(ttl = 5 * 60 * 1000) { // 5 minutos default
        this.cache = new Map();
        this.ttl = ttl;
    }

    set(key, value, customTTL) {
        const expireTime = Date.now() + (customTTL || this.ttl);
        this.cache.set(key, { value, expireTime });
    }

    get(key) {
        const cached = this.cache.get(key);
        
        if (!cached) return null;
        
        if (Date.now() > cached.expireTime) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.value;
    }

    clear() {
        this.cache.clear();
    }

    isExpired(key) {
        const cached = this.cache.get(key);
        return !cached || Date.now() > cached.expireTime;
    }
}

// ===== 10. ANIMAÇÕES CUSTOMIZADAS =====

/**
 * Sistema de animações reutilizáveis
 */
const Animations = {
    fadeIn: (element, duration = 300) => {
        element.style.animation = `fadeIn ${duration}ms ease-out`;
    },

    slideInRight: (element, duration = 300) => {
        element.style.animation = `slideInRight ${duration}ms ease-out`;
    },

    pulse: (element, duration = 1000) => {
        element.style.animation = `pulse ${duration}ms infinite`;
    },

    spin: (element, duration = 1000) => {
        element.style.animation = `spin ${duration}ms linear infinite`;
    }
};

// Adicione essas keyframes ao CSS:
/*
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}
*/

// ===== EXEMPLO DE USO INTEGRADO =====

/*
// Inicializar tudo junto
function initializeAdvanced() {
    const themeManager = new ThemeManager();
    const notifications = new NotificationManager();
    const pagination = new PaginationManager(15);
    const cache = new CacheManager();

    // Carregar dados com cache
    async function loadDevices() {
        let devices = cache.get('devices');
        
        if (!devices) {
            devices = await fetchDevices();
            cache.set('devices', devices);
            notifications.show('Dispositivos carregados', 'success');
        }
        
        pagination.setItems(devices);
        renderDeviceList(pagination.getCurrentPage());
    }

    // Exportar dados
    document.getElementById('export-csv').addEventListener('click', () => {
        exportToCSV(pagination.items, 'dispositivos.csv');
        notifications.show('Exportado com sucesso!', 'success');
    });
}
*/

// ===== EXPORTAR PARA USO =====
/*
export {
    ThemeManager,
    NotificationManager,
    PaginationManager,
    AdvancedFilter,
    CacheManager,
    Animations,
    addMenuItemDynamically,
    exportToCSV,
    initAdvancedCharts
};
*/
