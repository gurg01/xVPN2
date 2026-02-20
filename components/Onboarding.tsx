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
    title: 'Ultimate VPN protection',
    description: "ExpressVPN's Multi protocol is designed to keep you safe from future threats.",
    image: require('@assets/image_1771546411215.png'),
  },
  {
    id: '2',
    title: 'Ultra-fast servers',
    description: "Find out why we're called ExpressVPN and say goodbye to internet speed restrictions.",
    image: require('@assets/image_1771546421455.png'),
  },
  {
    id: '3',
    title: '200+ secure locations',
    description: 'Home or away, you can appear anywhere in the world with our global server network.',
    image: require('@assets/image_1771546433539.png'),
  },
];

interface OnboardingProps {
  onComplete: () => void;
  onSignIn?: () => void;
}

export function Onboarding({ onComplete, onSignIn }: OnboardingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item, index }: { item: any, index: number }) => {
    return (
      <View style={styles.slide}>
        <View style={styles.visualContainer}>
          <View style={styles.glowContainer}>
            <View style={[styles.glow, { opacity: 0.3 }]} />
            <View style={[styles.glow, { transform: [{ scale: 0.7 }], opacity: 0.5 }]} />
          </View>
          <Ionicons 
            name={index === 0 ? "shield-half" : index === 1 ? "speedometer" : "eye-off"} 
            size={120} 
            color={Colors.dark.accent} 
          />
        </View>
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
              outputRange: [8, 24, 8],
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
          <Pressable onPress={onSignIn || onComplete}>
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
    backgroundColor: '#050510',
  },
  slide: {
    width,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  visualContainer: {
    width: width * 0.8,
    height: width * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  glowContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: Colors.dark.accent,
    filter: 'blur(80px)',
  },
  content: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 28,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 16,
    letterSpacing: 1,
  },
  description: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 60,
    paddingHorizontal: 40,
  },
  paginator: {
    flexDirection: 'row',
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.accent,
    marginHorizontal: 4,
  },
  button: {
    backgroundColor: Colors.dark.accent,
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.dark.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 16,
    color: '#000',
    letterSpacing: 1,
  },
  authLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  authText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.5)',
  },
  authAction: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: Colors.dark.accent,
  },
});
