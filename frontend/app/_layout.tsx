import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../src/stores/authStore';
import { useConfigStore } from '../src/stores/configStore';
import { useFicheStore } from '../src/stores/ficheStore';
import { View, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  const { loadUser, isLoading: authLoading } = useAuthStore();
  const { loadConfig, isLoading: configLoading } = useConfigStore();
  const { loadOfflineFiches } = useFicheStore();

  useEffect(() => {
    loadUser();
    loadConfig();
    loadOfflineFiches();
  }, []);

  if (authLoading || configLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#FFF',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#0D0D0D' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ title: 'Connexion', headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="new-fiche" options={{ title: 'Nouvelle déclaration', presentation: 'modal' }} />
        <Stack.Screen name="fiche-detail" options={{ title: 'Détail fiche' }} />
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
