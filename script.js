// Module de données des bornes (fallback)
const bornesData = {
    "type": "FeatureCollection",
    "features": [
        {
            "type": "Feature",
            "properties": {
                "@id": "node/5031636772",
                "amenity": "charging_station",
                "capacity": "4"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1195684, 45.7832494]
            },
            "id": "node/5031636772"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/5861929486",
                "amenity": "charging_station",
                "capacity": "6"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1294539, 45.7608521]
            },
            "id": "node/5861929486"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/7468393166",
                "access": "private",
                "amenity": "charging_station",
                "capacity": "1"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1355761, 45.7583691]
            },
            "id": "node/7468393166"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/7468393167",
                "access": "customers",
                "amenity": "charging_station",
                "capacity": "2"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1355982, 45.7584009]
            },
            "id": "node/7468393167"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/7559066485",
                "amenity": "charging_station",
                "capacity": "4"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1250912, 45.7800239]
            },
            "id": "node/7559066485"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/9091702517",
                "amenity": "charging_station"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1280764, 45.7796068]
            },
            "id": "node/9091702517"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/9092480097",
                "amenity": "charging_station",
                "capacity": "1"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1024662, 45.7782186]
            },
            "id": "node/9092480097"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/9092480098",
                "amenity": "charging_station",
                "capacity": "2"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1023066, 45.7781569]
            },
            "id": "node/9092480098"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/9571073042",
                "access": "private",
                "amenity": "charging_station",
                "capacity": "3"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.1310284, 45.758371]
            },
            "id": "node/9571073042"
        },
        {
            "type": "Feature",
            "properties": {
                "@id": "node/9835368517",
                "amenity": "charging_station"
            },
            "geometry": {
                "type": "Point",
                "coordinates": [3.0685115, 45.7764768]
            },
            "id": "node/9835368517"
        }
    ]
};

// Module des classes Borne
class Borne {
    constructor(id, lat, lon) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
    }

    toHTML() {
        return `<div>ID: ${this.id}, Lat: ${this.lat}, Lon: ${this.lon}</div>`;
    }
}

class BornePublique extends Borne {
    constructor(id, lat, lon) {
        super(id, lat, lon);
        this.type = 'publique';
    }

    toHTML() {
        return `
                    <div class="borne-item">
                        <h4>Borne Publique</h4>
                        <p>ID: ${this.id}</p>
                        <p>Latitude: ${this.lat}</p>
                        <p>Longitude: ${this.lon}</p>
                        <button onclick="ouvrirModalReservation('${this.id}', '${this.type}')">Réserver</button>
                    </div>
                `;
    }
}

class BornePrivee extends Borne {
    constructor(id, lat, lon) {
        super(id, lat, lon);
        this.type = 'privee';
        this.proprietaire = this.genererProprietaire();
    }

    genererProprietaire() {
        const proprietaires = ['Martin Dupont', 'Sophie Martin', 'Jean Dubois', 'Marie Leroy', 'Pierre Bernard', 'Claire Moreau'];
        return proprietaires[Math.floor(Math.random() * proprietaires.length)];
    }

    toHTML() {
        return `
                    <div class="borne-item">
                        <h4>Borne Privée</h4>
                        <p>ID: ${this.id}</p>
                        <p>Latitude: ${this.lat}</p>
                        <p>Longitude: ${this.lon}</p>
                        <p>Propriétaire: ${this.proprietaire}</p>
                        <button onclick="ouvrirModalReservation('${this.id}', '${this.type}')">Réserver</button>
                    </div>
                `;
    }
}

// Module de gestion des réservations
class Reservation {
    constructor(idBorne, typeBorne, date, heureDebut, duree) {
        this.idBorne = idBorne;
        this.typeBorne = typeBorne;
        this.date = date;
        this.heureDebut = heureDebut;
        this.duree = duree;
        this.id = Date.now() + Math.random(); // ID unique
    }
}

// Variables globales
let map;
let bornesArray = [];
let reservations = [];
let currentView = 'map'; // 'map' ou 'list'

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', function () {
    initMap();
    chargerReservations();
    afficherReservations();
    demarrerCompteur();

    // Gestionnaires d'événements
    document.getElementById('search-form').addEventListener('submit', rechercherBornes);
    document.getElementById('toggle-view').addEventListener('click', basculerVue);
    document.getElementById('reservation-form').addEventListener('submit', confirmerReservation);
    document.getElementById('cancel-reservation').addEventListener('click', fermerModalReservation);

    // Définir la date par défaut à aujourd'hui
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('reservation-date').value = today;

    // Charger les bornes par défaut (géolocalisation ou coordonnées de Clermont-Ferrand)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            function (position) {
                const lat = position.coords.latitude;
                const lng = position.coords.longitude;
                map.setView([lat, lng], 13);
                rechercherBornesParCoordonnees(lat, lng);
            },
            function (error) {
                // Fallback vers Clermont-Ferrand
                const lat = 45.75806298279684;
                const lng = 3.1270760116784317;
                map.setView([lat, lng], 13);
                rechercherBornesParCoordonnees(lat, lng);
            }
        );
    } else {
        // Fallback vers Clermont-Ferrand
        const lat = 45.75806298279684;
        const lng = 3.1270760116784317;
        map.setView([lat, lng], 13);
        rechercherBornesParCoordonnees(lat, lng);
    }
});

// Initialisation de la carte Leaflet
function initMap() {
    map = L.map('map').setView([45.75806298279684, 3.1270760116784317], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

// Recherche de bornes par adresse
async function rechercherBornes(event) {
    event.preventDefault();
    const adresse = document.getElementById('address-input').value;
    const statusDiv = document.getElementById('search-status');

    statusDiv.innerHTML = 'Recherche en cours...';

    try {
        // Appel à l'API Nominatim pour géocoder l'adresse
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(adresse)}`);
        const data = await response.json();

        if (data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lon = parseFloat(data[0].lon);

            map.setView([lat, lon], 13);
            statusDiv.innerHTML = `Adresse trouvée: ${data[0].display_name}`;

            await rechercherBornesParCoordonnees(lat, lon);
        } else {
            statusDiv.innerHTML = 'Adresse non trouvée';
        }
    } catch (error) {
        statusDiv.innerHTML = 'Erreur lors de la recherche d\'adresse. Utilisation des coordonnées par défaut.';
        // Fallback vers Clermont-Ferrand
        const lat = 45.75806298279684;
        const lng = 3.1270760116784317;
        map.setView([lat, lng], 13);
        await rechercherBornesParCoordonnees(lat, lng);
    }
}

// Recherche de bornes par coordonnées
async function rechercherBornesParCoordonnees(lat, lon) {
    const statusDiv = document.getElementById('search-status');

    try {
        // Tentative d'appel à l'API Overpass
        const overpassQuery = `
                    [out:json][timeout:25];
                    (
                      node["amenity"="charging_station"](around:5000,${lat},${lon});
                    );
                    out geom;
                `;

        const response = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: overpassQuery
        });

        let data;
        if (response.ok) {
            const result = await response.json();
            data = {
                type: "FeatureCollection",
                features: result.elements.map(element => ({
                    type: "Feature",
                    properties: element.tags || {},
                    geometry: {
                        type: "Point",
                        coordinates: [element.lon, element.lat]
                    },
                    id: `node/${element.id}`
                }))
            };
        } else {
            throw new Error('API Overpass non disponible');
        }

        if (data.features.length > 0) {
            statusDiv.innerHTML = `${data.features.length} bornes trouvées`;
            traiterBornes(data);
        } else {
            statusDiv.innerHTML = 'Aucune borne trouvée dans un rayon de 5km';
        }
    } catch (error) {
        statusDiv.innerHTML = 'Erreur API. Utilisation des données de fallback.';
        // Utilisation des données de fallback
        traiterBornes(bornesData);
    }
}

// Traitement des données de bornes
function traiterBornes(data) {
    // Nettoyer les marqueurs existants
    map.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    bornesArray = [];

    data.features.forEach(feature => {
        const coordinates = feature.geometry.coordinates;
        const lon = coordinates[0];
        const lat = coordinates[1];

        // Extraire l'ID numérique
        const idString = feature.id.split('/')[1];
        const id = parseInt(idString);

        let borne;

        // Déterminer si la borne est publique (ID pair) ou privée (ID impair)
        if (id % 2 === 0) {
            borne = new BornePublique(id, lat, lon);
        } else {
            borne = new BornePrivee(id, lat, lon);
        }

        bornesArray.push(borne);

        // Ajouter un marqueur sur la carte
        const marker = L.marker([lat, lon]).addTo(map);
        marker.bindPopup(`
                    <div>
                        <strong>Borne ${borne.type}</strong><br>
                        ID: ${borne.id}<br>
                        ${borne.type === 'privee' ? `Propriétaire: ${borne.proprietaire}<br>` : ''}
                        <button onclick="ouvrirModalReservation('${borne.id}', '${borne.type}')">Réserver</button>
                    </div>
                `);
    });

    // Mettre à jour l'affichage de la liste
    if (currentView === 'list') {
        afficherListeBornes();
    }
}

// Basculer entre vue carte et vue liste
function basculerVue() {
    const mapContainer = document.getElementById('map-container');
    const listContainer = document.getElementById('list-container');

    if (currentView === 'map') {
        mapContainer.style.display = 'none';
        listContainer.style.display = 'block';
        currentView = 'list';
        afficherListeBornes();
    } else {
        mapContainer.style.display = 'block';
        listContainer.style.display = 'none';
        currentView = 'map';
    }
}

// Afficher la liste des bornes
function afficherListeBornes() {
    const listDiv = document.getElementById('bornes-list');
    listDiv.innerHTML = '';

    bornesArray.forEach(borne => {
        const div = document.createElement('div');
        div.innerHTML = borne.toHTML();
        listDiv.appendChild(div);
    });
}

// Ouvrir le modal de réservation
function ouvrirModalReservation(idBorne, typeBorne) {
    document.getElementById('modal-borne-id').textContent = idBorne;
    document.getElementById('reservation-modal').style.display = 'block';

    // Stocker les données de la borne pour le traitement
    document.getElementById('reservation-modal').setAttribute('data-borne-id', idBorne);
    document.getElementById('reservation-modal').setAttribute('data-borne-type', typeBorne);
}

// Fermer le modal de réservation
function fermerModalReservation() {
    document.getElementById('reservation-modal').style.display = 'none';
}

// Confirmer la réservation
function confirmerReservation(event) {
    event.preventDefault();

    const idBorne = document.getElementById('reservation-modal').getAttribute('data-borne-id');
    const typeBorne = document.getElementById('reservation-modal').getAttribute('data-borne-type');
    const date = document.getElementById('reservation-date').value;
    const heureDebut = document.getElementById('reservation-time').value;
    const duree = parseInt(document.getElementById('reservation-duration').value);

    // Validation des données
    if (!validerReservation(date, heureDebut, duree)) {
        return;
    }

    // Créer la réservation
    const reservation = new Reservation(idBorne, typeBorne, date, heureDebut, duree);
    reservations.push(reservation);

    // Sauvegarder dans localStorage
    localStorage.setItem('reservations', JSON.stringify(reservations));

    // Afficher message de confirmation
    alert(`Réservation confirmée pour la borne ${idBorne} le ${date} à ${heureDebut} pour ${duree} heure(s)`);

    // Fermer le modal et mettre à jour l'affichage
    fermerModalReservation();
    afficherReservations();
}

// Validation des données de réservation
function validerReservation(date, heureDebut, duree) {
    const dateReservation = new Date(date);
    const aujourdhui = new Date();
    aujourdhui.setHours(0, 0, 0, 0);

    // Vérifier que la date est future
    if (dateReservation < aujourdhui) {
        alert('La date de réservation doit être dans le futur');
        return false;
    }

    // Vérifier l'heure de début (entre 6h et 22h)
    const [heures, minutes] = heureDebut.split(':').map(Number);
    if (heures < 6 || heures > 22) {
        alert('L\'heure de début doit être entre 6h et 22h');
        return false;
    }

    // Vérifier la durée
    if (duree < 1 || duree > 6) {
        alert('La durée doit être entre 1 et 6 heures');
        return false;
    }

    return true;
}

// Charger les réservations depuis localStorage
function chargerReservations() {
    const reservationsString = localStorage.getItem('reservations');
    if (reservationsString) {
        reservations = JSON.parse(reservationsString);
        console.log('Données chargées depuis localStorage :', reservations);
    } else {
        console.log('Aucune réservation trouvée dans localStorage');
    }
}

// Afficher les réservations
function afficherReservations() {
    const tableDiv = document.getElementById('reservations-table');

    if (reservations.length === 0) {
        tableDiv.innerHTML = '<p>Aucune réservation</p>';
        return;
    }

    let html = `
                <table border="1">
                    <thead>
                        <tr>
                            <th>ID Borne</th>
                            <th>Type</th>
                            <th>Date</th>
                            <th>Heure</th>
                            <th>Durée</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

    reservations.forEach(reservation => {
        html += `
                    <tr>
                        <td>${reservation.idBorne}</td>
                        <td>${reservation.typeBorne}</td>
                        <td>${reservation.date}</td>
                        <td>${reservation.heureDebut}</td>
                        <td>${reservation.duree}h</td>
                        <td><button onclick="supprimerReservation('${reservation.id}')">Supprimer</button></td>
                    </tr>
                `;
    });

    html += '</tbody></table>';
    tableDiv.innerHTML = html;
}

// Supprimer une réservation
function supprimerReservation(idReservation) {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
        reservations = reservations.filter(r => r.id != idReservation);
        localStorage.setItem('reservations', JSON.stringify(reservations));
        afficherReservations();
    }
}

// Démarrer le compteur vers la prochaine réservation
function demarrerCompteur() {
    function mettreAJourCompteur() {
        const maintenant = new Date();
        const prochaineReservation = obtenirProchaineReservation();

        if (!prochaineReservation) {
            document.getElementById('countdown-text').textContent = 'Aucune réservation prévue';
            return;
        }

        const dateReservation = new Date(`${prochaineReservation.date}T${prochaineReservation.heureDebut}`);
        const tempsRestant = dateReservation - maintenant;

        if (tempsRestant <= 0) {
            document.getElementById('countdown-text').textContent = 'Réservation en cours';
            return;
        }

        const heures = Math.floor(tempsRestant / (1000 * 60 * 60));
        const minutes = Math.floor((tempsRestant % (1000 * 60 * 60)) / (1000 * 60));
        const secondes = Math.floor((tempsRestant % (1000 * 60)) / 1000);

        document.getElementById('countdown-text').textContent =
            `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secondes.toString().padStart(2, '0')}`;
    }

    mettreAJourCompteur();
    setInterval(mettreAJourCompteur, 1000);
}

// Obtenir la prochaine réservation
function obtenirProchaineReservation() {
    const maintenant = new Date();
    const reservationsFutures = reservations.filter(r => {
        const dateReservation = new Date(`${r.date}T${r.heureDebut}`);
        return dateReservation > maintenant;
    });

    if (reservationsFutures.length === 0) {
        return null;
    }

    return reservationsFutures.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.heureDebut}`);
        const dateB = new Date(`${b.date}T${b.heureDebut}`);
        return dateA - dateB;
    })[0];
}

// Rendre les fonctions globales pour les appels depuis HTML
window.ouvrirModalReservation = ouvrirModalReservation;
window.supprimerReservation = supprimerReservation;
