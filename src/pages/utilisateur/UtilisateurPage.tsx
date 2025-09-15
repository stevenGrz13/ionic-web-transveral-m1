// pages/UtilisateurPage.tsx
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonList, IonItem, IonLabel, IonButtons, IonButton, IonIcon, IonModal, IonCard, IonCardContent, IonText, IonCardHeader, IonCardTitle } from '@ionic/react';
import { useHistory } from 'react-router';
import { logOut } from 'ionicons/icons';
import { useState } from 'react';

const UtilisateurPage: React.FC = () => {
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
            <IonTitle>Utilisateur</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={openLogoutModal}>
                <IonIcon icon={logOut} slot="icon-only" />
              </IonButton>
          </IonButtons>
        </IonToolbar>        
      </IonHeader>
      <IonContent className="ion-padding">
        <IonList>
          <IonItem routerLink="/utilisateur/a-propos">
            <IonLabel>A propos de moi</IonLabel>
          </IonItem>
          <IonItem routerLink="/utilisateur/mes-voyages">
            <IonLabel>Historique de mes trajets</IonLabel>
          </IonItem>
          <IonItem routerLink="/utilisateur/trajets">
            <IonLabel>Chercher trajets</IonLabel>
          </IonItem>
          <IonItem routerLink="/utilisateur/abonnement">
            <IonLabel>Abonnement</IonLabel>
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

export default UtilisateurPage;
