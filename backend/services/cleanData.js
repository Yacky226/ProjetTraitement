const cleanAccidentData = async (rawData) => {
    const cleanedData = [];

    for (const accident of rawData) {
        try {
            const {
                on_street_name,
                borough,
                crash_date,
                crash_time,
                collision_id,
                latitude,
                longitude,
                number_of_persons_injured,
                number_of_persons_killed,
                contributing_factor_vehicle_1,
                vehicle_type_code1
            } = accident;

            // Vérifier si l'identifiant est présent
            if (!collision_id || (!on_street_name && !borough) || !longitude || !latitude ) {
               // console.warn(" collision_id manquant, accident ignoré");
                continue;
            }

            let nameStreet = on_street_name?.trim() || borough?.trim() ;
            let lat =  Number(latitude) ;
            let lon =  Number(longitude) ;
            if (lat === 0 || lon === 0) {
                console.warn(`Coordonnées invalides pour l'accident (collision_id: ${collision_id})`);
                continue;
            }

           

            cleanedData.push({
                collision_id,
                crash_date: crash_date ? new Date(crash_date) : null,
                crash_time: crash_time ,
                on_street_name: nameStreet,
                number_of_persons_injured: Number(number_of_persons_injured) || 0,
                number_of_persons_killed: Number(number_of_persons_killed) || 0,
                contributing_factor_vehicle_1: contributing_factor_vehicle_1?.trim(),
                vehicle_type_code1: vehicle_type_code1?.trim(),
                latitude: lat,
                longitude: lon
            });

        } catch (error) {
            console.warn(` Erreur traitement accident (collision_id: ${accident.collision_id || "N/A"}) : ${error.message}`);
        }
    }

    return  cleanedData ; 
};

module.exports = cleanAccidentData;
