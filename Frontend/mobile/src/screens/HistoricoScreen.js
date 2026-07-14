import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { chamadaApi } from '../services/api';

export default function HistoricoScreen() {
  const insets = useSafeAreaInsets();
  const [chamadas, setChamadas] = useState([]);
  const [erro, setErro] = useState('');
  const [meuAndroidId, setMeuAndroidId] = useState(null);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    carregarHistorico();
  }, []);

  const obterContatoDaChamada = (chamada) => {
    if (!chamada.origem || !chamada.destino) return chamada.origem || chamada.destino;
    return chamada.origem.androidId === meuAndroidId ? chamada.destino : chamada.origem;
  };

  const obterDirecaoDaChamada = (chamada) => {
    if (!chamada.origem) return 'recebida';
    return chamada.origem.androidId === meuAndroidId ? 'realizada' : 'recebida';
  };

  const carregarHistorico = async () => {
    try {
      const androidId = await AsyncStorage.getItem('androidId');
      if (!androidId) {
        setErro('Usuário não identificado');
        return;
      }
      setMeuAndroidId(androidId);
      const response = await chamadaApi.get(`/chamadas/por-dispositivo/${androidId}`);
      setChamadas(response.data);
      setErro('');
    } catch (e) {
      console.log('Erro ao carregar histórico:', e.message);
      setErro('Erro ao carregar histórico. Verifique sua conexão.');
    }
  };

  const formatarHora = (data) => {
    if (!data) return '';
    return new Date(data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatarData = (data) => {
    if (!data) return '';
    const hoje = new Date();
    const ontem = new Date();
    ontem.setDate(hoje.getDate() - 1);
    const d = new Date(data);

    if (d.toDateString() === hoje.toDateString()) return 'Hoje';
    if (d.toDateString() === ontem.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
  };

  const corStatus = (status) => {
    switch (status) {
      case 'atendida': return '#2E7D32';
      case 'nao_atendida': return '#D32F2F';
      case 'recusada': return '#F57C00';
      default: return '#888';
    }
  };

  const textoStatus = (status) => {
    switch (status) {
      case 'atendida': return 'ATENDIDA';
      case 'nao_atendida': return 'NÃO ATENDIDA';
      case 'recusada': return 'RECUSADA';
      default: return 'FINALIZADA';
    }
  };

  // Agrupar chamadas por data
  const agruparPorData = () => {
    const grupos = {};
    chamadas.forEach(c => {
      const data = formatarData(c.iniciadoEm);
      if (!grupos[data]) grupos[data] = [];
      grupos[data].push(c);
    });
    return Object.entries(grupos).map(([data, items]) => ({ data, items }));
  };

  if (!fontsLoaded) return null;

  const grupos = agruparPorData();

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Tabela header */}
      <View style={styles.tabelaHeader}>
        <Text style={styles.tabelaHeaderTexto}>Morador / Local</Text>
        <Text style={styles.tabelaHeaderTexto}>Status / Horário</Text>
      </View>

      {erro ? (
        <Text style={styles.erro}>{erro}</Text>
      ) : (
        <FlatList
        data={grupos}
        keyExtractor={(item) => item.data}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 70 }}
        renderItem={({ item: grupo }) => (
          <View>
            <Text style={styles.dataLabel}>{grupo.data}</Text>
            {grupo.items.map(chamada => {
              const contato = obterContatoDaChamada(chamada);
              const direcao = obterDirecaoDaChamada(chamada);
              return (
              <View key={chamada.id} style={styles.chamadaCard}>
                <View style={styles.chamadaEsquerda}>
                  <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
                  <View>
                    <Text style={styles.chamadaNome}>
                      {contato?.residencia?.usuario?.nome || contato?.nomeDispositivo || 'Desconhecido'}
                    </Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeTexto}>
                        {contato?.residencia?.identificador || 'Portaria'}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.chamadaDireita}>
                  <Text style={[styles.statusTexto, { color: corStatus(chamada.status) }]}>
                    {textoStatus(chamada.status)}
                  </Text>
                  <Text style={styles.horaTexto}>
                    {formatarHora(chamada.iniciadoEm)}
                  </Text>
                  <Text style={styles.direcaoTexto}>
                    {direcao === 'realizada' ? 'Realizada' : 'Recebida'}
                  </Text>
                </View>
              </View>
              );
            })}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma chamada encontrada</Text>
        }
      />
      )}


    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F0F0F0' },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: { width: 120, height: 36 },
  tabelaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#3949AB',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabelaHeaderTexto: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    fontSize: 13,
  },
  dataLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#444',
    marginTop: 16,
    marginBottom: 8,
    marginLeft: 12,
  },
  chamadaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 12,
    marginBottom: 8,
    borderRadius: 12,
    padding: 12,
  },
  chamadaEsquerda: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  chamadaNome: {
    fontFamily: 'Poppins_600SemiBold',
    fontSize: 14,
    color: '#222',
    marginBottom: 4,
  },
  badge: {
    backgroundColor: '#3949AB',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeTexto: {
    fontFamily: 'Poppins_400Regular',
    color: '#fff',
    fontSize: 11,
  },
  chamadaDireita: { alignItems: 'flex-end' },
  statusTexto: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 12,
    marginBottom: 2,
  },
  horaTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
    color: '#888',
  },
  direcaoTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: '#555',
    marginTop: 2,
  },
  erro: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    color: '#D32F2F',
    marginTop: 32,
    marginHorizontal: 20,
  },
  vazio: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
  },
 
});