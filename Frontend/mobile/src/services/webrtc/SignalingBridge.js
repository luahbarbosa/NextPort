class SignalingBridge {
  constructor() {
    this.socket = null;
    this.androidIdLocal = null;
  }

  initialize(socket, androidIdLocal) {
    this.socket = socket;
    this.androidIdLocal = androidIdLocal;
  }

  sendOffer(destinoAndroidId, offer) {
      console.log(`[Signaling] Enviando offer para ${destinoAndroidId}`);
      this.socket.emit("webrtc:offer", {
          from: this.androidIdLocal,
          to: destinoAndroidId,
          offer,
      });
  }
  sendAnswer(destinoAndroidId, answer) {
    console.log(`[Signaling] Enviando answer para ${destinoAndroidId}`);
    this.socket.emit("webrtc:answer", {
      from: this.androidIdLocal,
      to: destinoAndroidId,
      answer,
    });
  }

  onOffer(callback) {
    if (!this.socket) {
      console.warn("[Signaling] SignalingBridge não inicializada.");
      return;
    }

    this.socket.on("webrtc:offer", (data) => {
      console.log(`[Signaling] Offer recebida de ${data.from}`);
      callback(data);
    });
  }

  onAnswer(callback) {
    if (!this.socket) {
      console.warn("[Signaling] SignalingBridge não inicializada.");
      return;
    }

    this.socket.on("webrtc:answer", (data) => {
      console.log(`[Signaling] Answer recebida de ${data.from}`);
      callback(data);
    });
  }

  removeOfferListener() {
    if (this.socket) {
      this.socket.off("webrtc:offer");
    }
  }

  removeAnswerListener() {
    if (this.socket) {
      this.socket.off("webrtc:answer");
    }
  }

  sendIceCandidate(to, candidate) {
    this.socket.emit("webrtc:ice-candidate", {
      from: this.androidIdLocal,
      to,
      candidate,
    });
  }

  onIceCandidate(callback) {
    if (!this.socket) {
      console.warn("[Signaling] SignalingBridge não inicializada.");
      return;
    }

    this.socket.on("webrtc:ice-candidate", (data) => {
      console.log(`[Signaling] ICE candidate recebido de ${data.from}`);
      callback(data);
    });
  }

  removeIceCandidateListener() {
    if (this.socket) {
      this.socket.off("webrtc:ice-candidate");
    }
  }
}

export default new SignalingBridge();
