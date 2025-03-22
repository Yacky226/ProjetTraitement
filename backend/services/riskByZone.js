function calculateRiskByZone(accidents) {
    // Supposons que le nom de la rue soit utilisé pour la zone
    const riskByZone = accidents.reduce((acc, accident) => {
        const zone = accident.on_street_name;
        
        
        
        if (!acc[zone]) {
           
            acc[zone] = { accidentsCount: 0, risque: 0 ,injuries:0,deaths:0,latitude:accident.latitude,longitude:accident.longitude,freq:0};
        }
        
        // Incrémenter le nombre d'accidents dans la zone
        acc[zone].accidentsCount += 1;
        acc[zone].injuries+=accident.number_of_persons_injured;
        acc[zone].deaths+=accident.number_of_persons_killed;

        return acc;
    }, {});

    // Calcul du risque par zone (en pourcentage par rapport au total des accidents)

    let totalAccidents = 0;
    Object.keys(riskByZone).forEach(zone => {
        totalAccidents += riskByZone[zone].accidentsCount;
    });
  
    Object.keys(riskByZone).forEach(zone => {
        riskByZone[zone].freq=(riskByZone[zone].accidentsCount/totalAccidents);
        riskByZone[zone].risque = (riskByZone[zone].accidentsCount+riskByZone[zone].injuries*3 +riskByZone[zone].deaths*5);
    });

    return riskByZone;
}

module.exports = calculateRiskByZone;
