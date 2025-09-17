import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonToast,
  IonIcon,
  IonText,
  IonCard,
  IonCardContent,
  IonGrid,
  IonRow,
  IonCol,
  IonDatetimeButton,
  IonModal,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { 
  carOutline, 
  locationOutline, 
  calendarOutline, 
  cashOutline,
  checkmarkCircleOutline,
  arrowBackOutline
} from 'ionicons/icons';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import './Trajet.scss';

interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  plaque: string;
  annee: number;
  couleur: string;
}

interface Trajet {
  idVehicule: number;
  depart: string;
  arrivee: string;
  dateDepart?: string;
  prixUniquePlace?: number;
}

const Trajet: React.FC = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [selectedVehiculeId, setSelectedVehiculeId] = useState<number | null>(null);
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [prixUniquePlace, setPrixUniquePlace] = useState<number | undefined>();
  const [toastMessage, setToastMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer les véhicules au chargement du composant
  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        const res = await axios.get<Vehicule[]>(`${API_BASE_URL}/VehiculeApi`);
        setVehicules(res.data);
        if (res.data.length > 0) {
          setSelectedVehiculeId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
        setToastMessage('Impossible de charger les véhicules');
      }
    };

    fetchVehicules();
  }, []);

  const handleCreate = async () => {
    if (!selectedVehiculeId || !depart || !arrivee) {
      setToastMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsLoading(true);

    const newTrajet: Trajet = {
      idVehicule: selectedVehiculeId,
      depart,
      arrivee,
      dateDepart: dateDepart || new Date().toISOString(),
      prixUniquePlace
    };

    try {
      await axios.post(`${API_BASE_URL}/TrajetApi`, newTrajet);
      setShowSuccess(true);
      setToastMessage('Trajet créé avec succès !');
      
      // Réinitialiser le formulaire après un délai
      setTimeout(() => {
        setDepart('');
        setArrivee('');
        setDateDepart('');
        setPrixUniquePlace(undefined);
        setShowSuccess(false);
      }, 2000);
    } catch (err) {
      console.error(err);
      setToastMessage('Erreur lors de la création du trajet');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVehicule = vehicules.find(v => v.id === selectedVehiculeId);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton icon={arrowBackOutline} text="Retour" />
          </IonButtons>
          <IonTitle>Créer un trajet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="trajet-content">
        <div className="form-container">
          <IonCard className="form-card">
            <IonCardContent>
              {/* Véhicule */}
              <div className="input-section">
                <IonText color="medium" className="section-label">
                  <IonIcon icon={carOutline} className="section-icon" />
                  Véhicule
                </IonText>
                <IonItem className="custom-item" lines="none">
                  <IonSelect
                    value={selectedVehiculeId ?? undefined}
                    onIonChange={e => setSelectedVehiculeId(e.detail.value)}
                    interface="action-sheet"
                    className="custom-select"
                  >
                    {vehicules.map(v => (
                      <IonSelectOption key={v.id} value={v.id}>
                        {v.marque} {v.modele} - {v.plaque}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
                {selectedVehicule && (
                  <div className="vehicle-details">
                    <IonText color="medium" className="vehicle-info">
                      {selectedVehicule.couleur} • {selectedVehicule.annee}
                    </IonText>
                  </div>
                )}
              </div>

              {/* Départ et Arrivée */}
              <div className="input-section">
                <IonText color="medium" className="section-label">
                  <IonIcon icon={locationOutline} className="section-icon" />
                  Itinéraire
                </IonText>
                
                <IonGrid className="route-grid">
                  <IonRow>
                    <IonCol>
                      <IonItem className="custom-item route-item" lines="none">
                        <IonLabel position="stacked">Départ *</IonLabel>
                        <IonInput 
                          value={depart} 
                          onIonInput={e => setDepart(e.detail.value!)} 
                          placeholder="Lieu de départ"
                          className="custom-input"
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                  
                  <IonRow>
                    <IonCol>
                      <IonItem className="custom-item route-item" lines="none">
                        <IonLabel position="stacked">Arrivée *</IonLabel>
                        <IonInput 
                          value={arrivee} 
                          onIonInput={e => setArrivee(e.detail.value!)} 
                          placeholder="Destination"
                          className="custom-input"
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>

              {/* Date et heure - VERSION CORRIGÉE */}
              <div className="input-section">
                <IonText color="medium" className="section-label">
                  <IonIcon icon={calendarOutline} className="section-icon" />
                  Date et heure
                </IonText>
                <IonItem className="custom-item datetime-item" lines="none">
                  <IonLabel position="stacked">Date et heure de départ</IonLabel>
                  <IonDatetimeButton datetime="datetime" />
                  
                  <IonModal keepContentsMounted={true} trigger="datetime">
                    <IonContent>
                      <IonDatetime 
                        id="datetime"
                        value={dateDepart}
                        onIonChange={e => setDateDepart(e.detail.value!)}
                        presentation="date-time"
                        className="custom-datetime"
                      />
                      <div className="datetime-actions">
                        <IonButton 
                          fill="clear" 
                          onClick={() => {
                            const modal = document.querySelector('ion-modal');
                            modal?.dismiss();
                          }}
                        >
                          Fermer
                        </IonButton>
                      </div>
                    </IonContent>
                  </IonModal>
                </IonItem>
              </div>

              {/* Prix */}
              <div className="input-section">
                <IonText color="medium" className="section-label">
                  <IonIcon icon={cashOutline} className="section-icon" />
                  Tarification
                </IonText>
                <IonItem className="custom-item" lines="none">
                  <IonLabel position="stacked">Prix par place (MGA)</IonLabel>
                  <IonInput
                    type="number"
                    value={prixUniquePlace ?? ''}
                    onIonInput={e => setPrixUniquePlace(parseInt(e.detail.value!) || undefined)}
                    placeholder="0.00"
                    className="custom-input price-input"
                  />
                </IonItem>
              </div>

              {/* Bouton de création */}
              <IonButton 
                expand="block" 
                color="primary" 
                className="create-button"
                onClick={handleCreate}
                disabled={isLoading || !depart || !arrivee || !selectedVehiculeId}
              >
                {isLoading ? (
                  "Création en cours..."
                ) : showSuccess ? (
                  <>
                    <IonIcon icon={checkmarkCircleOutline} slot="start" />
                    Trajet créé !
                  </>
                ) : (
                  "Créer le trajet"
                )}
              </IonButton>

              <IonText color="medium" className="required-info">
                * Champs obligatoires
              </IonText>
            </IonCardContent>
          </IonCard>
        </div>

        <IonToast
          isOpen={toastMessage !== ''}
          message={toastMessage}
          duration={2000}
          onDidDismiss={() => setToastMessage('')}
          color={toastMessage.includes('succès') ? 'success' : 'danger'}
        />
      </IonContent>
    </IonPage>
  );
};

export default Trajet;