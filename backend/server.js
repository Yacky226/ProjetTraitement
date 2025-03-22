// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const accidentRoutes = require('./routes/accidents');
const cron = require('node-cron');
const axios = require('axios');
const cors = require('cors'); // Add this

// Initialiser Express
const app = express();


app.use(cors());


// Traiter les requêtes JSON
app.use(express.json());
app.use('/accidents', accidentRoutes);

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, {
})
  .then(() => console.log("Connecté à MongoDB"))
  .catch(err => console.error("Erreur de connexion à MongoDB", err));

// Route simple pour tester
app.get('/', (req, res) => {
  res.send('Serveur Express en marche !');
});

// Automatiser la mise à jour des accidents toutes les 25 minutes
cron.schedule('*/25 * * * *', async () => {
  console.log("Mise à jour automatique des accidents...");
  try {
    const response = await axios.post('http://localhost:5000/accidents/update');
    const response1 = await axios.post('http://localhost:5000/accidents/crash-per-period/update');
    console.log("Mise à jour terminée des accidents:", response.data.message);
    console.log("Mise à jour terminée des statistiques:", response1.data.message);
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error.message);
  }
});

// Lancer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});