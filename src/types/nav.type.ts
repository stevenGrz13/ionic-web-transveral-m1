export interface NavItem{
  tab: string;
  href: string;
  icon: string; // icon d’ionicons
  label: string;
  isCenter?: boolean; // pour bouton flottant
  component: React.FC; // la page à afficher
}