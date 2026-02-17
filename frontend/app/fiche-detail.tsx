import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { FicheQSE } from '../src/types';
import { ficheApi } from '../src/utils/api';

export default function FicheDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [fiche, setFiche] = useState<FicheQSE | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFiche = async () => {
    try {
      const data = await ficheApi.getOne(id!);
      setFiche(data);
    } catch (e) {
      Alert.alert('Erreur', 'Impossible de charger la fiche');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadFiche();
    }
  }, [id]);

  const handleDownload = async () => {
    if (!fiche?.excel_filename) {
      Alert.alert('Erreur', 'Fichier Excel non disponible');
      return;
    }
    const url = ficheApi.download(fiche.id);
    await Linking.openURL(url);
  };

  const handleResend = async () => {
    try {
      const result = await ficheApi.sendEmail(fiche!.id);
      Alert.alert('Succès', result.message);
      loadFiche();
    } catch (e) {
      Alert.alert('Erreur', "Impossible d'envoyer l'email");
    }
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

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!fiche) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header Card */}
      <View style={styles.headerCard}>
        <View style={styles.headerTop}>
          <View style={[styles.typeIcon, { backgroundColor: getTypeColor(fiche.type) + '20' }]}>
            <Ionicons name={getTypeIcon(fiche.type)} size={32} color={getTypeColor(fiche.type)} />
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.ficheType}>{fiche.type}</Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(fiche.statut) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(fiche.statut) }]}>
                {fiche.statut}
              </Text>
            </View>
          </View>
          <View style={styles.criticityBadge}>
            <Ionicons
              name={fiche.criticite === 'Critique' ? 'alert' : fiche.criticite === 'Majeure' ? 'warning-outline' : 'alert-circle-outline'}
              size={24}
              color={fiche.criticite === 'Critique' ? '#F44336' : fiche.criticite === 'Majeure' ? '#FF9800' : '#4CAF50'}
            />
            <Text style={[
              styles.criticityText,
              { color: fiche.criticite === 'Critique' ? '#F44336' : fiche.criticite === 'Majeure' ? '#FF9800' : '#4CAF50' }
            ]}>
              {fiche.criticite}
            </Text>
          </View>
        </View>
      </View>

      {/* Info Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Informations</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#888" />
            <Text style={styles.infoLabel}>Date :</Text>
            <Text style={styles.infoValue}>
              {format(new Date(fiche.date_evenement), 'dd MMMM yyyy à HH:mm', { locale: fr })}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="business-outline" size={20} color="#888" />
            <Text style={styles.infoLabel}>Service :</Text>
            <Text style={styles.infoValue}>{fiche.service_emetteur}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="person-outline" size={20} color="#888" />
            <Text style={styles.infoLabel}>Constaté par :</Text>
            <Text style={styles.infoValue}>{fiche.constate_par}</Text>
          </View>
          {fiche.service_concerne && (
            <View style={styles.infoRow}>
              <Ionicons name="flag-outline" size={20} color="#888" />
              <Text style={styles.infoLabel}>Service concerné :</Text>
              <Text style={styles.infoValue}>{fiche.service_concerne}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Quality specific */}
      {fiche.type === 'Qualité' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Détails Qualité</Text>
          <View style={styles.infoCard}>
            {fiche.non_conformite_constatee && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>NC :</Text>
                <Text style={styles.infoValue}>{fiche.non_conformite_constatee}</Text>
              </View>
            )}
            {fiche.defaut && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Défaut :</Text>
                <Text style={styles.infoValue}>{fiche.defaut}</Text>
              </View>
            )}
            {fiche.produit && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Produit :</Text>
                <Text style={styles.infoValue}>{fiche.produit}</Text>
              </View>
            )}
            {fiche.numero_lot && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>N° Lot :</Text>
                <Text style={styles.infoValue}>{fiche.numero_lot}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Description</Text>
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{fiche.description}</Text>
        </View>
      </View>

      {/* Causes */}
      {(fiche.cause_main_oeuvre || fiche.cause_materiel || fiche.cause_methode || fiche.cause_milieu || fiche.cause_matiere) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyse des causes (5M)</Text>
          <View style={styles.infoCard}>
            {fiche.cause_main_oeuvre && (
              <View style={styles.causeRow}>
                <Text style={styles.causeLabel}>Main d'œuvre :</Text>
                <Text style={styles.causeValue}>{fiche.cause_main_oeuvre}</Text>
              </View>
            )}
            {fiche.cause_materiel && (
              <View style={styles.causeRow}>
                <Text style={styles.causeLabel}>Matériel :</Text>
                <Text style={styles.causeValue}>{fiche.cause_materiel}</Text>
              </View>
            )}
            {fiche.cause_methode && (
              <View style={styles.causeRow}>
                <Text style={styles.causeLabel}>Méthode :</Text>
                <Text style={styles.causeValue}>{fiche.cause_methode}</Text>
              </View>
            )}
            {fiche.cause_milieu && (
              <View style={styles.causeRow}>
                <Text style={styles.causeLabel}>Milieu :</Text>
                <Text style={styles.causeValue}>{fiche.cause_milieu}</Text>
              </View>
            )}
            {fiche.cause_matiere && (
              <View style={styles.causeRow}>
                <Text style={styles.causeLabel}>Matière :</Text>
                <Text style={styles.causeValue}>{fiche.cause_matiere}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Photos */}
      {fiche.photos && fiche.photos.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Photos ({fiche.photos.length})</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {fiche.photos.map((photo, index) => (
              <Image
                key={photo.id || index}
                source={{ uri: `data:image/jpeg;base64,${photo.data}` }}
                style={styles.photoImage}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        {fiche.excel_filename && (
          <TouchableOpacity style={styles.actionButton} onPress={handleDownload}>
            <Ionicons name="document-outline" size={24} color="#4CAF50" />
            <Text style={[styles.actionText, { color: '#4CAF50' }]}>Télécharger Excel</Text>
          </TouchableOpacity>
        )}
        
        {(fiche.statut === 'Validé' || fiche.statut === 'Échec d\'envoi') && (
          <TouchableOpacity style={styles.actionButton} onPress={handleResend}>
            <Ionicons name="mail-outline" size={24} color="#FF6B00" />
            <Text style={[styles.actionText, { color: '#FF6B00' }]}>Envoyer par email</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  loading: {
    flex: 1,
    backgroundColor: '#0D0D0D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: '#1A1A1A',
    margin: 16,
    borderRadius: 16,
    padding: 20,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  ficheType: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  criticityBadge: {
    alignItems: 'center',
  },
  criticityText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  infoLabel: {
    fontSize: 14,
    color: '#888',
    marginLeft: 8,
    width: 100,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#FFF',
  },
  descriptionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
  },
  descriptionText: {
    fontSize: 16,
    color: '#CCC',
    lineHeight: 24,
  },
  causeRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  causeLabel: {
    fontSize: 14,
    color: '#FF6B00',
    fontWeight: '600',
    marginBottom: 4,
  },
  causeValue: {
    fontSize: 14,
    color: '#CCC',
  },
  photoImage: {
    width: 200,
    height: 150,
    borderRadius: 12,
    marginRight: 12,
  },
  actions: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
