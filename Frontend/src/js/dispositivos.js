// ===== Estado inicial =====
const state = {
  dispositivos: [],
  residencias: [],
  termoBusca: '',
  filtroStatus: 'TODOS',
  proximoId: 1,
  editandoId: null
};

// ===== Helpers de status =====
function normalizeDeviceType(tipo) {
  if (!tipo) return '';
  const valor = String(tipo).trim().toLowerCase();
  if (valor === 'portaria') return 'portaria';
  if (valor === 'residencia' || valor === 'residencial') return 'residencia';
  return valor;
}

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
      (item.modelo && item.modelo.toLowerCase().includes(termo));

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

  if (state.dispositivos.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">Carregando...</td>
      </tr>
    `;
    return;
  }

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
            <td data-col-modelo>${item.modelo || '—'}</td>
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
  ajustarColunaModelo(lista);
}

function ajustarColunaModelo(lista) {
  const mostrar = lista.some((item) => item.modelo);
  document.querySelectorAll('[data-col-modelo]').forEach((element) => {
    element.style.display = mostrar ? '' : 'none';
  });

  const headerModel = document.querySelector('th[data-col-modelo]');
  if (headerModel) {
    headerModel.style.display = mostrar ? '' : 'none';
  }
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

async function carregarDispositivos() {
  try {
    const [responseDispositivos, responseStatus, responseResidencias] = await Promise.all([
      fetch(window.NexportApi?.registro('/dispositivos') || 'http://localhost:3002/dispositivos'),
      fetch(window.NexportApi?.signaling('/status') || 'http://localhost:3004/status').catch(() => null),
      fetch(window.NexportApi?.registro('/residencias') || 'http://localhost:3002/residencias').catch(() => null)
    ]);

    if (!responseDispositivos.ok) {
      throw new Error(`Erro na API: ${responseDispositivos.status} ${responseDispositivos.statusText}`);
    }

    const dados = await responseDispositivos.json();
    const statusList = responseStatus && responseStatus.ok ? await responseStatus.json() : [];
    const connectedIds = new Set(
      Array.isArray(statusList)
        ? statusList.map((item) => (typeof item === 'string' ? item : item.androidId || item.id))
        : []
    );

    if (responseResidencias && responseResidencias.ok) {
      const residencias = await responseResidencias.json();
      state.residencias = residencias;
      popularSelectResidencias(residencias);
    }

    state.dispositivos = dados.map((item) => ({
      id: item.id,
      nome: item.nomeDispositivo,
      modelo: item.versaoApp || item.modelo || '',
      residencia: item.residencia?.identificador || 'Sem residência',
      residenciaId: item.residenciaId || item.residencia?.id || '',
      tipoValor: normalizeDeviceType(item.tipo),
      tipo: normalizeDeviceType(item.tipo) === 'portaria' ? 'Portaria' : 'Residência',
      status: connectedIds.has(item.androidId) ? 'ONLINE' : 'OFFLINE',
      ultimoAcesso: item.ultimoPing ? new Date(item.ultimoPing).toLocaleString('pt-BR') : 'Sem dados',
      androidId: item.androidId
    }));

    state.proximoId = state.dispositivos.length + 1;
    renderDispositivos();
  } catch (error) {
    console.error('Erro ao carregar dispositivos:', error);
    const tableBody = document.getElementById('devices-table-body');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="6" class="empty-state">Erro ao carregar dispositivos.</td>
        </tr>
      `;
    }
  }
}

function editarDispositivo(dispositivo) {
  state.editandoId = dispositivo.id;

  document.getElementById('device-name').value = dispositivo.nome;
  document.getElementById('device-model').value = dispositivo.modelo || '';
  document.getElementById('device-residence').value = dispositivo.residenciaId || '';
  document.getElementById('device-android-id').value = dispositivo.androidId || '';
  document.getElementById('device-type').value = dispositivo.tipoValor || '';

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

async function removerDispositivo(id) {
  const dispositivo = state.dispositivos.find((d) => d.id === id);
  if (!dispositivo) return;

  const confirmado = window.confirm(`Remover o dispositivo "${dispositivo.nome}"?`);
  if (!confirmado) return;

  try {
    const response = await fetch(`${window.NexportApi?.registro(`/dispositivos/${id}`) || `http://localhost:3002/dispositivos/${id}`}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`Erro ao remover dispositivo: ${response.statusText}`);
    }

    state.dispositivos = state.dispositivos.filter((d) => d.id !== id);
    renderDispositivos();
  } catch (error) {
    console.error('Erro ao remover dispositivo:', error);
    alert('Não foi possível remover o dispositivo.');
  }
}

// ===== Formulário de cadastro/edição =====
function resetFormularioParaCadastro() {
  const registerForm = document.getElementById('register-form');
  const formTitle = document.querySelector('.form-header h2');
  const submitBtn = document.querySelector('#register-form button[type="submit"]');

  if (registerForm) registerForm.reset();
  if (formTitle) formTitle.textContent = 'Cadastrar dispositivo';
  if (submitBtn) submitBtn.textContent = 'Cadastrar';

  const residenciaSelect = document.getElementById('device-residence');
  if (residenciaSelect && state.residencias.length) {
    residenciaSelect.value = '';
  }

  state.editandoId = null;
}

function popularSelectResidencias(residencias) {
  const residenciaSelect = document.getElementById('device-residence');
  if (!residenciaSelect) return;

  residenciaSelect.innerHTML = '<option value="">Selecione a residência</option>';
  residencias.forEach((residencia) => {
    const option = document.createElement('option');
    option.value = residencia.id;
    option.textContent = residencia.identificador;
    residenciaSelect.appendChild(option);
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const nome = document.getElementById('device-name').value.trim();
  const modelo = document.getElementById('device-model').value.trim();
  const residenciaId = document.getElementById('device-residence').value;
  const androidId = document.getElementById('device-android-id').value.trim();
  const tipo = normalizeDeviceType(document.getElementById('device-type').value);

  if (!nome || !residenciaId || !tipo) {
    alert('Preencha todos os campos obrigatórios.');
    return;
  }

  if (nome.length < 3) {
    alert('O nome do dispositivo deve ter pelo menos 3 caracteres.');
    return;
  }

  try {
    if (state.editandoId) {
      const response = await fetch(`${window.NexportApi?.registro(`/dispositivos/${state.editandoId}`) || `http://localhost:3002/dispositivos/${state.editandoId}`}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomeDispositivo: nome,
          androidId: androidId || undefined,
          tipo,
          residenciaId: residenciaId ? Number(residenciaId) : null,
          versaoApp: modelo
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar dispositivo: ${response.statusText}`);
      }

      alert('Dispositivo atualizado com sucesso!');
    } else {
      const response = await fetch(window.NexportApi?.registro('/dispositivos') || 'http://localhost:3002/dispositivos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nomeDispositivo: nome,
          androidId: androidId || `dev-${Date.now()}`,
          tipo,
          residenciaId
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao cadastrar dispositivo: ${response.statusText}`);
      }

      alert('Dispositivo cadastrado com sucesso!');
    }

    await carregarDispositivos();
    resetFormularioParaCadastro();
  } catch (error) {
    console.error('Erro ao salvar dispositivo:', error);
    alert('Não foi possível salvar o dispositivo.');
  }

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
  carregarDispositivos();

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