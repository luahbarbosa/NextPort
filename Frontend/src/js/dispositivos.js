// ===== Dados iniciais =====
const dadosIniciais = {
  dispositivos: [
    { id: 1, nome: 'Portaria Principal', modelo: 'Samsung A54', residencia: 'Apartamento 001 - Bloco A', tipo: 'Portaria', status: 'ONLINE', ultimoAcesso: 'Hoje, 09:35', androidId: '' },
    { id: 2, nome: 'Portaria Secundária', modelo: 'Moto G54', residencia: 'Apartamento 102 - Bloco B', tipo: 'Portaria', status: 'OFFLINE', ultimoAcesso: 'Hoje, 08:12', androidId: '' },
    { id: 3, nome: 'Portão Garagem', modelo: 'Redmi Note 13', residencia: 'Apartamento 203 - Bloco C', tipo: 'Portão', status: 'ONLINE', ultimoAcesso: 'Hoje, 09:22', androidId: '' },
    { id: 4, nome: 'Recepção', modelo: 'iPhone 13', residencia: 'Apartamento 304 - Bloco D', tipo: 'Recepção', status: 'INATIVO', ultimoAcesso: 'Ontem, 18:45', androidId: '' },
    { id: 5, nome: 'Portaria VIP', modelo: 'Samsung A54', residencia: 'Apartamento 005 - Bloco E', tipo: 'Portaria', status: 'ONLINE', ultimoAcesso: 'Hoje, 09:41', androidId: '' }
  ]
};

// Estado da aplicação (cópia mutável dos dados + filtros ativos)
const state = {
  dispositivos: [...dadosIniciais.dispositivos],
  termoBusca: '',
  filtroStatus: 'TODOS',
  proximoId: dadosIniciais.dispositivos.length + 1,
  editandoId: null
};

// ===== Helpers de status =====
function statusInfo(status) {
  switch (status) {
    case 'ONLINE':
      return { className: 'status-online', label: 'Online' };
    case 'OFFLINE':
      return { className: 'status-offline', label: 'Offline' };
    case 'INATIVO':
      return { className: 'status-inactive', label: 'Inativo' };
    default:
      return { className: 'status-offline', label: status };
  }
}

// ===== Filtragem =====
function getDispositivosFiltrados() {
  const termo = state.termoBusca.trim().toLowerCase();

  return state.dispositivos.filter((item) => {
    const correspondeBusca =
      !termo ||
      item.nome.toLowerCase().includes(termo) ||
      item.residencia.toLowerCase().includes(termo) ||
      item.modelo.toLowerCase().includes(termo);

    const correspondeStatus =
      state.filtroStatus === 'TODOS' || item.status === state.filtroStatus;

    return correspondeBusca && correspondeStatus;
  });
}

// ===== Renderização da tabela =====
function renderDispositivos() {
  const tableBody = document.getElementById('devices-table-body');
  if (!tableBody) return;

  const lista = getDispositivosFiltrados();

  if (lista.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Nenhum dispositivo encontrado.</td>
      </tr>
    `;
  } else {
    tableBody.innerHTML = lista
      .map((item) => {
        const { className, label } = statusInfo(item.status);
        return `
          <tr data-id="${item.id}">
            <td>
              <div class="device-cell">
                <div class="device-avatar">
                  <i class="fas fa-mobile"></i>
                </div>
                <div class="device-info">
                  <strong>${item.nome}</strong>
                  <span>${item.tipo}</span>
                </div>
              </div>
            </td>
            <td>${item.modelo}</td>
            <td>${item.residencia}</td>
            <td>
              <span class="status-pill ${className}">${label}</span>
            </td>
            <td>${item.ultimoAcesso}</td>
            <td class="actions-cell">
              <button class="action-btn btn-restart" type="button" title="Reiniciar conexão" data-id="${item.id}">
                <i class="fas fa-arrows-rotate"></i>
              </button>
              <button class="action-btn btn-edit" type="button" title="Editar" data-id="${item.id}">
                <i class="fas fa-pen"></i>
              </button>
              <button class="action-btn btn-delete" type="button" title="Remover" data-id="${item.id}">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
      })
      .join('');
  }

  atualizarPaginacao(lista.length);
}

// ===== Paginação / contador (somente exibição, sem paginação real ainda) =====
function atualizarPaginacao(totalFiltrado) {
  const info = document.getElementById('pagination-info');
  if (!info) return;

  const total = state.dispositivos.length;

  if (totalFiltrado === total) {
    info.textContent = `Mostrando 1 a ${total} de ${total} dispositivos`;
  } else {
    info.textContent = `Mostrando ${totalFiltrado} de ${total} dispositivos`;
  }
}

// ===== Ações da tabela (delegação de eventos) =====
function handleTableClick(e) {
  const btn = e.target.closest('.action-btn');
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const dispositivo = state.dispositivos.find((d) => d.id === id);
  if (!dispositivo) return;

  if (btn.classList.contains('btn-restart')) {
    reiniciarConexao(dispositivo);
  } else if (btn.classList.contains('btn-edit')) {
    editarDispositivo(dispositivo);
  } else if (btn.classList.contains('btn-delete')) {
    removerDispositivo(id);
  }
}

function reiniciarConexao(dispositivo) {
  dispositivo.status = 'ONLINE';
  dispositivo.ultimoAcesso = 'Agora';
  renderDispositivos();
}

function editarDispositivo(dispositivo) {
  state.editandoId = dispositivo.id;

  document.getElementById('device-name').value = dispositivo.nome;
  document.getElementById('device-model').value = dispositivo.modelo;
  document.getElementById('device-residence').value = dispositivo.residencia;
  document.getElementById('device-android-id').value = dispositivo.androidId || '';
  document.getElementById('device-type').value = dispositivo.tipo;

  const formPanel = document.querySelector('.form-panel');
  const formTitle = document.querySelector('.form-header h2');
  const submitBtn = document.querySelector('#register-form button[type="submit"]');

  if (formTitle) formTitle.textContent = 'Editar dispositivo';
  if (submitBtn) submitBtn.textContent = 'Salvar alterações';

  if (formPanel) {
    formPanel.style.display = 'flex';
    if (window.innerWidth < 1024) {
      setTimeout(() => formPanel.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }
}

function removerDispositivo(id) {
  const dispositivo = state.dispositivos.find((d) => d.id === id);
  if (!dispositivo) return;

  const confirmado = window.confirm(`Remover o dispositivo "${dispositivo.nome}"?`);
  if (!confirmado) return;

  state.dispositivos = state.dispositivos.filter((d) => d.id !== id);
  renderDispositivos();
}

// ===== Formulário de cadastro/edição =====
function resetFormularioParaCadastro() {
  const registerForm = document.getElementById('register-form');
  const formTitle = document.querySelector('.form-header h2');
  const submitBtn = document.querySelector('#register-form button[type="submit"]');

  if (registerForm) registerForm.reset();
  if (formTitle) formTitle.textContent = 'Cadastrar dispositivo';
  if (submitBtn) submitBtn.textContent = 'Cadastrar';

  state.editandoId = null;
}

function handleFormSubmit(e) {
  e.preventDefault();

  const nome = document.getElementById('device-name').value.trim();
  const modelo = document.getElementById('device-model').value.trim();
  const residencia = document.getElementById('device-residence').value;
  const androidId = document.getElementById('device-android-id').value.trim();
  const tipo = document.getElementById('device-type').value;

  if (!nome || !modelo || !residencia || !tipo) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  if (state.editandoId) {
    // Atualiza dispositivo existente
    const dispositivo = state.dispositivos.find((d) => d.id === state.editandoId);
    if (dispositivo) {
      dispositivo.nome = nome;
      dispositivo.modelo = modelo;
      dispositivo.residencia = residencia;
      dispositivo.androidId = androidId;
      dispositivo.tipo = tipo;
    }
    alert('Dispositivo atualizado com sucesso!');
  } else {
    // Cria novo dispositivo
    const novoDispositivo = {
      id: state.proximoId++,
      nome,
      modelo,
      residencia,
      androidId,
      tipo,
      status: 'ONLINE',
      ultimoAcesso: 'Agora'
    };
    state.dispositivos.push(novoDispositivo);
    alert('Dispositivo cadastrado com sucesso!');

    // Aqui você poderia enviar os dados para o backend:
    // await fetch('/api/dispositivos', { method: 'POST', body: JSON.stringify(novoDispositivo) })
  }

  resetFormularioParaCadastro();
  renderDispositivos();

  if (window.innerWidth < 1024) {
    const formPanel = document.querySelector('.form-panel');
    if (formPanel) formPanel.style.display = 'none';
  }
}

// ===== Busca =====
function handleSearchInput(e) {
  state.termoBusca = e.target.value;
  renderDispositivos();
}

// ===== Filtros (ciclo simples entre status a cada clique no botão "Filtros") =====
const ORDEM_FILTROS = ['TODOS', 'ONLINE', 'OFFLINE', 'INATIVO'];

function handleFiltrosClick() {
  const indexAtual = ORDEM_FILTROS.indexOf(state.filtroStatus);
  const proximoIndex = (indexAtual + 1) % ORDEM_FILTROS.length;
  state.filtroStatus = ORDEM_FILTROS[proximoIndex];

  const btnFilters = document.getElementById('btn-filters');
  if (btnFilters) {
    const labelMap = {
      TODOS: 'Filtros',
      ONLINE: 'Filtro: Online',
      OFFLINE: 'Filtro: Offline',
      INATIVO: 'Filtro: Inativo'
    };
    btnFilters.innerHTML = `<i class="fas fa-sliders"></i> ${labelMap[state.filtroStatus]}`;
  }

  renderDispositivos();
}

// ===== Inicialização =====
document.addEventListener('DOMContentLoaded', function () {
  renderDispositivos();

  const btnOpenRegister = document.getElementById('btn-open-register');
  const btnCancelForm = document.getElementById('btn-cancel-form');
  const registerForm = document.getElementById('register-form');
  const formPanel = document.querySelector('.form-panel');
  const tableBody = document.getElementById('devices-table-body');
  const searchDevice = document.getElementById('search-device');
  const btnFilters = document.getElementById('btn-filters');

  if (btnOpenRegister) {
    btnOpenRegister.addEventListener('click', function () {
      resetFormularioParaCadastro();
      if (formPanel) {
        formPanel.style.display = 'flex';
        if (window.innerWidth < 1024) {
          setTimeout(() => formPanel.scrollIntoView({ behavior: 'smooth' }), 100);
        }
      }
    });
  }

  if (btnCancelForm) {
    btnCancelForm.addEventListener('click', function () {
      resetFormularioParaCadastro();
      if (window.innerWidth < 1024 && formPanel) {
        formPanel.style.display = 'none';
      }
    });
  }

  if (registerForm) {
    registerForm.addEventListener('submit', handleFormSubmit);
  }

  if (tableBody) {
    tableBody.addEventListener('click', handleTableClick);
  }

  if (searchDevice) {
    searchDevice.addEventListener('input', handleSearchInput);
  }

  if (btnFilters) {
    btnFilters.addEventListener('click', handleFiltrosClick);
  }
});