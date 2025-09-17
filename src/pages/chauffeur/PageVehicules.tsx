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
  IonModal,
  IonInput,
  IonToast,
  IonFab,
  IonFabButton,
  IonIcon,
  IonChip,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonAlert,
  IonSkeletonText,
  IonButtons,
  IonImg
} from '@ionic/react';
import { 
  add, 
  car, 
  people, 
  create, 
  trash, 
  close,
  documentText,
  calendar
} from 'ionicons/icons';
import axios from 'axios';
import { useHistory } from 'react-router';
import { API_BASE_URL } from '../../../config';
import './PageVehicules.scss';

interface Vehicule {
  id: number;
  idUtilisateur: number;
  marque: string;
  modele: string;
  plaque: string;
  nombrePlace?: number;
  annee?: number;
  couleur?: string;
}

const PageVehicules: React.FC = () => {
  const history = useHistory(); 
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [selectedVehicule, setSelectedVehicule] = useState<Vehicule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const userId = Number.parseInt(sessionStorage.getItem('userId') + '');
  const [newVehicule, setNewVehicule] = useState<Partial<Vehicule>>({
    marque: '',
    modele: '',
    plaque: '',
    nombrePlace: undefined,
    annee: undefined,
    couleur: '',
    idUtilisateur: userId
  });
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const fetchVehicules = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get<Vehicule[]>(`${API_BASE_URL}/VehiculeApi`);
      // Filtrer les véhicules de l'utilisateur connecté
      const userVehicules = res.data.filter(v => v.idUtilisateur === userId);
      // console.log("vehicles = ", userVehicules);
      
      setVehicules(userVehicules);
    } catch (err) {
      console.error(err);
      setToastMessage('Impossible de charger les véhicules');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicules();
  }, []);

  const handleSelect = (vehicule: Vehicule) => {
    setSelectedVehicule({ ...vehicule });
    setEditModalOpen(true);
  };

  const handleAddNew = () => {
    setNewVehicule({
      marque: '',
      modele: '',
      plaque: '',
      nombrePlace: undefined,
      annee: undefined,
      couleur: '',
      idUtilisateur: userId
    });
    setAddModalOpen(true);
  };

  const handleSave = async () => {
    if (!selectedVehicule) return;

    try {
      await axios.put(`${API_BASE_URL}/VehiculeApi/${selectedVehicule.id}`, selectedVehicule);
      setToastMessage('Véhicule mis à jour avec succès !');
      setEditModalOpen(false);
      fetchVehicules();
    } catch (err) {
      console.error(err);
      setToastMessage('Erreur lors de la mise à jour');
    }
  };

  const handleCreate = async () => {
    try {
      await axios.post(`${API_BASE_URL}/VehiculeApi`, newVehicule);
      setToastMessage('Véhicule ajouté avec succès !');
      setAddModalOpen(false);
      fetchVehicules();
    } catch (err) {
      console.error(err);
      setToastMessage('Erreur lors de l\'ajout du véhicule');
    }
  };

  const handleDelete = async () => {
    if (!selectedVehicule) return;

    try {
      await axios.delete(`${API_BASE_URL}/VehiculeApi/${selectedVehicule.id}`);
      setToastMessage('Véhicule supprimé avec succès !');
      setEditModalOpen(false);
      setShowDeleteAlert(false);
      fetchVehicules();
    } catch (err) {
      console.error(err);
      setToastMessage('Erreur lors de la suppression');
    }
  };

  const handleChange = (field: keyof Vehicule, value: any) => {
    if (selectedVehicule) {
      setSelectedVehicule(prev => ({
        ...prev!,
        [field]: value
      }));
    }
  };

  const handleNewChange = (field: keyof Vehicule, value: any) => {
    setNewVehicule(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleTrajetsClick = (e: React.MouseEvent, vehiculeId: number) => {
    e.stopPropagation();
    history.push(`/chauffeur/trajets-vehicule/${vehiculeId}`);
  };

  const getVehicleColor = (index: number) => {
    const colors = ['primary', 'secondary', 'tertiary', 'success', 'warning'];
    return colors[index % colors.length];
  };

  return (
    <IonPage>
      <IonHeader className='custom-header'>
        <IonToolbar className='toolbar-header'>
          <IonButtons slot="start">
            <IonButton onClick={() => history.goBack()} className='back-button'>
              <i className='lni lni-chevron-left'></i>
            </IonButton>
          </IonButtons>
          <IonTitle className='toolbar-title'>Mes véhicules</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="vehicules-content">
        {isLoading ? (
          // Squelette de chargement
          <div className="loading-container">
            {[...Array(3)].map((_, index) => (
              <IonCard key={index} className="skeleton-card">
                <IonCardContent>
                  <IonSkeletonText animated style={{ width: '60%', height: '20px' }} />
                  <IonSkeletonText animated style={{ width: '40%', height: '16px', marginTop: '8px' }} />
                </IonCardContent>
              </IonCard>
            ))}
          </div>
        ) : vehicules.length === 0 ? (
          // État vide
          <div className="empty-state">
            <IonIcon icon={car} className="empty-icon" />
            <IonText color="medium">
              <h2>Aucun véhicule</h2>
              <p>Ajoutez votre premier véhicule pour commencer</p>
            </IonText>
          </div>
        ) : (
          // Liste des véhicules
          <div className="vehicules-list">
            <IonGrid>
              <IonRow>
                {vehicules.map((vehicule, index) => (
                  <IonCol size="12" size-md="6" key={vehicule.id}>
                    <IonCard 
                      className="vehicle-card" 
                      color='primary'
                      onClick={() => handleSelect(vehicule)}
                    >
                      <IonCardHeader>
                        <div className="vehicle-header">
                          <IonText>
                            <div className='text-dark fs-5 fw-semibold'>{vehicule.marque} {vehicule.modele}</div>
                            <div className='d-flex'>
                              <div className='text-white fw-bolder'>{vehicule.plaque}</div>
                              <div className="ms-3">
                                <div className='d-flex align-items-center text-dark fw-bold'>
                                  <i className='lni lni-user-multiple-4'></i>
                                  <IonLabel>{vehicule.nombrePlace} places</IonLabel>
                                </div>

                                <div>
                                  {vehicule.annee}
                                </div>
                                
                                {/* {vehicule.nombrePlace && (
                                  <IonChip color={getVehicleColor(index)}>
                                    <IonIcon icon={people} />
                                    <IonLabel>{vehicule.nombrePlace} places</IonLabel>
                                  </IonChip>
                                )} */}
                                
                                {vehicule.annee && (
                                  <IonChip color={getVehicleColor(index)}>
                                    <IonIcon icon={calendar} />
                                    <IonLabel>{vehicule.annee}</IonLabel>
                                  </IonChip>
                                )}
                                
                                {vehicule.couleur && (
                                  <IonChip color={getVehicleColor(index)}>
                                    <IonLabel>{vehicule.couleur}</IonLabel>
                                  </IonChip>
                                )}
                              </div>
                            </div>
                            
                          </IonText>
                          <IonButton 
                          className='custom-action-button icon-button'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(vehicule);
                            }}
                          >
                            <i className='lni lni-pen-to-square vehicle-icon'></i>
                          </IonButton>
                        </div>
                      </IonCardHeader>
                      
                      <IonCardContent>
                        <div className='d-flex justify-content-center'>
                          <IonImg src='/public/vehicule_placeholder.png'
                        alt={`${vehicule.marque} ${vehicule.modele}`}
                        className='img-fluid w-75' />
                        </div>
                        {/* <div className="vehicle-details">
                          {vehicule.nombrePlace && (
                            <IonChip color={getVehicleColor(index)}>
                              <IonIcon icon={people} />
                              <IonLabel>{vehicule.nombrePlace} places</IonLabel>
                            </IonChip>
                          )}
                          
                          {vehicule.annee && (
                            <IonChip color={getVehicleColor(index)}>
                              <IonIcon icon={calendar} />
                              <IonLabel>{vehicule.annee}</IonLabel>
                            </IonChip>
                          )}
                          
                          {vehicule.couleur && (
                            <IonChip color={getVehicleColor(index)}>
                              <IonLabel>{vehicule.couleur}</IonLabel>
                            </IonChip>
                          )}
                        </div> */}
                        
                        <div className="vehicle-actions col-2">

                          <IonButton 
                            // size="small" 
                            onClick={(e) => handleTrajetsClick(e, vehicule.id)}
                            className='custom-action-button'
                          >
                            {/* <IonIcon icon={documentText} slot="start" /> */}
                            Trajets
                          </IonButton>
                          
                          {/* <IonButton 
                          className='custom-action-button'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(vehicule);
                            }}
                          >
                            Modifier
                          </IonButton> */}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </div>
        )}

        {/* Bouton flottant pour ajouter un véhicule */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton color="primary" onClick={handleAddNew}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Modal pour modifier un véhicule existant */}
        <IonModal 
          isOpen={editModalOpen} 
          onDidDismiss={() => setEditModalOpen(false)}
          className="vehicle-modal"
        >
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Modifier le véhicule</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setEditModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="ion-padding">
            {selectedVehicule && (
              <div className="form-container">
                <IonGrid>
                  <IonRow>
                    <IonCol size="12" size-md="6">
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Marque *</IonLabel>
                        <IonInput
                          value={selectedVehicule.marque}
                          onIonInput={(e) => handleChange('marque', e.detail.value!)}
                          placeholder="Renault, Peugeot, etc."
                        />
                      </IonItem>
                    </IonCol>
                    
                    <IonCol size="12" size-md="6">
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Modèle *</IonLabel>
                        <IonInput
                          value={selectedVehicule.modele}
                          onIonInput={(e) => handleChange('modele', e.detail.value!)}
                          placeholder="Clio, 208, etc."
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" size-md="6">
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Plaque d'immatriculation *</IonLabel>
                        <IonInput
                          value={selectedVehicule.plaque}
                          onIonInput={(e) => handleChange('plaque', e.detail.value!)}
                          placeholder="AB-123-CD"
                        />
                      </IonItem>
                    </IonCol>
                    
                    <IonCol size="12" size-md="6">
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Nombre de places</IonLabel>
                        <IonInput
                          type="number"
                          value={selectedVehicule.nombrePlace?.toString() || ''}
                          onIonInput={(e) => handleChange('nombrePlace', parseInt(e.detail.value!) || 0)}
                          placeholder="4"
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" size-md="6">
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Année</IonLabel>
                        <IonInput
                          type="number"
                          value={selectedVehicule.annee?.toString() || ''}
                          onIonInput={(e) => handleChange('annee', parseInt(e.detail.value!) || undefined)}
                          placeholder="2020"
                        />
                      </IonItem>
                    </IonCol>
                    
                    <IonCol size="12" size-md="6">
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Couleur</IonLabel>
                        <IonInput
                          value={selectedVehicule.couleur || ''}
                          onIonInput={(e) => handleChange('couleur', e.detail.value!)}
                          placeholder="Rouge, Bleu, etc."
                        />
                      </IonItem>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <div className="form-actions">
                  <IonButton 
                    expand="block" 
                    color="primary" 
                    onClick={handleSave}
                    disabled={!selectedVehicule.marque || !selectedVehicule.modele || !selectedVehicule.plaque}
                  >
                    <IonIcon icon={create} slot="start" />
                    Sauvegarder
                  </IonButton>
                  
                  <IonButton 
                    expand="block" 
                    color="danger" 
                    onClick={() => setShowDeleteAlert(true)}
                  >
                    <IonIcon icon={trash} slot="start" />
                    Supprimer
                  </IonButton>
                  
                  <IonButton 
                    expand="block" 
                    color="medium" 
                    onClick={() => setEditModalOpen(false)}
                  >
                    Annuler
                  </IonButton>
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Modal pour ajouter un nouveau véhicule */}
        <IonModal 
          isOpen={addModalOpen} 
          onDidDismiss={() => setAddModalOpen(false)}
          className="vehicle-modal"
        >
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Ajouter un véhicule</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setAddModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          
          <IonContent className="ion-padding">
            <div className="form-container">
              <IonGrid>
                <IonRow>
                  <IonCol size="12" size-md="6">
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Marque *</IonLabel>
                      <IonInput
                        value={newVehicule.marque}
                        onIonInput={(e) => handleNewChange('marque', e.detail.value!)}
                        placeholder="Renault, Peugeot, etc."
                      />
                    </IonItem>
                  </IonCol>
                  
                  <IonCol size="12" size-md="6">
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Modèle *</IonLabel>
                      <IonInput
                        value={newVehicule.modele}
                        onIonInput={(e) => handleNewChange('modele', e.detail.value!)}
                        placeholder="Clio, 208, etc."
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" size-md="6">
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Plaque d'immatriculation *</IonLabel>
                      <IonInput
                        value={newVehicule.plaque}
                        onIonInput={(e) => handleNewChange('plaque', e.detail.value!)}
                        placeholder="AB-123-CD"
                      />
                    </IonItem>
                  </IonCol>
                  
                  <IonCol size="12" size-md="6">
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Nombre de places</IonLabel>
                      <IonInput
                        type="number"
                        value={newVehicule.nombrePlace?.toString() || ''}
                        onIonInput={(e) => handleNewChange('nombrePlace', parseInt(e.detail.value!) || 0)}
                        placeholder="4"
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" size-md="6">
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Année</IonLabel>
                      <IonInput
                        type="number"
                        value={newVehicule.annee?.toString() || ''}
                        onIonInput={(e) => handleNewChange('annee', parseInt(e.detail.value!) || undefined)}
                        placeholder="2020"
                      />
                    </IonItem>
                  </IonCol>
                  
                  <IonCol size="12" size-md="6">
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Couleur</IonLabel>
                      <IonInput
                        value={newVehicule.couleur || ''}
                        onIonInput={(e) => handleNewChange('couleur', e.detail.value!)}
                        placeholder="Rouge, Bleu, etc."
                      />
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <div className="form-actions">
                <IonButton 
                  expand="block" 
                  color="success" 
                  onClick={handleCreate}
                  disabled={!newVehicule.marque || !newVehicule.modele || !newVehicule.plaque}
                >
                  <IonIcon icon={add} slot="start" />
                  Ajouter le véhicule
                </IonButton>
                
                <IonButton 
                  expand="block" 
                  color="medium" 
                  onClick={() => setAddModalOpen(false)}
                >
                  Annuler
                </IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Alert de confirmation de suppression */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header={'Confirmer la suppression'}
          message={'Êtes-vous sûr de vouloir supprimer ce véhicule ? Cette action est irréversible.'}
          buttons={[
            {
              text: 'Annuler',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Supprimer',
              handler: handleDelete
            }
          ]}
        />

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

export default PageVehicules;