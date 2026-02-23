const natural = require('natural');
const pool = require('../config/database');
const { getCityCoordinates, calculateDistance, sortProvidersByRelevance } = require('./location');

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Service keywords mapping
const serviceKeywords = {
    'Electrical': ['electrical', 'electric', 'electrician', 'wiring', 'outlet', 'circuit', 'light', 'power', 'fuse', 'breaker'],
    'Plumbing': ['plumbing', 'plumber', 'pipe', 'leak', 'drain', 'faucet', 'toilet', 'sink', 'water', 'sewer'],
    'Painting': ['painting', 'paint', 'painter', 'wall', 'ceiling', 'exterior', 'interior', 'color'],
    'Carpentry': ['carpentry', 'carpenter', 'wood', 'cabinet', 'furniture', 'door', 'window', 'frame', 'shelf'],
    'HVAC': ['hvac', 'heating', 'cooling', 'air conditioning', 'ac', 'furnace', 'thermostat', 'ventilation'],
    'Appliance': ['appliance', 'refrigerator', 'washer', 'dryer', 'dishwasher', 'oven', 'stove', 'microwave'],
    'Cleaning': ['cleaning', 'clean', 'housekeeping', 'maid', 'deep clean', 'carpet'],
    'General': ['handyman', 'repair', 'fix', 'maintenance', 'general', 'help']
};

// Urgency keywords
const urgencyKeywords = {
    'emergency': ['emergency', 'urgent', 'immediate', 'asap', 'now', 'critical', 'broken', 'flooding', 'fire'],
    'high': ['soon', 'quickly', 'today', 'important', 'serious'],
    'medium': ['normal', 'regular', 'standard'],
    'low': ['whenever', 'flexible', 'no rush', 'sometime']
};

// Extract service type from user message
function extractServiceType(message) {
    const lowerMessage = message.toLowerCase();
    const tokens = tokenizer.tokenize(lowerMessage);
    
    let bestMatch = { category: 'General', score: 0 };
    
    for (const [category, keywords] of Object.entries(serviceKeywords)) {
        let score = 0;
        for (const keyword of keywords) {
            if (lowerMessage.includes(keyword)) {
                score += 2;
            }
            if (tokens.some(token => token.includes(keyword) || keyword.includes(token))) {
                score += 1;
            }
        }
        if (score > bestMatch.score) {
            bestMatch = { category, score };
        }
    }
    
    return bestMatch.category;
}

// Extract urgency level from user message
function extractUrgency(message) {
    const lowerMessage = message.toLowerCase();
    
    for (const [level, keywords] of Object.entries(urgencyKeywords)) {
        if (keywords.some(keyword => lowerMessage.includes(keyword))) {
            return level;
        }
    }
    
    return 'medium';
}

// Extract date/time information (simple pattern matching)
function extractDateTime(message) {
    const lowerMessage = message.toLowerCase();
    const today = new Date();
    
    // Check for specific days
    if (lowerMessage.includes('today')) {
        return { date: today.toISOString().split('T')[0], time: '10:00' };
    }
    if (lowerMessage.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { date: tomorrow.toISOString().split('T')[0], time: '10:00' };
    }
    if (lowerMessage.includes('monday') || lowerMessage.includes('tuesday') || 
        lowerMessage.includes('wednesday') || lowerMessage.includes('thursday') || 
        lowerMessage.includes('friday') || lowerMessage.includes('saturday') || 
        lowerMessage.includes('sunday')) {
        // Default to next occurrence of that day
        return { date: null, time: '10:00' };
    }
    
    // Check for time mentions
    const timeMatch = message.match(/\b(\d{1,2}):?(\d{2})?\s*(am|pm)?\b/i);
    if (timeMatch) {
        let hours = parseInt(timeMatch[1]);
        const minutes = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3]?.toLowerCase();
        
        if (period === 'pm' && hours !== 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        const time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
        return { date: today.toISOString().split('T')[0], time };
    }
    
    return { date: null, time: null };
}

// Main chatbot function
async function processChatbotMessage(userMessage, userId = null) {
    try {
        const serviceType = extractServiceType(userMessage);
        const urgency = extractUrgency(userMessage);
        const dateTime = extractDateTime(userMessage);
        
        // Get user location if userId is provided
        let userLat = null;
        let userLon = null;
        let userCity = null;
        
        if (userId) {
            const [users] = await pool.execute(
                'SELECT city, latitude, longitude FROM users WHERE user_id = ?',
                [userId]
            );
            
            if (users.length > 0) {
                const user = users[0];
                userCity = user.city;
                // Use stored coordinates if available, otherwise get from city name
                if (user.latitude && user.longitude) {
                    userLat = parseFloat(user.latitude);
                    userLon = parseFloat(user.longitude);
                } else if (user.city) {
                    const cityCoords = getCityCoordinates(user.city);
                    if (cityCoords) {
                        userLat = cityCoords.lat;
                        userLon = cityCoords.lon;
                    }
                }
            }
        }
        
        // Build query for providers
        let query;
        let params = [];
        const maxDistance = 50; // Maximum distance in km (like Swiggy/Uber)
        
        if (userLat && userLon) {
            // Location-based query with distance calculation using Haversine formula
            query = `
                SELECT p.provider_id, p.first_name, p.last_name, p.business_name, 
                       p.service_category, p.rating, p.hourly_rate, p.availability_status, 
                       p.city, p.latitude, p.longitude,
                       CASE 
                           WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN
                               (6371 * acos(
                                   cos(radians(?)) * 
                                   cos(radians(p.latitude)) * 
                                   cos(radians(p.longitude) - radians(?)) + 
                                   sin(radians(?)) * 
                                   sin(radians(p.latitude))
                               ))
                           ELSE NULL
                       END AS distance
                FROM service_providers p
                LEFT JOIN bookings b ON p.provider_id = b.provider_id 
                    AND b.status = 'in_progress' 
                    AND b.booking_date >= CURDATE()
                WHERE p.service_category = ? 
                AND p.verification_status = 'verified'
                AND p.availability_status = 'available'
                AND b.booking_id IS NULL
                HAVING distance IS NULL OR distance <= ?
                ORDER BY 
                    CASE WHEN distance IS NOT NULL THEN distance ELSE 999 END ASC,
                    p.rating DESC,
                    p.hourly_rate ASC
                LIMIT 10
            `;
            params = [userLat, userLon, userLat, serviceType, maxDistance];
        } else {
            // Fallback: no location filtering (original behavior)
            query = `
                SELECT p.provider_id, p.first_name, p.last_name, p.business_name, 
                       p.service_category, p.rating, p.hourly_rate, p.availability_status, 
                       p.city, p.latitude, p.longitude, NULL AS distance
                FROM service_providers p
                LEFT JOIN bookings b ON p.provider_id = b.provider_id 
                    AND b.status = 'in_progress' 
                    AND b.booking_date >= CURDATE()
                WHERE p.service_category = ? 
                AND p.verification_status = 'verified'
                AND p.availability_status = 'available'
                AND b.booking_id IS NULL
                ORDER BY p.rating DESC, p.hourly_rate ASC
                LIMIT 5
            `;
            params = [serviceType];
        }
        
        let [providers] = await pool.execute(query, params);
        
        // For providers without coordinates in DB, calculate distance using city coordinates
        if (userLat && userLon && providers.length > 0) {
            providers = providers.map(provider => {
                if (!provider.distance && provider.city) {
                    const providerCoords = getCityCoordinates(provider.city);
                    if (providerCoords) {
                        provider.distance = calculateDistance(
                            userLat, userLon,
                            providerCoords.lat, providerCoords.lon
                        );
                    }
                }
                return provider;
            });
            
            // Filter by max distance and sort
            providers = providers.filter(p => !p.distance || p.distance <= maxDistance);
            providers = sortProvidersByRelevance(providers);
            providers = providers.slice(0, 5); // Limit to top 5
        }
        
        // Get service details
        const [services] = await pool.execute(
            `SELECT service_id, service_name, base_price 
             FROM services 
             WHERE service_category = ? 
             LIMIT 1`,
            [serviceType]
        );
        
        const response = {
            serviceType,
            urgency,
            suggestedProviders: providers,
            service: services[0] || null,
            suggestedDateTime: dateTime,
            message: generateResponseMessage(serviceType, providers.length, urgency, userCity)
        };
        
        return response;
    } catch (error) {
        console.error('Chatbot error:', error);
        throw error;
    }
}

// Generate human-like response message
function generateResponseMessage(serviceType, providerCount, urgency, userCity = null) {
    let message = `I found ${serviceType} services for you. `;
    
    if (providerCount > 0) {
        if (userCity) {
            message += `I have ${providerCount} verified ${serviceType.toLowerCase()} provider${providerCount > 1 ? 's' : ''} available near ${userCity}. `;
        } else {
            message += `I have ${providerCount} verified ${serviceType.toLowerCase()} provider${providerCount > 1 ? 's' : ''} available. `;
        }
    } else {
        if (userCity) {
            message += `Unfortunately, I couldn't find any available ${serviceType.toLowerCase()} providers near ${userCity} at the moment. `;
        } else {
            message += `Unfortunately, I couldn't find any available ${serviceType.toLowerCase()} providers at the moment. `;
        }
    }
    
    if (urgency === 'emergency') {
        message += 'Given the urgent nature, I recommend booking immediately. ';
    } else if (urgency === 'high') {
        message += 'I can help you book this service soon. ';
    } else {
        message += 'I can help you schedule this service. ';
    }
    
    message += 'Would you like me to show you the available providers and help you book?';
    
    return message;
}

module.exports = {
    processChatbotMessage,
    extractServiceType,
    extractUrgency,
    extractDateTime
};
