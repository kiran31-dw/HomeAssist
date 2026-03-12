// Location utility for distance calculation and location-based matching

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Get nearby providers based on user location
 * @param {number} userLat - User latitude
 * @param {number} userLon - User longitude
 * @param {number} maxDistance - Maximum distance in kilometers (default: 50km)
 * @returns {string} SQL query for filtering nearby providers
 */
function getNearbyProvidersQuery(userLat, userLon, maxDistance = 50) {
    // Using Haversine formula in SQL
    // This is a simplified version - for production, consider using spatial indexes
    return `
        (6371 * acos(
            cos(radians(?)) * 
            cos(radians(latitude)) * 
            cos(radians(longitude) - radians(?)) + 
            sin(radians(?)) * 
            sin(radians(latitude))
        )) AS distance
    `;
}

/**
 * Sort providers by distance, rating, and availability
 * @param {Array} providers - Array of provider objects with distance, rating, availability_status
 * @returns {Array} Sorted providers
 */
function sortProvidersByRelevance(providers) {
    return providers.sort((a, b) => {
        // First priority: Available providers
        if (a.availability_status === 'available' && b.availability_status !== 'available') return -1;
        if (a.availability_status !== 'available' && b.availability_status === 'available') return 1;
        
        // Second priority: Distance (closer is better)
        const distanceA = a.distance || 999;
        const distanceB = b.distance || 999;
        if (Math.abs(distanceA - distanceB) > 5) { // If difference is more than 5km
            return distanceA - distanceB;
        }
        
        // Third priority: Rating (higher is better)
        const ratingA = parseFloat(a.rating) || 0;
        const ratingB = parseFloat(b.rating) || 0;
        if (Math.abs(ratingA - ratingB) > 0.5) {
            return ratingB - ratingA;
        }
        
        // Fourth priority: Number of reviews
        return (b.total_reviews || 0) - (a.total_reviews || 0);
    });
}

/**
 * Get city coordinates (all cities in Kerala, India)
 * This is a simple lookup - in production, use a geocoding API
 */
const cityCoordinates = {
    'Thiruvananthapuram': { lat: 8.5241, lon: 76.9366 },
    'Neyyattinkara': { lat: 8.3988, lon: 77.08 },
    'Attingal': { lat: 8.6967, lon: 76.8167 },
    'Varkala': { lat: 8.7375, lon: 76.7167 },
    'Kollam': { lat: 8.8932, lon: 76.6141 },
    'Punalur': { lat: 9.0167, lon: 76.9333 },
    'Karunagappally': { lat: 9.05, lon: 76.5333 },
    'Kottarakkara': { lat: 9.0, lon: 76.7667 },
    'Paravur': { lat: 8.8333, lon: 76.6667 },
    'Pathanamthitta': { lat: 9.2647, lon: 76.7870 },
    'Thiruvalla': { lat: 9.3816, lon: 76.5744 },
    'Chengannur': { lat: 9.3167, lon: 76.6167 },
    'Adoor': { lat: 9.15, lon: 76.7333 },
    'Ranni': { lat: 9.3833, lon: 76.8 },
    'Kozhencherry': { lat: 9.3333, lon: 76.7 },
    'Alappuzha': { lat: 9.4981, lon: 76.3388 },
    'Cherthala': { lat: 9.6833, lon: 76.3333 },
    'Mavelikkara': { lat: 9.2667, lon: 76.55 },
    'Kayamkulam': { lat: 9.1833, lon: 76.5 },
    'Haripad': { lat: 9.2833, lon: 76.45 },
    'Kottayam': { lat: 9.5916, lon: 76.5222 },
    'Changanassery': { lat: 9.45, lon: 76.5333 },
    'Pala': { lat: 9.7167, lon: 76.6833 },
    'Ettumanoor': { lat: 9.6667, lon: 76.5667 },
    'Vaikom': { lat: 9.7667, lon: 76.4 },
    'Erattupetta': { lat: 9.7, lon: 76.7833 },
    'Idukki': { lat: 9.85, lon: 76.9667 },
    'Thodupuzha': { lat: 9.9, lon: 76.7167 },
    'Munnar': { lat: 10.0889, lon: 77.0597 },
    'Devikulam': { lat: 10.05, lon: 77.15 },
    'Peermade': { lat: 9.5667, lon: 76.9833 },
    'Kochi': { lat: 9.9312, lon: 76.2673 },
    'Ernakulam': { lat: 9.9816, lon: 76.2997 },
    'Aluva': { lat: 10.1167, lon: 76.35 },
    'Kalamassery': { lat: 10.05, lon: 76.3333 },
    'Tripunithura': { lat: 9.95, lon: 76.35 },
    'Kothamangalam': { lat: 10.0667, lon: 76.6167 },
    'North Paravur': { lat: 10.15, lon: 76.2167 },
    'Thrissur': { lat: 10.5276, lon: 76.2144 },
    'Guruvayur': { lat: 10.6, lon: 76.05 },
    'Kodungallur': { lat: 10.2167, lon: 76.2 },
    'Chalakudy': { lat: 10.3, lon: 76.3333 },
    'Palakkad': { lat: 10.7867, lon: 76.6548 },
    'Ottapalam': { lat: 10.7667, lon: 76.3833 },
    'Shoranur': { lat: 10.7667, lon: 76.2833 },
    'Pattambi': { lat: 10.8167, lon: 76.2 },
    'Malappuram': { lat: 11.0667, lon: 76.0667 },
    'Manjeri': { lat: 11.1167, lon: 76.1167 },
    'Tirur': { lat: 10.9167, lon: 75.9167 },
    'Kottakkal': { lat: 10.9833, lon: 75.9833 },
    'Nilambur': { lat: 11.2833, lon: 76.2333 },
    'Kozhikode': { lat: 11.2588, lon: 75.7804 },
    'Vadakara': { lat: 11.6, lon: 75.5833 },
    'Koyilandy': { lat: 11.4333, lon: 75.7 },
    'Kalpetta': { lat: 11.6167, lon: 76.0833 },
    'Sulthan Bathery': { lat: 11.6667, lon: 76.2667 },
    'Mananthavady': { lat: 11.8, lon: 76.0 },
    'Kannur': { lat: 11.8745, lon: 75.3704 },
    'Thalassery': { lat: 11.75, lon: 75.4833 },
    'Payyannur': { lat: 12.1, lon: 75.2 },
    'Taliparamba': { lat: 12.05, lon: 75.35 },
    'Kasaragod': { lat: 12.4996, lon: 74.9869 },
    'Kanhangad': { lat: 12.3, lon: 75.1 },
    'Bekal': { lat: 12.4, lon: 75.0333 },
    // Legacy names for backward compatibility
    'Trivandrum': { lat: 8.5241, lon: 76.9366 },
    'Calicut': { lat: 11.2588, lon: 75.7804 }
};

function getCityCoordinates(cityName) {
    if (!cityName) return null;
    
    // Try exact match first
    if (cityCoordinates[cityName]) {
        return cityCoordinates[cityName];
    }
    
    // Try case-insensitive match
    const cityLower = cityName.toLowerCase();
    for (const [key, value] of Object.entries(cityCoordinates)) {
        if (key.toLowerCase() === cityLower) {
            return value;
        }
    }
    
    return null;
}

module.exports = {
    calculateDistance,
    getNearbyProvidersQuery,
    sortProvidersByRelevance,
    getCityCoordinates,
    cityCoordinates
};
