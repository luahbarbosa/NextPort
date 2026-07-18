import { PermissionsAndroid, Platform } from "react-native";
import { mediaDevices } from "react-native-webrtc";

class MediaManager {
  constructor() {
    this.localStream = null;
  }

  async startLocalAudio() {
    if (this.localStream) {
      return this.localStream;
    }

    console.log("[MediaManager] Abrindo microfone...");

    await this._solicitarPermissaoMicrofone();

    this.localStream = await mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });

    console.log("[MediaManager] Microfone iniciado.");

    const tracks = this.localStream.getTracks();
    console.log(`Quantidade de tracks: ${tracks.length}`);
    tracks.forEach((track) => {
      console.log(`Track: ${track.kind}, enabled: ${track.enabled}, id: ${track.id}`);
    });

    return this.localStream;
  }

  stopLocalAudio() {
    if (this.localStream) {
      const tracks = this.localStream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
      this.localStream = null;
      console.log("[MediaManager] Microfone encerrado.");
    }
  }

  async _solicitarPermissaoMicrofone() {
    if (Platform.OS === "android") {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
      );
      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        throw new Error("Permissão do microfone negada pelo usuário.");
      }
    }
  }

  getLocalStream() {
    return this.localStream;
  }

  hasLocalStream() {
    return Boolean(this.localStream);
  }
}

export default new MediaManager();
