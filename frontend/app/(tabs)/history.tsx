import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FicheQSE } from '../../src/types';
import { ficheApi } from '../../src/utils/api';
import { Dropdown } from '../../src/components/Dropdown';

export default function History() {
  const router = useRouter();
  const [fiches, setFiches] = useState<FicheQSE[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const loadFiches = async () => {
    try {
      const params: any = {};
      if (filterType) params.type = filterType;
      if (filterStatus) params.statut = filterStatus;
      const data = await ficheApi.getAll(params);
      setFiches(data);
    } catch (e) {
      console.error('Error loading fiches:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiches();
  }, [filterType, filterStatus]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFiches();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Envoyé':
        return '#4CAF50';
      case 'Validé':
        return '#FF9800';
      case 'Brouillon':
        return '#888';
      case 'Échec d\'envoi':
        return '#F44336';
      default:
        return '#888';
    }
  };

  const getTypeIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'Qualité':
        return 'checkmark-circle';
      case 'Sécurité':
        return 'shield-checkmark';
      case 'Environnement':
        return 'leaf';
      default:
        return 'document';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Qualité':
        return '#2196F3';
      case 'Sécurité':
        return '#FF9800';
      case 'Environnement':
        return '#4CAF50';
      default:
        return '#888';
    }
  };

  const handleResend = async (fiche: FicheQSE) => {
    try {
      await ficheApi.sendEmail(fiche.id);
      Alert.alert('Succès', 'Email renvoyé');
      loadFiches();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'envoyer l\'email');
    }
  };

  const renderFiche = ({ item }: { item: FicheQSE }) => (
    <TouchableOpacity
      style={styles.ficheCard}
      onPress={() => router.push({ pathname: '/fiche-detail', params: { id: item.id } })}
      activeOpacity={0.7}
    >
      <View style={styles.ficheHeader}>
        <View style={[styles.typeIcon, { backgroundColor: getTypeColor(item.type) + '20' }]}>
          <Ionicons name={getTypeIcon(item.type)} size={24} color={getTypeColor(item.type)} />
        </View>
        <View style={styles.ficheInfo}>
          <Text style={styles.ficheType}>{item.type}</Text>
          <Text style={styles.ficheService}>{item.service_emetteur}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.statut) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.statut) }]}>
            {item.statut}
          </Text>
        </View>
      </View>
      
      <Text style={styles.ficheDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.ficheFooter}>
        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color="#888" />
          <Text style={styles.ficheDate}>
            {format(new Date(item.date_evenement), 'dd MMM yyyy HH:mm', { locale: fr })}
          </Text>
        </View>
        
        <View style={styles.criticityBadge}>
          <Ionicons
            name={item.criticite === 'Critique' ? 'alert' : item.criticite === 'Majeure' ? 'warning-outline' : 'alert-circle-outline'}
            size={16}
            color={item.criticite === 'Critique' ? '#F44336' : item.criticite === 'Majeure' ? '#FF9800' : '#4CAF50'}
          />
          <Text style={[
            styles.criticityText,
            { color: item.criticite === 'Critique' ? '#F44336' : item.criticite === 'Majeure' ? '#FF9800' : '#4CAF50' }
          ]}>
            {item.criticite}
          </Text>
        </View>
      </View>

      {item.statut === 'Échec d\'envoi' && (
        <TouchableOpacity
          style={styles.resendButton}
          onPress={() => handleResend(item)}
        >
          <Ionicons name="reload" size={18} color="#FF6B00" />
          <Text style={styles.resendText}>Renvoyer</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Filters */}
      <View style={styles.filters}>
        <View style={styles.filterItem}>
          <Dropdown
            label=""
            value={filterType}
            options={['', 'Qualité', 'Sécurité', 'Environnement']}
            onSelect={setFilterType}
            placeholder="Tous types"
          />
        </View>
        <View style={styles.filterItem}>
          <Dropdown
            label=""
            value={filterStatus}
            options={['', 'Brouillon', 'Validé', 'Envoyé', 'Échec d\'envoi']}
            onSelect={setFilterStatus}
            placeholder="Tous statuts"
          />
        </View>
      </View>

      <FlatList
        data={fiches}
        keyExtractor={(item) => item.id}
        renderItem={renderFiche}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF6B00"
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="document-outline" size={64} color="#444" />
            <Text style={styles.emptyText}>Aucune fiche</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  filters: {
    flexDirection: 'row',
    padding: 16,
    paddingBottom: 0,
  },
  filterItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  list: {
    padding: 16,
  },
  ficheCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  ficheHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  typeIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ficheInfo: {
    flex: 1,
    marginLeft: 12,
  },
  ficheType: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  ficheService: {
    fontSize: 14,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ficheDescription: {
    fontSize: 14,
    color: '#CCC',
    marginBottom: 12,
    lineHeight: 20,
  },
  ficheFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ficheDate: {
    fontSize: 13,
    color: '#888',
    marginLeft: 6,
  },
  criticityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  criticityText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B00',
  },
  resendText: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
    marginLeft: 6,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
});
