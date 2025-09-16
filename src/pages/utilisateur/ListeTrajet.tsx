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
import { calendar, time, people, car } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { API_BASE_URL } from '../../../config';
import './UtilisateurListeTrajets.scss'; // ✅ Import du SCSS

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
  const [showToast, setShowToast] = useState(false);

  // -------------------- Récupération des données --------------------
  const fetchTrajets = async () => {
    try {
      setLoading(true);

      const trajetsRes = await axios.get<Trajet[]>(`${API_BASE_URL}/TrajetApi`);
      const reservationsRes = await axios.get<Reservation[]>(`${API_BASE_URL}/VoyageApi`);

      const allTrajets = trajetsRes.data;
      const allReservations = reservationsRes.data;

      const trajetsAvecDetails = await Promise.all(
        allTrajets.map(async (trajet) => {
          try {
            const vehiculeRes = await axios.get(`${API_BASE_URL}/VehiculeApi/${trajet.idVehicule}`);
            const vehicule = vehiculeRes.data;

            const reservationsTrajet = allReservations.filter(res => res.idTrajet === trajet.id);
            const placesDisponibles = (vehicule.nombrePlace || 4) - reservationsTrajet.length;

            return { ...trajet, vehicule, placesDisponibles: Math.max(0, placesDisponibles) };
          } catch {
            return { ...trajet, placesDisponibles: 0 };
          }
        })
      );

      setTrajets(trajetsAvecDetails);
      setFilteredTrajets(trajetsAvecDetails);
    } catch {
      setToastMessage('Impossible de charger les trajets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrajets();
  }, []);

  // -------------------- Filtrage --------------------
  useEffect(() => {
    let filtered = trajets;

    if (searchText) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(trajet =>
        trajet.depart.toLowerCase().includes(search) ||
        trajet.arrivee.toLowerCase().includes(search) ||
        trajet.vehicule?.marque.toLowerCase().includes(search) ||
        trajet.vehicule?.modele.toLowerCase().includes(search)
      );
    }

    if (filterDepart) {
      filtered = filtered.filter(trajet => trajet.depart.toLowerCase().includes(filterDepart.toLowerCase()));
    }

    if (filterArrivee) {
      filtered = filtered.filter(trajet => trajet.arrivee.toLowerCase().includes(filterArrivee.toLowerCase()));
    }

    setFilteredTrajets(filtered);
  }, [searchText, filterDepart, filterArrivee, trajets]);

  // -------------------- Helpers --------------------
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
    } catch {
      return 'Date invalide';
    }
  };

  const formatHeure = (dateString?: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(date);
    } catch {
      return '';
    }
  };

  // -------------------- Actions --------------------
  const handleAcheterPlaceWithCheck = (id: number) => {
    if (sessionStorage.getItem('abonnement') !== 'true') {
      setShowToast(true);
      return;
    }
    history.push(`/utilisateur/reserver-trajet/${id}`);
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

      <IonContent className="liste-trajets ion-padding">
        {/* --- Recherche & Filtres --- */}
        <IonSearchbar
          value={searchText}
          onIonInput={e => setSearchText(e.detail.value!)}
          placeholder="Rechercher un trajet, ville ou véhicule"
        />

        <div className="filters">
          <IonSelect
            value={filterDepart}
            placeholder="Départ"
            onIonChange={e => setFilterDepart(e.detail.value)}
          >
            <IonSelectOption value="">Tous les départs</IonSelectOption>
            {getUniqueVilles('depart').map(ville => (
              <IonSelectOption key={ville} value={ville}>{ville}</IonSelectOption>
            ))}
          </IonSelect>

          <IonSelect
            value={filterArrivee}
            placeholder="Arrivée"
            onIonChange={e => setFilterArrivee(e.detail.value)}
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

        {/* --- Liste des trajets --- */}
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
              <IonCard key={trajet.id} className="trajet-card">
                <IonCardHeader>
                  <IonCardTitle>
                    {trajet.depart} → {trajet.arrivee}
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <div className="trajet-header">
                    <IonBadge color="primary">#{trajet.id}</IonBadge>
                    {trajet.prixUniquePlace && <IonBadge color="success">{trajet.prixUniquePlace} Ar</IonBadge>}
                    <IonChip color={trajet.placesDisponibles && trajet.placesDisponibles > 0 ? 'success' : 'danger'}>
                      <IonIcon icon={people} />
                      {trajet.placesDisponibles !== undefined ? `${trajet.placesDisponibles} place(s)` : 'N/A'}
                    </IonChip>
                  </div>

                  <div className="trajet-details">
                    <div><IonIcon icon={calendar} /> <strong>Date:</strong> {formatDate(trajet.dateDepart)}</div>
                    <div><IonIcon icon={time} /> <strong>Heure:</strong> {formatHeure(trajet.dateDepart)}</div>
                    {trajet.vehicule && (
                      <div><IonIcon icon={car} /> <strong>Véhicule:</strong> {trajet.vehicule.marque} {trajet.vehicule.modele} ({trajet.vehicule.plaque})</div>
                    )}
                  </div>

                  <div className="trajet-actions">
                    <IonButton
                      color="success"
                      expand="block"
                      onClick={() => handleAcheterPlaceWithCheck(trajet.id)}
                      disabled={!trajet.placesDisponibles || trajet.placesDisponibles <= 0}
                    >
                      {!trajet.placesDisponibles || trajet.placesDisponibles <= 0 ? 'Complet' : 'Réserver'}
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

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message="Vous devez avoir un abonnement actif pour réserver."
          duration={2500}
          color="danger"
        />
      </IonContent>
    </IonPage>
  );
};

export default ListeTrajet;
