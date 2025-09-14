// pages/UtilisateurListeTrajets.tsx
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
  IonIcon,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonLoading
} from '@ionic/react';
import { calendar, cash, time, people, car } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
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

interface Reservation {
  id: number;
  idTrajet: number;
  idUtilisateur: number;
  dateReservation: string;
  statut: string;
}

const ListeTrajet: React.FC = () => {
  const history = useHistory();
  const [trajets, setTrajets] = useState<Trajet[]>([]);
  const [filteredTrajets, setFilteredTrajets] = useState<Trajet[]>([]);
  const [searchText, setSearchText] = useState('');
  const [filterDepart, setFilterDepart] = useState('');
  const [filterArrivee, setFilterArrivee] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Charger tous les trajets avec les véhicules et places disponibles
  const fetchTrajets = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les trajets
      const trajetsRes = await axios.get<Trajet[]>(`${API_BASE_URL}/TrajetApi`);

      const allTrajets = trajetsRes.data;

      // Récupérer toutes les réservations
      const reservationsRes = await axios.get<Reservation[]>(`${API_BASE_URL}/VoyageApi`);
      const allReservations = reservationsRes.data;

      // Pour chaque trajet, récupérer le véhicule et calculer les places disponibles
      const trajetsAvecDetails = await Promise.all(
        allTrajets.map(async (trajet) => {
          try {
            // Récupérer les détails du véhicule
            const vehiculeRes = await axios.get(`${API_BASE_URL}/VehiculeApi/${trajet.idVehicule}`);
            const vehicule = vehiculeRes.data;

            // Compter les réservations pour ce trajet
            const reservationsTrajet = allReservations.filter(res => res.idTrajet === trajet.id);
            const placesDisponibles = (vehicule.nombrePlace || 4) - reservationsTrajet.length;

            return {
              ...trajet,
              vehicule,
              placesDisponibles: Math.max(0, placesDisponibles) // Éviter les valeurs négatives
            };
          } catch (error) {
            console.error('Erreur lors du chargement des détails du trajet:', error);
            return {
              ...trajet,
              placesDisponibles: 0 // Par défaut si erreur
            };
          }
        })
      );

      setTrajets(trajetsAvecDetails);
      setFilteredTrajets(trajetsAvecDetails);
    } catch (err) {
      console.error(err);
      setToastMessage('Impossible de charger les trajets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, []);

  // Filtrer les trajets
  useEffect(() => {
    let filtered = trajets;
    
    if (searchText) {
      filtered = filtered.filter(trajet =>
        trajet.depart.toLowerCase().includes(searchText.toLowerCase()) ||
        trajet.arrivee.toLowerCase().includes(searchText.toLowerCase()) ||
        (trajet.vehicule?.marque && trajet.vehicule.marque.toLowerCase().includes(searchText.toLowerCase())) ||
        (trajet.vehicule?.modele && trajet.vehicule.modele.toLowerCase().includes(searchText.toLowerCase()))
      );
    }
    
    if (filterDepart) {
      filtered = filtered.filter(trajet =>
        trajet.depart.toLowerCase().includes(filterDepart.toLowerCase())
      );
    }
    
    if (filterArrivee) {
      filtered = filtered.filter(trajet =>
        trajet.arrivee.toLowerCase().includes(filterArrivee.toLowerCase())
      );
    }
    
    setFilteredTrajets(filtered);
  }, [searchText, filterDepart, filterArrivee, trajets]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date non spécifiée';
    
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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

  const handleAcheterPlace = (trajetId: number) => {
    history.push(`/utilisateur/reserver-trajet/${trajetId}`);
  };

  const handleVoirDetails = (trajetId: number) => {
    history.push(`/utilisateur/detail-trajet/${trajetId}`);
  };

  const getUniqueVilles = (field: 'depart' | 'arrivee') => {
    const villes = trajets.map(t => t[field]).filter((ville): ville is string => !!ville);
    return Array.from(new Set(villes)).sort();
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonTitle>Tous les trajets disponibles</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <IonLoading isOpen={loading} message="Chargement des trajets..." />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tous les trajets disponibles</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Barre de recherche et filtres */}
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value!)}
          placeholder="Rechercher un trajet, ville, véhicule..."
        />

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <IonSelect
            value={filterDepart}
            placeholder="Départ"
            onIonChange={(e) => setFilterDepart(e.detail.value)}
            style={{ minWidth: '120px' }}
          >
            <IonSelectOption value="">Tous les départs</IonSelectOption>
            {getUniqueVilles('depart').map(ville => (
              <IonSelectOption key={ville} value={ville}>{ville}</IonSelectOption>
            ))}
          </IonSelect>

          <IonSelect
            value={filterArrivee}
            placeholder="Arrivée"
            onIonChange={(e) => setFilterArrivee(e.detail.value)}
            style={{ minWidth: '120px' }}
          >
            <IonSelectOption value="">Toutes les arrivées</IonSelectOption>
            {getUniqueVilles('arrivee').map(ville => (
              <IonSelectOption key={ville} value={ville}>{ville}</IonSelectOption>
            ))}
          </IonSelect>

          <IonButton
            size="small"
            color="medium"
            onClick={() => {
              setFilterDepart('');
              setFilterArrivee('');
              setSearchText('');
            }}
          >
            Réinitialiser
          </IonButton>
        </div>

        {/* Liste des trajets */}
        <IonList>
          {filteredTrajets.length === 0 ? (
            <IonItem>
              <IonLabel className="ion-text-center">
                <h2>Aucun trajet trouvé</h2>
                <p>{trajets.length === 0 ? 'Aucun trajet disponible' : 'Aucun trajet ne correspond à vos critères'}</p>
              </IonLabel>
            </IonItem>
          ) : (
            filteredTrajets.map(trajet => (
              <IonCard key={trajet.id}>
                <IonCardHeader>
                  <IonCardTitle>
                    {trajet.depart} → {trajet.arrivee}
                  </IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <IonBadge color="primary">
                      #{trajet.id}
                    </IonBadge>
                    
                    {trajet.prixUniquePlace && (
                      <IonBadge color="success">
                        <IonIcon icon={cash} /> {trajet.prixUniquePlace}€
                      </IonBadge>
                    )}
                    
                    <IonChip color={trajet.placesDisponibles && trajet.placesDisponibles > 0 ? 'success' : 'danger'}>
                      <IonIcon icon={people} /> 
                      {trajet.placesDisponibles !== undefined ? `${trajet.placesDisponibles} place(s)` : 'N/A'}
                    </IonChip>
                  </div>

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
                        <strong>Véhicule:</strong> {trajet.vehicule.marque} {trajet.vehicule.modele} ({trajet.vehicule.plaque})
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                    <IonButton
                      color="success"
                      expand="block"
                      onClick={() => handleAcheterPlace(trajet.id)}
                      disabled={!trajet.placesDisponibles || trajet.placesDisponibles <= 0}
                    >
                      {!trajet.placesDisponibles || trajet.placesDisponibles <= 0 ? 'Complet' : 'Réserver'}
                    </IonButton>
                    
                    <IonButton
                      color="primary"
                      fill="outline"
                      onClick={() => handleVoirDetails(trajet.id)}
                    >
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

export default ListeTrajet;