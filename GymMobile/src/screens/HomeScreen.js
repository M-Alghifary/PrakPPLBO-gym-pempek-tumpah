import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>🏋️ Lenjer Fit</Text>
      <Text style={styles.sub}>Selamat Datang!</Text>
      <TouchableOpacity style={styles.button} onPress={handleLogout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  text: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  sub: {
    color: '#aaa',
    fontSize: 16,
  },
  button: {
    marginTop: 20,
    backgroundColor: '#4caf7d',
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 30,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});