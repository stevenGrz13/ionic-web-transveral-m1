// pages/ChauffeurMesVehicules.tsx
import React, { useState, useEffect } from 'react';
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
  IonButton,
  IonModal,
  IonInput,
  IonItem,
  IonLabel,
  IonItemDivider,
  IonToast,
  IonFab,
  IonFabButton,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { add, car } from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router';
import { API_BASE_URL } from '../../../config';
import './MesVehicules.scss';

interface Vehicule {
  id: number;
  idUtilisateur: number;
  marque: string;
  modele: string;
  plaque: string;
  nombrePlace?: number;
}

const PageVehicules: React.FC = () => {
  const history = useHistory();
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const userId = Number.parseInt(sessionStorage.getItem('userId') + '');
  const [newVehicule, setNewVehicule] = useState<Partial<Vehicule>>({
    marque: '',
    modele: '',
    plaque: '',
    nombrePlace: undefined,
    idUtilisateur: userId
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchVehicules = async () => {
    try {
      const res = await axios.get<Vehicule[]>(`${API_BASE_URL}/VehiculeApi`);
      setVehicules(res.data);
    } catch (err) {
      console.error(err);
      setToastMessage('Impossible de charger les véhicules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  const handleSelect = (vehicule: Vehicule) => {
    setSelectedVehicule({ ...vehicule });
    setModalOpen(true);
  };

  const handleAddNew = () => {
    setNewVehicule({
      marque: '',
      modele: '',
      plaque: '',
      nombrePlace: undefined,
      idUtilisateur: userId
    });
    setAddModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedVehicule) return;
    try {
      await axios.put(`${API_BASE_URL}/VehiculeApi/${selectedVehicule.id}`, selectedVehicule);
      setToastMessage('Véhicule mis à jour !');
      setModalOpen(false);
      fetchVehicules();
    } catch {
      setToastMessage('Erreur lors de la mise à jour');
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API_BASE_URL}/VehiculeApi`, newVehicule);
      setToastMessage('Véhicule ajouté !');
      setAddModalOpen(false);
      fetchVehicules();
    } catch {
      setToastMessage('Erreur lors de l\'ajout du véhicule');
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicule) return;
    try {
      await axios.delete(`${API_BASE_URL}/VehiculeApi/${selectedVehicule.id}`);
      setToastMessage('Véhicule supprimé !');
      setModalOpen(false);
      fetchVehicules();
    } catch {
      setToastMessage('Erreur lors de la suppression');
    }
  };

  const handleChange = (field: keyof Vehicule, value: any) => {
    if (selectedVehicule) {
      setSelectedVehicule(prev => ({ ...prev!, [field]: value }));
    }
  };

  const handleNewChange = (field: keyof Vehicule, value: any) => {
    setNewVehicule(prev => ({ ...prev, [field]: value }));
  };

  const handleTrajetsClick = (e: React.MouseEvent, vehiculeId: number) => {
    e.stopPropagation();
    history.push(`/chauffeur/trajets-vehicule/${vehiculeId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Mes véhicules</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="mesvehicules-container" fullscreen>
        {loading ? (
          <div className="loading">
            <IonSpinner name="dots" />
          </div>
        ) : vehicules.length === 0 ? (
          <p className="empty-text">Aucun véhicule enregistré pour le moment</p>
        ) : (
          vehicules.map(v => (
            <IonCard key={v.id} className="vehicule-card" button onClick={() => handleSelect(v)}>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={car} className="car-icon" /> {v.marque} {v.modele}
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p className="vehicule-info"><strong>Plaque :</strong> {v.plaque}</p>
                {v.nombrePlace && (
                  <p className="vehicule-info"><strong>Places :</strong> {v.nombrePlace}</p>
                )}
                <IonButton
                  size="small"
                  color="secondary"
                  onClick={(e) => handleTrajetsClick(e, v.id)}
                >
                  Voir les trajets
                </IonButton>
              </IonCardContent>
            </IonCard>
          ))
        )}

        <IonButton
          expand="block"
          className="create-trajet-btn"
          onClick={() => {
            history.push({
              pathname: '/chauffeur/creer-trajet',
              state: { vehicules }
            });
          }}
        >
          Créer un nouveau trajet
        </IonButton>

        {/* Bouton flottant pour ajouter un véhicule */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAddNew} color="primary">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modal modification */}
        <IonModal isOpen={modalOpen} onDidDismiss={() => setModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Modifier le véhicule</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedVehicule && (
              <>
                <IonItem>
                  <IonLabel position="floating">Marque *</IonLabel>
                  <IonInput
                    value={selectedVehicule.marque}
                    onIonInput={(e) => handleChange('marque', e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Modèle *</IonLabel>
                  <IonInput
                    value={selectedVehicule.modele}
                    onIonInput={(e) => handleChange('modele', e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Plaque d'immatriculation *</IonLabel>
                  <IonInput
                    value={selectedVehicule.plaque}
                    onIonInput={(e) => handleChange('plaque', e.detail.value!)}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel position="floating">Nombre de places</IonLabel>
                  <IonInput
                    type="number"
                    value={selectedVehicule.nombrePlace?.toString() || ''}
                    onIonInput={(e) => handleChange('nombrePlace', parseInt(e.detail.value!) || 0)}
                  />
                </IonItem>

                <IonItemDivider />

                <IonButton expand="block" color="primary" onClick={handleSave}>
                  Sauvegarder
                </IonButton>
                <IonButton expand="block" color="danger" onClick={handleDelete}>
                  Supprimer
                </IonButton>
                <IonButton expand="block" color="medium" onClick={() => setModalOpen(false)}>
                  Annuler
                </IonButton>
              </>
            )}
          </IonContent>
        </IonModal>

        {/* Modal ajout */}
        <IonModal isOpen={addModalOpen} onDidDismiss={() => setAddModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Ajouter un véhicule</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="floating">Marque *</IonLabel>
              <IonInput
                value={newVehicule.marque}
                onIonInput={(e) => handleNewChange('marque', e.detail.value!)}
                placeholder="Ex: Renault"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Modèle *</IonLabel>
              <IonInput
                value={newVehicule.modele}
                onIonInput={(e) => handleNewChange('modele', e.detail.value!)}
                placeholder="Ex: Clio"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Plaque d'immatriculation *</IonLabel>
              <IonInput
                value={newVehicule.plaque}
                onIonInput={(e) => handleNewChange('plaque', e.detail.value!)}
                placeholder="Ex: AB-123-CD"
              />
            </IonItem>
            <IonItem>
              <IonLabel position="floating">Nombre de places</IonLabel>
              <IonInput
                type="number"
                value={newVehicule.nombrePlace?.toString() || ''}
                onIonInput={(e) => handleNewChange('nombrePlace', parseInt(e.detail.value!) || 0)}
                placeholder="Ex: 4"
              />
            </IonItem>

            <IonItemDivider />

            <IonButton
              expand="block"
              color="success"
              onClick={handleCreate}
              disabled={!newVehicule.marque || !newVehicule.modele || !newVehicule.plaque}
            >
              Ajouter le véhicule
            </IonButton>
            <IonButton expand="block" color="medium" onClick={() => setAddModalOpen(false)}>
              Annuler
            </IonButton>
          </IonContent>
        </IonModal>

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

export default PageVehicules;
