import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

const STATUS_MAP = {
  recebendo: { label: 'Chamada recebida', icon: 'call' },
  chamando: { label: 'Chamando', icon: 'call-outline' },
  conectando: { label: 'Conectando', icon: 'sync' },
  conversando: { label: 'Em chamada', icon: 'mic' },
  encerrando: { label: 'Encerrando', icon: 'call' },
};

export default function CallStatus({ status, fontsLoaded }) {
  const dotAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (status === 'chamando' || status === 'conectando') {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0,
            duration: 600,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    }
    dotAnim.setValue(0);
  }, [status]);

  if (!fontsLoaded) return null;

  const info = STATUS_MAP[status] || { label: status, icon: 'call' };
  const opacity1 = dotAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] });
  const opacity2 = { opacity: dotAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 0.7, 1] }) };
  const opacity3 = dotAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.3] });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{info.label}</Text>
      {(status === 'chamando' || status === 'conectando') && (
        <View style={styles.dots}>
          <Animated.Text style={[styles.dot, { opacity: opacity1 }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, opacity2]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: opacity3 }]}>.</Animated.Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  label: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 18,
    color: 'rgba(255,255,255,0.8)',
  },
  dots: {
    flexDirection: 'row',
    marginLeft: 4,
  },
  dot: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 24,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
});
