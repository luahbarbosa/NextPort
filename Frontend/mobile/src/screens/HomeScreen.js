import { useEffect, useState } from 'react';
import {
    View, Text, StyleSheet, FlatList,
    TextInput, TouchableOpacity, SafeAreaView, Image
} from 'react-native';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import api from '../services/api';

export default function HomeScreen() {
    const [dispositivos, setDispositivos] = useState([]);
    const [busca, setBusca] = useState('');
    const [portaria, setPortaria] = useState(null);

    const [fontsLoaded] = useFonts({
        Poppins_400Regular,
        Poppins_600SemiBold,
        Poppins_700Bold,
    });

    useEffect(() => {
        carregarDispositivos();
    }, []);

    const carregarDispositivos = async () => {
        try {
            const response = await api.get('/dispositivos');
            const todos = response.data;
            const port = todos.find(d => d.tipo === 'portaria');
            const residencias = todos.filter(d => d.tipo === 'residencia');
            setPortaria(port);
            setDispositivos(residencias);
        } catch (e) {
            console.log('Erro ao carregar dispositivos:', e.message);
        }
    };

    const isOnline = (ultimoPing) => {
        if (!ultimoPing) return false;
        const diff = (new Date() - new Date(ultimoPing)) / 1000;
        return diff < 60;
    };

    const filtrados = dispositivos.filter(d =>
        d.nomeDispositivo?.toLowerCase().includes(busca.toLowerCase()) ||
        d.residencia?.identificador?.toLowerCase().includes(busca.toLowerCase())
    );

    if (!fontsLoaded) return null;

    const renderContato = ({ item }) => (
        <TouchableOpacity
            style={styles.contatoCard}
            onPress={() => alert(`Chamando ${item.nomeDispositivo}...`)}
            disabled={!isOnline(item.ultimoPing)}
        >
            <Image source={require('../../assets/avatar.png')} style={styles.avatar} />
            <View style={styles.contatoInfo}>
                <Text style={styles.contatoNome}>{item.nomeDispositivo}</Text>
                <View style={styles.badges}>
                    <View style={styles.badgeApto}>
                        <Text style={styles.badgeAptoTexto}>
                            {item.residencia?.identificador || 'Sem residência'}
                        </Text>
                    </View>
                    <View style={[styles.badgeStatus, isOnline(item.ultimoPing) ? styles.online : styles.offline]}>
                        <Text style={styles.badgeStatusTexto}>
                            {isOnline(item.ultimoPing) ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                </View>
            </View>
            <Image
                source={isOnline(item.ultimoPing)
                    ? require('../../assets/telefone-online.png')
                    : require('../../assets/telefone-offline.png')}
                style={[styles.icone, !isOnline(item.ultimoPing) && { opacity: 0.3 }]}
            />
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>

            {/* Header com logo */}
            <View style={styles.header}>
                <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            </View>

            {/* Boas vindas */}
            <View style={styles.boasVindas}>
                <Image source={require('../../assets/avatar.png')} style={styles.avatarGrande} />
                <View>
                    <Text style={styles.bemVindo}>Bem-vindo,</Text>
                    <Text style={styles.nomeUsuario}>Gabriel Carvalho</Text>
                </View>
            </View>

            {/* Portaria */}
            {portaria && (
                <TouchableOpacity style={styles.portariaCard}>
                    <View>
                        <Text style={styles.portariaNome}>Portaria</Text>
                        <Text style={styles.portariaStatus}>
                            {isOnline(portaria.ultimoPing) ? 'Online' : 'Offline'}
                        </Text>
                    </View>
                    <Image source={require('../../assets/telefone-online.png')} style={styles.icone} />
                </TouchableOpacity>
            )}

            {/* Contatos */}
            <Text style={styles.secaoTitulo}>Contatos</Text>

            {/* Busca */}
            <View style={styles.buscaContainer}>
                <Image source={require('../../assets/search.png')} style={styles.searchIcone} />
                <TextInput
                    style={styles.buscaInput}
                    placeholder="Buscar contato..."
                    placeholderTextColor="#999"
                    value={busca}
                    onChangeText={setBusca}
                />
            </View>

            <FlatList
                data={filtrados}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderContato}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListEmptyComponent={
                    <Text style={styles.vazio}>Nenhum contato encontrado</Text>
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

    boasVindas: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        gap: 12,
        marginBottom: 8,
    },
    avatarGrande: { width: 48, height: 48, borderRadius: 24 },
    bemVindo: { fontFamily: 'Poppins_400Regular', fontSize: 13, color: '#888' },
    nomeUsuario: { fontFamily: 'Poppins_700Bold', fontSize: 16, color: '#222' },

    portariaCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        margin: 12,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A5D6A7',
    },
    portariaNome: { fontFamily: 'Poppins_600SemiBold', fontSize: 16, color: '#2E7D32' },
    portariaStatus: { fontFamily: 'Poppins_400Regular', fontSize: 12, color: '#4CAF50' },

    secaoTitulo: {
        fontFamily: 'Poppins_700Bold',
        fontSize: 18, color: '#222',
        marginLeft: 12, marginBottom: 8,
    },

    buscaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 24,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: '#DDD',
        height: 44,
    },
    searchIcone: { width: 18, height: 18, marginRight: 8, tintColor: '#999' },
    buscaInput: {
        flex: 1, fontSize: 14,
        fontFamily: 'Poppins_400Regular',
        color: '#333',
    },

    contatoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        marginHorizontal: 12,
        marginBottom: 8,
        borderRadius: 12,
        padding: 12,
        gap: 12,
    },
    avatar: { width: 40, height: 40, borderRadius: 20 },
    contatoInfo: { flex: 1 },
    contatoNome: { fontFamily: 'Poppins_600SemiBold', fontSize: 15, color: '#222', marginBottom: 4 },
    badges: { flexDirection: 'row', gap: 6 },
    badgeApto: {
        backgroundColor: '#3949AB',
        paddingHorizontal: 8, paddingVertical: 2,
        borderRadius: 12,
    },
    badgeAptoTexto: { fontFamily: 'Poppins_400Regular', color: '#fff', fontSize: 11 },
    badgeStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    online: { backgroundColor: '#4CAF50' },
    offline: { backgroundColor: '#FFA726' },
    badgeStatusTexto: { fontFamily: 'Poppins_400Regular', color: '#fff', fontSize: 11 },
    icone: { width: 28, height: 28 },


    vazio: {
        fontFamily: 'Poppins_400Regular',
        textAlign: 'center', color: '#888', marginTop: 32,
    },
});