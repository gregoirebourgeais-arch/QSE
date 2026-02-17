export interface User {
  id: string;
  code: string;
  name: string;
  first_name: string;
  service: string;
  is_admin: boolean;
}

export interface Photo {
  id: string;
  data: string;
  filename: string;
  created_at: string;
}

export interface ActionCorrective {
  action: string;
  responsable: string;
  delai?: string;
  type_action?: string;
  statut: string;
}

export interface FicheQSE {
  id: string;
  type: 'Qualité' | 'Sécurité' | 'Environnement';
  date_evenement: string;
  heure_evenement: string;
  constate_par: string;
  service_emetteur: string;
  service_concerne?: string;
  non_conformite_constatee?: string;
  defaut?: string;
  ccp_prpo?: string;
  categorie_corps_etranger?: string;
  quantite_concernee?: string;
  produit?: string;
  grammage?: string;
  marque?: string;
  ligne?: string;
  ddm?: string;
  quantieme?: string;
  heure_production?: string;
  numero_lot?: string;
  numero_palette?: string;
  code_sca?: string;
  reference_interne?: string;
  date_production?: string;
  numero_bobine?: string;
  autres_tracabilite?: string;
  description: string;
  criticite: 'Mineure' | 'Majeure' | 'Critique';
  impact_securite_aliments?: string;
  traitement_blocage?: boolean;
  traitement_methanisation?: boolean;
  traitement_fonte?: boolean;
  traitement_analyses?: boolean;
  traitement_alimentation_animale?: boolean;
  traitement_autres?: string;
  date_traitement?: string;
  nom_traitement?: string;
  type_incident?: string;
  type_risque?: string;
  regle_or?: string;
  type_env?: string;
  traitement_env?: string[];
  cause_main_oeuvre?: string;
  cause_materiel?: string;
  cause_methode?: string;
  cause_milieu?: string;
  cause_matiere?: string;
  actions_correctives: ActionCorrective[];
  photos: Photo[];
  signature?: string;
  statut: 'Brouillon' | 'Validé' | 'Envoyé' | 'Échec d\'envoi';
  created_at: string;
  updated_at: string;
  created_by: string;
  excel_filename?: string;
  sync_status: 'pending' | 'synced' | 'failed';
}

export interface ConfigData {
  services: string[];
  non_conformites: string[];
  defauts: string[];
  ccp_prpo: string[];
  categories_corps_etranger: string[];
  types_risque: string[];
  regles_or: string[];
  types_env: string[];
  lieux: string[];
  postes: string[];
  types_action: string[];
  statuts_action: string[];
}
