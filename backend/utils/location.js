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
 * Get city coordinates (example cities in Kerala, India)
 * This is a simple lookup - in production, use a geocoding API
 */
const cityCoordinates = {
    'Thiruvalla': { lat: 9.3816, lon: 76.5744 },
    'Pathanamthitta': { lat: 9.2647, lon: 76.7870 },
    'Kochi': { lat: 9.9312, lon: 76.2673 },
    'Trivandrum': { lat: 8.5241, lon: 76.9366 },
    'Kottayam': { lat: 9.5916, lon: 76.5222 },
    'Alappuzha': { lat: 9.4981, lon: 76.3388 },
    'Thrissur': { lat: 10.5276, lon: 76.2144 },
    'Calicut': { lat: 11.2588, lon: 75.7804 },
    'Kannur': { lat: 11.8745, lon: 75.3704 },
    'Palakkad': { lat: 10.7867, lon: 76.6548 }
};

function getCityCoordinates(cityName) {
    if (!cityName) return null;
    const city = cityCoordinates[cityName] || cityCoordinates[cityName.toLowerCase()];
    return city || null;
}

module.exports = {
    calculateDistance,
    getNearbyProvidersQuery,
    sortProvidersByRelevance,
    getCityCoordinates,
    cityCoordinates
};
