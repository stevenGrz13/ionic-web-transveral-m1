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

interface Voyage {
  idTrajet: number;
  idPassager: number;
  nombrePlaces: number;
  lieuRecuperation: string;
  statut?: string;
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

      // Récupérer les détails du véhicule
      const vehiculeRes = await axios.get(`${API_BASE_URL}/VehiculeApi/${trajetData.idVehicule}`);
      const vehicule = vehiculeRes.data;

      // Récupérer les réservations pour calculer les places disponibles
      const reservationsRes = await axios.get(`${API_BASE_URL}/VoyageApi`);
      const allVoyages = reservationsRes.data;
      const voyagesTrajet = allVoyages.filter((voyage: any) => voyage.idTrajet === trajetData.id);
      
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
    if (trajetId) {
      fetchTrajet();
    }
  }, [trajetId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non spécifiée';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(date);
    } catch (error) {
      return 'Date invalide';
    }
  };

  const formatHeure = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return '';
    }
  };

  const handleReserver = async () => {
    if (!trajet) return;

    // Validation
    if (nombrePlaces <= 0) {
      setToastMessage('Veuillez sélectionner au moins 1 place');
      return;
    }

    if (nombrePlaces > (trajet.placesDisponibles || 0)) {
      setToastMessage(`Seulement ${trajet.placesDisponibles} place(s) disponible(s)`);
      return;
    }

    if (!lieuRecuperation.trim()) {
      setToastMessage('Veuillez indiquer un lieu de récupération');
      return;
    }

    if (!destination.trim()) {
      setToastMessage('Veuillez indiquer votre destination');
      return;
    }

    try {
      setReserving(true);

        const userId = Number.parseInt(sessionStorage.getItem('userId') + ''); 

        const newVoyage = {
            idTrajet : trajet.id,
            idPassager : userId,
            lieuRecuperation : lieuRecuperation.trim(),
            destination : destination.trim()
        }

      if(nombrePlaces > 1){
        for(let i = 0; i<nombrePlaces; i++){
            await axios.post(`${API_BASE_URL}/VoyageApi`, newVoyage);
        }
      }
      if(nombrePlaces == 1){
        await axios.post(`${API_BASE_URL}/VoyageApi`, newVoyage);
      }
      
      setToastMessage('Réservation confirmée !');
      
      // Redirection après un délai
      setTimeout(() => {
        history.push('/utilisateur/trajets');
      }, 2000);

    } catch (err) {
      console.error(err);
      setToastMessage('Erreur lors de la réservation');
    } finally {
      setReserving(false);
    }
  };

  const calculerPrixTotal = () => {
    if (!trajet || !trajet.prixUniquePlace) return 0;
    return trajet.prixUniquePlace * nombrePlaces;
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/utilisateur/trajets" />
            </IonButtons>
            <IonTitle>Réservation</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message="Chargement..." />
        </IonContent>
      </IonPage>
    );
  }

  if (!trajet) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/utilisateur/trajets" />
            </IonButtons>
            <IonTitle>Réservation</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonText color="danger">
            <h2>Trajet non trouvé</h2>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/utilisateur/trajets" />
          </IonButtons>
          <IonTitle>Réserver un trajet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Détails du trajet */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              {trajet.depart} → {trajet.arrivee}
            </IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <div style={{ marginBottom: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <IonIcon icon={calendar} style={{ marginRight: '8px', color: '#3880ff' }} />
                <strong>Date:</strong> {formatDate(trajet.dateDepart)}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <IonIcon icon={time} style={{ marginRight: '8px', color: '#3880ff' }} />
                <strong>Heure:</strong> {formatHeure(trajet.dateDepart)}
              </div>
              
              {trajet.vehicule && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <IonIcon icon={car} style={{ marginRight: '8px', color: '#3880ff' }} />
                  <strong>Véhicule:</strong> {trajet.vehicule.marque} {trajet.vehicule.modele}
                </div>
              )}
              
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <IonIcon icon={people} style={{ marginRight: '8px', color: '#3880ff' }} />
                <strong>Places disponibles:</strong> {trajet.placesDisponibles}
              </div>
              
              {trajet.prixUniquePlace && (
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                  <IonIcon icon={cash} style={{ marginRight: '8px', color: '#3880ff' }} />
                  <strong>Prix par place:</strong> {trajet.prixUniquePlace}€
                </div>
              )}
            </div>
          </IonCardContent>
        </IonCard>

        {/* Formulaire de réservation */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Détails de la réservation</IonCardTitle>
          </IonCardHeader>
          
          <IonCardContent>
            <IonItem>
              <IonLabel position="stacked">Nombre de places *</IonLabel>
              <IonInput
                type="number"
                value={nombrePlaces}
                onIonInput={(e) => setNombrePlaces(parseInt(e.detail.value!) || 1)}
                min="1"
                max={trajet.placesDisponibles}
                placeholder="Nombre de places"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Lieu de récupération *</IonLabel>
              <IonInput
                value={lieuRecuperation}
                onIonInput={(e) => setLieuRecuperation(e.detail.value!)}
                placeholder="Ex: Gare centrale, 123 Rue Principale..."
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Destination *</IonLabel>
              <IonInput
                value={destination}
                onIonInput={(e) => setDestination(e.detail.value!)}
                placeholder="Ex: Gare centrale, 123 Rue Principale..."
              />
            </IonItem>

            {trajet.prixUniquePlace && (
              <div style={{ margin: '20px 0', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <IonText>
                  <h3>
                    <strong>Prix total: {calculerPrixTotal()}€</strong>
                  </h3>
                  <p>{nombrePlaces} place(s) × {trajet.prixUniquePlace}€</p>
                </IonText>
              </div>
            )}

            <IonButton
              expand="block"
              color="success"
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