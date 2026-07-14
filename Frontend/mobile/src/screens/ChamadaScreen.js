import { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RTCView } from 'react-native-webrtc';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { aceitarChamada, recusarChamada, encerrarChamada, getSocket } from '../services/socketService';
import { chamadaApi } from '../services/api';
import MediaManager from '../services/webrtc/MediaManager';
import PeerConnection from '../services/webrtc/PeerConnection';
import SignalingBridge from '../services/webrtc/SignalingBridge';
import CallAvatar from '../components/CallAvatar';
import CallButton from '../components/CallButton';
import CallStatus from '../components/CallStatus';
import AudioControls, { AudioWaves } from '../components/AudioControls';

export default function ChamadaScreen({ route, navigation }) {
  const params = route.params || {};
  const { nome = 'Desconhecido', local = 'Local não informado', tipo = 'recebendo', deAndroidId, paraAndroidId, chamadaId } = params;

  const destinoAndroidId = deAndroidId || paraAndroidId;
  const [fase, setFase] = useState(tipo);
  const [statusTexto, setStatusTexto] = useState(tipo === 'chamando' ? 'chamando...' : '');
  const [remoteStream, setRemoteStream] = useState(null);
  const [connectionReady, setConnectionReady] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const displayStatus = fase === 'conversando' && !connectionReady ? 'conectando' : fase;

  async function iniciarWebRTC() {
    try {
      console.log("[Caller] iniciarWebRTC");
      const androidIdLocal = await AsyncStorage.getItem('androidId');
      const socket = getSocket();
      if (!SignalingBridge.socket) {
        SignalingBridge.initialize(socket, androidIdLocal);
      }

      const stream = await MediaManager.startLocalAudio();
      PeerConnection.createPeer();
      PeerConnection.setOnIceCandidateCallback((candidate) => {
        SignalingBridge.sendIceCandidate(destinoAndroidId, candidate);
      });
      PeerConnection.setOnTrackCallback((remoteStream) => {
        console.log("[Caller] Stream remota recebida");
        setRemoteStream(remoteStream);
        setConnectionReady(true);
      });
      PeerConnection.addLocalStream(stream);
      await PeerConnection.createOffer();

      const offer = PeerConnection.getLocalDescription();
      SignalingBridge.sendOffer(destinoAndroidId, offer);

      SignalingBridge.onAnswer((data) => {
        console.log("[Caller] Answer recebida, conectando...");
        PeerConnection.setRemoteDescription(data.answer);
      });

      SignalingBridge.onIceCandidate((data) => {
        console.log("[Caller] ICE candidate recebido");
        PeerConnection.addIceCandidate(data.candidate);
      });
    } catch (err) {
      console.log('Erro ao iniciar WebRTC:', err?.message || err);
    }
  }

  async function iniciarWebRTCReceiver() {
    try {
      console.log("[Receiver] iniciarWebRTCReceiver");
      const androidIdLocal = await AsyncStorage.getItem('androidId');
      const socket = getSocket();
      if (!SignalingBridge.socket) {
        SignalingBridge.initialize(socket, androidIdLocal);
      }

      const stream = await MediaManager.startLocalAudio();
      PeerConnection.createPeer();
      PeerConnection.setOnIceCandidateCallback((candidate) => {
        SignalingBridge.sendIceCandidate(destinoAndroidId, candidate);
      });
      PeerConnection.setOnTrackCallback((remoteStream) => {
        console.log("[Receiver] Stream remota recebida");
        setRemoteStream(remoteStream);
        setConnectionReady(true);
      });
      PeerConnection.addLocalStream(stream);

      SignalingBridge.onOffer(async (data) => {
        console.log("[Receiver] Offer recebida, criando answer...");
        await PeerConnection.setRemoteDescription(data.offer);
        await PeerConnection.createAnswer();
        const answer = PeerConnection.getLocalDescription();
        SignalingBridge.sendAnswer(data.from, answer);
        console.log("[Receiver] Answer enviada");
      });

      SignalingBridge.onIceCandidate((data) => {
        console.log("[Receiver] ICE candidate recebido");
        PeerConnection.addIceCandidate(data.candidate);
      });
    } catch (err) {
      console.log('Erro ao iniciar WebRTC (receiver):', err?.message || err);
    }
  }

  const handleAceitar = async () => {
    try {
      if (chamadaId) {
        await chamadaApi.patch(`/chamadas/${chamadaId}`, {
          status: 'atendida',
          atendidoEm: new Date()
        });
      }
      setFase('conversando');
      setStatusTexto('em chamada...');

      await iniciarWebRTCReceiver();

      if (destinoAndroidId) {
        aceitarChamada(destinoAndroidId, chamadaId);
      }
    } catch (err) {
      console.log('Erro ao aceitar chamada:', err?.message || 'Erro');
      navigation.goBack();
    }
  };

  const handleRecusar = async () => {
    try {
      if (chamadaId) {
        await chamadaApi.patch(`/chamadas/${chamadaId}`, {
          status: 'recusada',
          encerradoEm: new Date()
        });
      }
      if (destinoAndroidId) {
        recusarChamada(destinoAndroidId, chamadaId);
      }
      navigation.goBack();
    } catch (err) {
      console.log('Erro ao recusar chamada:', err?.message || 'Erro');
      navigation.goBack();
    }
  };

  const handleEncerrar = async () => {
    try {
      setFase('encerrando');
      setStatusTexto('encerrando...');
      if (chamadaId) {
        await chamadaApi.patch(`/chamadas/${chamadaId}`, {
          encerradoEm: new Date()
        });
      }
      if (destinoAndroidId) {
        encerrarChamada(destinoAndroidId, chamadaId);
      }
      navigation.goBack();
    } catch (err) {
      console.log('Erro ao encerrar chamada:', err?.message || 'Erro');
      navigation.goBack();
    }
  };

  const handleToggleMute = useCallback(() => {
    const stream = MediaManager.getLocalStream();
    if (stream) {
      const tracks = stream.getAudioTracks();
      tracks.forEach((track) => {
        track.enabled = isMuted;
      });
    }
    setIsMuted((prev) => !prev);
  }, [isMuted]);

  const handleToggleSpeaker = useCallback(() => {
    setSpeakerEnabled((prev) => !prev);
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('chamada_aceita', async () => {
        setStatusTexto('em chamada...');
        setFase('conversando');

        await iniciarWebRTC();
      });

      socket.on('chamada_recusada', () => {
        setStatusTexto('chamada recusada');
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      });

      socket.on('chamada_encerrada', () => {
        setStatusTexto('chamada encerrada');
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      });

      socket.on('dispositivo_offline', () => {
        setStatusTexto('dispositivo offline');
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      });
    }

    return () => {
      console.log("[ChamadaScreen] Cleanup executando");
      const socket = getSocket();
      if (socket) {
        socket.off('chamada_aceita');
        socket.off('chamada_recusada');
        socket.off('chamada_encerrada');
        socket.off('dispositivo_offline');
      }
      SignalingBridge.removeOfferListener();
      SignalingBridge.removeAnswerListener();
      SignalingBridge.removeIceCandidateListener();
      PeerConnection.closePeer();
      MediaManager.stopLocalAudio();
      setRemoteStream(null);
    };
  }, []);

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#0F0F1A', '#1A1A2E', '#16213E']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        {remoteStream && (
          <RTCView streamURL={remoteStream.toURL()} style={styles.remoteAudio} />
        )}

        {/* Top bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => {
              if (fase === 'chamando' || fase === 'conversando' || fase === 'encerrando') {
                handleEncerrar();
              } else {
                navigation.goBack();
              }
            }}
          >
            <Ionicons name="chevron-down" size={28} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Center: Avatar + Info */}
        <View style={styles.center}>
          <CallAvatar fase={displayStatus} imageSource={require('../../assets/avatar.png')} />
          <AudioWaves active={displayStatus === 'conversando' && connectionReady} />
          <View style={styles.contactInfo}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.nome}>{nome}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color="rgba(255,255,255,0.5)" />
              <Text style={styles.local}>{local}</Text>
            </View>
          </View>
          <CallStatus status={displayStatus} fontsLoaded={fontsLoaded} />
        </View>

        {/* Bottom: Controls */}
        <View style={styles.bottom}>
          {displayStatus === 'conversando' && connectionReady && (
            <AudioControls
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              speakerEnabled={speakerEnabled}
              onToggleSpeaker={handleToggleSpeaker}
            />
          )}

          <View style={styles.mainButtons}>
            {fase === 'recebendo' && (
              <>
                <CallButton icon="close" color="#DC2626" onPress={handleRecusar} />
                <CallButton icon="call" color="#22C55E" onPress={handleAceitar} />
              </>
            )}

            {(fase === 'chamando' || fase === 'conversando') && (
              <CallButton icon="call" color="#DC2626" onPress={handleEncerrar} style={{ transform: [{ rotate: '135deg' }] }} />
            )}
          </View>
        </View>
      </SafeAreaView>
      <Text style={styles.versionLabel}>InterFacil</Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  remoteAudio: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  topBar: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  contactInfo: {
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nome: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#fff',
  },
  local: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 15,
    color: 'rgba(255,255,255,0.6)',
  },
  bottom: {
    alignItems: 'center',
    paddingBottom: 40,
  },
  mainButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 50,
  },
  versionLabel: {
    position: 'absolute',
    bottom: 8,
    alignSelf: 'center',
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: 'rgba(255,255,255,0.2)',
  },
});
