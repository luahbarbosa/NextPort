import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Poppins_400Regular, Poppins_600SemiBold, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { authApi } from '../services/api';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.post('/auth/login', { email, senha });
      Alert.alert('Sucesso!', 'Login realizado com sucesso');
      navigation.replace('MainTabs');
    } catch (e) {
      Alert.alert('Erro', 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  if (!fontsLoaded) return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.card}>
        <Text style={styles.subtitulo}>Vamos fazer login</Text>
        <Text style={styles.titulo}>Bem vindo!</Text>

        <TextInput
          style={styles.input}
          placeholder="E-mail"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View style={styles.inputSenhaContainer}>
          <TextInput
            style={styles.inputSenha}
            placeholder="senha"
            placeholderTextColor="#999"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!mostrarSenha}
          />
          <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)}>
            <Ionicons
              name={mostrarSenha ? 'eye-off' : 'eye'}
              size={20}
              color="#888"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.linkEsqueceu}>
          <Text style={styles.linkEsqueceuTexto}>esqueceu a senha?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botaoEntrar} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.botaoEntrarTexto}>Entrar</Text>
          }
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  card: {
    flex: 1,
    backgroundColor: '#F7F7F7',
    padding: 28,
    paddingTop: 80,
  },
  subtitulo: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#1A1A4D',
    textAlign: 'center',
    marginBottom: 32,
  },
  titulo: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 32,
    color: '#1A1A4D',
    marginBottom: 48,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 58,
    paddingHorizontal: 20,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  inputSenhaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    height: 58,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 12,
  },
  inputSenha: {
    flex: 1,
    fontFamily: 'Poppins_400Regular',
    fontSize: 16,
    color: '#333',
  },
  linkEsqueceu: {
    alignSelf: 'flex-end',
    marginBottom: 40,
  },
  linkEsqueceuTexto: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
    color: '#3B82F6',
  },
  botaoEntrar: {
    backgroundColor: '#2D2D7A',
    borderRadius: 14,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
  },
  botaoEntrarTexto: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#fff',
    fontSize: 16,
  },
});