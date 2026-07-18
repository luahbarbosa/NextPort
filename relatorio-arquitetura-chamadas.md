# Relatório Técnico — Módulo de Chamadas (InterFacil)

> Análise de engenharia reversa completa do módulo de chamadas.
> Projeto: InterFacil — Sistema de interfone via chamada de voz.

---

## 1. Mapa da Arquitetura (Fluxograma Textual)

```
SplashScreen (3s)
    ↓ navigation.replace('Login')
LoginScreen
    ↓ handleLogin()
    ↓ POST /auth/login (auth-service:3001)
    ↓ GET  /dispositivos/por-usuario/:id (registro-service:3002)
    ↓ AsyncStorage salva token, androidId, nomeUsuario
    ↓ navigation.replace('MainTabs')
MainTabs
    ├── Tab "Home"   → HomeScreen (carrega dispositivos via GET /dispositivos)
    ├── Tab "Historico" → HistoricoScreen (carrega chamadas via GET /chamadas/por-dispositivo)
    └── Tab "Settings" → HomeScreen (reaproveitada)

HOME SCREEN → Fluxo de Chamada:
    Usuário toca em um contato/portaria
    ↓
    chamadaApi.post('/chamadas', { origemAndroidId, destinoAndroidId, status: 'nao_atendida' })
    ↓
    socketService.chamar(deAndroidId, paraAndroidId, nome, local, chamadaId)
    ↓
    socket.emit('chamar', payload) → signaling-server:3004
    ↓
    Servidor verifica se destino está online (mapa dispositivosConectados)
    ├── Sim → socket.emit('chamada_recebida') para o destino
    └── Não → socket.emit('dispositivo_offline') para o chamador
    ↓
    navigation.navigate('Chamada', { tipo: 'chamando' }) → ChamadaScreen

CHAMADA SCREEN:
    ├── tipo='chamando':  exibe "chamando...", botão vermelho de encerrar
    ├── tipo='recebendo': exibe botão verde (aceitar) + vermelho (recusar)
    └── tipo='conversando': exibe "em chamada...", botão vermelho de encerrar
    ↓
    Aceitar → PATCH /chamadas/:id (status='atendida') + socket 'aceitar_chamada'
    Recusar → PATCH /chamadas/:id (status='recusada') + socket 'recusar_chamada'
    Encerrar → PATCH /chamadas/:id (encerradoEm) + socket 'encerrar_chamada'
```

---

## 2. Socket.IO

**Onde o socket é criado:** `src/services/socketService.js:8` — dentro de `conectarSocket()`

**Onde conecta:** `socketService.js:8` — `io(SOCKET_URL, { transports: ['websocket'], reconnection: true })`

**Onde desconecta:** `socketService.js:76` — chamado via `desconectarSocket()` (mas **nunca é chamado no App atual**)

**Onde registra usuário:** `socketService.js:15` — `socket.emit('registrar', androidId)` logo após conectar

**Onde envia eventos:**

| Evento | Função | Arquivo | Linha |
|--------|--------|---------|-------|
| `chamar` | `chamar()` | socketService.js | 52 |
| `aceitar_chamada` | `aceitarChamada()` | socketService.js | 58 |
| `recusar_chamada` | `recusarChamada()` | socketService.js | 64 |
| `encerrar_chamada` | `encerrarChamada()` | socketService.js | 70 |

**Onde recebe eventos:**

| Evento | Handler | Arquivo | Linha |
|--------|---------|---------|-------|
| `connect` | console.log + emit('registrar') | socketService.js | 13 |
| `registrado` | console.log | socketService.js | 18 |
| `chamada_recebida` | callback onChamadaRecebida | socketService.js | 22 |
| `status_atualizado` | callback onStatusAtualizado | socketService.js | 27 |
| `chamada_aceita` | console.log | socketService.js | 31 |
| `chamada_recusada` | console.log | socketService.js | 35 |
| `chamada_encerrada` | console.log | socketService.js | 39 |
| `dispositivo_offline` | console.log | socketService.js | 43 |

Também na ChamadaScreen há listeners adicionais registrados manualmente via `getSocket()`:

| Evento | Handler | Arquivo | Linha |
|--------|---------|---------|-------|
| `chamada_aceita` | setStatusTexto + setFase | ChamadaScreen.js | 27 |
| `chamada_recusada` | setStatusTexto + goBack | ChamadaScreen.js | 32 |
| `chamada_encerrada` | setStatusTexto + goBack | ChamadaScreen.js | 39 |
| `dispositivo_offline` | setStatusTexto + goBack | ChamadaScreen.js | 46 |

⚠️ **Problema:** listeners duplicados — os mesmos eventos são registrados tanto no `socketService.js` quanto na `ChamadaScreen.js`, podendo causar dupla execução.

---

## 3. Fluxo da Chamada (passo a passo)

1. **Usuário toca em "Ligar"** (HomeScreen.js:99 ou :170)
2. **`chamadaApi.post('/chamadas')`** é chamado com payload:
   ```json
   { "origemAndroidId": "meuId", "destinoAndroidId": "outroId", "status": "nao_atendida" }
   ```
3. Resposta do servidor (chamada-service:3003):
   ```json
   { "id": 123, "dispositivoOrigemId": 1, "dispositivoDestinoId": 2, "iniciadoEm": "...", "status": "nao_atendida" }
   ```
4. **`socketService.chamar(meuAndroidId, destinoAndroidId, nome, local, chamadaId)`** é chamado
5. Socket emite `'chamar'` para signaling-server:3004
6. Servidor roteia `'chamada_recebida'` para o destino (se online) OU emite `'dispositivo_offline'` de volta
7. **`navigation.navigate('Chamada', { tipo: 'chamando', ... })`** abre a tela de chamada
8. Estado da chamada é armazenado **apenas em memória** (React state: `fase`, `statusTexto`) — não há Context/Redux

---

## 4. Backend — Microsserviços

| Serviço | Porta | Papel |
|---------|-------|-------|
| **auth-service** | 3001 | Login, JWT, perfil, alterar senha |
| **registro-service** | 3002 | CRUD residências e dispositivos |
| **chamada-service** | 3003 | Histórico de chamadas (CRUD) |
| **signaling-server** | 3004 | Socket.IO em tempo real + roteamento de chamadas |
| **notif-service** | 3005 | Notificações push |

---

## 5. Endpoints

**Mobile utiliza:**

| Método | Endpoint | Arquivo | Linha | Payload | Resposta |
|--------|----------|---------|-------|---------|----------|
| POST | `/auth/login` | LoginScreen.js | 31 | `{ email, senha }` | `{ token, nome, id }` |
| GET | `/dispositivos/por-usuario/:id` | LoginScreen.js | 38 | — | Dispositivo com residência |
| GET | `/dispositivos` | HomeScreen.js | 63 | — | Array de dispositivos |
| POST | `/chamadas` | HomeScreen.js | 102 | `{ origemAndroidId, destinoAndroidId, status }` | `{ id, ... }` |
| POST | `/chamadas` | HomeScreen.js | 172 | idem | idem |
| GET | `/chamadas/por-dispositivo/:androidId` | HistoricoScreen.js | 43 | — | Array de chamadas |
| PATCH | `/chamadas/:id` | ChamadaScreen.js | 68 | `{ status, atendidoEm }` | Chamada atualizada |
| PATCH | `/chamadas/:id` | ChamadaScreen.js | 87 | `{ status, encerradoEm }` | Chamada atualizada |
| PATCH | `/chamadas/:id` | ChamadaScreen.js | 105 | `{ encerradoEm }` | Chamada atualizada |
| GET | `/status` (signaling) | HomeScreen.js | 75 | — | `["androidId1", "androidId2"]` |

---

## 6. Estados da Chamada

**Banco de dados (enum `StatusChamada` no Prisma):**

- `atendida`
- `nao_atendida`
- `recusada`
- `erro`

**Mobile (fases na ChamadaScreen):**

- `'recebendo'` — tela de incoming call
- `'chamando'` — tela de outgoing call
- `'conversando'` — após aceitar

**Status de texto exibido:**

- `'chamando...'`
- `'em chamada...'`
- `'chamada recusada'` (1.5s + goBack)
- `'chamada encerrada'` (1.5s + goBack)
- `'dispositivo offline'` (1.5s + goBack)

**Status do dispositivo:**

- `online` / `offline` (via `dispositivosOnline` state em HomeScreen)

---

## 7. Telas Relacionadas

| Tela | Responsabilidade | Abre por | Fecha por |
|------|------------------|----------|-----------|
| **SplashScreen** | Animação inicial, redireciona após 3s | App → Stack | `navigation.replace('Login')` |
| **LoginScreen** | Autenticação do usuário | SplashScreen | `navigation.replace('MainTabs')` |
| **HomeScreen** | Lista dispositivos, botão de ligar | MainTabs → Tab "Home" | Navega para Chamada |
| **ChamadaScreen** | Controle da chamada (aceitar/recusar/encerrar) | HomeScreen via `navigate('Chamada')` | `navigation.goBack()` |
| **HistoricoScreen** | Lista histórico de chamadas | MainTabs → Tab "Historico" | — |

---

## 8. Navegação

Stack Navigator (App.js):

```
Splash → Login → MainTabs (BottomTab)
                    ├── Home (Tab)
                    ├── Historico (Tab)
                    └── Settings (Tab) → HomeScreen
Chamada (em cima das tabs, via Stack)
```

Rotas relacionadas a chamada:

- `navigation.navigate('Chamada', { nome, local, tipo, deAndroidId/paraAndroidId, chamadaId })` — HomeScreen.js:111, :181
- `navigation.goBack()` — ChamadaScreen.js:35, :42, :49, :80, :95, :98, :112, :115, :128

---

## 9. Modelos de Dados

**Chamada (API response):**

```json
{
  "id": 1,
  "dispositivoOrigemId": 1,
  "dispositivoDestinoId": 2,
  "iniciadoEm": "2024-01-01T00:00:00.000Z",
  "atendidoEm": null,
  "encerradoEm": null,
  "status": "nao_atendida",
  "origem": {
    "id": 1,
    "nomeDispositivo": "Tablet Portaria",
    "androidId": "PORTARIA-001",
    "tipo": "portaria",
    "residencia": { "identificador": "Portaria Principal", "usuario": { "nome": "Admin" } }
  },
  "destino": { ... }
}
```

**Payload de navegação (Chamada params):**

```js
{
  nome: string,        // nome do contato
  local: string,       // identificador da residência
  tipo: 'chamando' | 'recebendo',
  deAndroidId: string, // se recebendo
  paraAndroidId: string, // se chamando
  chamadaId: number
}
```

---

## 10. Socket Events — Tabela Completa

| Evento (emit) | Quem envia | Payload | Evento (on) | Quem recebe | Arquivo | Linha |
|---------------|-----------|---------|-------------|-------------|---------|-------|
| `registrar` | Mobile | `androidId` | `registrado` | Quem enviou | socketService.js:15 | 15 |
| `chamar` | Mobile | `{ deAndroidId, paraAndroidId, nome, local, chamadaId }` | `chamada_recebida` | Destino | socketService.js:52 | 52 |
| `aceitar_chamada` | Mobile | `{ paraAndroidId, chamadaId }` | `chamada_aceita` | Origem | socketService.js:58 | 58 |
| `recusar_chamada` | Mobile | `{ paraAndroidId, chamadaId }` | `chamada_recusada` | Origem | socketService.js:64 | 64 |
| `encerrar_chamada` | Mobile | `{ paraAndroidId, chamadaId }` | `chamada_encerrada` | Origem | socketService.js:70 | 70 |
| `disconnect` | Auto | — | `status_atualizado` | Todos (broadcast) | signaling-server | — |
| — | Servidor | — | `status_atualizado` | Todos | signaling-server | — |
| — | Servidor | — | `dispositivo_offline` | Origem | signaling-server | — |

---

## 11. Pontos de Integração WebRTC

**Onde o WebRTC deve ser integrado:**

1. **Após `chamada_aceita`** (ChamadaScreen.js:27) — Quando o destinatário aceita, `fase` muda para `'conversando'`. É neste momento que a **PeerConnection** deve ser estabelecida e o **MediaStream** ativado.

2. **Após `handleAceitar()`** (ChamadaScreen.js:65) — Quando o usuário ACEITA uma chamada recebida. Antes de chamar `aceitarChamada()`, deve-se preparar a PeerConnection local.

3. **No `handleEncerrar()`** (ChamadaScreen.js:102) — Momento de fechar a PeerConnection e liberar recursos de mídia.

4. **No `limparRecursos()` do CallManager** — Deve ser chamado no `useEffect` cleanup (ChamadaScreen.js:54) e no `navigation.goBack()` para garantir limpeza.

5. **No `signaling-server`** — Serão necessários novos eventos Socket.IO para troca de **Offer**, **Answer** e **ICE Candidates** entre os peers.

**Arquivos a modificar:**

- `ChamadaScreen.js` — integrar CallManager nos handlers de aceitar/recusar/encerrar
- `socketService.js` — adicionar eventos de WebRTC signaling (offer, answer, ice-candidate)
- `signaling-server/index.js` — adicionar roteamento dos novos eventos

---

## 12. Riscos

| Risco | Detalhes | Local |
|-------|----------|-------|
| **Listeners duplicados** | Eventos chamada_aceita/recusada/encerrada registrados tanto no socketService quanto na ChamadaScreen | socketService.js:31-41 e ChamadaScreen.js:27-51 |
| **Memory leak de socket** | `desconectarSocket()` nunca é chamado no App — socket fica vivo mesmo após logout ou fechamento | Nenhum lugar chama no fluxo atual |
| **Catch vazio** | `chamadaApi.post().catch(() => ({ data: { id: null } }))` silencia erros | HomeScreen.js:106, :176 |
| **Sem tratamento de estado global** | Estado da chamada é só React state local — se usuário navegar para outra tela e voltar, o estado é perdido | ChamadaScreen.js:16-17 |
| **Hardcoded status check** | URL do signaling `http://localhost:3004/status` hardcoded no fetch (não usa env) | HomeScreen.js:74 |
| **Settings tab aponta para HomeScreen** | A tab "Settings" reusa HomeScreen, o que não faz sentido | App.js:66-67 |
| **Sem loading states** | Nenhum tratamento de loading nas telas — PATCH /chamadas pode falhar silenciosamente | ChamadaScreen.js:65-117 |
| **Navigation goBack sem cleanup** | ChamadaScreen não limpa recursos de mídia ao dar goBack | ChamadaScreen.js:34-50 |

---

## 13. WebRTC — Onde Criar Cada Componente

| Componente WebRTC | Onde criar | Arquivo | Justificativa |
|------------------|------------|---------|---------------|
| **RTCPeerConnection** | No `PeerConnection` | `PeerConnection.js` | Classe já existe como boilerplate |
| **MediaStream (áudio)** | No `MediaManager` | `MediaManager.js` | Classe já existe, responsável pelo microfone |
| **ICE Candidate** | No `PeerConnection` + `SignalingBridge` | Ambos | PeerConnection gera/gerencia, SignalingBridge envia/recebe |
| **Offer** | Criado no PeerConnection, transmitido via SignalingBridge | Ambos | Após chamada aceita |
| **Answer** | Criado no PeerConnection, transmitido via SignalingBridge | Ambos | Em resposta ao Offer |
| **Encerrar conexão** | No `PeerConnection.close()` | `PeerConnection.js` | Chamado por CallManager.encerrarChamada() |
| **Microfone** | No `MediaManager.getUserMedia()` | `MediaManager.js` | Permissão + captura |
| **Mute/Unmute** | No `MediaManager` | `MediaManager.js` | Controle de áudio local |
| **Speaker** | No `MediaManager` | `MediaManager.js` | Controle de saída de áudio |

---

## 14. Árvore Completa da Chamada

```
HomeScreen
  ↓ onPress contato/portaria
  ↓
  chamadaApi.post('/chamadas')
    ↓ POST para chamada-service:3003
    ↓ resposta: { id, ... }
  ↓
  chamar(meuId, destinoId, nome, local, chamadaId)
    ↓ socket.emit('chamar', payload)
    ↓
    signaling-server:3004
      ↓ destino online?
      ├── SIM → io.to(destino).emit('chamada_recebida', { deAndroidId, nome, local, chamadaId })
      │         ↓ destino abre ChamadaScreen (tipo='recebendo')
      │         ↓ destino clica ACEITAR
      │         ├── chamadaApi.patch('/chamadas/:id', { status: 'atendida' })
      │         ├── aceitarChamada()
      │         │   └── socket.emit('aceitar_chamada')
      │         │       └── signaling-server → io.to(origem).emit('chamada_aceita')
      │         │           ↓ origem seta fase='conversando'
      │         │           ↓ *** AQUI: iniciar WebRTC (PeerConnection + MediaStream) ***
      │         └── destino seta fase='conversando'
      │             ↓ *** AQUI: iniciar WebRTC (PeerConnection + MediaStream) ***
      │
      └── NÃO → socket.emit('dispositivo_offline')
                ↓ ChamadaScreen exibe "dispositivo offline" + goBack

  ↓
  navigation.navigate('Chamada', { tipo: 'chamando', ... })
    ↓ ChamadaScreen exibe "chamando..." + botão encerrar
```

---

## 15. Relatório Final

### Arquitetura Atual

Monólito fragmentado em 5 microsserviços + 1 signaling server. Mobile se comunica via REST (axios) para dados persistentes e Socket.IO para tempo real. Não há gerenciamento de estado global (Context/Redux/Zustand). A navegação usa React Navigation com Stack + BottomTabs.

### Fluxo Atual

Chamadas são apenas **sinalizadas** — não há áudio real. O fluxo cria um registro HTTP no chamada-service e envia eventos Socket.IO para notificar o outro dispositivo. A tela de chamada é puramente visual (ícones e textos).

### Componentes Envolvidos

- **5 Screens:** Splash, Login, Home, Chamada, Historico
- **2 Services:** api.js (axios), socketService.js (Socket.IO)
- **4 Stubs WebRTC:** CallManager, PeerConnection, MediaManager, SignalingBridge (vazios)
- **App.js** com Stack + BottomTab Navigator

### Serviços

- **auth-service:3001** — Login/JWT
- **registro-service:3002** — Dispositivos/Residências
- **chamada-service:3003** — Histórico de chamadas
- **signaling-server:3004** — Socket.IO signaling
- **notif-service:3005** — Notificações

### Eventos Socket.IO

8 eventos no total (4 enviados, 4 recebidos pelo mobile): `chamar`, `aceitar_chamada`, `recusar_chamada`, `encerrar_chamada`, `chamada_recebida`, `chamada_aceita`, `chamada_recusada`, `chamada_encerrada`, `dispositivo_offline`, `status_atualizado`, `registrar`, `registrado`.

### APIs

19 endpoints REST no total. Mobile usa 6: POST /auth/login, GET /dispositivos, GET /dispositivos/por-usuario/:id, POST /chamadas, GET /chamadas/por-dispositivo/:androidId, PATCH /chamadas/:id, GET /status.

### Estrutura das Chamadas

Objeto chamada no banco: `{ id, dispositivoOrigemId, dispositivoDestinoId, iniciadoEm, atendidoEm?, encerradoEm?, status (atendida|nao_atendida|recusada|erro) }`.

### Melhor Ponto para Integrar WebRTC

**Após `chamada_aceita`** (ChamadaScreen.js:27) para o chamador e **após `handleAceitar()`** (ChamadaScreen.js:65) para o receptor. Ambos os lados devem estabelecer a PeerConnection e ativar o MediaStream simultaneamente.

### Ordem Recomendada de Implementação

1. **SignalingBridge** — implementar emissão/recepção de offer, answer, ICE candidates sobre Socket.IO
2. **PeerConnection** — criar RTCPeerConnection, criar offer/answer, gerenciar ICE
3. **MediaManager** — getUserMedia, mute/unmute, liberar recursos
4. **CallManager** — orquestrar os 3 acima, integrar com os handlers da ChamadaScreen
5. **signaling-server** — adicionar novos eventos de WebRTC signaling (offer, answer, ice-candidate)
6. **ChamadaScreen** — conectar CallManager aos botões e eventos socket

### Possíveis Riscos

- Listeners Socket.IO duplicados entre socketService e ChamadaScreen
- Sem cleanup de socket ao deslogar
- Memory leak se usuário navegar sem encerrar chamada
- Sem estado global — perda de estado ao navegar
- ChamadaScreen não limpa recursos ao dar goBack
- Não há tratamento de permissão de microfone
- `react-native-webrtc` já está no package.json mas não é utilizado

### Melhor Arquitetura Sugerida

```
                    ┌─────────────────────┐
                    │    ChamadaScreen     │
                    │  (UI + handlers)     │
                    └──────┬──────────────┘
                           │ usa
                    ┌──────▼──────────────┐
                    │    CallManager       │  ← Singleton ou Context
                    │  (orquestrador)      │
                    └──┬───────┬────────┬─┘
                       │       │        │
              ┌────────▼──┐ ┌──▼──────┐ ┌▼────────────┐
              │ PeerConnec│ │MediaMgr │ │SignalingBrid│
              │ (RTCPeer) │ │(Stream) │ │ (Socket)    │
              └───────────┘ └─────────┘ └─────────────┘
                       │                    │
              ┌────────▼──┐        ┌───────▼───────┐
              │  Navegador │        │ socketService │
              │  WebRTC    │        │ (Socket.IO)   │
              └────────────┘        └───────────────┘
```

Recomenda-se criar um **CallContext** (React Context) para manter o estado da chamada globalmente, e o CallManager atuar como serviço singleton acessível de qualquer tela.
