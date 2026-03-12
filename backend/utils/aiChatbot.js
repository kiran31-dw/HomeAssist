const natural = require('natural');
const pool = require('../config/database');
const { getCityCoordinates, calculateDistance, sortProvidersByRelevance } = require('./location');

// Initialize tokenizer and stemmer
const tokenizer = new natural.WordTokenizer();
const stemmer = natural.PorterStemmer;

// Common misspellings mapping (typo -> correct word)
const misspellingsMap = {
    // Electrical misspellings
    'electrition': 'electrician',
    'elctritiion': 'electrician',
    'electritian': 'electrician',
    'electrisian': 'electrician',
    'electriton': 'electrician',
    'elctrician': 'electrician',
    'electrisity': 'electricity',
    'elektrician': 'electrician',
    'elektrisian': 'electrician',
    'elektrisity': 'electricity',
    'elektricity': 'electricity',
    // Plumbing misspellings
    'plumer': 'plumber',
    'plumbur': 'plumber',
    'plumbar': 'plumber',
    'plumbor': 'plumber',
    'plumbir': 'plumber',
    // Cleaning misspellings
    'cleener': 'cleaner',
    'cleen': 'clean',
    'cleening': 'cleaning',
    'cleenar': 'cleaner',
    'cleenor': 'cleaner',
    'cleenir': 'cleaner',
    'cleenning': 'cleaning',
    // Painting misspellings
    'paintor': 'painter',
    'paintar': 'painter',
    'paintir': 'painter',
    'paintur': 'painter',
    // Carpentry misspellings (including carpeter as user mentioned)
    'carpentar': 'carpenter',
    'carpentor': 'carpenter',
    'carpentir': 'carpenter',
    'carpentur': 'carpenter',
    'carpetar': 'carpenter',
    'carpetor': 'carpenter',
    'carpetir': 'carpenter',
    'carpeter': 'carpenter',
    // HVAC misspellings
    'h-vac': 'hvac',
    'h v a c': 'hvac',
    // Appliance misspellings
    'refridgerator': 'refrigerator',
    'fridge': 'refrigerator',
};

// Service keywords mapping - ordered by priority (more specific first)
// Order matters: more specific services should be checked first
const serviceKeywords = {
    'Appliance': [
        'appliance', 'refrigerator', 'washer', 'dryer', 'dishwasher', 'oven', 'stove', 'microwave',
        'washing machine', 'wash machine', 'washingmachine', 'fridge', 'freezer', 'mixer', 'grinder',
        'blender', 'juicer', 'toaster', 'kettle', 'iron', 'vacuum cleaner', 'vacuum', 'tv', 'television',
        'radio', 'speaker', 'fan', 'table fan', 'geyser', 'water heater', 'heater', 'induction', 'induction stove',
        'gas stove', 'chimney', 'exhaust', 'chimney exhaust', 'water purifier', 'purifier',
        'appliance repair', 'appliance service', 'refrigerator repair', 'washer repair', 'dryer repair',
        'dishwasher repair', 'oven repair', 'stove repair', 'microwave repair', 'fridge repair',
        'washing machine repair', 'mixer repair', 'grinder repair', 'tv repair', 'television repair',
        'radio repair', 'fan repair', 'geyser repair', 'heater repair', 'water heater repair',
        'room heater repair', 'space heater repair', 'heater service', 'heater not working',
        'fridge service', 'need appliance', 'want appliance', 'appliance issue', 'appliance problem',
        'refrigerator issue', 'washer issue', 'dryer issue', 'oven issue', 'stove issue',
        'microwave issue', 'fridge issue', 'washing machine issue', 'heater issue', 'geyser issue',
        'washing machine not working', 'mixer not working', 'grinder not working', 'tv not working',
        'television not working', 'radio not working', 'fan not working', 'geyser not working',
        'heater not working', 'appliance not working', 'fix refrigerator', 'fix washer', 'fix dryer',
        'fix dishwasher', 'fix oven', 'fix stove', 'fix microwave', 'fix fridge', 'fix washing machine',
        'fix mixer', 'fix grinder', 'fix tv', 'fix television', 'fix radio', 'fix fan', 'fix geyser',
        'fix heater', 'fix water heater', 'repair heater', 'repair water heater', 'book heater repair',
        'heater repair service', 'book heater service',
        'install appliance', 'appliance installation', 'my washing machine', 'my fridge', 'my mixer',
        'my grinder', 'my tv', 'my television', 'broken washing machine', 'broken fridge', 'broken mixer',
        'broken grinder', 'broken tv', 'broken television', 'damaged washing machine', 'damaged fridge'
    ],
    'Cleaning': [
        'cleaner', 'cleaning', 'clean', 'housekeeping', 'maid', 'house cleaner', 'house cleaning', 
        'deep clean', 'carpet cleaning', 'janitor', 'janitorial', 'cleaning service', 'cleaning help',
        'need cleaning', 'want cleaning', 'house clean', 'home clean', 'room clean', 'office clean',
        'clean house', 'clean home', 'clean room', 'clean office', 'dusting', 'mopping', 'vacuum',
        'sweep', 'sweeping', 'wash', 'washing', 'tidy', 'tidy up', 'organize', 'organization'
    ],
    'Electrical': [
        'electrician', 'electrical', 'electric', 'wiring', 'outlet', 'circuit', 'light', 'power', 
        'fuse', 'breaker', 'electricity', 'electrical work', 'electrical service', 'electrical repair',
        'electrical wiring', 'new electrical wiring', 'install wiring', 'install electrical wiring',
        'wiring installation', 'electrical wiring installation', 'new wiring', 'house wiring',
        'home wiring', 'rewiring', 're-wiring', 'electrical rewiring', 'wire installation',
        'need electrician', 'want electrician', 'book electrician', 'arrange electrician', 'send electrician',
        'schedule electrician', 'get electrician', 'find electrician', 'electrical issue', 'electrical problem',
        'power issue', 'power problem', 'light issue', 'light problem', 'wiring work', 'wiring repair',
        'install light', 'fix light', 'broken light', 'no power', 'power cut', 'electricity cut',
        'fuse blown', 'circuit breaker', 'electrical safety', 'electrical inspection', 'electrical installation',
        'install electrical', 'electrical connection', 'power connection', 'electric connection'
    ],
    'Plumbing': [
        'plumber', 'plumbing', 'pipe', 'leak', 'drain', 'faucet', 'toilet', 'sink', 'sewer', 
        'tap', 'taps', 'shower', 'washbasin', 'wash basin', 'water tank', 'overhead tank',
        'geyser', 'bathroom fitting', 'bathroom fittings', 'drainage', 'drainage system',
        'water leak', 'water problem', 'plumbing work', 'plumbing service', 'plumbing repair',
        'plumbing maintenance', 'plumbing installation', 'pipe repair', 'leak repair', 'drain cleaning',
        'toilet repair', 'sink repair', 'tap installation', 'shower installation', 'bathroom fitting',
        'water tank repair', 'geyser connection', 'geyser pipe connection', 'pipe installation',
        'need plumber', 'want plumber', 'book plumber', 'arrange plumber', 'send plumber',
        'schedule plumber', 'get plumber', 'find plumber', 'water issue', 'leak issue', 'drain issue',
        'toilet issue', 'sink issue', 'faucet issue', 'tap issue', 'shower issue', 'pipe issue',
        'blocked drain', 'clogged drain', 'clogged toilet', 'clogged sink', 'clogged washbasin',
        'broken pipe', 'pipe leak', 'pipe leaking', 'pipe burst', 'pipe broken', 'leaking pipe',
        'leaking tap', 'leaking faucet', 'leaking sink', 'leaking toilet', 'leaking shower',
        'water damage', 'water overflow', 'water pressure', 'low water pressure', 'water not filling',
        'fix leak', 'fix drain', 'fix toilet', 'fix sink', 'fix faucet', 'fix tap', 'fix pipe',
        'fix shower', 'fix washbasin', 'fix geyser', 'fix water tank', 'repair leak', 'repair drain',
        'repair toilet', 'repair sink', 'repair faucet', 'repair tap', 'repair pipe', 'repair shower',
        'repair washbasin', 'repair geyser', 'repair water tank', 'repair bathroom', 'repair kitchen',
        'install faucet', 'install sink', 'install tap', 'install shower', 'install toilet',
        'install geyser', 'install water tank', 'install bathroom fitting', 'install pipe',
        'replace shower', 'replace tap', 'replace faucet', 'replace sink', 'replace toilet',
        'bathroom repair', 'kitchen repair', 'pipe leakage', 'tap leakage', 'faucet leakage',
        'sink leakage', 'toilet leakage', 'shower leakage', 'water leakage', 'emergency plumbing',
        'urgent plumbing', 'plumbing emergency', 'plumbing urgent', 'new house plumbing',
        'plumbing work done', 'plumbing assistance', 'plumbing help', 'toilet flush', 'toilet clogged',
        'sink clogged', 'drain blocked', 'drainage blocked', 'drainage issue', 'drainage problem'
    ],
    'Painting': [
        'painter', 'painting', 'paint', 'wall', 'ceiling', 'exterior', 'interior', 'color', 'colour', 
        'new color', 'new colour', 'change color', 'change colour', 'repaint', 're-paint', 'recolor', 
        're-colour', 'paint job', 'paint house', 'paint walls', 'paint room', 'paint home', 
        'color change', 'colour change', 'fresh paint', 'new paint', 'wall paint', 'house paint',
        'painting work', 'painting service', 'need painter', 'want painter', 'wall painting',
        'house painting', 'home painting', 'room painting', 'exterior painting', 'interior painting',
        'paint walls', 'paint ceiling', 'paint exterior', 'paint interior', 'brush', 'brush work'
    ],
    'Carpentry': [
        'carpenter', 'carpentry', 'wood', 'cabinet', 'furniture', 'door', 'window', 'frame', 'shelf',
        'cupboard', 'wardrobe', 'almirah', 'drawer', 'drawers', 'table', 'chair', 'bench', 'rack',
        'kitchen cabinet', 'kitchen cabinets', 'bathroom cabinet', 'bathroom cabinets', 'bedroom cabinet',
        'dining table', 'coffee table', 'side table', 'bookshelf', 'book shelf', 'tv stand', 'tv unit',
        'carpentry work', 'carpentry service', 'wood work', 'woodwork', 'need carpenter', 'want carpenter',
        'arrange carpenter', 'get carpenter', 'find carpenter', 'send carpenter', 'book carpenter',
        'schedule carpenter', 'cabinet work', 'furniture work', 'kitchen work', 'cabinet repair work',
        'door work', 'window work', 'cupboard work', 'wardrobe work', 'install door', 'install window',
        'install cabinet', 'install furniture', 'install cupboard', 'install wardrobe', 'install shelf',
        'fix door', 'fix window', 'repair door', 'repair window', 'repair cupboard', 'repair wardrobe',
        'repair cabinet', 'repair furniture', 'repair kitchen cabinet', 'repair kitchen cabinets',
        'fix cupboard', 'fix wardrobe', 'fix cabinet', 'fix furniture', 'fix kitchen cabinet',
        'fix kitchen cabinets', 'broken cupboard', 'broken wardrobe', 'broken cabinet', 'broken furniture',
        'broken kitchen cabinet', 'broken kitchen cabinets', 'broken door', 'broken window',
        'wood repair', 'furniture repair', 'cabinet repair', 'cupboard repair', 'wardrobe repair',
        'kitchen cabinet repair', 'kitchen cabinets repair', 'build cabinet', 'build furniture',
        'build cupboard', 'build wardrobe', 'build kitchen cabinet', 'build kitchen cabinets',
        'custom furniture', 'custom cabinet', 'custom kitchen cabinet', 'wooden work', 'carpentry repair',
        'wood installation', 'door installation', 'window installation', 'cabinet installation',
        'furniture installation', 'kitchen cabinet installation'
    ],
    'HVAC': [
        'hvac', 'heating', 'cooling', 'air conditioning', 'ac', 'furnace', 'thermostat', 'ventilation',
        'hvac service', 'hvac repair', 'ac service', 'ac repair', 'air conditioner', 'air conditioning',
        'need ac', 'want ac', 'ac issue', 'ac problem', 'heating issue', 'cooling issue',
        'air conditioning issue', 'ac not working', 'heating not working', 'cooling not working',
        'fix ac', 'fix heating', 'fix cooling', 'install ac', 'install heating', 'install cooling',
        'ac maintenance', 'heating maintenance', 'cooling maintenance', 'thermostat repair',
        'furnace repair', 'ventilation repair', 'air quality', 'temperature control'
    ],
    'General': [
        'handyman', 'repair', 'fix', 'maintenance', 'general', 'help', 'handyman service',
        'repair service', 'fix service', 'maintenance service', 'need handyman', 'want handyman',
        'general repair', 'general service', 'home repair', 'house repair', 'home maintenance',
        'house maintenance', 'fix it', 'repair work', 'maintenance work', 'handyman work'
    ]
};

// Urgency keywords
const urgencyKeywords = {
    'emergency': ['emergency', 'urgent', 'immediate', 'asap', 'now', 'critical', 'broken', 'flooding', 'fire'],
    'high': ['soon', 'quickly', 'today', 'important', 'serious'],
    'medium': ['normal', 'regular', 'standard'],
    'low': ['whenever', 'flexible', 'no rush', 'sometime']
};

// Calculate string similarity using Jaro-Winkler distance (better for typos)
function calculateSimilarity(str1, str2) {
    return natural.JaroWinklerDistance(str1, str2);
}

// Check if two strings are similar enough (handles typos)
function isSimilar(str1, str2, threshold = 0.7) {
    if (str1 === str2) return true;
    
    // Check if one contains the other (for partial matches)
    if (str1.includes(str2) || str2.includes(str1)) {
        return true;
    }
    
    // Use Jaro-Winkler distance for fuzzy matching
    const similarity = calculateSimilarity(str1, str2);
    return similarity >= threshold;
}

// Check first letter match (for very misspelled words)
function firstLetterMatch(str1, str2) {
    if (str1.length === 0 || str2.length === 0) return false;
    // Check first letter
    if (str1[0].toLowerCase() !== str2[0].toLowerCase()) return false;
    // Also check if first 2-3 letters match (more reliable)
    const minLen = Math.min(str1.length, str2.length, 3);
    const str1Start = str1.substring(0, minLen).toLowerCase();
    const str2Start = str2.substring(0, minLen).toLowerCase();
    return str1Start === str2Start;
}

// Normalize message by fixing common misspellings
function normalizeMessage(message) {
    let normalized = message.toLowerCase();
    // Replace common misspellings
    for (const [typo, correct] of Object.entries(misspellingsMap)) {
        // Use word boundaries to avoid partial replacements
        const regex = new RegExp(`\\b${typo}\\b`, 'gi');
        normalized = normalized.replace(regex, correct);
    }
    return normalized;
}

// Extract service type from user message with fuzzy matching
function extractServiceType(message) {
    // First, normalize common misspellings
    const normalizedMessage = normalizeMessage(message);
    const lowerMessage = normalizedMessage; // Already lowercase from normalizeMessage
    const tokens = tokenizer.tokenize(lowerMessage);
    
    // Create a word boundary regex helper
    const createWordBoundaryRegex = (keyword) => {
        // Escape special regex characters
        const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Match whole word with word boundaries (handles plurals and common suffixes)
        return new RegExp(`\\b${escaped}(?:s|er|ing|ed)?\\b`, 'i');
    };
    
    let bestMatch = { category: 'General', score: 0 };
    
    // Special context-aware matching for indirect requests
    // Check for painting-related context (e.g., "new colour", "change color", "schedule a painter", "paint my house")
    const hasPaintingContext = lowerMessage.match(/\b(new|change|want|need|get|schedule|arrange|book|i need|i want)\s+(to\s+)?(paint|painting|a\s+)?(new\s+)?(color|colour|paint|painter)\b/i) ||
        lowerMessage.match(/\b(paint|painting)\s+(my|the|a|an|this)\s+(house|home|room|wall|walls|bedroom|kitchen|bathroom|room)\b/i) ||
        lowerMessage.match(/\b(need|want|get|schedule|arrange|book|i need|i want)\s+(to\s+)?paint\s+(my|the|a|an|this)\s+(house|home|room|wall|walls|bedroom|kitchen|bathroom)\b/i) ||
        lowerMessage.match(/\b(color|colour|paint)\s+(change|job|work|service)\b/i) ||
        lowerMessage.match(/\b(house|home|room|wall|walls|bedroom|kitchen|bathroom)\s+(need|want|get|schedule|arrange|book)\s+(a\s+)?(new\s+)?(color|colour|paint|painter)\b/i) ||
        lowerMessage.match(/\b(painter|painting)\s+(for|to|in|at)\s+(my|the|a|an|this)\s+(house|home|room|wall|walls|bedroom|kitchen|bathroom)\b/i) ||
        lowerMessage.match(/\b(schedule|arrange|book|need|want|get|i need|i want)\s+(a\s+)?painter\s+(to\s+)?(paint|for)\b/i) ||
        lowerMessage.match(/\b(paint|painting)\s+(service|work|job)\b/i);
    
    // Check for carpentry-related context (e.g., "carpenter to repair", "broken cupboard", "kitchen cabinets")
    const hasCarpentryContext = lowerMessage.match(/\b(carpenter|carpentry)\s+(to\s+)?(repair|fix|build|install|arrange|send|book|schedule)\b/i) ||
        lowerMessage.match(/\b(repair|fix|build|install)\s+(cupboard|wardrobe|cabinet|cabinets|furniture|door|window|shelf|shelves|table|chair|kitchen cabinet|kitchen cabinets)\b/i) ||
        lowerMessage.match(/\b(broken|damaged)\s+(cupboard|wardrobe|cabinet|cabinets|furniture|door|window|shelf|shelves|table|chair|kitchen cabinet|kitchen cabinets)\b/i) ||
        lowerMessage.match(/\b(arrange|get|need|want|send|book|schedule|can you send)\s+(a\s+)?carpenter\b/i) ||
        lowerMessage.match(/\b(kitchen|bathroom|bedroom)\s+(cabinet|cabinets|furniture|work)\b/i) ||
        lowerMessage.match(/\b(cabinet|cabinets|furniture|cupboard|wardrobe)\s+(repair|fix|installation|work|broken|damaged)\b/i);
    
    // Check for plumbing-related context (e.g., "pipe is leaking", "need a plumber", "book a plumber")
    const hasPlumbingContext = lowerMessage.match(/\b(plumber|plumbing)\s+(to\s+)?(repair|fix|install|arrange|book|schedule)\b/i) ||
        lowerMessage.match(/\b(pipe|tap|faucet|sink|toilet|drain|shower|washbasin|geyser|water tank)\s+(is|are|not)\s+(leaking|leak|broken|clogged|blocked|burst)\b/i) ||
        lowerMessage.match(/\b(leaking|leak|broken|clogged|blocked|burst)\s+(pipe|tap|faucet|sink|toilet|drain|shower|washbasin|geyser|water tank)\b/i) ||
        lowerMessage.match(/\b(pipe|tap|faucet|sink|toilet|drain|shower|washbasin|geyser|water tank)\s+(leakage|leak|repair|fix|installation|issue|problem)\b/i) ||
        lowerMessage.match(/\b(arrange|get|need|want|book|schedule|send)\s+(a\s+)?plumber\b/i) ||
        lowerMessage.match(/\b(water|drainage)\s+(leak|leakage|problem|issue|overflow|pressure|not filling)\b/i) ||
        lowerMessage.match(/\b(blocked|clogged)\s+(drain|toilet|sink|washbasin|drainage)\b/i) ||
        lowerMessage.match(/\b(pipe|tap|faucet)\s+(burst|broken|installation|repair)\b/i);
    
    // Check for appliance-related context (e.g., "washing machine not working", "my fridge", "broken tv", "heater repair")
    const applianceNames = 'washing machine|fridge|refrigerator|mixer|grinder|tv|television|radio|fan|geyser|microwave|oven|stove|washer|dryer|dishwasher|freezer|blender|juicer|toaster|kettle|iron|vacuum|speaker|heater|purifier|water heater|room heater|space heater|vacuum cleaner';
    const hasApplianceContext = lowerMessage.match(new RegExp(`\\b(my|the|a|an)\\s+(${applianceNames})\\b`, 'i')) ||
        lowerMessage.match(new RegExp(`\\b(${applianceNames})\\s+(is|not|not working|broken|damaged|issue|problem)\\b`, 'i')) ||
        lowerMessage.match(new RegExp(`\\b(broken|damaged|not working|fix|repair)\\s+(${applianceNames})\\b`, 'i')) ||
        lowerMessage.match(/\b(appliance|appliances)\s+(not working|broken|damaged|issue|problem|repair|fix)\b/i) ||
        lowerMessage.match(/\b(heater|water heater|room heater|space heater)\s+(repair|service|fix|not working|broken|issue|problem)\b/i) ||
        lowerMessage.match(/\b(book|need|want|arrange|schedule)\s+(heater|water heater)\s+(repair|service)\b/i) ||
        lowerMessage.match(/\b(heater|water heater)\s+repair\s+service\b/i);
    
    // Special check: If "painter" is explicitly mentioned, Painting should win
    const hasPainterExplicit = lowerMessage.match(/\b(painter|painters)\b/i);
    
    // Special check: If "paint my house" or similar painting phrases are mentioned, Painting should win
    const hasPaintHousePhrase = lowerMessage.match(/\b(paint|painting)\s+(my|the|a|an|this)\s+(house|home|room|wall|walls|bedroom|kitchen|bathroom)\b/i) ||
        lowerMessage.match(/\b(need|want|get|i need|i want)\s+(to\s+)?paint\s+(my|the|a|an|this)\s+(house|home|room|wall|walls|bedroom|kitchen|bathroom)\b/i);
    
    // Special check: If "plumber" is explicitly mentioned, Plumbing should win
    const hasPlumberExplicit = lowerMessage.match(/\b(plumber|plumbers)\b/i);
    
    // Special check: If "carpenter" is explicitly mentioned, Carpentry should win
    const hasCarpenterExplicit = lowerMessage.match(/\b(carpenter|carpenters)\b/i);
    
    // Special check: If "electrician" is explicitly mentioned, Electrical should win
    const hasElectricianExplicit = lowerMessage.match(/\b(electrician|electricians)\b/i);
    
    // Special check: If "AC" or "ac" is explicitly mentioned with "not working" or similar, HVAC should win
    // Handles case variations: "AC", "Ac", "ac", "aC" - all work due to case-insensitive flag (i)
    const hasACNotWorking = lowerMessage.match(/\b(ac|air conditioner|air conditioning)\s+(is|are)\s+not\s+working\b/i) ||
        lowerMessage.match(/\b(ac|air conditioner|air conditioning)\s+(is|are)\s+(broken|damaged)\b/i) ||
        lowerMessage.match(/\b(ac|air conditioner|air conditioning)\s+not\s+working\b/i) ||
        lowerMessage.match(/\b(ac|air conditioner|air conditioning)\s+(broken|damaged)\b/i) ||
        lowerMessage.match(/\b(my|the|a|an)\s+(ac|air conditioner|air conditioning)\s+(is|are)\s+not\s+working\b/i) ||
        lowerMessage.match(/\b(my|the|a|an)\s+(ac|air conditioner|air conditioning)\s+(is|are)\s+(broken|damaged)\b/i) ||
        lowerMessage.match(/\b(my|the|a|an)\s+(ac|air conditioner|air conditioning)\s+not\s+working\b/i);
    
    // Check for electrical-related context (semantic understanding)
    const hasElectricalContext = lowerMessage.match(/\b(electrician|electrical|electric)\s+(to\s+)?(repair|fix|install|arrange|book|schedule|work|service)\b/i) ||
        lowerMessage.match(/\b(install|install new|new|replace|repair|fix)\s+(electrical\s+)?(wiring|wires|wire|electrical system|electrical connection|power connection)\b/i) ||
        lowerMessage.match(/\b(electrical\s+)?(wiring|wires|wire|electrical system)\s+(install|installation|repair|fix|new|replacement)\b/i) ||
        lowerMessage.match(/\b(want|need|book|arrange|schedule|get|send|i want|i need)\s+(to\s+)?(install|install new|new)\s+(electrical\s+)?(wiring|wires|wire)\b/i) ||
        lowerMessage.match(/\b(install|installing)\s+(new\s+)?(electrical\s+)?(wiring|wires|wire)\b/i) ||
        lowerMessage.match(/\b(electrical|electric|power)\s+(issue|problem|work|service|repair|installation|connection|wiring)\b/i) ||
        lowerMessage.match(/\b(light|lights|outlet|outlets|circuit|circuits|fuse|breaker)\s+(install|installation|repair|fix|issue|problem|not working)\b/i);
    
    // Check for cleaning-related context (semantic understanding)
    const hasCleaningContext = lowerMessage.match(/\b(cleaner|cleaning|clean)\s+(to\s+)?(clean|service|help|work|house|home|room|office)\b/i) ||
        lowerMessage.match(/\b(want|need|book|arrange|schedule|get|send|i want|i need)\s+(to\s+)?(clean|cleaning|house cleaning|home cleaning|room cleaning)\b/i) ||
        lowerMessage.match(/\b(house|home|room|office|apartment)\s+(need|want|get|schedule|arrange|book)\s+(cleaning|clean|cleaner)\b/i) ||
        lowerMessage.match(/\b(deep|thorough|complete)\s+clean(ing)?\b/i) ||
        lowerMessage.match(/\b(dusting|mopping|vacuum|sweep|tidy)\s+(service|work|help)\b/i);
    
    // Check for HVAC-related context (semantic understanding)
    const hasHVACContext = lowerMessage.match(/\b(hvac|heating|cooling|air conditioning|ac)\s+(to\s+)?(repair|fix|install|service|maintenance|work)\b/i) ||
        lowerMessage.match(/\b(install|install new|new|replace|repair|fix)\s+(ac|air conditioner|air conditioning|heating|cooling|hvac)\b/i) ||
        lowerMessage.match(/\b(ac|air conditioner|air conditioning|heating|cooling|hvac)\s+(install|installation|repair|fix|not working|issue|problem|service)\b/i) ||
        lowerMessage.match(/\b(ac|air conditioner|air conditioning|heating|cooling|hvac)\s+(is|are)\s+not\s+working\b/i) ||
        lowerMessage.match(/\b(ac|air conditioner|air conditioning|heating|cooling|hvac)\s+(is|are)\s+(broken|damaged|issue|problem)\b/i) ||
        lowerMessage.match(/\b(ac|air conditioner|air conditioning|heating|cooling|hvac)\s+not\s+working\b/i) ||
        lowerMessage.match(/\b(my|the|a|an)\s+(ac|air conditioner|air conditioning|heating|cooling|hvac)\s+(is|are)\s+not\s+working\b/i) ||
        lowerMessage.match(/\b(my|the|a|an)\s+(ac|air conditioner|air conditioning|heating|cooling|hvac)\s+(is|are)\s+(broken|damaged)\b/i) ||
        lowerMessage.match(/\b(want|need|book|arrange|schedule|get|send|i want|i need)\s+(to\s+)?(install|repair|fix)\s+(ac|air conditioner|heating|cooling)\b/i) ||
        lowerMessage.match(/\b(temperature|thermostat|furnace|ventilation)\s+(repair|fix|install|issue|problem|not working)\b/i);
    
    // Check each category in order (priority order matters)
    for (const [category, keywords] of Object.entries(serviceKeywords)) {
        let score = 0;
        
        // If "painter" is explicitly mentioned, only Painting should match (highest priority)
        if (hasPainterExplicit) {
            if (category === 'Painting') {
                score += 50; // Extremely high priority when "painter" is mentioned
            } else {
                // Skip other categories if "painter" is mentioned - they shouldn't match
                continue;
            }
        }
        
        // If "paint my house" or similar phrases are mentioned, only Painting should match (highest priority)
        if (hasPaintHousePhrase) {
            if (category === 'Painting') {
                score += 60; // Extremely high priority when "paint my house" is mentioned
            } else {
                // Skip other categories if "paint my house" is mentioned - they shouldn't match
                continue;
            }
        }
        
        // If "plumber" is explicitly mentioned, only Plumbing should match (highest priority)
        if (hasPlumberExplicit) {
            if (category === 'Plumbing') {
                score += 50; // Extremely high priority when "plumber" is mentioned
            } else {
                // Skip other categories if "plumber" is mentioned - they shouldn't match
                continue;
            }
        }
        
        // If "carpenter" is explicitly mentioned, only Carpentry should match (highest priority)
        if (hasCarpenterExplicit) {
            if (category === 'Carpentry') {
                score += 50; // Extremely high priority when "carpenter" is mentioned
            } else {
                // Skip other categories if "carpenter" is mentioned - they shouldn't match
                continue;
            }
        }
        
        // If "electrician" is explicitly mentioned, only Electrical should match (highest priority)
        if (hasElectricianExplicit) {
            if (category === 'Electrical') {
                score += 50; // Extremely high priority when "electrician" is mentioned
            } else {
                // Skip other categories if "electrician" is mentioned - they shouldn't match
                continue;
            }
        }
        
        // If "AC is not working" or similar phrases are mentioned, only HVAC should match (highest priority)
        if (hasACNotWorking) {
            if (category === 'HVAC') {
                score += 60; // Extremely high priority when "AC is not working" is mentioned
            } else {
                // Skip other categories if "AC is not working" is mentioned - they shouldn't match
                continue;
            }
        }
        
        // SEMANTIC UNDERSTANDING: Boost scores based on sentence meaning (HIGHEST PRIORITY)
        // These context matches understand the full sentence meaning, not just individual keywords
        // Semantic matches get much higher scores than simple keyword matches
        
        // Boost Electrical score if context suggests electrical (very high priority - semantic understanding)
        if (category === 'Electrical' && hasElectricalContext) {
            score += 50; // Highest priority for electrical context (semantic understanding)
        }
        
        // Boost Painting score if context suggests painting (very high priority - semantic understanding)
        if (category === 'Painting' && hasPaintingContext) {
            score += 50; // Highest priority for painting context (semantic understanding)
        }
        
        // Boost Carpentry score if context suggests carpentry (very high priority - semantic understanding)
        if (category === 'Carpentry' && hasCarpentryContext) {
            score += 50; // Highest priority for carpentry context (semantic understanding)
        }
        
        // Boost Plumbing score if context suggests plumbing (very high priority - semantic understanding)
        if (category === 'Plumbing' && hasPlumbingContext) {
            score += 50; // Highest priority for plumbing context (semantic understanding)
        }
        
        // Boost Appliance score if context suggests appliance (very high priority - semantic understanding)
        if (category === 'Appliance' && hasApplianceContext) {
            score += 50; // Highest priority for appliance context (semantic understanding)
        }
        
        // Boost Cleaning score if context suggests cleaning (very high priority - semantic understanding)
        if (category === 'Cleaning' && hasCleaningContext) {
            score += 50; // Highest priority for cleaning context (semantic understanding)
        }
        
        // Boost HVAC score if context suggests HVAC (very high priority - semantic understanding)
        if (category === 'HVAC' && hasHVACContext) {
            score += 50; // Highest priority for HVAC context (semantic understanding)
        }
        
        for (const keyword of keywords) {
            // Phrase match (for multi-word keywords like "house cleaning") - check first
            if (keyword.includes(' ')) {
                // For multi-word phrases, check if the entire phrase exists
                if (lowerMessage.includes(keyword)) {
                    score += 15; // Multi-word phrases get good priority (but semantic context still higher)
                }
                // Also check if phrase components appear near each other (for flexible word order)
                const phraseWords = keyword.split(/\s+/);
                if (phraseWords.length === 2) {
                    const word1 = phraseWords[0];
                    const word2 = phraseWords[1];
                    // Check if both words appear in the message (even if not adjacent)
                    if (lowerMessage.includes(word1) && lowerMessage.includes(word2)) {
                        // Check if they're reasonably close (within 5 words)
                        const word1Index = lowerMessage.indexOf(word1);
                        const word2Index = lowerMessage.indexOf(word2);
                        if (word1Index !== -1 && word2Index !== -1) {
                            const distance = Math.abs(word1Index - word2Index);
                            if (distance < 30) { // Characters, roughly 5-6 words
                                score += 12; // Good indirect match
                            }
                        }
                    }
                }
            } else {
                // Exact word match - LOWER PRIORITY than semantic context
                // Keywords are fallback when semantic context doesn't match
                const wordRegex = createWordBoundaryRegex(keyword);
                if (wordRegex.test(lowerMessage)) {
                    // Profession names and specific appliance names get higher priority
                    const professionNames = ['carpenter', 'plumber', 'electrician', 'painter', 'cleaner', 'handyman'];
                    const applianceNames = ['washing machine', 'fridge', 'refrigerator', 'mixer', 'grinder', 'tv', 'television', 'radio', 'fan', 'geyser', 'microwave', 'oven', 'stove', 'washer', 'dryer', 'dishwasher', 'freezer', 'blender', 'juicer', 'toaster', 'kettle', 'iron', 'vacuum', 'speaker', 'heater', 'water heater', 'room heater', 'space heater', 'cooler', 'purifier'];
                    if (professionNames.includes(keyword.toLowerCase())) {
                        score += 20; // High priority for profession names (but lower than semantic context)
                    } else if (applianceNames.includes(keyword.toLowerCase())) {
                        score += 20; // High priority for specific appliance names (but lower than semantic context)
                    } else {
                        // Lower priority for generic keywords - semantic context should win
                        score += keyword.length > 5 ? 5 : 3; // Reduced from 10/8 to 5/3
                    }
                }
            }
            
            // Token-based matching with fuzzy matching
            const keywordTokens = keyword.split(/\s+/);
            const matchedTokens = keywordTokens.filter(kw => 
                tokens.some(token => {
                    // Exact token match
                    if (token === kw || token === kw + 's' || token === kw + 'er' || token === kw + 'ing') {
                        return true;
                    }
                    // Check if token starts with keyword (for variations)
                    if (kw.length > 4 && token.startsWith(kw)) {
                        return true;
                    }
                    // Fuzzy matching for typos (e.g., "electrition" -> "electrician")
                    if (kw.length >= 4 && token.length >= 3) {
                        const similarity = calculateSimilarity(token, kw);
                        // Use lower threshold for longer words, higher for shorter
                        const threshold = kw.length > 6 ? 0.65 : 0.75;
                        if (similarity >= threshold) {
                            return true;
                        }
                    }
                    // First letter match as last resort (for very misspelled words)
                    if (firstLetterMatch(token, kw) && token.length >= 3 && kw.length >= 4) {
                        // Check if the token is reasonably similar in length
                        const lengthDiff = Math.abs(token.length - kw.length);
                        if (lengthDiff <= 3) {
                            return true;
                        }
                    }
                    return false;
                })
            );
            if (matchedTokens.length > 0) {
                score += matchedTokens.length * 2;
            }
            
            // Also check fuzzy matching against the entire message for very misspelled words
            // This helps catch cases like "i need a electrition" -> "electrician"
            if (keyword.length >= 6) {
                // Check each token against the keyword with fuzzy matching
                for (const token of tokens) {
                    if (token.length >= 4 && keyword.length >= 4) {
                        const similarity = calculateSimilarity(token, keyword);
                        // For longer keywords, be more lenient
                        const threshold = keyword.length > 8 ? 0.6 : 0.7;
                        if (similarity >= threshold) {
                            score += 6; // Good fuzzy match
                            break; // Only count once per keyword
                        }
                    }
                }
            }
        }
        
        // Only update if this score is strictly better
        if (score > bestMatch.score) {
            bestMatch = { category, score };
        }
    }
    
    // If "painter" was explicitly mentioned and Painting matched, return it immediately
    if (hasPainterExplicit && bestMatch.category === 'Painting' && bestMatch.score > 0) {
        return 'Painting';
    }
    
    // If "paint my house" or similar phrases were mentioned and Painting matched, return it immediately
    if (hasPaintHousePhrase && bestMatch.category === 'Painting' && bestMatch.score > 0) {
        return 'Painting';
    }
    
    // If "plumber" was explicitly mentioned and Plumbing matched, return it immediately
    if (hasPlumberExplicit && bestMatch.category === 'Plumbing' && bestMatch.score > 0) {
        return 'Plumbing';
    }
    
    // If "carpenter" was explicitly mentioned and Carpentry matched, return it immediately
    if (hasCarpenterExplicit && bestMatch.category === 'Carpentry' && bestMatch.score > 0) {
        return 'Carpentry';
    }
    
    // If "electrician" was explicitly mentioned and Electrical matched, return it immediately
    if (hasElectricianExplicit && bestMatch.category === 'Electrical' && bestMatch.score > 0) {
        return 'Electrical';
    }
    
    // If "AC is not working" or similar phrases were mentioned and HVAC matched, return it immediately
    if (hasACNotWorking && bestMatch.category === 'HVAC' && bestMatch.score > 0) {
        return 'HVAC';
    }
    
    // If we have a good match (score > 0), return it; otherwise default to General
    return bestMatch.score > 0 ? bestMatch.category : 'General';
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
    
    // Get current system time
    const currentTime = `${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;
    
    // Check for specific days
    if (lowerMessage.includes('today')) {
        return { date: today.toISOString().split('T')[0], time: currentTime };
    }
    if (lowerMessage.includes('tomorrow')) {
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return { date: tomorrow.toISOString().split('T')[0], time: currentTime };
    }
    if (lowerMessage.includes('monday') || lowerMessage.includes('tuesday') || 
        lowerMessage.includes('wednesday') || lowerMessage.includes('thursday') || 
        lowerMessage.includes('friday') || lowerMessage.includes('saturday') || 
        lowerMessage.includes('sunday')) {
        // Default to next occurrence of that day with current time
        return { date: null, time: currentTime };
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
