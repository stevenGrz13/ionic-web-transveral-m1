import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonToast
} from '@ionic/react';
import axios from 'axios';

interface Vehicule {
  id: number;
  marque: string;
  modele: string;
  plaque: string;
}

interface Trajet {
  idVehicule: number;
  depart: string;
  arrivee: string;
  dateDepart?: string;
  prixUniquePlace?: number;
}

const Trajet: React.FC = () => {
  const [vehicules, setVehicules] = useState<Vehicule[]>([]);
  const [selectedVehiculeId, setSelectedVehiculeId] = useState<number | null>(null);
  const [depart, setDepart] = useState('');
  const [arrivee, setArrivee] = useState('');
  const [dateDepart, setDateDepart] = useState('');
  const [prixUniquePlace, setPrixUniquePlace] = useState<number | undefined>();
  const [toastMessage, setToastMessage] = useState('');

  // Récupérer les véhicules au chargement du composant
  useEffect(() => {
    const fetchVehicules = async () => {
      try {
        const res = await axios.get<Vehicule[]>('http://localhost:5055/api/VehiculeApi');
        setVehicules(res.data);
        if (res.data.length > 0) {
          setSelectedVehiculeId(res.data[0].id);
        }
      } catch (err) {
        console.error(err);
        setToastMessage('Impossible de charger les véhicules');
      }
    };

    fetchVehicules();
  }, []);

  const handleCreate = async () => {
    if (!selectedVehiculeId || !depart || !arrivee) {
      setToastMessage('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const newTrajet: Trajet = {
      idVehicule: selectedVehiculeId,
      depart,
      arrivee,
      dateDepart,
      prixUniquePlace
    };

    try {
      await axios.post('http://localhost:5055/api/TrajetApi', newTrajet);
      setToastMessage('Trajet créé avec succès !');
      setDepart('');
      setArrivee('');
      setDateDepart('');
      setPrixUniquePlace(undefined);
    } catch (err) {
      console.error(err);
      setToastMessage('Erreur lors de la création du trajet');
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Créer un trajet</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel>Véhicule</IonLabel>
          <IonSelect
            value={selectedVehiculeId ?? undefined}
            onIonChange={e => setSelectedVehiculeId(e.detail.value)}
          >
            {vehicules.map(v => (
              <IonSelectOption key={v.id} value={v.id}>
                {v.marque} {v.modele} - {v.plaque}
              </IonSelectOption>
            ))}
          </IonSelect>
        </IonItem>

<IonItem>
          <IonLabel position="floating">Départ *</IonLabel>
          <IonInput value={depart} onIonInput={e => setDepart(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Arrivée *</IonLabel>
          <IonInput value={arrivee} onIonInput={e => setArrivee(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Date et heure de départ</IonLabel>
          <IonDatetime
            value={dateDepart}
            onIonChange={e => setDateDepart(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="floating">Prix unique par place</IonLabel>
          <IonInput
            type="number"
            value={prixUniquePlace ?? ''}
            onIonInput={e => setPrixUniquePlace(parseInt(e.detail.value!) || 0)}
          />
        </IonItem>

        <IonButton expand="block" color="success" className="ion-margin-top" onClick={handleCreate}>
          Créer le trajet
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

export default Trajet;