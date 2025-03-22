function calculateStatistics(accidents) {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endOfYear = new Date(`${currentYear}-12-31T23:59:59.999Z`);

    const currentYearAccidents = accidents.filter(accident => {
        const crashDate = new Date(accident.crash_date);
        return crashDate >= startOfYear && crashDate <= endOfYear;
    });

    if (currentYearAccidents.length === 0) {
        return [];
    }

    const stats = {};

    currentYearAccidents.forEach(accident => {
        const injured = accident.number_of_persons_injured || 0;
        const killed = accident.number_of_persons_killed || 0;
        const on_street_name = accident.on_street_name || "Zone non spécifiée";

        if (!stats[on_street_name]) {
            stats[on_street_name] = {
                on_street_name,
                totalAccidents: 0,
                totalInjured: 0,
                totalKilled: 0,
                latitude: accident.latitude ?? 0,
                longitude: accident.longitude ?? 0,
                riskIndex: 0,
                indice_de_risque: 0
            };
        }

        stats[on_street_name].totalAccidents += 1;
        stats[on_street_name].totalInjured += injured;
        stats[on_street_name].totalKilled += killed;
    });

    return stats;
}

function calculateRiskIndex(statsByZone) {
    for (const zone in statsByZone) {
        const zoneData = statsByZone[zone];
        zoneData.riskIndex = 
            zoneData.totalAccidents + (zoneData.totalInjured * 2) + (zoneData.totalKilled * 5);
    }
}

function normalizeRiskIndices(statsByZone) {
    const riskIndices = Object.values(statsByZone).map(zone => zone.riskIndex);
    const maxIndex = Math.max(...riskIndices);
    const minIndex = Math.min(...riskIndices);
    const range = maxIndex - minIndex || 1;

    Object.values(statsByZone).forEach(zone => {
        zone.indice_de_risque = ((zone.riskIndex - minIndex) / range) * 100;
    });
}

function analyzeCurrentYearAccidentsByZone(accidents) {
    const statsByZone = calculateStatistics(accidents);
    if (statsByZone.length === 0) {
        return [];
    }

    calculateRiskIndex(statsByZone);
    normalizeRiskIndices(statsByZone);

    return Object.values(statsByZone);
}

module.exports = analyzeCurrentYearAccidentsByZone;
