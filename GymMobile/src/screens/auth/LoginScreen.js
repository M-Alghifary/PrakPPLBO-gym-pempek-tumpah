import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../api/authApi';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Email dan password harus diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('name', data.name || '');
      await AsyncStorage.setItem('role', data.role || '');
      await AsyncStorage.setItem('email', data.email || '');
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.page}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>LOGIN</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="email..."
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="password..."
          placeholderTextColor="#666"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>LOGIN</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.link}>
          Belum punya akun?{' '}
          <Text
            style={styles.linkGreen}
            onPress={() => navigation.navigate('Register')}
          >
            REGISTER
          </Text>
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '85%',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 4,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 30,
    backgroundColor: '#1e1e1e',
    color: '#fff',
    fontSize: 14,
  },
  button: {
    width: '100%',
    height: 52,
    borderRadius: 30,
    backgroundColor: '#4caf7d',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 2,
  },
  error: {
    color: '#ff6b6b',
    fontSize: 13,
    textAlign: 'center',
  },
  link: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 8,
  },
  linkGreen: {
    color: '#4caf7d',
    fontWeight: 'bold',
  },
});