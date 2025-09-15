// pages/UtilisateurMesVoyages.tsx
import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonToast,
  IonLoading,
  IonIcon,
  IonText,
  IonChip,
  IonButton
} from '@ionic/react';
import { location, calendar, time, car, checkmarkCircle, closeCircle } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';

interface Voyage {
  id: number;
  idPassager: number;
  idTrajet: number;
  lieuRecuperation?: string;
  destination?: string;
  estPayee?: boolean;
  trajet?: {
    id: number;
    idVehicule: number;
    depart: string;
    arrivee: string;
    dateDepart?: string;
    prixUniquePlace?: number;
    vehicule?: {
      id: number;
      marque: string;
      modele: string;
      plaque: string;
    };
  };
}

const MesVoyages: React.FC = () => {
  const history = useHistory();
  const [voyages, setVoyages] = useState<Voyage[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [payingId, setPayingId] = useState<number | null>(null);

  const idUtilisateur = Number(sessionStorage.getItem('userId') || 0);

  const fetchVoyages = async () => {
    try {
      setLoading(true);
      const voyagesRes = await axios.get<Voyage[]>(`${API_BASE_URL}/VoyageApi`);
      const voyagesUtilisateur = voyagesRes.data.filter(v => v.idPassager === idUtilisateur);

      const voyagesAvecDetails = await Promise.all(
        voyagesUtilisateur.map(async (voyage) => {
          try {
            const trajetRes = await axios.get(`${API_BASE_URL}/TrajetApi/${voyage.idTrajet}`);
            const trajet = trajetRes.data;
            const vehiculeRes = await axios.get(`${API_BASE_URL}/VehiculeApi/${trajet.idVehicule}`);
            return { ...voyage, trajet: { ...trajet, vehicule: vehiculeRes.data } };
          } catch {
            return voyage;
          }
        })
      );

      setVoyages(voyagesAvecDetails);
    } catch {
      setToastMessage('Impossible de charger vos voyages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non spécifiée';
    try {
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date(dateString));
    } catch {
      return 'Date invalide';
    }
  };

  const formatHeure = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateString));
    } catch {
      return '';
    }
  };

  const calculerPrixTotal = (voyage: Voyage) => voyage.trajet?.prixUniquePlace || 0;

  const handlePayer = async (voyage: Voyage) => {
    try {
      setPayingId(voyage.id);
      await axios.put(`${API_BASE_URL}/VoyageApi/${voyage.id}`, {
        ...voyage,
        estPayee: true
      });
      setToastMessage('Paiement effectué avec succès !');
      fetchVoyages();
    } catch {
      setToastMessage('Erreur lors du paiement.');
    } finally {
      setPayingId(null);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Mes voyages</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message="Chargement de vos voyages..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mes voyages</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {voyages.length === 0 ? (
          <IonCard style={{ textAlign: 'center', padding: '30px', backgroundColor: '#f9f9f9' }}>
            <IonText>
              <h2>Vous n'avez aucun voyage</h2>
              <p>Réservez votre premier trajet pour commencer !</p>
            </IonText>
            <IonButton color="primary" onClick={() => history.push('/utilisateur/trajets')} style={{ marginTop: '15px' }}>
              Voir les trajets disponibles
            </IonButton>
          </IonCard>
        ) : (
          <IonList>
            {voyages.map(voyage => (
              <IonCard key={voyage.id} style={{ marginBottom: '15px', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                <IonCardHeader>
                  <IonCardTitle style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {voyage.trajet?.depart} → {voyage.trajet?.arrivee}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
                    <IonBadge color="medium">#{voyage.id}</IonBadge>
                    <IonChip color={voyage.estPayee ? 'success' : 'warning'}>
                      <IonIcon icon={voyage.estPayee ? checkmarkCircle : closeCircle} style={{ marginRight: '4px' }} />
                      {voyage.estPayee ? 'Payé' : 'En attente'}
                    </IonChip>
                    {voyage.trajet?.prixUniquePlace && <IonBadge color="tertiary">{calculerPrixTotal(voyage)} Ar</IonBadge>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                    {voyage.trajet?.dateDepart && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IonIcon icon={calendar} color="medium" />
                        <span>{formatDate(voyage.trajet.dateDepart)}</span>
                      </div>
                    )}
                    {voyage.trajet?.dateDepart && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IonIcon icon={time} color="medium" />
                        <span>{formatHeure(voyage.trajet.dateDepart)}</span>
                      </div>
                    )}
                    {voyage.lieuRecuperation && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IonIcon icon={location} color="medium" />
                        <span>Récupération: {voyage.lieuRecuperation}</span>
                      </div>
                    )}
                    {voyage.destination && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IonIcon icon={location} color="medium" />
                        <span>Destination: {voyage.destination}</span>
                      </div>
                    )}
                    {voyage.trajet?.vehicule && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <IonIcon icon={car} color="medium" />
                        <span>Véhicule: {voyage.trajet.vehicule.marque} {voyage.trajet.vehicule.modele} ({voyage.trajet.vehicule.plaque})</span>
                      </div>
                    )}
                  </div>

                  {!voyage.estPayee && (
                    <IonButton expand="block" color="primary" onClick={() => handlePayer(voyage)} disabled={payingId === voyage.id}>
                      {payingId === voyage.id ? 'Paiement en cours...' : 'Payer maintenant'}
                    </IonButton>
                  )}
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}

        <IonToast
          isOpen={toastMessage !== ''}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
        />
        <IonLoading isOpen={payingId !== null} message="Traitement du paiement..." />
      </IonContent>
    </IonPage>
  );
};

export default MesVoyages;