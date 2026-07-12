import { io } from 'socket.io-client';

const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3004';

let socket = null;

export const conectarSocket = (androidId, onChamadaRecebida, onStatusAtualizado) => {
  console.log('[Socket] conectarSocket chamado');

  if (socket?.connected) {
    console.log('[Socket] Já conectado:', socket.id);
    socket.off('chamada_recebida');
    socket.off('status_atualizado');
    socket.on('chamada_recebida', (data) => {
      console.log('[Socket] Chamada recebida de:', data.deAndroidId);
      if (onChamadaRecebida) onChamadaRecebida(data);
    });
    socket.on('status_atualizado', (data) => {
      if (onStatusAtualizado) onStatusAtualizado(data);
    });
    return socket;
  }

  console.log('[Socket] Criando nova conexão');

  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
  });

  socket.on('connect', () => {
    console.log('[Socket] connect:', socket.id);
    socket.emit('registrar', androidId);
  });

  socket.on('registrado', (data) => {
    console.log('[Socket] Registrado como:', data.androidId);
  });

  socket.on('chamada_recebida', (data) => {
    console.log('[Socket] Chamada recebida de:', data.deAndroidId);
    if (onChamadaRecebida) onChamadaRecebida(data);
  });

  socket.on('status_atualizado', (data) => {
    if (onStatusAtualizado) onStatusAtualizado(data);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket] disconnect:', reason);
  });

  socket.on('connect_error', (err) => {
    console.error('[Socket] Connect Error:', err.message);
  });

  socket.on('error', (err) => {
    console.error('[Socket] Error:', err);
  });

  socket.io.on('reconnect', () => {
    console.log('[Socket] reconnect');
  });

  socket.io.on('reconnect_attempt', () => {
    console.log('[Socket] reconnect_attempt');
  });

  socket.io.on('reconnect_error', (err) => {
    console.error('[Socket] reconnect_error:', err.message);
  });

  socket.io.on('reconnect_failed', () => {
    console.log('[Socket] reconnect_failed');
  });

  return socket;
};

export const chamar = (deAndroidId, paraAndroidId, nome, local, chamadaId = null) => {
  if (socket) {
    socket.emit('chamar', { deAndroidId, paraAndroidId, nome, local, chamadaId });
  }
};

export const aceitarChamada = (androidId, chamadaId = null) => {
  if (socket) {
    socket.emit('aceitar_chamada', { paraAndroidId: androidId, chamadaId });
  }
};

export const recusarChamada = (androidId, chamadaId = null) => {
  if (socket) {
    socket.emit('recusar_chamada', { paraAndroidId: androidId, chamadaId });
  }
};

export const encerrarChamada = (androidId, chamadaId = null) => {
  if (socket) {
    socket.emit('encerrar_chamada', { paraAndroidId: androidId, chamadaId });
  }
};

export const desconectarSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
