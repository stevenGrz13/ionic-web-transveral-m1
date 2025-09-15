import React, { useState, useEffect } from 'react';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonItem, IonLabel, IonButton, IonToast, IonSelect,
  IonSelectOption, IonText, IonIcon, IonLoading
} from '@ionic/react';
import { cash, calendar } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';

interface Abonnement {
  id: number;
  montantPassager: number;
  montantChauffeur: number;
  dateChangement: string;
}

interface AbonnementUtilisateur {
  id: number;
  idUtilisateur: number;
  idMois: number;
  annee: number;
  datePaiement: string;
}

const PassagerAbonnement: React.FC = () => {
  const history = useHistory();
  const [mois, setMois] = useState<number>(1);
  const [abonnement, setAbonnement] = useState<Abonnement | null>(null);
  const [dateFin, setDateFin] = useState<string>('');  
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [processing, setProcessing] = useState(false);

  const userId = sessionStorage.getItem('userId');

  useEffect(() => {
    const fetchAbonnement = async () => {
      try {
        const res = await axios.get<Abonnement[]>(`${API_BASE_URL}/AbonnementApi`);
        const dernierAbonnement = res.data[res.data.length - 1];
        setAbonnement(dernierAbonnement);
      } catch (err) {
        console.error('Erreur lors du chargement des tarifs:', err);
        setToastMessage('Impossible de charger les tarifs');
      } finally {
        setLoading(false);
      }
    };
    fetchAbonnement();
  }, []);

  useEffect(() => {
    const fetchAbonnementUtilisateur = async () => {
      if (!userId) return;
      try {
        const res = await axios.get<AbonnementUtilisateur[]>(
          `${API_BASE_URL}/AbonnementUtilisateurApi/Utilisateur/${userId}`
        );

        if (res.data.length > 0) {
          const dernier = res.data.reduce((max, curr) =>
            curr.annee > max.annee || (curr.annee === max.annee && curr.idMois > max.idMois)
              ? curr
              : max
          );
          const date = new Date(dernier.annee, dernier.idMois, 0); // 0 = dernier jour du mois précédent
          const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
          setDateFin(date.toLocaleDateString('fr-FR', options));
        }
      } catch (err) {
        console.error('Erreur récupération abonnement utilisateur:', err);
      }
    };

    fetchAbonnementUtilisateur();
  }, [userId]);

  const calculerPrixTotal = () => {
    if (!abonnement) return 0;
    return (abonnement.montantPassager * mois).toFixed(2);
  };

  const handlePayer = async () => {
    if (mois <= 0) {
      setToastMessage('Veuillez sélectionner au moins 1 mois');
      return;
    }
    if (!userId) {
      setToastMessage('Utilisateur non connecté');
      history.push('/login');
      return;
    }

    try {
      setProcessing(true);
      const nouvelAbonnement: Partial<AbonnementUtilisateur> = {
        idUtilisateur: parseInt(userId),
        idMois: mois,
        datePaiement: new Date().toISOString()
      };

      await axios.post(
        `${API_BASE_URL}/AbonnementUtilisateurApi?nombremois=${mois}`,
        nouvelAbonnement
      );

      setToastMessage(`Abonnement de ${mois} mois payé avec succès ! Prix: ${calculerPrixTotal()} Ar`);

      setTimeout(() => history.push('/utilisateur'), 3000);
    } catch (error) {
      console.error('Erreur de paiement:', error);
      setToastMessage('Erreur lors du paiement');
    } finally {
      setProcessing(false);
    }
  };

  const optionsMois = [
    { value: 1, label: '1 mois' },
    { value: 3, label: '3 mois' },
    { value: 6, label: '6 mois' },
    { value: 12, label: '12 mois' }
  ];

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Abonnement Passager</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message="Chargement des tarifs..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Abonnement Passager</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle className="ion-text-center">
              Abonnement
            </IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>

            {dateFin && (
              <IonText color="primary">
                <p style={{ fontWeight: 'bold', marginBottom: '15px' }}>
                    Vous êtes abonné(e) jusqu’au <u>{dateFin}</u>.
                </p>
              </IonText>
            )}

            <div style={{ marginBottom: '20px' }}>
              <IonText>
                <h3>Avantages de l'abonnement :</h3>
                <ul>
                  <li>Trajets illimités</li>
                  <li>Réservation prioritaire</li>
                  <li>Support 24/7</li>
                  <li>Réductions exclusives</li>
                  <li>Annulation gratuite</li>
                </ul>
              </IonText>
            </div>

            {abonnement && (
              <>
                <IonItem>
                  <IonLabel position="stacked">
                    <IonIcon icon={calendar} style={{ marginRight: '8px' }} />
                    Durée de l'abonnement
                  </IonLabel>
                  <IonSelect
                    value={mois}
                    onIonChange={e => setMois(e.detail.value)}
                    placeholder="Choisir la durée"
                  >
                    {optionsMois.map(option => (
                      <IonSelectOption key={option.value} value={option.value}>
                        {option.label} - {(abonnement.montantPassager * option.value).toFixed(2)} Ar
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <div style={{
                  margin: '20px 0',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}>
                  <IonText>
                    <h2>
                      <strong>Total: {calculerPrixTotal()} Ar</strong>
                    </h2>
                    <p>Prix mensuel: {abonnement.montantPassager.toFixed(2)} Ar</p>
                  </IonText>
                </div>
              </>
            )}

            <IonButton
              expand="block"
              color="success"
              onClick={handlePayer}
              disabled={processing || mois <= 0 || !abonnement}
            >
              {processing ? 'Traitement en cours...' : 'Payer mon abonnement'}
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={toastMessage !== ''}
          message={toastMessage}
          duration={3000}
          onDidDismiss={() => setToastMessage('')}
        />

        <IonLoading isOpen={processing} message="Traitement du paiement..." />
      </IonContent>
    </IonPage>
  );
};

export default PassagerAbonnement;
