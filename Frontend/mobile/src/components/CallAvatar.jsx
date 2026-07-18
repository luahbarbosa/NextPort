import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, View } from 'react-native';

export default function CallAvatar({ fase, imageSource }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const borderAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (fase === 'chamando') {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1200,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }

    if (fase === 'conversando') {
      const rotate = Animated.loop(
        Animated.timing(borderAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      rotate.start();
      return () => rotate.stop();
    }

    pulseAnim.setValue(1);
    borderAnim.setValue(0);
  }, [fase]);

  const pulseStyle = {
    transform: [{ scale: pulseAnim }],
  };

  const spinInterpolate = borderAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.wrapper}>
      {fase === 'conversando' && (
        <Animated.View
          style={[
            styles.rotatingBorder,
            { transform: [{ rotate: spinInterpolate }] },
          ]}
        >
          <View style={styles.dashCircle} />
        </Animated.View>
      )}
      <Animated.View
        style={[
          styles.avatarCircle,
          fase === 'chamando' && pulseStyle,
          fase === 'conversando' && styles.shadowGlow,
        ]}
      >
        <Image source={imageSource} style={styles.avatarImg} />
      </Animated.View>
    </View>
  );
}

const CIRCLE_SIZE = 140;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: CIRCLE_SIZE + 30,
    height: CIRCLE_SIZE + 30,
  },
  avatarCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  shadowGlow: {
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 10,
  },
  avatarImg: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  rotatingBorder: {
    position: 'absolute',
    width: CIRCLE_SIZE + 24,
    height: CIRCLE_SIZE + 24,
    borderRadius: (CIRCLE_SIZE + 24) / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dashCircle: {
    width: CIRCLE_SIZE + 24,
    height: CIRCLE_SIZE + 24,
    borderRadius: (CIRCLE_SIZE + 24) / 2,
    borderWidth: 3,
    borderColor: '#4ADE80',
    borderStyle: 'dashed',
  },
});
