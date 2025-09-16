import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonRouterOutlet,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

import 'bootstrap/dist/css/bootstrap.min.css';
// import 'primereact/resources/themes/lara-light-indigo/theme.css';
// import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
// import 'primeflex/primeflex.css';


/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';
import Login from './pages/Login';
import UtilisateurPage from './pages/utilisateur/UtilisateurPage';
import ChauffeurPage from './pages/chauffeur/ChauffeurPage';
import PageVehicules from './pages/chauffeur/PageVehicules';
import Trajet from './pages/chauffeur/Trajet';
import TrajetsVehicule from './pages/chauffeur/TrajetsVehicule';
import AProposChauffeur from './pages/chauffeur/AproposChauffeur';
import ListeTrajet from './pages/utilisateur/ListeTrajet';
import PageReservation from './pages/utilisateur/PageReservation';
import MesVoyages from './pages/utilisateur/MesVoyages';
import APropos from './pages/utilisateur/APropos';
import PassagerAbonnement from './pages/utilisateur/PassagerAbonnement';

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path="/login" component={Login} />

        {/* chauffeurs routes */}
        <Route exact path="/chauffeur" component={ChauffeurPage} />
        <Route path="/chauffeur/mes-vehicules" component={PageVehicules} />
        <Route path="/chauffeur/creer-trajet" component={Trajet} />
        <Route path="/chauffeur/trajets-vehicule/:vehiculeId" component={TrajetsVehicule} />
        <Route path="/chauffeur/a-propos" component={AProposChauffeur} />

        {/* utilisateurs routes */}
        <Route exact path="/utilisateur" component={UtilisateurPage} />
        <Route path="/utilisateur/trajets" component={ListeTrajet} />
        <Route path="/utilisateur/reserver-trajet/:trajetId" component={PageReservation} />
        <Route path="/utilisateur/mes-voyages" component={MesVoyages} />
        <Route path="/utilisateur/a-propos" component={APropos} />
        <Route path="/utilisateur/abonnement" component={PassagerAbonnement} />

        <Redirect exact from="/" to="/login" />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;
