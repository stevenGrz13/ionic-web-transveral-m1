// pages/ChauffeurAPropos.tsx
import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
  IonSpinner,
  IonToast
} from '@ionic/react';
import axios from 'axios';

import { API_BASE_URL } from '../../../config';
import './ChauffeurAPropos.scss';

interface Utilisateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  numero?: string;
  idRole: number;
  motDePasse?: string;
  createdAt?: Date;
}

const AProposChauffeur: React.FC = () => {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUtilisateur = async () => {
    try {
      const userId = sessionStorage.getItem('userId');
      const res = await axios.get<Utilisateur>(`${API_BASE_URL}/UtilisateursApi/${userId}`);
      setUtilisateur(res.data);
    } catch (err) {
      console.error(err);
      setToastMessage("Impossible de charger les informations de l'utilisateur");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilisateur();
  }, []);

  return (
    <IonPage>
      <IonContent className="apropos-container" fullscreen>
        <div className="apropos-background">
          <div className="apropos-card">
            <div className="apropos-header">
              <h1>À propos de moi</h1>
              <p className="apropos-subtitle">Informations personnelles du chauffeur</p>
            </div>

            {isLoading ? (
              <div className="apropos-loading">
                <IonSpinner name="dots" />
                <span>Chargement...</span>
              </div>
            ) : utilisateur ? (
              <div className="apropos-details">
                <div className="apropos-field">
                  <span className="label">Nom complet</span>
                  <span className="value">{utilisateur.nom} {utilisateur.prenom}</span>
                </div>

                <div className="apropos-field">
                  <span className="label">Email</span>
                  <span className="value">{utilisateur.email}</span>
                </div>

                {utilisateur.numero && (
                  <div className="apropos-field">
                    <span className="label">Téléphone</span>
                    <span className="value">{utilisateur.numero}</span>
                  </div>
                )}

                <div className="apropos-field">
                  <span className="label">Rôle</span>
                  <span className="value">{utilisateur.idRole === 1 ? 'Chauffeur' : 'Autre'}</span>
                </div>

                <div className="apropos-field">
                  <span className="label">Date d'inscription</span>
                  <span className="value">
                    {new Date(utilisateur.createdAt ?? '').toLocaleDateString()}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-center">Aucune information disponible.</p>
            )}
          </div>
        </div>

        <IonToast
          isOpen={toastMessage !== ''}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
        />
      </IonContent>
    </IonPage>
  );
};

export default AProposChauffeur;
