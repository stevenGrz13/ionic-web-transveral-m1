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
  IonItem,
  IonLabel,
  IonToast
} from '@ionic/react';
import axios from 'axios';

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

  const fetchUtilisateur = async () => {
    try {
      // Ici tu peux mettre l'ID du chauffeur connecté
      const userId = sessionStorage.getItem('userId');
      const res = await axios.get<Utilisateur>(`http://localhost:5055/api/UtilisateursApi/${userId}`);

      setUtilisateur(res.data);
    } catch (err) {
      console.error(err);
      setToastMessage("Impossible de charger les informations de l'utilisateur");
    }
  };

  useEffect(() => {
    fetchUtilisateur();
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>À propos de moi</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {utilisateur ? (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>{utilisateur.nom} {utilisateur.prenom}</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel>Email</IonLabel>
                <IonLabel>{utilisateur.email}</IonLabel>
              </IonItem>
              {utilisateur.numero && (
                <IonItem>
                  <IonLabel>Téléphone</IonLabel>
                  <IonLabel>{utilisateur.numero}</IonLabel>
                </IonItem>
              )}
              <IonItem>
                <IonLabel>Rôle</IonLabel>
                <IonLabel>{utilisateur.idRole === 1 ? 'Chauffeur' : 'Autre'}</IonLabel>
              </IonItem>
              <IonItem>
                <IonLabel>Date Inscription</IonLabel>
                <IonLabel>{utilisateur.createdAt + ''}</IonLabel>
              </IonItem>
            </IonCardContent>
          </IonCard>
        ) : (
          <p>Chargement des informations...</p>
        )}

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
