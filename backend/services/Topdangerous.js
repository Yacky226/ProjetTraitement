function getTopNDangerousZones(accidentsByZone, n) {
    const sortedZones = Object.entries(accidentsByZone)
        .sort(([, a], [, b]) => (b.indice_de_risque || 0) - (a.indice_de_risque || 0)) 
        .slice(0, n);

    return sortedZones.map(([on_street_name, data]) => ({
        on_street_name:data.on_street_name,
        totalAccidents: data.totalAccidents,
        totalInjured: data.totalInjured,
        totalKilled: data.totalKilled,
        riskIndex: data.riskIndex,
        latitude: data.latitude,
        longitude: data.longitude,
        riskPercentage: Number((data.indice_de_risque || 0).toFixed(2)) 
    }));
}

module.exports = getTopNDangerousZones;