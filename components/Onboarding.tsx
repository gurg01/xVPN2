import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/colors';

const { width, height } = Dimensions.get('window');

const DATA = [
  {
    id: '1',
    title: 'Deep Space Security',
    description: 'Protect your data with galactic-grade encryption.',
    image: require('@/assets/images/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Beyond Borders',
    description: 'Access 50+ global server locations with one tap.',
    image: require('@/assets/images/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Zero-Log Policy',
    description: 'Your browsing history stays in the void. We never track you.',
    image: require('@/assets/images/onboarding-3.png'),
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    setCurrentIndex(viewableItems[0].index);
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View style={styles.slide}>
        <Image source={item.image} style={styles.image} resizeMode="cover" />
        <View style={styles.content}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={{ flex: 3 }}>
        <FlatList
          data={DATA}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
            useNativeDriver: false,
          })}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
          ref={slidesRef}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.paginator}>
          {DATA.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                style={[styles.dot, { width: dotWidth, opacity }]}
                key={i.toString()}
              />
            );
          })}
        </View>

        <Pressable style={styles.button} onPress={onComplete}>
          <Text style={styles.buttonText}>Get Started</Text>
        </Pressable>
        
        <View style={styles.authLink}>
          <Text style={styles.authText}>Have an account? </Text>
          <Pressable onPress={onComplete}>
            <Text style={styles.authAction}>Sign In</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  slide: {
    width,
    flex: 1,
  },
  image: {
    width,
    height: height * 0.6,
  },
  content: {
    paddingHorizontal: 40,
    marginTop: 20,
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 28,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingBottom: 50,
    paddingHorizontal: 40,
  },
  paginator: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.dark.accent,
    marginHorizontal: 8,
  },
  button: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: 18,
    borderRadius: 30,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
    color: '#000',
  },
  authLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  authText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: '#AAA',
  },
  authAction: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: Colors.dark.accent,
  },
});
