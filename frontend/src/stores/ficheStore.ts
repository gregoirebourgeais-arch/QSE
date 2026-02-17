import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FicheQSE, Photo, ActionCorrective } from '../types';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';

interface FicheState {
  currentFiche: Partial<FicheQSE>;
  offlineFiches: FicheQSE[];
  setCurrentFiche: (fiche: Partial<FicheQSE>) => void;
  updateCurrentFiche: (updates: Partial<FicheQSE>) => void;
  resetCurrentFiche: () => void;
  addPhoto: (photo: Photo) => void;
  removePhoto: (photoId: string) => void;
  addAction: (action: ActionCorrective) => void;
  removeAction: (index: number) => void;
  saveOffline: (fiche: FicheQSE) => Promise<void>;
  loadOfflineFiches: () => Promise<void>;
  removeOfflineFiche: (id: string) => Promise<void>;
}

const initialFiche: Partial<FicheQSE> = {
  type: 'Qualité',
  date_evenement: new Date().toISOString(),
  heure_evenement: format(new Date(), 'HH:mm'),
  criticite: 'Mineure',
  statut: 'Brouillon',
  photos: [],
  actions_correctives: [],
  traitement_blocage: false,
  traitement_methanisation: false,
  traitement_fonte: false,
  traitement_analyses: false,
  traitement_alimentation_animale: false,
};

export const useFicheStore = create<FicheState>((set, get) => ({
  currentFiche: { ...initialFiche },
  offlineFiches: [],
  
  setCurrentFiche: (fiche) => set({ currentFiche: fiche }),
  
  updateCurrentFiche: (updates) => set((state) => ({
    currentFiche: { ...state.currentFiche, ...updates }
  })),
  
  resetCurrentFiche: () => set({ currentFiche: { ...initialFiche, date_evenement: new Date().toISOString(), heure_evenement: format(new Date(), 'HH:mm') } }),
  
  addPhoto: (photo) => set((state) => ({
    currentFiche: {
      ...state.currentFiche,
      photos: [...(state.currentFiche.photos || []), photo]
    }
  })),
  
  removePhoto: (photoId) => set((state) => ({
    currentFiche: {
      ...state.currentFiche,
      photos: (state.currentFiche.photos || []).filter(p => p.id !== photoId)
    }
  })),
  
  addAction: (action) => set((state) => ({
    currentFiche: {
      ...state.currentFiche,
      actions_correctives: [...(state.currentFiche.actions_correctives || []), action]
    }
  })),
  
  removeAction: (index) => set((state) => ({
    currentFiche: {
      ...state.currentFiche,
      actions_correctives: (state.currentFiche.actions_correctives || []).filter((_, i) => i !== index)
    }
  })),
  
  saveOffline: async (fiche) => {
    const fiches = get().offlineFiches;
    const updated = [...fiches, fiche];
    await AsyncStorage.setItem('offlineFiches', JSON.stringify(updated));
    set({ offlineFiches: updated });
  },
  
  loadOfflineFiches: async () => {
    try {
      const data = await AsyncStorage.getItem('offlineFiches');
      if (data) {
        set({ offlineFiches: JSON.parse(data) });
      }
    } catch (e) {
      console.error('Error loading offline fiches:', e);
    }
  },
  
  removeOfflineFiche: async (id) => {
    const fiches = get().offlineFiches.filter(f => f.id !== id);
    await AsyncStorage.setItem('offlineFiches', JSON.stringify(fiches));
    set({ offlineFiches: fiches });
  },
}));
