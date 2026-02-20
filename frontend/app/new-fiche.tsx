import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

import { useAuthStore } from '../src/stores/authStore';
import { useFicheStore } from '../src/stores/ficheStore';
import { useConfigStore } from '../src/stores/configStore';
import { ficheApi } from '../src/utils/api';
import { Photo } from '../src/types';

import { BigButton } from '../src/components/BigButton';
import { TypeSelector } from '../src/components/TypeSelector';
import { Dropdown } from '../src/components/Dropdown';
import { TextInput } from '../src/components/TextInput';
import { CriticalitySelector } from '../src/components/CriticalitySelector';
import { CheckboxItem } from '../src/components/CheckboxItem';

type Step = 'type' | 'info' | 'details' | 'description' | 'treatment' | 'causes' | 'photos' | 'review';

export default function NewFiche() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { currentFiche, updateCurrentFiche, addPhoto, removePhoto, resetCurrentFiche, saveOffline } = useFicheStore();
  const { config } = useConfigStore();
  
  const [step, setStep] = useState<Step>('type');
  const [isLoading, setIsLoading] = useState(false);

  const steps: Step[] = ['type', 'info', 'details', 'description', 'treatment', 'causes', 'photos', 'review'];
  const currentStepIndex = steps.indexOf(step);

  const getStepTitle = () => {
    switch (step) {
      case 'type': return 'Type de déclaration';
      case 'info': return 'Informations générales';
      case 'details': return 'Détails du problème';
      case 'description': return 'Description';
      case 'treatment': return 'Traitement';
      case 'causes': return 'Analyse des causes';
      case 'photos': return 'Photos';
      case 'review': return 'Validation';
      default: return '';
    }
  };

  const canGoNext = () => {
    switch (step) {
      case 'type':
        return !!currentFiche.type;
      case 'info':
        return !!currentFiche.service_emetteur && !!currentFiche.constate_par;
      case 'details':
        return true;
      case 'description':
        return !!currentFiche.description && currentFiche.description.length > 5;
      case 'treatment':
        return true;
      case 'causes':
        return true;
      case 'photos':
        return true;
      default:
        return true;
    }
  };

  const goNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setStep(steps[currentStepIndex + 1]);
    }
  };

  const goBack = () => {
    if (currentStepIndex > 0) {
      setStep(steps[currentStepIndex - 1]);
    } else {
      Alert.alert(
        'Quitter ?',
        'Les données saisies seront perdues.',
        [
          { text: 'Rester', style: 'cancel' },
          { text: 'Quitter', style: 'destructive', onPress: () => router.back() },
        ]
      );
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès caméra nécessaire');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const photo: Photo = {
        id: uuidv4(),
        data: result.assets[0].base64,
        filename: `photo_${Date.now()}.jpg`,
        created_at: new Date().toISOString(),
      };
      addPhoto(photo);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission refusée', 'Accès galerie nécessaire');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      const photo: Photo = {
        id: uuidv4(),
        data: result.assets[0].base64,
        filename: `photo_${Date.now()}.jpg`,
        created_at: new Date().toISOString(),
      };
      addPhoto(photo);
    }
  };

  const handleValidate = async () => {
    setIsLoading(true);

    const ficheData = {
      ...currentFiche,
      created_by: user?.id || '',
      constate_par: currentFiche.constate_par || `${user?.first_name} ${user?.name}`,
    };

    try {
      // Create fiche
      const createdFiche = await ficheApi.create(ficheData);
      
      // Validate and generate Excel
      const validateResult = await ficheApi.validate(createdFiche.id);
      
      // Try to send email
      const emailResult = await ficheApi.sendEmail(createdFiche.id);

      Alert.alert(
        'Fiche validée !',
        `${validateResult.message}\n${emailResult.message}`,
        [
          {
            text: 'OK',
            onPress: () => {
              resetCurrentFiche();
              router.replace('/(tabs)/history');
            },
          },
        ]
      );
    } catch (error: any) {
      console.error('Error validating fiche:', error);

      const ficheToQueue = {
        ...ficheData,
        date_evenement: ficheData.date_evenement || new Date().toISOString(),
        heure_evenement: ficheData.heure_evenement || format(new Date(), 'HH:mm'),
        description: ficheData.description || '',
        criticite: ficheData.criticite || 'Mineure',
        type: ficheData.type || 'Qualité',
        service_emetteur: ficheData.service_emetteur || 'Non défini',
        created_by: ficheData.created_by || '',
        constate_par: ficheData.constate_par || '',
        actions_correctives: ficheData.actions_correctives || [],
        photos: ficheData.photos || [],
      };

      await saveOffline(ficheToQueue);

      Alert.alert(
        'Mode hors ligne',
        'Fiche enregistrée sur le téléphone. Elle sera envoyée automatiquement dès que vous relancez la synchronisation.'
      );

      resetCurrentFiche();
      router.replace('/(tabs)/home');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'type':
        return (
          <View style={styles.stepContent}>
            <TypeSelector
              value={currentFiche.type as any || 'Qualité'}
              onChange={(type) => updateCurrentFiche({ type })}
            />
            
            <CriticalitySelector
              value={currentFiche.criticite as any || 'Mineure'}
              onChange={(criticite) => updateCurrentFiche({ criticite })}
            />
          </View>
        );

      case 'info':
        return (
          <View style={styles.stepContent}>
            <Dropdown
              label="Service émetteur"
              value={currentFiche.service_emetteur}
              options={config.services}
              onSelect={(value) => updateCurrentFiche({ service_emetteur: value })}
              required
            />
            
            <Dropdown
              label="Service concerné"
              value={currentFiche.service_concerne}
              options={config.services}
              onSelect={(value) => updateCurrentFiche({ service_concerne: value })}
            />
            
            <TextInput
              label="Constaté par"
              value={currentFiche.constate_par || `${user?.first_name} ${user?.name}`}
              onChangeText={(text) => updateCurrentFiche({ constate_par: text })}
              required
            />

            <View style={styles.dateTimeRow}>
              <View style={styles.dateTimeItem}>
                <Text style={styles.fieldLabel}>Date</Text>
                <View style={styles.readOnlyField}>
                  <Ionicons name="calendar" size={20} color="#FF6B00" />
                  <Text style={styles.readOnlyText}>
                    {format(new Date(currentFiche.date_evenement || new Date()), 'dd/MM/yyyy')}
                  </Text>
                </View>
              </View>
              <View style={styles.dateTimeItem}>
                <Text style={styles.fieldLabel}>Heure</Text>
                <View style={styles.readOnlyField}>
                  <Ionicons name="time" size={20} color="#FF6B00" />
                  <Text style={styles.readOnlyText}>
                    {currentFiche.heure_evenement || format(new Date(), 'HH:mm')}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        );

      case 'details':
        if (currentFiche.type === 'Qualité') {
          return (
            <View style={styles.stepContent}>
              <Dropdown
                label="Non-conformité constatée"
                value={currentFiche.non_conformite_constatee}
                options={config.non_conformites}
                onSelect={(value) => updateCurrentFiche({ non_conformite_constatee: value })}
              />
              
              <Dropdown
                label="Défaut"
                value={currentFiche.defaut}
                options={config.defauts}
                onSelect={(value) => updateCurrentFiche({ defaut: value })}
              />

              {currentFiche.defaut === 'Corps étranger' && (
                <Dropdown
                  label="Catégorie corps étranger"
                  value={currentFiche.categorie_corps_etranger}
                  options={config.categories_corps_etranger}
                  onSelect={(value) => updateCurrentFiche({ categorie_corps_etranger: value })}
                />
              )}
              
              <Dropdown
                label="CCP/PRPo"
                value={currentFiche.ccp_prpo}
                options={config.ccp_prpo}
                onSelect={(value) => updateCurrentFiche({ ccp_prpo: value })}
              />

              <TextInput
                label="Produit"
                value={currentFiche.produit}
                onChangeText={(text) => updateCurrentFiche({ produit: text })}
              />
              
              <TextInput
                label="Numéro de lot"
                value={currentFiche.numero_lot}
                onChangeText={(text) => updateCurrentFiche({ numero_lot: text })}
              />

              <TextInput
                label="Quantité concernée"
                value={currentFiche.quantite_concernee}
                onChangeText={(text) => updateCurrentFiche({ quantite_concernee: text })}
              />
            </View>
          );
        } else if (currentFiche.type === 'Sécurité') {
          return (
            <View style={styles.stepContent}>
              <Dropdown
                label="Type d'incident"
                value={currentFiche.type_incident}
                options={["Presqu'accident", 'Situation dangereuse', 'Acte dangereux', 'Risques psychosociaux', 'Autre']}
                onSelect={(value) => updateCurrentFiche({ type_incident: value })}
              />
              
              <Dropdown
                label="Type de risque"
                value={currentFiche.type_risque}
                options={config.types_risque}
                onSelect={(value) => updateCurrentFiche({ type_risque: value })}
              />
              
              <Dropdown
                label="Règle d'or associée"
                value={currentFiche.regle_or}
                options={config.regles_or}
                onSelect={(value) => updateCurrentFiche({ regle_or: value })}
              />
            </View>
          );
        } else {
          return (
            <View style={styles.stepContent}>
              <Dropdown
                label="Type environnement"
                value={currentFiche.type_env}
                options={config.types_env}
                onSelect={(value) => updateCurrentFiche({ type_env: value })}
              />
            </View>
          );
        }

      case 'description':
        return (
          <View style={styles.stepContent}>
            <TextInput
              label="Description détaillée"
              value={currentFiche.description}
              onChangeText={(text) => updateCurrentFiche({ description: text })}
              required
              multiline
              numberOfLines={6}
              placeholder="Décrivez le problème constaté..."
            />

            {currentFiche.type === 'Qualité' && (
              <Dropdown
                label="Impact sécurité des aliments"
                value={currentFiche.impact_securite_aliments}
                options={['Oui', 'Non', 'En cours d\'évaluation']}
                onSelect={(value) => updateCurrentFiche({ impact_securite_aliments: value })}
              />
            )}
          </View>
        );

      case 'treatment':
        if (currentFiche.type === 'Qualité') {
          return (
            <View style={styles.stepContent}>
              <Text style={styles.sectionTitle}>Traitement du produit</Text>
              
              <CheckboxItem
                label="Blocage en attente de décision"
                checked={!!currentFiche.traitement_blocage}
                onToggle={() => updateCurrentFiche({ traitement_blocage: !currentFiche.traitement_blocage })}
              />
              
              <CheckboxItem
                label="Méthanisation"
                checked={!!currentFiche.traitement_methanisation}
                onToggle={() => updateCurrentFiche({ traitement_methanisation: !currentFiche.traitement_methanisation })}
              />
              
              <CheckboxItem
                label="Fonte (Lons)"
                checked={!!currentFiche.traitement_fonte}
                onToggle={() => updateCurrentFiche({ traitement_fonte: !currentFiche.traitement_fonte })}
              />
              
              <CheckboxItem
                label="Nouvelles analyses"
                checked={!!currentFiche.traitement_analyses}
                onToggle={() => updateCurrentFiche({ traitement_analyses: !currentFiche.traitement_analyses })}
              />
              
              <CheckboxItem
                label="Alimentation animale (Biosilait)"
                checked={!!currentFiche.traitement_alimentation_animale}
                onToggle={() => updateCurrentFiche({ traitement_alimentation_animale: !currentFiche.traitement_alimentation_animale })}
              />
              
              <TextInput
                label="Autres traitements"
                value={currentFiche.traitement_autres}
                onChangeText={(text) => updateCurrentFiche({ traitement_autres: text })}
              />
            </View>
          );
        }
        return (
          <View style={styles.stepContent}>
            <Text style={styles.infoText}>
              Passez à l'étape suivante pour les actions correctives.
            </Text>
          </View>
        );

      case 'causes':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Analyse des causes (5M)</Text>
            
            <TextInput
              label="Main d'œuvre"
              value={currentFiche.cause_main_oeuvre}
              onChangeText={(text) => updateCurrentFiche({ cause_main_oeuvre: text })}
              placeholder="Causes liées au personnel..."
            />
            
            <TextInput
              label="Matériel"
              value={currentFiche.cause_materiel}
              onChangeText={(text) => updateCurrentFiche({ cause_materiel: text })}
              placeholder="Causes liées aux équipements..."
            />
            
            <TextInput
              label="Méthode"
              value={currentFiche.cause_methode}
              onChangeText={(text) => updateCurrentFiche({ cause_methode: text })}
              placeholder="Causes liées aux procédures..."
            />
            
            <TextInput
              label="Milieu"
              value={currentFiche.cause_milieu}
              onChangeText={(text) => updateCurrentFiche({ cause_milieu: text })}
              placeholder="Causes liées à l'environnement..."
            />
            
            <TextInput
              label="Matière"
              value={currentFiche.cause_matiere}
              onChangeText={(text) => updateCurrentFiche({ cause_matiere: text })}
              placeholder="Causes liées aux matières..."
            />
          </View>
        );

      case 'photos':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Photos</Text>
            <Text style={styles.infoText}>
              Ajoutez des photos pour documenter le problème
            </Text>
            
            <View style={styles.photoButtons}>
              <TouchableOpacity style={styles.photoButton} onPress={takePhoto}>
                <Ionicons name="camera" size={32} color="#FF6B00" />
                <Text style={styles.photoButtonText}>Prendre photo</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
                <Ionicons name="images" size={32} color="#FF6B00" />
                <Text style={styles.photoButtonText}>Galerie</Text>
              </TouchableOpacity>
            </View>
            
            {currentFiche.photos && currentFiche.photos.length > 0 && (
              <View style={styles.photoGrid}>
                {currentFiche.photos.map((photo) => (
                  <View key={photo.id} style={styles.photoItem}>
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${photo.data}` }}
                      style={styles.photoImage}
                    />
                    <TouchableOpacity
                      style={styles.removePhotoButton}
                      onPress={() => removePhoto(photo.id)}
                    >
                      <Ionicons name="close-circle" size={28} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        );

      case 'review':
        return (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>Récapitulatif</Text>
            
            <View style={styles.reviewCard}>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Type :</Text>
                <Text style={styles.reviewValue}>{currentFiche.type}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Criticité :</Text>
                <Text style={[
                  styles.reviewValue,
                  { color: currentFiche.criticite === 'Critique' ? '#F44336' : currentFiche.criticite === 'Majeure' ? '#FF9800' : '#4CAF50' }
                ]}>
                  {currentFiche.criticite}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Service :</Text>
                <Text style={styles.reviewValue}>{currentFiche.service_emetteur}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Constaté par :</Text>
                <Text style={styles.reviewValue}>{currentFiche.constate_par}</Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Date :</Text>
                <Text style={styles.reviewValue}>
                  {format(new Date(currentFiche.date_evenement || new Date()), 'dd/MM/yyyy HH:mm')}
                </Text>
              </View>
              <View style={styles.reviewRow}>
                <Text style={styles.reviewLabel}>Photos :</Text>
                <Text style={styles.reviewValue}>{currentFiche.photos?.length || 0}</Text>
              </View>
            </View>
            
            <View style={styles.reviewDescription}>
              <Text style={styles.reviewLabel}>Description :</Text>
              <Text style={styles.reviewDescText}>{currentFiche.description}</Text>
            </View>

            <BigButton
              title={isLoading ? "Validation en cours..." : "VALIDER LA FICHE"}
              onPress={handleValidate}
              icon="checkmark-circle"
              color="#4CAF50"
              disabled={isLoading}
              style={styles.validateButton}
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentStepIndex + 1) / steps.length) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Étape {currentStepIndex + 1}/{steps.length}
          </Text>
        </View>

        {/* Step title */}
        <Text style={styles.stepTitle}>{getStepTitle()}</Text>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {renderStep()}
        </ScrollView>

        {/* Navigation buttons */}
        <View style={styles.navigation}>
          <TouchableOpacity style={styles.navButtonBack} onPress={goBack}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
            <Text style={styles.navButtonText}>Retour</Text>
          </TouchableOpacity>

          {step !== 'review' && (
            <TouchableOpacity
              style={[styles.navButtonNext, !canGoNext() && styles.navButtonDisabled]}
              onPress={goNext}
              disabled={!canGoNext()}
            >
              <Text style={styles.navButtonText}>Suivant</Text>
              <Ionicons name="arrow-forward" size={24} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Validation en cours...</Text>
        </View>
      )}
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
  progressContainer: {
    padding: 16,
    paddingTop: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  stepContent: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 16,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dateTimeItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#444',
  },
  readOnlyText: {
    fontSize: 16,
    color: '#FFF',
    marginLeft: 8,
  },
  photoButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  photoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 100,
    backgroundColor: '#2A2A2A',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF6B00',
    borderStyle: 'dashed',
  },
  photoButtonText: {
    fontSize: 14,
    color: '#FF6B00',
    marginTop: 8,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  photoItem: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  reviewCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reviewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  reviewLabel: {
    fontSize: 16,
    color: '#888',
  },
  reviewValue: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
  },
  reviewDescription: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  reviewDescText: {
    fontSize: 14,
    color: '#CCC',
    marginTop: 8,
    lineHeight: 22,
  },
  validateButton: {
    marginBottom: 16,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#333',
    backgroundColor: '#1A1A1A',
  },
  navButtonBack: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#333',
    borderRadius: 12,
  },
  navButtonNext: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: '#FF6B00',
    borderRadius: 12,
  },
  navButtonDisabled: {
    backgroundColor: '#555',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    marginHorizontal: 8,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#FFF',
    marginTop: 16,
  },
});
