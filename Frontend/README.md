# NexPort Dashboard - Documentação Completa

## 📋 Visão Geral

Dashboard completo de gerenciamento central para o sistema **NexPort**, desenvolvido com:
- **HTML5** estruturado e semântico
- **CSS3** moderno com Grid/Flexbox, responsivo
- **JavaScript puro** com arquitetura pronta para integração com API REST

### Características

✅ Layout responsivo (Desktop, Tablet, Mobile)  
✅ Componentes reutilizáveis e bem estruturados  
✅ Estado centralizado com padrão Observer  
✅ Funções assíncronas prontas para API  
✅ Mock data para desenvolvimento  
✅ Modal interativo para cadastro de dispositivos  
✅ Filtros e buscas funcionais  
✅ Animações suaves e transições  
✅ Ícones modernos (Phosphor Icons)  
✅ Acessibilidade básica

---

## 🗂️ Estrutura de Arquivos

```
Frontend/
└── JS/
    ├── index.html          # Estrutura HTML principal
    ├── styles.css          # Estilos CSS moderno
    ├── dashboard.js        # Lógica JavaScript
    ├── api-config.example  # Exemplo de configuração de API
    └── README.md           # Este arquivo
```

---

## 🚀 Como Usar

### 1. Abrir o Dashboard

Simplesmente abra `index.html` em um navegador:

```bash
# Opção 1: Abrir direto no navegador
file:///caminho/para/Frontend/JS/index.html

# Opção 2: Usar um servidor local (recomendado)
npx http-server Frontend/JS --port 8080
# ou
python -m http.server 8000 --directory Frontend/JS
```

### 2. Estrutura de Componentes

#### **Sidebar (Lateral)**
- Logo "NexPort"
- Menu de navegação com 7 itens
- Perfil do usuário no rodapé
- Totalmente responsiva em mobile

#### **Header Principal**
- Título da página e subtítulo
- Botão de notificações com badge
- Layout flexível

#### **Seção de Métricas**
- 4 cards com dados principais
- Gráficos mini (SVG) em cada card
- Badges com variação percentual
- Hover effects animados

#### **Monitor da Rede**
- 4 métricas de desempenho
- Barras de progresso com cores de status
- Dropdown para período de tempo
- Grid responsivo (2 colunas → 1 coluna em mobile)

#### **Barra de Ações**
- Campo de busca com ícone
- Dropdown de filtros
- Botão primário para cadastro
- Totalmente responsiva

---

## 🎨 Design & Paleta de Cores

### Cores Principais
```css
--color-primary-dark: #0A196F    /* Azul escuro (Sidebar) */
--color-primary-blue: #3B82F6    /* Azul primário */
--color-bg-light: #F4F6FA        /* Fundo claro */
--color-white: #FFFFFF           /* Branco */
--color-success: #10B981         /* Verde */
--color-error: #EF4444           /* Vermelho */
--color-warning: #F59E0B         /* Laranja */
```

### Tipografia
- Font: 'Segoe UI', 'Roboto', 'Inter', sans-serif
- Weights: 400 (regular), 600 (semibold), 700 (bold)
- Line-height: 1.6

### Espaçamentos
- `--radius-sm`: 8px
- `--radius-md`: 12px
- `--radius-lg`: 16px

---

## ⚙️ JavaScript - Arquitetura

### Estado (dashboardState)

O estado é centralizado em uma classe `DashboardState` que usa o padrão **Observer**:

```javascript
// Instância global
let dashboardState = new DashboardState(mockData);

// Atualizar estado
dashboardState.updateState({ 
    metrics: { totalDevices: 150 } 
});

// Obter estado
const currentData = dashboardState.getState();

// Inscrever-se a mudanças
dashboardState.subscribe((data) => {
    console.log('Estado foi atualizado:', data);
});
```

### Mock Data

Dados de exemplo para desenvolvimento (veja `mockData` em `dashboard.js`):

```javascript
{
    metrics: {
        totalDevices: 128,
        devicesOnline: 96,
        devicesOffline: 24,
        devicesUnstable: 8
    },
    networkMonitor: {
        latency: 32,      // ms
        bandwidth: 68,    // %
        uptime: 99.9,     // %
        connectionErrors: 12
    },
    notifications: 3
}
```

### Funções Principais

#### `renderDashboard(data)`
Renderiza todo o dashboard com os dados fornecidos.

```javascript
const data = await fetchDashboardData();
renderDashboard(data);
```

#### `fetchDashboardData()`
Busca dados do dashboard. Atualmente retorna mock data, mas está pronta para integração com API.

```javascript
async function fetchDashboardData() {
    // Descomente para integrar com backend:
    // const response = await fetch('https://api.nexport.com/v1/dashboard');
    // const data = await response.json();
    
    return mockData; // Retorna mock temporariamente
}
```

#### `registerNewDevice(deviceData)`
Cadastra um novo dispositivo via POST.

```javascript
const device = await registerNewDevice({
    name: "Sensor Sala",
    type: "sensor",
    location: "Sala Principal"
});
```

#### `fetchDevices(filters)`
Busca dispositivos com filtros opcionais.

```javascript
const devices = await fetchDevices({ 
    status: 'online',
    search: 'termo'
});
```

---

## 🔌 Integração com API REST

### Endpoints Esperados (Backend)

```bash
# GET - Obter dados do dashboard
GET /api/v1/dashboard

# GET - Obter métricas de rede
GET /api/v1/network-metrics

# GET - Listar dispositivos com filtros
GET /api/v1/devices?status=online&search=termo

# POST - Cadastrar novo dispositivo
POST /api/v1/devices
```

### Como Integrar

1. **Descomente as chamadas de fetch reais em `dashboard.js`:**

```javascript
async function fetchDashboardData() {
    const response = await fetch('https://sua-api.com/v1/dashboard', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
    });

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    return await response.json();
}
```

2. **Configure a URL base da API:**

```javascript
// No topo de dashboard.js, adicione:
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.nexport.com/v1';
```

3. **Gerencie tokens de autenticação:**

```javascript
// Armazenar token após login
localStorage.setItem('authToken', token);

// Usar em requisições
headers: {
    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
}
```

4. **Trate erros adequadamente:**

```javascript
try {
    const data = await fetchDashboardData();
} catch (error) {
    console.error('Erro ao buscar dados:', error);
    // Mostrar notificação de erro ao usuário
    showNotification('Erro ao carregar dashboard', 'error');
}
```

---

## 📱 Responsividade

### Breakpoints

```css
/* Desktop: 1200px+ */
/* Tablet: 768px - 1199px */
/* Mobile: até 768px */
/* Pequeno: até 480px */
```

### Comportamentos Responsivos

- **Desktop**: Sidebar visível, 4 colunas de métricas
- **Tablet**: Sidebar visível, 2 colunas de métricas
- **Mobile**: Sidebar colapsável, 1 coluna, toolbar em coluna
- **Menu Mobile**: Toggle sidebar com sidebar fixa à esquerda

---

## 🛠️ Customização

### Alterar Cores

Edite as variáveis CSS em `styles.css`:

```css
:root {
    --color-primary-dark: #0A196F;  /* Altere aqui */
    --color-success: #10B981;       /* Ou aqui */
}
```

### Alterar Fontes

```css
body {
    font-family: 'Sua Fonte', sans-serif;
}
```

### Adicionar Novos Cards de Métrica

1. Adicione o HTML em `index.html`
2. Adicione o CSS em `styles.css`
3. Adicione a renderização em `dashboard.js`:

```javascript
function renderMetrics(metrics) {
    document.getElementById('seu-elemento').innerText = metrics.suaDado;
}
```

### Adicionar Novo Menu Item

Em `index.html`, na seção da sidebar:

```html
<li class="menu-item">
    <a href="#" class="menu-link">
        <i class="ph ph-seu-icone"></i>
        <span>Seu Item</span>
    </a>
</li>
```

---

## 🎯 Funcionalidades Principais

### 1. Dashboard em Tempo Real
- Atualiza dados a cada 30 segundos
- Padrão Observer para reatividade
- Loading states simulados

### 2. Cadastro de Dispositivos
- Modal interativo
- Validação básica de formulário
- Integração com API POST

### 3. Filtros e Busca
- Filtro por status de dispositivo
- Busca por nome/localização
- Debounce para otimizar requisições

### 4. Notificações
- Badge com contador
- Integrado ao estado global

### 5. Atalhos do Teclado
- **ESC**: Fechar modal ou sidebar mobile

---

## 🔍 Debugging & Logging

O código inclui logs detalhados. Abra o console do navegador (F12) para ver:

```javascript
// Logs automáticos
console.log('✓ Dashboard renderizado completamente');
console.error('❌ Erro ao buscar dados...');

// Função de log personalizada
log('Mensagem', 'info|success|warning|error');
```

---

## 📊 Exemplo de Integração Completa

```javascript
// 1. Inicializar dashboard
initializeDashboard();

// 2. Quando receber dados da API
const apiData = await fetchDashboardData();

// 3. Atualizar estado
dashboardState.updateState(apiData);

// 4. Dashboard re-renderiza automaticamente
// (graças ao padrão Observer)
```

---

## ⚡ Performance

### Otimizações Implementadas

- **Debounce**: Para busca e inputs (300ms)
- **Throttle**: Para eventos de scroll
- **Lazy Loading**: Imagens e conteúdo sob demanda
- **CSS Grid & Flexbox**: Renderização eficiente
- **Event Delegation**: Poucos listeners globais
- **Estado Centralizado**: Evita renderizações desnecessárias

### Dicas de Otimização

```javascript
// Use debounce para inputs
searchInput.addEventListener('input', debounce((e) => {
    handleSearch(e.target.value);
}, 300));

// Use throttle para scroll events
window.addEventListener('scroll', throttle(() => {
    // Handle scroll
}, 100));
```

---

## 🔒 Segurança

### Best Practices Implementadas

- ✅ Sanitização de inputs (validação básica)
- ✅ HTTPS recomendado para requisições
- ✅ Token de autenticação armazenado seguramente
- ✅ CORS configurado no backend
- ✅ Error handling adequado

### Melhorias Recomendadas

- Implementar sanitização mais rigorosa (DOMPurify)
- Usar CSP (Content Security Policy)
- Validação server-side obrigatória
- Rate limiting em endpoints críticos
- Refresh automático de tokens

---

## 📚 Recursos Úteis

- [Phosphor Icons](https://phosphoricons.com/)
- [CSS Grid Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [Observer Pattern](https://www.patterns.dev/posts/observer-pattern/)

---

## 🤝 Contribuindo

Para adicionar novos recursos:

1. Siga a estrutura de componentes existente
2. Mantenha a nomenclatura CSS com BEM quando possível
3. Documente mudanças no topo do arquivo
4. Teste responsividade em múltiplos devices
5. Valide acessibilidade (teclado, screen readers)

---

## 📝 Changelog

### v1.0.0 (2024)
- ✅ Dashboard inicial completo
- ✅ Sidebar responsiva
- ✅ Cards de métricas
- ✅ Monitor de rede
- ✅ Modal de cadastro
- ✅ Integração preparada para API

---

## 📧 Suporte

Para dúvidas sobre integração com backend ou problemas técnicos, verifique:

1. Console do navegador (F12)
2. Network tab para requisições
3. Este arquivo de documentação
4. Comentários no código (bem detalhados)

---

**Desenvolvido com ❤️ para NexPort**  
**Versão**: 1.0.0  
**Última atualização**: 2024
