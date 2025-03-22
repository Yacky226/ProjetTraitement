const express = require('express');
const  Accident = require('../models/Accident');
const statModel=require('../models/Stats');
const fetchNYCAccidentData = require('../services/fetchNYCData');
const cleanAccidentData = require('../services/cleanData');
const calculateRiskByZone = require('../services/riskByZone');
const calculateRiskByHourAndZone = require('../services/riskByHourAndZone');
const crash_current=require('../services/CrashperPeriod');
const crashModel=require('../models/AccidentbyHour');
const topZone=require('../services/Topdangerous');
const router = express.Router();



router.get('/', async (req, res) => {
    try {
        const accidents = await Accident.find().sort({ crash_date: -1 });
        res.status(200).json(accidents);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la récupération", error: err.message });
    }
});



router.get('/crash-per-period',async(req,res)=>{
    try{
       const crashPerPeriod=await statModel.find();
        res.status(200).json(crashPerPeriod);
    }
    catch(err){
        res.status(500).json({message:"Erreur lors du calcul du crash par période",error:err.message});
    }
});


router.get('/risk-by-zone', async (req, res) => {
    try {
        const accidents = await Accident.find();
        const riskByZone = calculateRiskByZone(accidents);

        res.status(200).json(riskByZone);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors du calcul du risque par zone", error: err.message });
    }
});

router.get('/top-dangerous-zones', async (req, res) => {
    try {
        const crashPerPeriod = await statModel.find();
        // Récupère le top 10 des zones les plus dangereuses
        const topZones = topZone(crashPerPeriod, 10); 
        console.log("topZones :", topZones);

        res.status(200).json(topZones);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors du calcul du top des zones les plus dangereuses", error: err.message });
    }
});




router.get('/risk-by-hour-and-zone', async (req, res) => {
    try {
        const accidents = await Accident.find();
        const riskByHourAndZone = calculateRiskByHourAndZone(accidents);
        res.status(200).json(riskByHourAndZone);
    } catch (err) {
        res.status(500).json({ message: "Erreur lors du calcul du risque par heure et zone", error: err.message });
    }
});



router.post('/', async (req, res) => {
    try {
        const rawData = await fetchNYCAccidentData();
        const  cleanedData = await cleanAccidentData(rawData);
      
        // Insérer les données dans MongoDB
        await Accident.insertMany(cleanedData);

        res.status(201).json({ 
            message: 'Accidents importés et traités avec succès', 
            accidentCount: cleanedData.length, 
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de l'importation", error: err.message });
    }
});

router.post('/crash-per-period',async(req,res)=>{
    try{
        const accidents=await Accident.find();
        const crashPerPeriod=crash_current(accidents);
        statModel.insertMany(crashPerPeriod);
        res.status(200).json({message:"Crash par période inséré avec succès"});
      
    }
    catch(err){
        res.status(500).json({message:"Erreur lors du calcul du crash par période",error:err.message});
    }
});

router.post('/risk-by-hour-and-zone', async (req, res) => {
    try {
        const accidents = await Accident.find();
        const riskByHourAndZone = calculateRiskByHourAndZone(accidents);
        await crashModel.insertMany(riskByHourAndZone);
        res.status(200).json({ message: "Risque par heure et zone inséré avec succès" });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de l'insertion du risque par heure et zone", error: err.message });
    }
});

router.post('/update', async (req, res) => {
    try {
        const existingIds = new Set(await Accident.distinct("collision_id"));

        const rawData = await fetchNYCAccidentData();
        const  cleanedData = await cleanAccidentData(rawData);

        // Filtrer uniquement les nouveaux accidents à insérer
        const newAccidents = cleanedData.filter(accident => 
            accident.collision_id && !existingIds.has(accident.collision_id)
        );

        if (newAccidents.length === 0) {
            return res.status(200).json({ message: "Aucun nouvel accident à ajouter" });
        }

        // Insérer les nouveaux accidents et les nouvelles rues
        await Accident.insertMany(newAccidents);

        res.status(201).json({ 
            message: "Mise à jour terminée", 
            newAccidentsCount: newAccidents.length, 
        });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
});

router.post('/risk-by-zone/update', async (req, res) => {
    try {
        const accidents = await Accident.find();
        const riskByZone = calculateRiskByZone(accidents);

        // Mise à jour avec upsert (remplace si existe, insère sinon)
        await statModel.replaceOne({}, riskByZone, { upsert: true });

        res.status(200).json({ message: "Risque par zone mis à jour avec succès" });
    } catch (err) {
        console.error("Erreur lors de la mise à jour du risque par zone :", err);
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
});


router.post('/crash-per-period/update', async (req, res) => {
    try {
        const accidents = await Accident.find();
        const crashPerPeriod = crash_current(accidents);

        console.log("crashPerPeriod avant insertion :", JSON.stringify(crashPerPeriod, null, 2));

        const filter = {}; // On veut un document unique
        const update = { $set: crashPerPeriod };
        const options = { upsert: true, new: true }; // Upsert = insert si inexistant, new = retourne la version mise à jour

        const result = await statModel.findOneAndUpdate(filter, update, options);

        res.status(200).json({ message: "Crash par période mis à jour avec succès", data: result });
    } catch (err) {
        res.status(500).json({ message: "Erreur lors de la mise à jour", error: err.message });
    }
});


module.exports = router;
