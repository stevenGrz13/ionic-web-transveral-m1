// pages/ChauffeurTrajetsVehicule.tsx
import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonToast,
  IonBackButton,
  IonButtons,
  IonIcon
} from '@ionic/react';
import { car, calendar, location, cash } from 'ionicons/icons';
import axios from 'axios';
import { useHistory, useParams } from 'react-router-dom';

interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  plaque: string;
  nombrePlace?: number;
}

interface Trajet {
  id: number;
  idVehicule: number;
  depart: string;
  arrivee: string;
  dateDepart?: string;
  prixUniquePlace?: number;
  vehicule?: Vehicule;
}

const TrajetsVehicule: React.FC = () => {
  const history = useHistory();
  const { vehiculeId } = useParams<{ vehiculeId: string }>();
  const [vehicule, setVehicule] = useState<Vehicule | null>(null);
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [allTrajets, setAllTrajets] = useState<Trajet[]>([]);
  const [showAllTrajets, setShowAllTrajets] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Charger les détails du véhicule
  const fetchVehicule = async () => {
    try {
      const res = await axios.get<Vehicule>(`http://localhost:5055/api/VehiculeApi/${vehiculeId}`);
      setVehicule(res.data);
    } catch (err) {
      console.error(err);
      setToastMessage('Impossible de charger les détails du véhicule');
    }
  };

  // Charger les trajets de ce véhicule
  const fetchTrajetsVehicule = async () => {
    try {
      const res = await axios.get<Trajet[]>('http://localhost:5055/api/TrajetApi');
      const trajetsVehicule = res.data.filter(trajet => trajet.idVehicule === parseInt(vehiculeId));
      setTrajets(trajetsVehicule);
    } catch (err) {
      console.error(err);
      setToastMessage('Impossible de charger les trajets');
    }
  };

  // Charger tous les trajets (pour le bouton "Tous les trajets")
  const fetchAllTrajets = async () => {
    try {
      const res = await axios.get<Trajet[]>('http://localhost:5055/api/TrajetApi');
      setAllTrajets(res.data);
      setShowAllTrajets(true);
    } catch (err) {
      console.error(err);
      setToastMessage('Impossible de charger tous les trajets');
    }
  };

  useEffect(() => {
    if (vehiculeId) {
      fetchVehicule();
      fetchTrajetsVehicule();
    }
  }, [vehiculeId]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non spécifiée';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleCreateTrajet = () => {
    history.push('/chauffeur/creer-trajet');
  };

  const handleEditTrajet = (trajetId: number) => {
    history.push(`/chauffeur/modifier-trajet/${trajetId}`);
  };

  const handleViewAllTrajets = () => {
    fetchAllTrajets();
  };

  const handleBackToVehiculeTrajets = () => {
    setShowAllTrajets(false);
  };

  const displayedTrajets = showAllTrajets ? allTrajets : trajets;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/chauffeur/mes-vehicules" />
          </IonButtons>
          <IonTitle>
            {showAllTrajets ? 'Tous mes trajets' : `Trajets - ${vehicule?.marque} ${vehicule?.modele}`}
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {!showAllTrajets && vehicule && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                <IonIcon icon={car} /> {vehicule.marque} {vehicule.modele}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <p>Plaque: {vehicule.plaque}</p>
              {vehicule.nombrePlace && <p>Places: {vehicule.nombrePlace}</p>}
              <IonButton expand="block" color="primary" onClick={handleCreateTrajet}>
                Créer un nouveau trajet
              </IonButton>
              <IonButton expand="block" color="secondary" onClick={handleViewAllTrajets}>
                Voir tous mes trajets
              </IonButton>
            </IonCardContent>
          </IonCard>
        )}

        {showAllTrajets && (
          <IonButton expand="block" color="medium" onClick={handleBackToVehiculeTrajets}>
            ← Retour aux trajets du véhicule
          </IonButton>
        )}

        <IonList>
          {displayedTrajets.length === 0 ? (
            <IonItem>
              <IonLabel className="ion-text-center">
                <h2>Aucun trajet trouvé</h2>
                <p>{showAllTrajets ? 'Vous n\'avez créé aucun trajet' : 'Ce véhicule n\'a aucun trajet'}</p>
              </IonLabel>
            </IonItem>
          ) : (
            displayedTrajets.map(trajet => (
              <IonCard key={trajet.id}>
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <IonBadge color="primary">
                      #{trajet.id}
                    </IonBadge>
                    {trajet.prixUniquePlace && (
                      <IonBadge color="success">
                        <IonIcon icon={cash} /> {trajet.prixUniquePlace}€
                      </IonBadge>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <IonIcon icon={location} style={{ marginRight: '8px' }} />
                      <strong>Départ:</strong> {trajet.depart}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                      <IonIcon icon={location} style={{ marginRight: '8px' }} />
                      <strong>Arrivée:</strong> {trajet.arrivee}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                      <IonIcon icon={calendar} style={{ marginRight: '8px' }} />
                      <strong>Date:</strong> {formatDate(trajet.dateDepart)}
                    </div>
                  </div>

                  {showAllTrajets && trajet.vehicule && (
                    <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                      <strong>Véhicule:</strong> {trajet.vehicule.marque} {trajet.vehicule.modele} ({trajet.vehicule.plaque})
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <IonButton size="small" onClick={() => handleEditTrajet(trajet.id)}>
                      Modifier
                    </IonButton>
                    <IonButton size="small" color="medium">
                      Détails
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            ))
          )}
        </IonList>

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

export default TrajetsVehicule;