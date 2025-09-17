import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonToast,
  IonSpinner,
  IonText
} from '@ionic/react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { API_BASE_URL } from '../../config';
import './Login.scss';

interface Role {
  id: number;
  nom: string;
}

const Login: React.FC<{ onLogin: (role: string) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState('Uzzdlh4343@gmail.com');
  const [password, setPassword] = useState('');
  const [idRole, setIdRole] = useState<number | null>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  // const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/UtilisateursApi/Login`,
        {
          idRole: idRole,
          email: email,
          password: password
        }
      );

      if (!response.data.success) {
        setToastMessage('Verifiez vos identifiants !');
      } else {
        setToastMessage('Connexion réussie !');

        sessionStorage.setItem('userId', response.data.utilisateur.id.toString());
        sessionStorage.setItem('abonnement', response.data.abonnement ? 'true' : 'false');

        if (response.data.utilisateur.idRole === 1) {
          history.push('/chauffeur');
          onLogin('chauffeur');
        } else if (response.data.utilisateur.idRole === 2) {
          history.push('/utilisateur');
          onLogin('utilisateur');
        } else {
          history.push('/administrateur');
          onLogin('administrateur');
        }
      }

      console.log('Utilisateur connecté :', response.data);
    } catch (error: unknown) {
      console.error(error);
      setToastMessage('Un léger erreur au niveau de nos serveurs');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="auth-container" fullscreen>
        <div className="auth-background">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Login</h1>
              <p className="auth-subtitle">
                Don't have an account? 
                <span className='ms-1 fw-medium'>Go to the web</span>
              </p>
            </div>

            <div className="input-group">
              <label>Email Address</label>
              <IonInput
                type="email"
                value={email}
                placeholder="Enter your email"
                onIonInput={(e) => setEmail(e.detail.value!)}
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <label>Password</label>
              <IonInput
                type="password"
                value={password}
                placeholder="Enter your password"
                onIonInput={(e) => setPassword(e.detail.value!)}
                className="auth-input"
              />
            </div>

            <div className="d-flex flex-column mb-3">
              <span className='text-dark mb-1' style={{ fontSize: '14px', fontWeight: '600' }}>Select Your Role</span>
              {loadingRoles ? (
                <div className="role-loading">
                  <IonSpinner name="dots" />
                  <IonText>Loading roles...</IonText>
                </div>
              ) : (
                <div className="role-selector">
                  {roles.map(role => (
                    <div 
                      key={role.id} 
                      className={`role-option ${idRole === role.id ? 'selected' : ''}`}
                      onClick={() => setIdRole(role.id)}
                    >
                      <span className="role-text">{role.nom}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <IonButton 
              expand="block" 
              className="auth-button"
              onClick={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? <IonSpinner name="dots" /> : "Login"}
            </IonButton>
          </div>
        </div>

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