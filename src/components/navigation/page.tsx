import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from "@ionic/react";
import { Redirect, Route } from "react-router";
import { NavItem } from "../../types/nav.type";
import "./page.scss";
import TrajetsVehicule from "../../pages/chauffeur/TrajetsVehicule";
import PageReservation from "../../pages/utilisateur/PageReservation";

interface TabsProps {
  tabs: NavItem[];
  defaultRoute?: string;
}

const Navigation: React.FC<TabsProps> = ({ tabs, defaultRoute = "/home" }) => {
  return (
    <IonTabs className="custom-tabs">
      <IonRouterOutlet>
        {tabs.map((tab) => (
          <Route key={tab.tab} exact path={tab.href} component={tab.component} />
        ))}
        <Route path="/chauffeur/trajets-vehicule/:vehiculeId" component={TrajetsVehicule} />
        <Route path="/utilisateur/reserver-trajet/:trajetId" component={PageReservation} />
        <Redirect exact from="/" to={defaultRoute} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" className="custom-tab-bar">
        {tabs.map((tab) => (
          <IonTabButton key={tab.tab} tab={tab.href} href={tab.href} className={`custom-button ${tab.isCenter ? "center-button" : ""}`}>
            <i className={`custom-icon ${tab.icon}`} />
            <IonLabel>{tab.label}</IonLabel>
          </IonTabButton>
        ))}
      </IonTabBar>
    </IonTabs>

  );
};

export default Navigation;
