import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import CallButton from './CallButton';

export default function AudioControls({ isMuted, onToggleMute, speakerEnabled, onToggleSpeaker }) {
  return (
    <View style={styles.container}>
      <CallButton
        icon={isMuted ? 'mic-off' : 'mic'}
        color={isMuted ? '#DC2626' : 'rgba(255,255,255,0.2)'}
        size={55}
        onPress={onToggleMute}
      />
      <CallButton
        icon={speakerEnabled ? 'volume-high' : 'volume-medium'}
        color={speakerEnabled ? '#4ADE80' : 'rgba(255,255,255,0.2)'}
        size={55}
        onPress={onToggleSpeaker}
      />
    </View>
  );
}

export function AudioWaves({ active }) {
  const anims = useRef([...Array(4)].map(() => new Animated.Value(0))).current;
  const heights = [20, 35, 28, 18];

  useEffect(() => {
    if (!active) {
      anims.forEach((a) => a.setValue(0));
      return;
    }
    const loops = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 500 + i * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 500 + i * 100,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [active]);

  return (
    <View style={styles.waveContainer}>
      {anims.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.waveBar,
            {
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, heights[i]],
              }),
              opacity: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 0.9],
              }),
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 30,
    marginBottom: 20,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    height: 40,
    marginTop: 8,
  },
  waveBar: {
    width: 5,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
});
