import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:3004';

let socket = null;

export const conectarSocket = (androidId, onChamadaRecebida, onStatusAtualizado) => {
  socket = io(SOCKET_URL, {
    transports: ['websocket'],
    reconnection: true,
  });

  socket.on('connect', () => {
    console.log('Socket conectado:', socket.id);
    socket.emit('registrar', androidId);
  });

  socket.on('registrado', (data) => {
    console.log('Registrado como:', data.androidId);
  });

  socket.on('chamada_recebida', (data) => {
    console.log('Chamada recebida de:', data.deAndroidId);
    if (onChamadaRecebida) onChamadaRecebida(data);
  });

  socket.on('status_atualizado', (data) => {
    if (onStatusAtualizado) onStatusAtualizado(data);
  });

  socket.on('chamada_aceita', () => {
    console.log('Chamada aceita pelo destinatário');
  });

  socket.on('chamada_recusada', () => {
    console.log('Chamada recusada');
  });

  socket.on('chamada_encerrada', () => {
    console.log('Chamada encerrada');
  });

  socket.on('dispositivo_offline', (data) => {
    console.log('Dispositivo offline:', data.paraAndroidId);
  });

  return socket;
};

export const chamar = (deAndroidId, paraAndroidId, nome, local) => {
  if (socket) {
    socket.emit('chamar', { deAndroidId, paraAndroidId, nome, local });
  }
};

export const aceitarChamada = (paraAndroidId) => {
  if (socket) {
    socket.emit('aceitar_chamada', { paraAndroidId });
  }
};

export const recusarChamada = (paraAndroidId) => {
  if (socket) {
    socket.emit('recusar_chamada', { paraAndroidId });
  }
};

export const encerrarChamada = (paraAndroidId) => {
  if (socket) {
    socket.emit('encerrar_chamada', { paraAndroidId });
  }
};

export const desconectarSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;