import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ConfigData } from '../types';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_BACKEND_URL;

const DEFAULT_CONFIG: ConfigData = {
  services: [
    'REPC', 'Fabrication PPC', 'Affinage PPC', 'Conditionnement PPC',
    'Expéditions PPC', 'Fabrication PPNC', 'Affinage PPNC', 'Conditionnement PPNC',
    'Expéditions PPNC', 'Maintenance générale', 'Maintenance Fab/Aff PPC',
    'Maintenance Condi PPC', 'Maintenance Fab PPNC', 'Maintenance Condi PPNC',
    'Maintenance REPC', 'Magasin', 'Laboratoire', 'Collecte', 'Administratif',
    'Garage', 'Rétrocession', 'Froid ferme', 'Qualité', 'Environnement', 'Sécurité', 'Autre'
  ],
  non_conformites: [
    'Situation', 'Matière première / Ingrédient', 'Coproduit',
    'Produit en cours', 'Produit Fini', 'Emballage', 'Echantillon'
  ],
  defauts: [
    'Qualité - Autre', 'Moisissures', 'Goût - texture - odeur', 'Aspect',
    'Corps étranger', 'Microbiologie', 'Physico-chimie', 'Emballage - marquage',
    'Poids', 'Nuisibles'
  ],
  ccp_prpo: [
    'CCP - Antibiotiques', 'CCP - Pasteurisation', 'PRPo - Préparation milieu ferment',
    'CCP - DPM', 'PRPo - Etanchéité', 'PRPo - Composition gazeuse'
  ],
  categories_corps_etranger: [
    'Plastique dur', 'Plastique divers', 'Papier/Carton', 'Verre',
    'Graisse', 'Métal', 'Encre/marquage', 'Nuisible', 'Fromage',
    'Bois', 'Cheveu', 'Autre'
  ],
  types_risque: [
    'Agents chimiques dangereux', 'Ambiances climatiques', 'ATEX - risque explosion',
    'Bruit', 'Brûlure thermique', 'Chute avec dénivellation', 'Chute de hauteur',
    'Chute de plain-pied', 'Chute d\'objet', 'Circulation', 'Coincement / Ecrasement',
    'Coupure', 'Electricité', 'Espaces confinés', 'Gestes répétitifs', 'Incendie',
    'Machines', 'Manutention manuelle', 'Manutention mécanique', 'Postures pénibles',
    'Risque biologique', 'Risque routier', 'Risques psychosociaux', 'Autre'
  ],
  regles_or: [
    'EPI', 'Machines', 'Consignation', 'Espace confiné / Travail en hauteur',
    'Produit chimique', 'Manutention manuelle / Posture', 'Conduite d\'engins',
    'Circulation piétonne', 'Circulation routière', 'NON APPLICABLE'
  ],
  types_env: [
    'Eaux (fuite)', 'Air : fuite, rejet', 'Sol (déversement)',
    'Déchets (tri)', 'Autres (réglementaire)'
  ],
  lieux: [
    'cuve', 'pressage', 'GSV', 'Acidification', 'Laverie', 'Saumure',
    'salle levains', 'cave', 'Quai', 'Autres'
  ],
  postes: [
    'salle de soins', 'sortie saumure', 'conduite moulage', 'conduite cuves',
    'cariste', 'gradeur', 'nettoyage', 'expedition', 'autre'
  ],
  types_action: ['Humaine', 'Organisationnelle', 'Technique'],
  statuts_action: ['Close', 'En cours', 'A lancer']
};

interface ConfigState {
  config: ConfigData;
  isLoading: boolean;
  loadConfig: () => Promise<void>;
  updateConfig: (config: ConfigData) => Promise<void>;
}

export const useConfigStore = create<ConfigState>((set) => ({
  config: DEFAULT_CONFIG,
  isLoading: true,
  
  loadConfig: async () => {
    try {
      // First try to load from API
      const response = await axios.get(`${API_URL}/api/config`);
      if (response.data && response.data.services) {
        set({ config: response.data, isLoading: false });
        await AsyncStorage.setItem('config', JSON.stringify(response.data));
        return;
      }
    } catch (e) {
      console.log('Could not load config from API, trying local');
    }
    
    // Try local storage
    try {
      const localConfig = await AsyncStorage.getItem('config');
      if (localConfig) {
        set({ config: JSON.parse(localConfig), isLoading: false });
        return;
      }
    } catch (e) {
      console.log('Could not load local config');
    }
    
    // Use default
    set({ config: DEFAULT_CONFIG, isLoading: false });
  },
  
  updateConfig: async (config) => {
    try {
      await axios.put(`${API_URL}/api/config`, config);
      await AsyncStorage.setItem('config', JSON.stringify(config));
      set({ config });
    } catch (e) {
      console.error('Error updating config:', e);
    }
  },
}));
