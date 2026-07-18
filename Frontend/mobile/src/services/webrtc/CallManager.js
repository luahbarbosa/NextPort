import PeerConnection from './PeerConnection';
import MediaManager from './MediaManager';
import SignalingBridge from './SignalingBridge';

// Responsável por ser o orquestrador principal das chamadas

class CallManager {
  constructor() {
    this.peerConnection = null;
    this.mediaManager = null;
    this.signalingBridge = null;
  }

  iniciarChamada() {
  }

  receberChamada() {
  }

  aceitarChamada() {
  }

  recusarChamada() {
  }

  encerrarChamada() {
  }

  limparRecursos() {
  }
}

export default CallManager;
