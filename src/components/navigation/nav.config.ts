import { home, map, airplane, calendar } from "ionicons/icons";
// import { home, qrCode, map, airplane, calendar, car } from "ionicons/";

import { NavItem } from "../../types/nav.type";
import Trajet from "../../pages/chauffeur/Trajet";
import PageVehicules from "../../pages/chauffeur/PageVehicules";
// import TrajetsVehicule from "../../pages/chauffeur/TrajetsVehicule";
import APropos from "../../pages/utilisateur/APropos";
import MesVoyages from "../../pages/utilisateur/MesVoyages";
import ListeTrajet from "../../pages/utilisateur/ListeTrajet";
import PageReservation from "../../pages/utilisateur/PageReservation";
import PassagerAbonnement from "../../pages/utilisateur/PassagerAbonnement";
import ChauffeurPage from "../../pages/chauffeur/ChauffeurPage";
import UtilisateurPage from "../../pages/utilisateur/UtilisateurPage";

export const chauffeurConfig: NavItem[] = [
  { tab: "home", href: "/chauffeur", icon: 'lni lni-home-2', label: "Home", component: ChauffeurPage },
  { tab: "trajet", href: "/chauffeur/creer-trajet", icon: 'lni lni-road-1', label: "Trajet", component: Trajet, isCenter: true },
  { tab: "vehicules", href: "/chauffeur/mes-vehicules", icon: 'lni lni-car-6', label: "Véhicules", component: PageVehicules }
];

// Exemple Client
export const userTabs: NavItem[] = [
  { tab: "home", href: "/utilisateur", icon: 'lni lni-home-2', label: "Home", component: UtilisateurPage },
  { tab: "invoices", href: "/utilisateur/trajets", icon: 'lni lni-road-1', label: "Trajets", component: ListeTrajet },
  { tab: "mes-voyages", href: "/utilisateur/mes-voyages", icon: 'lni lni-calendar-days', label: "Mes voyages", component: PageReservation },
  { tab: "a-propos", href: "/utilisateur/a-propos", icon: 'lni lni-user-4', label: "À propos", component: PassagerAbonnement },
  { tab: "abonnement", href: "/utilisateur/abonnement", icon: 'lni lni-credit-card-multiple', label: "Abonnement", component: PassagerAbonnement },
];
