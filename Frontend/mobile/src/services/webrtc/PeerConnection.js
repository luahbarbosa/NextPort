import { RTCPeerConnection, RTCSessionDescription } from "react-native-webrtc";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

class PeerConnectionManager {
  constructor() {
    this.peer = null;
    this.onIceCandidateCallback = null;
    this.onTrackCallback = null;
    this.pendingCandidates = [];
  }

  setOnIceCandidateCallback(callback) {
    this.onIceCandidateCallback = callback;
  }

  setOnTrackCallback(callback) {
    this.onTrackCallback = callback;
  }

  createPeer() {
    console.log("[PeerConnection] Criando conexão...");

    this.peer = new RTCPeerConnection(ICE_SERVERS);

    this.peer.onicecandidate = (event) => {
      if (!this.peer) return;
      console.log("[PeerConnection] onicecandidate:", event.candidate);
      if (this.onIceCandidateCallback && event.candidate) {
        this.onIceCandidateCallback(event.candidate);
      }
    };

    this.peer.onconnectionstatechange = () => {
      if (!this.peer) return;
      console.log("[PeerConnection] connectionState:", this.peer.connectionState);
    };

    this.peer.oniceconnectionstatechange = () => {
      if (!this.peer) return;
      console.log("[PeerConnection] iceConnectionState:", this.peer.iceConnectionState);
    };

    this.peer.onsignalingstatechange = () => {
      if (!this.peer) return;
      console.log("[PeerConnection] signalingState:", this.peer.signalingState);
    };

    this.peer.ontrack = (event) => {
      if (!this.peer) return;
      console.log("[PeerConnection] ontrack - stream recebida:", event.streams[0]);
      if (this.onTrackCallback && event.streams[0]) {
        this.onTrackCallback(event.streams[0]);
      }
    };

    this.peer.onnegotiationneeded = () => {
      if (!this.peer) return;
      console.log("[PeerConnection] onnegotiationneeded");
    };

    console.log("[PeerConnection] Criada.");
    return this.peer;
  }

  addLocalStream(stream) {
    if (!this.peer) {
      console.warn("[PeerConnection] Nenhuma conexão ativa para adicionar tracks.");
      return;
    }

    const tracks = stream.getTracks();
    console.log(`[PeerConnection] Adicionando ${tracks.length} track(s) de áudio...`);

    tracks.forEach((track) => {
      this.peer.addTrack(track, stream);
      console.log(`[PeerConnection] Track adicionada: ${track.kind}, enabled: ${track.enabled}`);
    });

    console.log(`[PeerConnection] ${tracks.length} track(s) adicionada(s).`);
  }

  async createOffer() {
    if (!this.peer) {
      console.warn("[PeerConnection] Nenhuma conexão ativa para criar offer.");
      return;
    }

    const offer = await this.peer.createOffer({
      offerToReceiveAudio: true,
    });
    await this.peer.setLocalDescription(offer);

    console.log("[PeerConnection] Offer criada.");
    console.log("Tipo:", this.peer.localDescription.type);
    console.log(this.peer.localDescription.sdp.substring(0, 300));
  }

  getLocalDescription() {
    return this.peer?.localDescription || null;
  }

  async setRemoteDescription(description) {
    if (!this.peer) {
      console.warn("[PeerConnection] Nenhuma conexão ativa para setRemoteDescription.");
      return;
    }

    await this.peer.setRemoteDescription(new RTCSessionDescription(description));
    console.log("[PeerConnection] RemoteDescription setada.");
    await this._flushPendingCandidates();
  }

  async createAnswer() {
    if (!this.peer) {
      console.warn("[PeerConnection] Nenhuma conexão ativa para criar answer.");
      return;
    }

    const answer = await this.peer.createAnswer();
    await this.peer.setLocalDescription(answer);

    console.log("[PeerConnection] Answer criada.");
    console.log("Tipo:", this.peer.localDescription.type);
  }

  async addIceCandidate(candidate) {
    if (!this.peer) {
      console.warn("[PeerConnection] Nenhuma conexão ativa para addIceCandidate.");
      return;
    }

    if (!this.peer.remoteDescription) {
      console.log("[PeerConnection] RemoteDescription ausente, enfileirando candidate...");
      this.pendingCandidates.push(candidate);
      return;
    }

    await this.peer.addIceCandidate(candidate);
    console.log("[PeerConnection] ICE candidate adicionado.");
  }

  async _flushPendingCandidates() {
    while (this.pendingCandidates.length > 0) {
      const candidate = this.pendingCandidates.shift();
      await this.peer.addIceCandidate(candidate);
      console.log("[PeerConnection] ICE candidate pendente adicionado.");
    }
  }

  getPeer() {
    return this.peer;
  }

  closePeer() {
    if (this.peer) {
      this.peer.ontrack = null;
      this.peer.onicecandidate = null;
      this.peer.onconnectionstatechange = null;
      this.peer.oniceconnectionstatechange = null;
      this.peer.onsignalingstatechange = null;
      this.peer.onnegotiationneeded = null;

      this.peer.close();
      this.peer = null;
      console.log("[PeerConnection] Encerrada.");
    }
  }

  isCreated() {
    return this.peer !== null;
  }
}

export default new PeerConnectionManager();
