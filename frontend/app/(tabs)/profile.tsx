import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useAuthStore } from '../../src/stores/authStore';
import {
  clearBackendUrlOverride,
  getCurrentBackendUrl,
  setBackendUrlOverride,
} from '../../src/utils/backendConfig';

export default function Profile() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const [backendUrl, setBackendUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBackendUrl(getCurrentBackendUrl());
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const checkBackend = async (urlToCheck: string) => {
    const normalized = /^https?:\/\//.test(urlToCheck) ? urlToCheck : `http://${urlToCheck}`;
    await axios.get(`${normalized.replace(/\/+$/, '')}/api/`, { timeout: 8000 });
  };

  const handleSaveBackend = async () => {
    try {
      setIsSaving(true);
      await checkBackend(backendUrl);
      const saved = await setBackendUrlOverride(backendUrl);
      setBackendUrl(saved);
      Alert.alert('Backend enregistré', 'Nouvelle URL backend enregistrée.');
    } catch (e) {
      Alert.alert('Erreur backend', 'URL invalide ou backend inaccessible.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetBackend = async () => {
    await clearBackendUrlOverride();
    const current = getCurrentBackendUrl();
    setBackendUrl(current);
    Alert.alert('Backend réinitialisé', `URL active: ${current}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.userCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.first_name?.[0]}{user?.name?.[0]}
          </Text>
        </View>
        <Text style={styles.userName}>
          {user?.first_name} {user?.name}
        </Text>
        <Text style={styles.userCode}>Code: {user?.code}</Text>
        <Text style={styles.userService}>{user?.service}</Text>
      </View>

      <View style={styles.menu}>
        <Text style={styles.sectionTitle}>Backend (modifiable après installation)</Text>

        <View style={styles.backendCard}>
          <Text style={styles.backendLabel}>URL backend</Text>
          <TextInput
            value={backendUrl}
            onChangeText={setBackendUrl}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="https://ton-backend.com"
            placeholderTextColor="#777"
            style={styles.backendInput}
          />

          <View style={styles.backendButtons}>
            <TouchableOpacity style={styles.primaryBtn} onPress={handleSaveBackend} disabled={isSaving}>
              <Text style={styles.primaryBtnText}>{isSaving ? 'Validation...' : 'Tester + Enregistrer'}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.secondaryBtn} onPress={handleResetBackend}>
              <Text style={styles.secondaryBtnText}>Réinitialiser</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#F44336" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>QSE App v1.0.0</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  userCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#FFF' },
  userName: { fontSize: 24, fontWeight: '700', color: '#FFF', marginBottom: 4 },
  userCode: { fontSize: 16, color: '#FF6B00', marginBottom: 4 },
  userService: { fontSize: 14, color: '#888' },
  menu: { padding: 20 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  backendCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333',
  },
  backendLabel: { color: '#FFF', fontWeight: '600', marginBottom: 8 },
  backendInput: {
    backgroundColor: '#101010',
    color: '#FFF',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backendButtons: { flexDirection: 'row', gap: 10, marginTop: 12 },
  primaryBtn: {
    backgroundColor: '#FF6B00',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  primaryBtnText: { color: '#111', fontWeight: '700' },
  secondaryBtn: {
    borderColor: '#555',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  secondaryBtnText: { color: '#FFF', fontWeight: '600' },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 20,
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#F44336', marginLeft: 8 },
  appInfo: { alignItems: 'center', padding: 20, paddingBottom: 40 },
  appVersion: { fontSize: 14, color: '#666' },
});
