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
import { register } from '../../api/authApi';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Semua field harus diisi');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password);
      navigation.navigate('Login');
    } catch (err) {
        console.error('Register error:', JSON.stringify(err.response?.data));
        const data = err.response?.data;
        if (data?.errors) {
          // Spring validation errors (array)
          const messages = Object.values(data.errors).join(', ');
          setError(messages);
        } else {
          setError(data?.message || 'Registrasi gagal');
        }
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
        <Text style={styles.title}>REGISTER</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder="nama..."
          placeholderTextColor="#666"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="email..."
          placeholderTextColor="#666"
          keyboardType="email-address"
          autoCapitalize="none"
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
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>REGISTER</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.link}>
          Sudah punya akun?{' '}
          <Text
            style={styles.linkGreen}
            onPress={() => navigation.navigate('Login')}
          >
            LOGIN
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