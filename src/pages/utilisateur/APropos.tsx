// pages/ChauffeurAPropos.tsx
import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToast,
  IonGrid,
  IonRow,
  IonCol,
  IonText
} from '@ionic/react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';

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

interface AbonnementUtilisateur {
  id: number;
  idUtilisateur: number;
  idMois: number;
  annee: number;
  datePaiement: string;
}

const APropos: React.FC = () => {
  const [utilisateur, setUtilisateur] = useState<Utilisateur | null>(null);
  const [abonnements, setAbonnements] = useState<AbonnementUtilisateur[]>([]);
  const [toastMessage, setToastMessage] = useState('');

  const userId = sessionStorage.getItem('userId');

  const fetchUtilisateur = async () => {
    try {
      const res = await axios.get<Utilisateur>(`${API_BASE_URL}/UtilisateursApi/${userId}`);
      setUtilisateur(res.data);
    } catch (err) {
      console.error(err);
      setToastMessage("Impossible de charger les informations de l'utilisateur");
    }
  };

  const fetchAbonnements = async () => {
    try {
      const res = await axios.get<AbonnementUtilisateur[]>(`${API_BASE_URL}/AbonnementUtilisateurApi`);
      const userAbonnements = res.data.filter(a => a.idUtilisateur === Number(userId));
      setAbonnements(userAbonnements);
    } catch (err) {
      console.error(err);
      setToastMessage("Impossible de charger les abonnements");
    }
  };

  useEffect(() => {
    fetchUtilisateur();
    fetchAbonnements();
  }, []);

  const nomMois = (mois: number) =>
    new Date(0, mois - 1).toLocaleString('fr-FR', { month: 'long' });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mon profil</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">

        {/* -------- Message d’accueil -------- */}
        {utilisateur && (
          <IonText color="primary">
            <h2 style={{ fontWeight: 600, marginBottom: '20px' }}>
              Bonjour {utilisateur.prenom} {utilisateur.nom}
            </h2>
          </IonText>
        )}

        {/* -------- Informations utilisateur -------- */}
        {utilisateur ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Informations personnelles</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="4"><strong>Email</strong></IonCol>
                  <IonCol>{utilisateur.email}</IonCol>
                </IonRow>
                {utilisateur.numero && (
                  <IonRow>
                    <IonCol size="4"><strong>Téléphone</strong></IonCol>
                    <IonCol>{utilisateur.numero}</IonCol>
                  </IonRow>
                )}
                <IonRow>
                  <IonCol size="4"><strong>Rôle</strong></IonCol>
                  <IonCol>{utilisateur.idRole === 2 ? 'Passager' : 'Autre'}</IonCol>
                </IonRow>
                <IonRow>
                  <IonCol size="4"><strong>Date d'inscription</strong></IonCol>
                  <IonCol>{new Date(utilisateur.createdAt ?? '').toLocaleDateString()}</IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        ) : (
          <p>Chargement des informations…</p>
        )}

        {/* -------- Tableau des abonnements -------- */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Abonnements payés</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {abonnements.length > 0 ? (
              <IonGrid>
                <IonRow style={{ fontWeight: 600, borderBottom: '1px solid #ccc', marginBottom: '6px' }}>
                  <IonCol>Mois</IonCol>
                  <IonCol>Année</IonCol>
                  <IonCol>Date de paiement</IonCol>
                </IonRow>
                {abonnements.map(ab => (
                  <IonRow key={ab.id} style={{ borderBottom: '1px solid #eee', padding: '4px 0' }}>
                    <IonCol className="text-capitalize">{nomMois(ab.idMois)}</IonCol>
                    <IonCol>{ab.annee}</IonCol>
                    <IonCol>{new Date(ab.datePaiement).toLocaleDateString()}</IonCol>
                  </IonRow>
                ))}
              </IonGrid>
            ) : (
              <p>Aucun abonnement trouvé.</p>
            )}
          </IonCardContent>
        </IonCard>

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

export default APropos;