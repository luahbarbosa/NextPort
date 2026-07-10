import { RTCPeerConnection } from "react-native-webrtc";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

class PeerConnectionManager {
  constructor() {
    this.peer = null;
  }

  createPeer() {
    console.log("[PeerConnection] Criando conexão...");

    this.peer = new RTCPeerConnection(ICE_SERVERS);

    this.peer.onicecandidate = (event) => {
      if (!this.peer) return;
      console.log("[PeerConnection] onicecandidate:", event.candidate);
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
