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
import './ChauffeurPage.scss';

const ChauffeurPage: React.FC = () => {
  const history = useHistory();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const openLogoutModal = () => setShowLogoutModal(true);
  const closeLogoutModal = () => setShowLogoutModal(false);

  const handleLogout = () => {
    sessionStorage.removeItem('userId');
    history.push('/login');
    setShowLogoutModal(false);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tableau de bord</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={openLogoutModal}>
              <IonIcon icon={logOut} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="chauffeur-container" fullscreen>
        <div className="chauffeur-background">
          <div className="chauffeur-card">
            <h1 className="chauffeur-title">Bienvenue !</h1>

            <IonList className="chauffeur-list">
              <IonItem routerLink="/chauffeur/a-propos" detail={true}>
                <IonLabel>À propos de moi</IonLabel>
              </IonItem>
              <IonItem routerLink="/chauffeur/mes-vehicules" detail={true}>
                <IonLabel>Mes véhicules</IonLabel>
              </IonItem>
              <IonItem routerLink="/chauffeur/creer-trajet" detail={true}>
                <IonLabel>Créer un trajet</IonLabel>
              </IonItem>
            </IonList>
          </div>
        </div>

        <IonModal isOpen={showLogoutModal} onDidDismiss={closeLogoutModal}>
          <IonContent className="ion-padding">
            <IonCard className="logout-card">
              <IonCardHeader>
                <IonCardTitle className="ion-text-center">
                  <IonText color="primary"><h2>Déconnexion</h2></IonText>
                </IonCardTitle>
              </IonCardHeader>

              <IonCardContent>
                <div className="ion-text-center" style={{ marginBottom: '20px' }}>
                  <IonText>
                    <p>Êtes-vous sûr de vouloir vous déconnecter ?</p>
                  </IonText>
                </div>

                <div className="logout-buttons">
                  <IonButton expand="block" color="medium" onClick={closeLogoutModal}>
                    Annuler
                  </IonButton>

                  <IonButton expand="block" color="primary" onClick={handleLogout}>
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