import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/stores/authStore';
import { useFicheStore } from '../../src/stores/ficheStore';
import { BigButton } from '../../src/components/BigButton';
import { statsApi } from '../../src/utils/api';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { offlineFiches, resetCurrentFiche } = useFicheStore();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const data = await statsApi.get();
      setStats(data);
    } catch (e) {
      console.log('Could not load stats');
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const handleNewFiche = () => {
    resetCurrentFiche();
    router.push('/new-fiche');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B00"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Bonjour,</Text>
            <Text style={styles.userName}>
              {user?.first_name} {user?.name}
            </Text>
          </View>
          <View style={styles.badge}>
            <Ionicons name="shield-checkmark" size={24} color="#FF6B00" />
          </View>
        </View>

        {/* Main Action */}
        <BigButton
          title="NOUVELLE DÉCLARATION"
          onPress={handleNewFiche}
          icon="add-circle"
          style={styles.mainButton}
        />

        {/* Offline indicator */}
        {offlineFiches.length > 0 && (
          <View style={styles.offlineCard}>
            <Ionicons name="cloud-offline" size={24} color="#FF9800" />
            <View style={styles.offlineInfo}>
              <Text style={styles.offlineTitle}>
                {offlineFiches.length} fiche(s) en attente
              </Text>
              <Text style={styles.offlineSubtitle}>
                Seront envoyées dès connexion
              </Text>
            </View>
          </View>
        )}

        {/* Stats */}
        {stats && (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Statistiques</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{stats.total}</Text>
                <Text style={styles.statLabel}>Total fiches</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#1B3A1B' }]}>
                <Text style={[styles.statNumber, { color: '#4CAF50' }]}>
                  {stats.by_status?.envoye || 0}
                </Text>
                <Text style={styles.statLabel}>Envoyées</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#3A2A1B' }]}>
                <Text style={[styles.statNumber, { color: '#FF9800' }]}>
                  {stats.by_status?.valide || 0}
                </Text>
                <Text style={styles.statLabel}>Validées</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: '#3A1B1B' }]}>
                <Text style={[styles.statNumber, { color: '#F44336' }]}>
                  {stats.by_status?.echec || 0}
                </Text>
                <Text style={styles.statLabel}>Échecs</Text>
              </View>
            </View>
          </View>
        )}

        {/* Quick Stats by Type */}
        {stats && (
          <View style={styles.typeStats}>
            <View style={styles.typeStatItem}>
              <Ionicons name="checkmark-circle" size={20} color="#2196F3" />
              <Text style={styles.typeStatText}>
                {stats.by_type?.Qualité || 0} Qualité
              </Text>
            </View>
            <View style={styles.typeStatItem}>
              <Ionicons name="shield-checkmark" size={20} color="#FF9800" />
              <Text style={styles.typeStatText}>
                {stats.by_type?.Sécurité || 0} Sécurité
              </Text>
            </View>
            <View style={styles.typeStatItem}>
              <Ionicons name="leaf" size={20} color="#4CAF50" />
              <Text style={styles.typeStatText}>
                {stats.by_type?.Environnement || 0} Env.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 16,
    color: '#888',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFF',
  },
  badge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainButton: {
    marginBottom: 24,
    paddingVertical: 28,
  },
  offlineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  offlineInfo: {
    marginLeft: 12,
  },
  offlineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9800',
  },
  offlineSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  statsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FF6B00',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    marginTop: 4,
  },
  typeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
  },
  typeStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeStatText: {
    fontSize: 14,
    color: '#FFF',
    marginLeft: 6,
  },
});
