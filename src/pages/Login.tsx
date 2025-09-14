import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonToast,
  IonSelect,
  IonSelectOption,
  IonSpinner
} from '@ionic/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { API_BASE_URL } from '../../config';

interface Role {
  id: number;
  nom: string;   // <-- adapte le nom de la propriété à ton modèle (ex: Name ou NomRole)
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idRole, setIdRole] = useState<number | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const history = useHistory(); 

  // Récupération des rôles au montage du composant
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const res = await axios.get<Role[]>(
          `${API_BASE_URL}/RoleApi`
        );

        // Filtrer les rôles pour exclure l'administrateur (supposons que l'admin a l'ID 3)
      const filteredRoles = res.data.filter(role => role.id !== 3);
        setRoles(filteredRoles);
        // setRoles(res.data);
      } catch (err) {
        console.error('Erreur lors du chargement des rôles :', err);
        setToastMessage("Impossible de charger les rôles");
      } finally {
        setLoadingRoles(false);
      }
    };

    fetchRoles();
  }, []);

  const handleLogin = async () => {
    if (!idRole) {
      setToastMessage('Veuillez choisir un rôle');
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/UtilisateursApi/Login`,
        {
          idRole: idRole,
          email: email,
          password: password
        }
      );

      if(!response.data.success){
        setToastMessage('Verifiez vous identifiants !');
      }
      else{
        setToastMessage('Connexion réussie !');
        sessionStorage.setItem('userId', response.data.utilisateur.id.toString());
        if(response.data.utilisateur.idRole === 1){
          history.push('/chauffeur');
        } else if(response.data.utilisateur.idRole === 2){
          history.push('/utilisateur');
        } else {
          history.push('/administrateur');
        }
      }

      console.log('Utilisateur connecté :', response.data);
      // ➜ ici tu peux rediriger vers une autre page ou stocker l'utilisateur globalement
    } catch (error: any) {
      console.error(error);
      setToastMessage('Un leger erreur au niveau de nos serveurs');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Connexion</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Email */}
        <IonItem>
          <IonLabel position="floating">Email</IonLabel>
          <IonInput
            type="email"
            value={email}
            onIonChange={e => setEmail(e.detail.value!)}
          />
        </IonItem>

        {/* Mot de passe */}
        <IonItem>
          <IonLabel position="floating">Mot de passe</IonLabel>
          <IonInput
            type="password"
            value={password}
            onIonChange={e => setPassword(e.detail.value!)}
          />
        </IonItem>

        {/* Sélection du rôle */}
        <IonItem>
          <IonLabel>Rôle</IonLabel>
          {loadingRoles ? (
            <IonSpinner name="dots" />
          ) : (
            <IonSelect
              placeholder="Choisir un rôle"
              value={idRole ?? undefined}
              onIonChange={e => setIdRole(e.detail.value)}
            >
              {roles.map(role => (
                <IonSelectOption key={role.id} value={role.id}>
                  {role.nom} {/* <-- affiche le NOM du rôle */}
                </IonSelectOption>
              ))}
            </IonSelect>
          )}
        </IonItem>

        {/* Bouton login */}
        <IonButton expand="block" className="ion-margin-top" onClick={handleLogin}>
          Se connecter
        </IonButton>

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

export default Login;
