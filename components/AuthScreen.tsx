import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, Platform, ActivityIndicator, KeyboardAvoidingView, ScrollView, Animated, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useAuth } from '@/lib/auth-context';
import Colors from '@/constants/colors';

const { width } = Dimensions.get('window');

const FloatingInput = ({ label, value, onChangeText, secureTextEntry, ...props }: any) => {
  const [isFocused, setIsFocused] = useState(false);
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: isFocused || value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [isFocused, value]);

  const labelStyle = {
    position: 'absolute',
    left: 14,
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [18, -10],
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [14, 10],
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [Colors.dark.textMuted, Colors.dark.accent],
    }),
    backgroundColor: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: ['transparent', '#0A0A1A'],
    }),
    paddingHorizontal: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 4],
    }),
    zIndex: 1,
  };

  return (
    <View style={styles.inputGroup}>
      <Animated.Text style={labelStyle}>{label}</Animated.Text>
      <View style={[styles.inputContainer, isFocused && { borderColor: Colors.dark.accent }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={secureTextEntry}
          {...props}
        />
      </View>
    </View>
  );
};

export function AuthScreen() {
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async () => {
    setError(null);

    if (mode === 'forgot') {
      await handleForgotPassword();
      return;
    }

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (mode === 'signup') {
      if (!displayName.trim()) {
        setError('Please enter a display name');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      if (mode === 'login') {
        const result = await login(email, password);
        if (!result.success) {
          setError(result.message || 'Invalid email or password');
        }
      } else {
        const result = await signup(email, password, displayName);
        if (!result.success) {
          setError(result.message || 'Account already exists with this email');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address first');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Password reset instructions sent to your email');
        setMode('login');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoRing}>
                <Ionicons name="shield-checkmark" size={36} color={Colors.dark.accent} />
              </View>
            </View>
            <Text style={styles.brand}>xVPN</Text>
            <Text style={styles.tagline}>{mode === 'forgot' ? 'Reset Password' : 'Deep Space Security'}</Text>
          </View>

          <View style={styles.formCard}>
            {mode !== 'forgot' && (
              <View style={styles.tabRow}>
                <Pressable
                  style={[styles.tab, mode === 'login' && styles.tabActive]}
                  onPress={() => { setMode('login'); setError(null); }}
                >
                  <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>Sign In</Text>
                </Pressable>
                <Pressable
                  style={[styles.tab, mode === 'signup' && styles.tabActive]}
                  onPress={() => { setMode('signup'); setError(null); }}
                >
                  <Text style={[styles.tabText, mode === 'signup' && styles.tabTextActive]}>Sign Up</Text>
                </Pressable>
              </View>
            )}

            {mode === 'signup' && (
              <FloatingInput
                label="DISPLAY NAME"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
              />
            )}

            <FloatingInput
              label="EMAIL"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {mode !== 'forgot' && (
              <FloatingInput
                label="PASSWORD"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            )}

            {mode === 'signup' && (
              <FloatingInput
                label="CONFIRM PASSWORD"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
            )}

            {mode === 'login' && (
              <Pressable style={styles.forgotPassword} onPress={() => setMode('forgot')}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </Pressable>
            )}

            {mode === 'forgot' && (
              <Pressable style={styles.forgotPassword} onPress={() => setMode('login')}>
                <Text style={styles.forgotPasswordText}>Back to Sign In</Text>
              </Pressable>
            )}

            {error && error.trim() !== '' && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={14} color={Colors.dark.accentCoral} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Pressable
              style={[styles.submitButton, loading && styles.submitButtonLoading]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name={mode === 'login' ? 'log-in-outline' : mode === 'signup' ? 'person-add-outline' : 'send-outline'} size={18} color="#000" />
                  <Text style={styles.submitText}>
                    {mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          <View style={styles.features}>
            {['Military-grade encryption', 'Zero-log policy', '50+ server locations'].map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={14} color={Colors.dark.success} />
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 32,
    color: Colors.dark.accent,
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 6,
    letterSpacing: 2,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  tabText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  tabTextActive: {
    color: Colors.dark.accent,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 8,
    color: Colors.dark.textMuted,
    letterSpacing: 3,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: Colors.dark.text,
    paddingVertical: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: Colors.dark.accent,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 46, 99, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: Colors.dark.accentCoral,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dark.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  submitButtonLoading: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: '#000',
    letterSpacing: 1,
  },
  features: {
    marginTop: 28,
    gap: 10,
    alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 240, 255, 0.06)',
    borderWidth: 2,
    borderColor: 'rgba(0, 240, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 32,
    color: Colors.dark.accent,
    letterSpacing: 6,
  },
  tagline: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 13,
    color: Colors.dark.textMuted,
    marginTop: 6,
    letterSpacing: 2,
  },
  formCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 24,
    gap: 16,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: 'rgba(0, 240, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 240, 255, 0.2)',
  },
  tabText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: Colors.dark.textMuted,
  },
  tabTextActive: {
    color: Colors.dark.accent,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 8,
    color: Colors.dark.textMuted,
    letterSpacing: 3,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 14,
    color: Colors.dark.text,
    paddingVertical: 14,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  forgotPasswordText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: Colors.dark.accent,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 46, 99, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 99, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: Colors.dark.accentCoral,
    flex: 1,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.dark.accent,
    borderRadius: 14,
    paddingVertical: 16,
    marginTop: 4,
  },
  submitButtonLoading: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: 'Orbitron_700Bold',
    fontSize: 13,
    color: '#000',
    letterSpacing: 1,
  },
  features: {
    marginTop: 28,
    gap: 10,
    alignItems: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontFamily: 'SpaceGrotesk_400Regular',
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
});
