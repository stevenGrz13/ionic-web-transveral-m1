// pages/ChauffeurPage.tsx
import React, { useState } from 'react';
import { 
  IonPage, 
  IonHeader, 
  IonToolbar, 
  IonTitle, 
  IonContent, 
  IonList, 
  IonItem, 
  IonLabel, 
  IonButtons, 
  IonButton, 
  IonIcon, 
  IonModal,
  IonCardHeader,
  IonText,
  IonCardContent,
  IonCard,
  IonCardTitle
} from '@ionic/react';
import { logOut } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';

const ChauffeurPage: React.FC = () => {
  const history = useHistory();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
    const openLogoutModal = () => {
      setShowLogoutModal(true);
    };
  
    const closeLogoutModal = () => {
      setShowLogoutModal(false);
    };

  const handleLogout = () => {
    // Effacer la sessionStorage
    sessionStorage.removeItem('userId');
    // Rediriger vers la page login
    history.push('/login');
    setShowLogoutModal(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chauffeur</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={openLogoutModal}>
              <IonIcon icon={logOut} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonList>
          <IonItem routerLink="/chauffeur/a-propos">
            <IonLabel>A propos de moi</IonLabel>
          </IonItem>
          <IonItem routerLink="/chauffeur/mes-vehicules">
            <IonLabel>Mes véhicules</IonLabel>
          </IonItem>
          {/* <IonItem routerLink="/chauffeur/historique">
            <IonLabel>Historique de mes trajets</IonLabel>
          </IonItem> */}
          <IonItem routerLink="/chauffeur/creer-trajet">
            <IonLabel>Créer trajet</IonLabel>
          </IonItem>
        </IonList>

        <IonModal isOpen={showLogoutModal} onDidDismiss={closeLogoutModal}>
                  <IonContent className="ion-padding">
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle className="ion-text-center">
                          <IonText color="primary">
                            <h2>Déconnexion</h2>
                          </IonText>
                        </IonCardTitle>
                      </IonCardHeader>
                      
                      <IonCardContent>
                        <div className="ion-text-center" style={{ marginBottom: '20px' }}>
                          <IonText>
                            <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
                          </IonText>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <IonButton 
                            expand="block" 
                            color="medium" 
                            onClick={closeLogoutModal}
                          >
                            Annuler
                          </IonButton>
                          
                          <IonButton 
                            expand="block" 
                            color="primary" 
                            onClick={handleLogout}
                          >
                            Se déconnecter
                          </IonButton>
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </IonContent>
                </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default ChauffeurPage;