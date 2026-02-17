import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../src/stores/authStore';
import { userApi } from '../src/utils/api';
import { BigButton } from '../src/components/BigButton';

export default function Login() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    code: '',
    name: '',
    first_name: '',
    service: 'REPC',
  });

  const handleLogin = async () => {
    if (!code.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre code employé');
      return;
    }

    setIsLoading(true);
    try {
      const user = await userApi.login(code.trim());
      setUser(user);
      router.replace('/(tabs)/home');
    } catch (error: any) {
      if (error.response?.status === 404) {
        Alert.alert(
          'Utilisateur non trouvé',
          'Voulez-vous créer un nouveau compte ?',
          [
            { text: 'Non', style: 'cancel' },
            {
              text: 'Oui',
              onPress: () => {
                setNewUser({ ...newUser, code: code.trim() });
                setIsCreating(true);
              },
            },
          ]
        );
      } else {
        Alert.alert('Erreur', 'Connexion impossible. Vérifiez votre connexion.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.code || !newUser.name || !newUser.first_name) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const user = await userApi.create(newUser);
      setUser(user);
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer le compte');
    } finally {
      setIsLoading(false);
    }
  };

  if (isCreating) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setIsCreating(false)}
            >
              <Ionicons name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>

            <Text style={styles.title}>Nouveau compte</Text>
            <Text style={styles.subtitle}>Créez votre profil opérateur</Text>

            <View style={styles.form}>
              <Text style={styles.label}>Code employé *</Text>
              <TextInput
                style={styles.input}
                value={newUser.code}
                onChangeText={(text) => setNewUser({ ...newUser, code: text })}
                placeholder="Ex: EMP001"
                placeholderTextColor="#666"
                autoCapitalize="characters"
              />

              <Text style={styles.label}>Nom *</Text>
              <TextInput
                style={styles.input}
                value={newUser.name}
                onChangeText={(text) => setNewUser({ ...newUser, name: text })}
                placeholder="Votre nom"
                placeholderTextColor="#666"
                autoCapitalize="words"
              />

              <Text style={styles.label}>Prénom *</Text>
              <TextInput
                style={styles.input}
                value={newUser.first_name}
                onChangeText={(text) => setNewUser({ ...newUser, first_name: text })}
                placeholder="Votre prénom"
                placeholderTextColor="#666"
                autoCapitalize="words"
              />

              <BigButton
                title={isLoading ? 'Création...' : 'Créer mon compte'}
                onPress={handleCreateUser}
                icon="person-add"
                disabled={isLoading}
                style={styles.submitButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>QSE</Text>
            <Text style={styles.logoSubtitle}>Application Industrielle</Text>
          </View>

          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Entrez votre code employé</Text>

          <TextInput
            style={styles.codeInput}
            value={code}
            onChangeText={setCode}
            placeholder="Code employé"
            placeholderTextColor="#666"
            autoCapitalize="characters"
            autoCorrect={false}
          />

          <BigButton
            title={isLoading ? 'Connexion...' : 'Se connecter'}
            onPress={handleLogin}
            icon="log-in"
            disabled={isLoading}
            style={styles.loginButton}
          />

          <TouchableOpacity
            style={styles.createLink}
            onPress={() => setIsCreating(true)}
          >
            <Text style={styles.createLinkText}>Créer un nouveau compte</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 72,
    fontWeight: '900',
    color: '#FF6B00',
  },
  logoSubtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 32,
  },
  codeInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    padding: 20,
    fontSize: 24,
    color: '#FFF',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 4,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#444',
  },
  loginButton: {
    marginBottom: 24,
  },
  createLink: {
    alignItems: 'center',
    padding: 16,
  },
  createLinkText: {
    fontSize: 16,
    color: '#FF6B00',
    textDecorationLine: 'underline',
  },
  form: {
    marginTop: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#FFF',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  submitButton: {
    marginTop: 16,
  },
});
