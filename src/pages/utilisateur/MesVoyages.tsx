// pages/UtilisateurMesVoyages.tsx
import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonBadge,
  IonToast,
  IonLoading,
  IonIcon,
  IonText,
  IonChip
} from '@ionic/react';
import { location, calendar, time, cash, car, checkmarkCircle, closeCircle } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

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

  // ID utilisateur actuel (à remplacer par l'ID réel de l'utilisateur connecté)
  const idUtilisateur = Number.parseInt(sessionStorage.getItem('userId') + '');

  // Charger les voyages de l'utilisateur
  const fetchVoyages = async () => {
    try {
      setLoading(true);
      
      // Récupérer tous les voyages
      const voyagesRes = await axios.get<Voyage[]>('http://localhost:5055/api/VoyageApi');
      
      // Filtrer pour n'avoir que les voyages de l'utilisateur actuel
      const voyagesUtilisateur = voyagesRes.data.filter(voyage => voyage.idPassager === idUtilisateur);
      
      // Récupérer les détails des trajets pour chaque voyage
      const voyagesAvecDetails = await Promise.all(
        voyagesUtilisateur.map(async (voyage) => {
          try {
            // Récupérer les détails du trajet
            const trajetRes = await axios.get(`http://localhost:5055/api/TrajetApi/${voyage.idTrajet}`);
            const trajet = trajetRes.data;
            
            // Récupérer les détails du véhicule
            const vehiculeRes = await axios.get(`http://localhost:5055/api/VehiculeApi/${trajet.idVehicule}`);
            const vehicule = vehiculeRes.data;
            
            return {
              ...voyage,
              trajet: {
                ...trajet,
                vehicule
              }
            };
          } catch (error) {
            console.error('Erreur lors du chargement des détails du trajet:', error);
            return voyage;
          }
        })
      );
      
      setVoyages(voyagesAvecDetails);
    } catch (err) {
      console.error(err);
      setToastMessage('Impossible de charger vos voyages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVoyages();
  }, []);

  const handlePayer = async (voyage: Voyage) => {
    try {
      setPayingId(voyage.id);
      
      // Préparer l'objet voyage complet avec tous les champs obligatoires
      const voyageToUpdate = {
        id: voyage.id,
        idPassager: voyage.idPassager,
        idTrajet: voyage.idTrajet,
        lieuRecuperation: voyage.lieuRecuperation || '',
        destination: voyage.destination || '',
        estPayee: true // Marquer comme payé
      };

      // Envoyer la requête PUT avec l'objet voyage complet
      await axios.put(`http://localhost:5055/api/VoyageApi/${voyage.id}`, voyageToUpdate);
      
      setToastMessage('Paiement effectué avec succès !');
      
      // Recharger la liste des voyages
      fetchVoyages();
      
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setToastMessage('Erreur lors du paiement. Vérifiez que tous les champs sont valides.');
    } finally {
      setPayingId(null);
    }
  };

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

  const calculerPrixTotal = (voyage: Voyage) => {
    if (!voyage.trajet?.prixUniquePlace) return 0;
    return voyage.trajet.prixUniquePlace;
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
          <IonCard>
            <IonCardContent className="ion-text-center">
              <IonText>
                <h2>Vous n'avez aucun voyage</h2>
                <p>Réservez votre premier trajet pour commencer !</p>
              </IonText>
              <IonButton 
                color="primary" 
                onClick={() => history.push('/utilisateur/trajets')}
              >
                Voir les trajets disponibles
              </IonButton>
            </IonCardContent>
          </IonCard>
        ) : (
          <IonList>
            {voyages.map(voyage => (
              <IonCard key={voyage.id}>
                <IonCardHeader>
                  <IonCardTitle>
                    {voyage.trajet?.depart} → {voyage.trajet?.arrivee}
                  </IonCardTitle>
                </IonCardHeader>
                
                <IonCardContent>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
                    <IonBadge color="primary">
                      #{voyage.id}
                    </IonBadge>
                    
                    <IonChip color={voyage.estPayee ? 'success' : 'warning'}>
                      <IonIcon icon={voyage.estPayee ? checkmarkCircle : closeCircle} />
                      {voyage.estPayee ? 'Payé' : 'En attente de paiement'}
                    </IonChip>
                    
                    {voyage.trajet?.prixUniquePlace && (
                      <IonBadge color="success">
                        <IonIcon icon={cash} /> {calculerPrixTotal(voyage)}€
                      </IonBadge>
                    )}
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    {voyage.trajet?.dateDepart && (
                      <>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <IonIcon icon={calendar} style={{ marginRight: '8px', color: '#3880ff' }} />
                          <strong>Date:</strong> {formatDate(voyage.trajet.dateDepart)}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                          <IonIcon icon={time} style={{ marginRight: '8px', color: '#3880ff' }} />
                          <strong>Heure:</strong> {formatHeure(voyage.trajet.dateDepart)}
                        </div>
                      </>
                    )}
                    
                    {voyage.lieuRecuperation && (
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <IonIcon icon={location} style={{ marginRight: '8px', color: '#3880ff' }} />
                        <strong>Lieu de récupération:</strong> {voyage.lieuRecuperation}
                      </div>
                    )}
                    
                    {voyage.destination && (
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <IonIcon icon={location} style={{ marginRight: '8px', color: '#3880ff' }} />
                        <strong>Destination:</strong> {voyage.destination}
                      </div>
                    )}
                    
                    {voyage.trajet?.vehicule && (
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                        <IonIcon icon={car} style={{ marginRight: '8px', color: '#3880ff' }} />
                        <strong>Véhicule:</strong> {voyage.trajet.vehicule.marque} {voyage.trajet.vehicule.modele} ({voyage.trajet.vehicule.plaque})
                      </div>
                    )}
                  </div>

                  {!voyage.estPayee && (
                    <IonButton
                      expand="block"
                      color="success"
                      onClick={() => handlePayer(voyage)}
                      disabled={payingId === voyage.id}
                    >
                      {payingId === voyage.id ? 'Paiement en cours...' : 'Payer maintenant'}
                    </IonButton>
                  )}

                  {voyage.estPayee && (
                    <IonButton
                      expand="block"
                      color="medium"
                      fill="outline"
                      onClick={() => history.push(`/utilisateur/detail-voyage/${voyage.id}`)}
                    >
                      Voir les détails
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