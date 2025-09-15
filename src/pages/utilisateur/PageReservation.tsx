// pages/PageReservation.tsx
import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonLoading,
  IonText,
  IonIcon,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { calendar, time, cash, car, people } from 'ionicons/icons';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';

interface Trajet {
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
    nombrePlace?: number;
  };
  placesDisponibles?: number;
}

const PageReservation: React.FC = () => {
  const history = useHistory();
  const { trajetId } = useParams<{ trajetId: string }>();
  const [trajet, setTrajet] = useState<Trajet | null>(null);
  const [nombrePlaces, setNombrePlaces] = useState<number>(1);
  const [lieuRecuperation, setLieuRecuperation] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [reserving, setReserving] = useState(false);

  // Charger les détails du trajet
  const fetchTrajet = async () => {
    try {
      setLoading(true);
      const res = await axios.get<Trajet>(`${API_BASE_URL}/TrajetApi/${trajetId}`);
      const trajetData = res.data;

      const vehiculeRes = await axios.get(`${API_BASE_URL}/VehiculeApi/${trajetData.idVehicule}`);
      const vehicule = vehiculeRes.data;

      const reservationsRes = await axios.get(`${API_BASE_URL}/VoyageApi`);
      const voyagesTrajet = reservationsRes.data.filter((v: any) => v.idTrajet === trajetData.id);

      const placesDisponibles = (vehicule.nombrePlace || 4) - voyagesTrajet.length;

      setTrajet({
        ...trajetData,
        vehicule,
        placesDisponibles: Math.max(0, placesDisponibles)
      });
    } catch (err) {
      console.error(err);
      setToastMessage('Impossible de charger les détails du trajet');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (trajetId) fetchTrajet();
  }, [trajetId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non spécifiée';
    try {
      return new Intl.DateTimeFormat('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(dateString));
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

  const calculerPrixTotal = () => trajet?.prixUniquePlace ? trajet.prixUniquePlace * nombrePlaces : 0;

  const handleReserver = async () => {
    if (!trajet) return;

    if (nombrePlaces <= 0) return setToastMessage('Veuillez sélectionner au moins 1 place');
    if (nombrePlaces > (trajet.placesDisponibles || 0)) return setToastMessage(`Seulement ${trajet.placesDisponibles} place(s) disponible(s)`);
    if (!lieuRecuperation.trim()) return setToastMessage('Veuillez indiquer un lieu de récupération');
    if (!destination.trim()) return setToastMessage('Veuillez indiquer votre destination');

    try {
      setReserving(true);
      const userId = Number(sessionStorage.getItem('userId') || 0);

      const newVoyage = {
        idTrajet: trajet.id,
        idPassager: userId,
        lieuRecuperation: lieuRecuperation.trim(),
        destination: destination.trim()
      };

      for (let i = 0; i < nombrePlaces; i++) {
        await axios.post(`${API_BASE_URL}/VoyageApi`, newVoyage);
      }

      setToastMessage('Réservation confirmée !');
      setTimeout(() => history.push('/utilisateur/trajets'), 2000);
    } catch (err) {
      console.error(err);
      setToastMessage('Erreur lors de la réservation');
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton defaultHref="/utilisateur/trajets" /></IonButtons>
            <IonTitle>Réservation</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent><IonLoading isOpen={loading} message="Chargement..." /></IonContent>
      </IonPage>
    );
  }

  if (!trajet) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonBackButton defaultHref="/utilisateur/trajets" /></IonButtons>
            <IonTitle>Réservation</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="danger"><h2>Trajet non trouvé</h2></IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/utilisateur/trajets" /></IonButtons>
          <IonTitle>Réserver un trajet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Détails du trajet */}
        <IonCard>
          <IonCardHeader><IonCardTitle>{trajet.depart} → {trajet.arrivee}</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <div style={{ marginBottom: '15px' }}>
              {trajet.dateDepart && (
                <div style={{ marginBottom: '8px' }}>
                  <IonIcon icon={calendar} style={{ marginRight: '6px', color: '#555' }} />
                  <strong>Date:</strong> {formatDate(trajet.dateDepart)}
                </div>
              )}
              {trajet.dateDepart && (
                <div style={{ marginBottom: '8px' }}>
                  <IonIcon icon={time} style={{ marginRight: '6px', color: '#555' }} />
                  <strong>Heure:</strong> {formatHeure(trajet.dateDepart)}
                </div>
              )}
              {trajet.vehicule && (
                <div style={{ marginBottom: '8px' }}>
                  <IonIcon icon={car} style={{ marginRight: '6px', color: '#555' }} />
                  <strong>Véhicule:</strong> {trajet.vehicule.marque} {trajet.vehicule.modele}
                </div>
              )}
              <div style={{ marginBottom: '8px' }}>
                <IonIcon icon={people} style={{ marginRight: '6px', color: '#555' }} />
                <strong>Places disponibles:</strong> {trajet.placesDisponibles}
              </div>
              {trajet.prixUniquePlace && (
                <div style={{ marginBottom: '8px' }}>
                  <IonIcon icon={cash} style={{ marginRight: '6px', color: '#555' }} />
                  <strong>Prix par place:</strong> {trajet.prixUniquePlace} Ar
                </div>
              )}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Formulaire de réservation */}
        <IonCard>
          <IonCardHeader><IonCardTitle>Détails de la réservation</IonCardTitle></IonCardHeader>
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Nombre de places *</IonLabel>
              <IonInput
                type="number"
                value={nombrePlaces}
                onIonInput={(e) => setNombrePlaces(parseInt(e.detail.value!) || 1)}
                min={1}
                max={trajet.placesDisponibles}
              />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Lieu de récupération *</IonLabel>
              <IonInput value={lieuRecuperation} onIonInput={(e) => setLieuRecuperation(e.detail.value!)} />
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">Destination *</IonLabel>
              <IonInput value={destination} onIonInput={(e) => setDestination(e.detail.value!)} />
            </IonItem>

            {trajet.prixUniquePlace && (
              <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f4f4f4', borderRadius: '8px' }}>
                <IonText>
                  <h3><strong>Prix total: {calculerPrixTotal()} Ar</strong></h3>
                  <p>{nombrePlaces} × {trajet.prixUniquePlace} Ar</p>
                </IonText>
              </div>
            )}

            <IonButton
              expand="block"
              color="primary"
              onClick={handleReserver}
              disabled={reserving || !lieuRecuperation.trim() || nombrePlaces <= 0}
            >
              {reserving ? 'Réservation en cours...' : 'Confirmer la réservation'}
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonToast
          isOpen={toastMessage !== ''}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
        />
        <IonLoading isOpen={reserving} message="Traitement de votre réservation..." />
      </IonContent>
    </IonPage>
  );
};

export default PageReservation;
