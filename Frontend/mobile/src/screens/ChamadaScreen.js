import { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Image, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { aceitarChamada, recusarChamada, encerrarChamada, getSocket } from '../services/socketService';
import { chamadaApi } from '../services/api';

export default function ChamadaScreen({ route, navigation }) {
  const params = route.params || {};
  const { nome = 'Desconhecido', local = 'Local não informado', tipo = 'recebendo', deAndroidId, paraAndroidId, chamadaId } = params;
  
  const destinoAndroidId = deAndroidId || paraAndroidId;
  const [fase, setFase] = useState(tipo); // 'recebendo', 'chamando', 'conversando'
  const [statusTexto, setStatusTexto] = useState(tipo === 'chamando' ? 'chamando...' : '');

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    const socket = getSocket();
    if (socket) {
      socket.on('chamada_aceita', () => {
        setStatusTexto('em chamada...');
        setFase('conversando');
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
      const socket = getSocket();
      if (socket) {
        socket.off('chamada_aceita');
        socket.off('chamada_recusada');
        socket.off('chamada_encerrada');
        socket.off('dispositivo_offline');
      }
    };
  }, []);

  const handleAceitar = async () => {
    try {
      if (chamadaId) {
        await chamadaApi.patch(`/chamadas/${chamadaId}`, {
          status: 'atendida',
          atendidoEm: new Date()
        });
      }
      if (destinoAndroidId) {
        aceitarChamada(destinoAndroidId, chamadaId);
      }
      setFase('conversando');
      setStatusTexto('em chamada...');
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

  if (!fontsLoaded) return null;

  return (
    <LinearGradient
      colors={['#2D2D8A', '#1B8A6B', '#E8B800', '#EFE8D5']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>

        <TouchableOpacity style={styles.voltarBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>

        <View style={styles.topo}>
          {(fase === 'chamando' || fase === 'conversando') && (
            <Text style={styles.statusTexto}>{statusTexto}</Text>
          )}
        </View>

        <View style={styles.centro}>
          <View style={styles.avatarCircle}>
            <Image
              source={require('../../assets/avatar.png')}
              style={styles.avatarImg}
            />
          </View>
          <Text style={styles.nome}>{nome}</Text>
          <Text style={styles.local}>{local}</Text>
        </View>

        <View style={styles.botoes}>
          {fase === 'recebendo' && (
            <>
              <TouchableOpacity style={[styles.botaoCircular, styles.botaoVerde]} onPress={handleAceitar}>
                <Ionicons name="call" size={30} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.botaoCircular, styles.botaoVermelho]} onPress={handleRecusar}>
                <Ionicons name="call" size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
              </TouchableOpacity>
            </>
          )}

          {(fase === 'chamando' || fase === 'conversando') && (
            <TouchableOpacity style={[styles.botaoCircular, styles.botaoVermelho]} onPress={handleEncerrar}>
              <Ionicons name="call" size={30} color="#fff" style={{ transform: [{ rotate: '135deg' }] }} />
            </TouchableOpacity>
          )}
        </View>

      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, justifyContent: 'space-between' },
  voltarBtn: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  topo: {
    alignItems: 'center',
    marginTop: 40,
  },
  statusTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 18,
    color: '#E5E5F5',
  },
  centro: {
    alignItems: 'center',
  },
  avatarCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  avatarImg: {
    width: 100,
    height: 100,
  },
  nome: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 26,
    color: '#fff',
    marginBottom: 4,
  },
  local: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#F0F0E0',
  },
  botoes: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 80,
    paddingBottom: 60,
  },
  botaoCircular: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoVerde: { backgroundColor: '#1B8A6B' },
  botaoVermelho: { backgroundColor: '#D32F2F' },
});