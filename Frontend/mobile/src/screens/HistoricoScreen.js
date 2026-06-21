import { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  SafeAreaView, Image
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { chamadaApi } from '../services/api';

export default function HistoricoScreen() {
  const [chamadas, setChamadas] = useState([]);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    carregarHistorico();
  }, []);

  const carregarHistorico = async () => {
    try {
      const response = await chamadaApi.get('/chamadas');
      setChamadas(response.data);
    } catch (e) {
      console.log('Erro ao carregar histórico:', e.message);
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

      <FlatList
        data={grupos}
        keyExtractor={(item) => item.data}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item: grupo }) => (
          <View>
            <Text style={styles.dataLabel}>{grupo.data}</Text>
            {grupo.items.map(chamada => (
              <View key={chamada.id} style={styles.chamadaCard}>
                <View style={styles.chamadaEsquerda}>
                  <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
                  <View>
                    <Text style={styles.chamadaNome}>
                      {chamada.origem?.nomeDispositivo || 'Desconhecido'}
                    </Text>
                    <View style={styles.badge}>
                      <Text style={styles.badgeTexto}>
                        {chamada.origem?.residencia?.identificador || 'Portaria'}
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
                </View>
              </View>
            ))}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.vazio}>Nenhuma chamada encontrada</Text>
        }
      />


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
  vazio: {
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
  },
 
});